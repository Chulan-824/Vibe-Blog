package handler

import (
	"github.com/gin-gonic/gin"
)

type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg,omitempty"`
	Data interface{} `json:"data,omitempty"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(200, Response{
		Code: 0,
		Msg:  "请求成功",
		Data: data,
	})
}

func SuccessWithMsg(c *gin.Context, msg string) {
	c.JSON(200, Response{
		Code: 0,
		Msg:  msg,
	})
}

func SuccessWithData(c *gin.Context, msg string, data interface{}) {
	c.JSON(200, Response{
		Code: 0,
		Msg:  msg,
		Data: data,
	})
}

func Error(c *gin.Context, code int, msg string) {
	c.JSON(200, Response{
		Code: code,
		Msg:  msg,
	})
}

func ServerError(c *gin.Context) {
	c.JSON(200, Response{
		Code: 4,
		Msg:  "服务器错误~请稍后再试",
	})
}
