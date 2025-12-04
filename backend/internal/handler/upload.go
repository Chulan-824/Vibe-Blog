package handler

import (
	"backend/internal/config"
	"backend/internal/dao"
	"backend/internal/middleware"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ========== 常量 ==========

// 允许的 MIME 类型映射
var allowedMIMETypes = map[string]string{
	"image/jpeg": ".jpg",
	"image/png":  ".png",
	"image/gif":  ".gif",
}

// ========== 类型定义 ==========

type UploadHandler struct {
	userDAO *dao.UserDAO
}

// ========== 构造函数 ==========

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{
		userDAO: dao.NewUserDAO(),
	}
}

// ========== Handler 方法 ==========

func (h *UploadHandler) Avatar(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "msg": "请先登录"})
		return
	}

	// 限制请求体大小
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, config.AppConfig.MaxUploadSize)

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		if err.Error() == "http: request body too large" {
			c.JSON(http.StatusBadRequest, gin.H{"code": 1, "msg": "文件大小超出限制"})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "msg": "文件上传失败"})
		return
	}
	defer file.Close()

	// 读取文件头检测真实 MIME 类型（前 512 字节）
	buff := make([]byte, 512)
	if _, err := file.Read(buff); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "msg": "无法读取文件"})
		return
	}
	// 重置文件读取位置
	if _, err := file.Seek(0, 0); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 4, "msg": "文件处理失败"})
		return
	}

	// 检测真实 MIME 类型
	mimeType := http.DetectContentType(buff)
	ext, allowed := allowedMIMETypes[mimeType]
	if !allowed {
		c.JSON(http.StatusBadRequest, gin.H{"code": 1, "msg": "不支持的文件格式，仅支持 JPG/PNG/GIF"})
		return
	}

	// 生成随机文件名防止覆盖和路径猜测
	randomName := uuid.New().String()
	filename := fmt.Sprintf("%s_%s%s", userID.Hex(), randomName[:8], ext)
	savePath := filepath.Join(config.AppConfig.UploadPath, "avatar", filename)

	// 确保目录存在
	if err := os.MkdirAll(filepath.Dir(savePath), 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 4, "msg": "创建目录失败"})
		return
	}

	// 创建目标文件
	dst, err := os.Create(savePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 4, "msg": "创建文件失败"})
		return
	}
	defer dst.Close()

	// 写入文件
	if _, err := io.Copy(dst, file); err != nil {
		// 失败时清理已创建的文件
		os.Remove(savePath)
		c.JSON(http.StatusInternalServerError, gin.H{"code": 4, "msg": "文件保存失败"})
		return
	}

	// 更新用户头像
	avatarURL := fmt.Sprintf("%s/img/upload/avatar/%s", config.AppConfig.BaseURL, filename)
	if err := h.userDAO.UpdateAvatar(c.Request.Context(), userID, avatarURL); err != nil {
		// 更新失败时回滚：删除已上传的文件
		os.Remove(savePath)
		c.JSON(http.StatusInternalServerError, gin.H{"code": 4, "msg": "更新头像失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"msg":  "上传成功",
		"data": gin.H{"avatar_url": avatarURL},
	})

	// 记录上传信息（可选：后续可添加日志）
	_ = header.Filename // 原始文件名，仅用于日志
}
