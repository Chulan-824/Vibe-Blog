import type { User } from './auth'

export interface Message {
  _id: string
  user: User
  content: string
  date: string
  createTime: string
  children?: ChildMessage[]
}

export interface ChildMessage {
  _id: string
  user: User
  content: string
  date: string
  reUser: string
  createTime: string
}

export interface MessageParams {
  content: string
}

export interface ChildMessageParams {
  content: string
  reply_to_user: string
}
