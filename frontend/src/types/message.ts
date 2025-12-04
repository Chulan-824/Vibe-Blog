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
  user: string
  content: string
}

export interface ChildMessageParams {
  parentId: string
  user: string
  content: string
  reUser: string
}
