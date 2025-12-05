import { request } from './index'
import type {
  LoginParams,
  RegisterParams,
  LoginResponse,
  RegisterResponse,
  VCodeResponse,
  CheckCaptchaParams,
} from '@/types/auth'
import type { ApiResponse } from '@/types/api'

export const login = (params: LoginParams) => {
  return request<LoginResponse>('/auth/login', { method: 'POST', body: params })
}

export const logout = (refreshToken?: string) => {
  return request<ApiResponse>('/auth/logout', {
    method: 'POST',
    body: refreshToken ? { refresh_token: refreshToken } : {},
  })
}

export const refreshToken = (refreshToken: string) => {
  return request<LoginResponse>('/auth/refresh', {
    method: 'POST',
    body: { refresh_token: refreshToken },
  })
}

export const register = (params: RegisterParams) => {
  return request<RegisterResponse>('/auth/register', { method: 'POST', body: params })
}

export const getCaptcha = () => {
  return request<VCodeResponse>('/auth/captcha', { method: 'POST' })
}

export const checkCaptcha = (params: CheckCaptchaParams) => {
  return request<ApiResponse>('/auth/captcha/verify', { method: 'POST', body: params })
}
