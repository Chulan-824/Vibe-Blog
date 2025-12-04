import { ofetch } from 'ofetch'

export const request = ofetch.create({
  baseURL: '/api',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
})
