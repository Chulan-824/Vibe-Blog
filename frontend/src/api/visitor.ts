import { request } from './index'

export interface Visitor {
  _id: string
  ip: string
  time: string
  user: {
    _id: string
    user: string
    photo?: string
  }
}

export const getVisitor = () => {
  return request<Visitor[]>('/visitor', { method: 'POST' })
}
