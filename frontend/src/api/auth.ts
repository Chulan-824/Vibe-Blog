import { request } from './index'
import type {
  LoginParams,
  RegisterParams,
  LoginResponse,
  RegisterResponse,
  VCodeResponse,
} from '@/types/auth'
import type { ApiResponse } from '@/types/api'

export const login = (params: LoginParams) => {
  return request<LoginResponse>('/login', { method: 'POST', body: params })
}

export const checkLogin = () => {
  return request<LoginResponse>('/login/ifLogin', { method: 'POST' })
}

export const logout = () => {
  return request<ApiResponse>('/login/logout', { method: 'POST' })
}

export const register = (params: RegisterParams) => {
  return request<RegisterResponse>('/register', { method: 'POST', body: params })
}

export const getVCode = () => {
  return request<VCodeResponse>('/register/vcode', { method: 'POST' })
}

export const checkVCode = (svgCode: string) => {
  return request<ApiResponse>('/register/checkVcode', { method: 'POST', body: { svgCode } })
}
