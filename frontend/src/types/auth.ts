import type { ApiResponse } from './api'

export interface User {
  _id: string
  user: string
  avatar?: string
  photo?: string
}

export interface LoginParams {
  user: string
  pwd: string
}

export interface RegisterParams {
  user: string
  pwd: string
  svgCode: string
}

export interface LoginResponse extends ApiResponse {
  userInfo?: User
}

export type RegisterResponse = ApiResponse

export interface VCodeResponse extends ApiResponse {
  data?: string
  time?: number
}
