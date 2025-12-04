export interface ApiResponse<T = unknown> {
  code?: number
  msg?: string
  data?: T
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number
}

export interface VCodeResponse extends ApiResponse {
  data?: string
  time?: number
}
