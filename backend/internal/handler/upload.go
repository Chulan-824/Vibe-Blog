package handler

import (
	"backend/internal/config"
	"backend/internal/dao"
	"backend/internal/middleware"
	"fmt"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

type UploadHandler struct {
	userDAO *dao.UserDAO
}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{
		userDAO: dao.NewUserDAO(),
	}
}

func (h *UploadHandler) Avatar(c *gin.Context) {
	userID, ok := middleware.GetUserID(c)
	if !ok {
		c.String(500, "请先登录")
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.String(500, "文件上传失败")
		return
	}

	// 验证文件类型
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".gif" {
		c.String(500, "不支持的文件格式")
		return
	}

	// 生成文件名
	filename := fmt.Sprintf("%s%s", userID.Hex(), ext)
	savePath := filepath.Join(config.AppConfig.UploadPath, "avatar", filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.String(500, "文件保存失败")
		return
	}

	// 更新用户头像
	avatarURL := fmt.Sprintf("%s/img/upload/avatar/%s", config.AppConfig.BaseURL, filename)
	if err := h.userDAO.UpdateAvatar(c.Request.Context(), userID, avatarURL); err != nil {
		c.String(500, "更新头像失败")
		return
	}

	c.String(200, "OK")
}
