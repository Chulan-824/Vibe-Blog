import { request } from './index'
import type { ListResponse } from '@/types/api'

export interface Visitor {
  _id: string
  ip: string
  time: string
  user: {
    _id: string
    user: string
    photo?: string
    avatar?: string
    user_name?: string
  }
}

export const getVisitor = () => {
  return request<ListResponse<Visitor>>('/visitors', { method: 'GET' })
}
