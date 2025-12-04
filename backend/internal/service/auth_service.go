package service

import (
	"backend/internal/config"
	"backend/internal/dao"
	"backend/internal/model"
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidCredentials = errors.New("用户名或密码错误")
	ErrUserExists         = errors.New("用户名已存在")
	ErrInvalidToken       = errors.New("无效的Token")
	ErrTokenExpired       = errors.New("Token已过期")
	ErrTokenRevoked       = errors.New("Token已被吊销")
)

type Claims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

type AuthService struct {
	userDAO  *dao.UserDAO
	tokenDAO *dao.TokenDAO
}

func NewAuthService() *AuthService {
	return &AuthService{
		userDAO:  dao.NewUserDAO(),
		tokenDAO: dao.NewTokenDAO(),
	}
}

func (s *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func (s *AuthService) CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (s *AuthService) GenerateAccessToken(userID primitive.ObjectID) (string, error) {
	claims := &Claims{
		UserID: userID.Hex(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(config.AppConfig.AccessTokenExpire)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.AppConfig.JWTSecret))
}

func (s *AuthService) GenerateRefreshToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func (s *AuthService) GenerateTokenPair(ctx context.Context, userID primitive.ObjectID) (*model.TokenPair, error) {
	accessToken, err := s.GenerateAccessToken(userID)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.GenerateRefreshToken()
	if err != nil {
		return nil, err
	}

	expiresAt := time.Now().Add(config.AppConfig.RefreshTokenExpire)
	if err = s.tokenDAO.Create(ctx, userID, refreshToken, expiresAt); err != nil {
		return nil, err
	}

	return &model.TokenPair{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(config.AppConfig.AccessTokenExpire.Seconds()),
	}, nil
}

func (s *AuthService) ValidateAccessToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.AppConfig.JWTSecret), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidToken
}

func (s *AuthService) RefreshTokenPair(ctx context.Context, refreshTokenStr string) (*model.TokenPair, error) {
	refreshToken, err := s.tokenDAO.FindByToken(ctx, refreshTokenStr)
	if err != nil {
		return nil, ErrInvalidToken
	}

	if refreshToken.Revoked {
		return nil, ErrTokenRevoked
	}

	if time.Now().After(refreshToken.ExpiresAt) {
		return nil, ErrTokenExpired
	}

	// 吊销旧的refresh token
	_ = s.tokenDAO.Revoke(ctx, refreshTokenStr)

	// 生成新的token对
	return s.GenerateTokenPair(ctx, refreshToken.UserID)
}

func (s *AuthService) RevokeRefreshToken(ctx context.Context, refreshToken string) error {
	return s.tokenDAO.Revoke(ctx, refreshToken)
}

func (s *AuthService) Register(ctx context.Context, username, password string) (*model.User, error) {
	exists, err := s.userDAO.ExistsByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrUserExists
	}

	hashedPwd, err := s.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := model.NewUser(username, hashedPwd)
	return s.userDAO.Create(ctx, user)
}

func (s *AuthService) Login(ctx context.Context, username, password string) (*model.User, error) {
	user, err := s.userDAO.FindByUsername(ctx, username)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if !s.CheckPassword(password, user.Password) {
		return nil, ErrInvalidCredentials
	}

	return user, nil
}
