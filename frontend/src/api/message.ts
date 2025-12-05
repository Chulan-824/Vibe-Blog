import { request } from './index'
import type { Message, MessageParams, ChildMessageParams } from '@/types/message'
import type { ListResponse } from '@/types/api'

export const commitMessage = (params: MessageParams) => {
  return request('/messages', { method: 'POST', body: params })
}

export const commitChildMessage = (parentId: string, params: ChildMessageParams) => {
  return request(`/messages/${parentId}/replies`, { method: 'POST', body: params })
}

export const getMessageList = (skip = 0, limit = 5) => {
  return request<ListResponse<Message>>('/messages', {
    method: 'GET',
    query: { skip, limit },
  })
}
