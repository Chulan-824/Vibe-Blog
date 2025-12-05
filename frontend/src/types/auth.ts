import type { ApiResponse } from './api'

export interface User {
  _id: string
  user_name: string
  avatar?: string
  registered_at?: number
  is_disabled?: boolean
  is_admin?: boolean
}

export interface LoginParams {
  user_name: string
  password: string
}

export interface RegisterParams {
  user_name: string
  password: string
  captcha_code: string
  captcha_id: string
}

export interface LoginData {
  access_token: string
  refresh_token: string
  expires_in: number
  user_info: User
}

export type LoginResponse = ApiResponse<LoginData>

export type RegisterResponse = ApiResponse

export interface VCodeData {
  image: string
  captcha_id: string
  time: number
}

export type VCodeResponse = ApiResponse<VCodeData>

export interface CheckCaptchaParams {
  captcha_code: string
  captcha_id: string
}
