import { ofetch } from 'ofetch'

const TOKEN_STORAGE_KEY = 'auth_tokens'

function getAccessToken(): string | null {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (stored) {
      const tokens = JSON.parse(stored)
      return tokens.access_token || null
    }
    return null
  } catch {
    return null
  }
}

export const request = ofetch.create({
  baseURL: '/api/v1',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  onRequest({ options }) {
    const token = getAccessToken()
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      }
    }
  },
})
