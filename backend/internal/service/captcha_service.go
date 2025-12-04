package service

import (
	"sync"
	"time"

	"github.com/mojocn/base64Captcha"
)

type CaptchaService struct {
	store  base64Captcha.Store
	driver *base64Captcha.DriverString
}

var (
	captchaService *CaptchaService
	captchaOnce    sync.Once
)

func GetCaptchaService() *CaptchaService {
	captchaOnce.Do(func() {
		captchaService = &CaptchaService{
			store: base64Captcha.NewMemoryStore(10240, 3*time.Minute),
			driver: &base64Captcha.DriverString{
				Height:          60,
				Width:           200,
				NoiseCount:      0,
				ShowLineOptions: base64Captcha.OptionShowSlimeLine,
				Length:          4,
				Source:          "1234567890abcdefghjkmnpqrstuvwxyz",
				Fonts:           []string{"wqy-microhei.ttc"},
			},
		}
	})
	return captchaService
}

type CaptchaResult struct {
	ID   string `json:"id"`
	Data string `json:"data"`
}

func (s *CaptchaService) Generate() (*CaptchaResult, error) {
	c := base64Captcha.NewCaptcha(s.driver, s.store)
	id, b64s, _, err := c.Generate()
	if err != nil {
		return nil, err
	}
	return &CaptchaResult{
		ID:   id,
		Data: b64s,
	}, nil
}

func (s *CaptchaService) Verify(id, answer string) bool {
	return s.store.Verify(id, answer, true)
}

func (s *CaptchaService) Get(id string) string {
	return s.store.Get(id, false)
}
