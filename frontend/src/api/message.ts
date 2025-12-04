import { request } from './index'
import type { Message, MessageParams, ChildMessageParams } from '@/types/message'

export const commitMessage = (params: MessageParams) => {
  return request('/message/commit', { method: 'POST', body: params })
}

export const commitChildMessage = (params: ChildMessageParams) => {
  return request('/message/childCommit', { method: 'POST', body: params })
}

export const getMessageList = (skip = 0, limit = 5) => {
  return request<Message[]>('/message/getList', { method: 'POST', body: { skip, limit } })
}
