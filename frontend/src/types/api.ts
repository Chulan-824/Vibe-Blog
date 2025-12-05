export interface ApiResponse<T = unknown> {
  code?: number
  msg?: string
  data?: T
}

// 列表类接口响应格式
export interface ListResponse<T> {
  code?: number
  msg?: string
  data?: {
    list: T[]
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number
}
