import { request } from './index'
import type { LoginParams, RegisterParams, User } from '@/types/auth'

export const login = (params: LoginParams) => {
  return request<User>('/login', { method: 'POST', body: params })
}

export const checkLogin = () => {
  return request<User>('/login/ifLogin', { method: 'POST' })
}

export const logout = () => {
  return request('/login/logout', { method: 'POST' })
}

export const register = (params: RegisterParams) => {
  return request('/register', { method: 'POST', body: params })
}

export const getVCode = () => {
  return request('/register/vcode', { method: 'POST' })
}

export const checkVCode = (svgCode: string) => {
  return request('/register/checkVcode', { method: 'POST', body: { svgCode } })
}
