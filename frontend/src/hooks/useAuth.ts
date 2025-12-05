import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { login, logout, register, getCaptcha, checkCaptcha } from '@/api/auth'
import type { LoginParams, RegisterParams, User, CheckCaptchaParams } from '@/types/auth'

const AUTH_STORAGE_KEY = 'auth_user'
const TOKEN_STORAGE_KEY = 'auth_tokens'

interface StoredTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function setStoredUser(user: User | null) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

function setStoredTokens(tokens: StoredTokens | null) {
  if (tokens) {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

function getStoredTokens(): StoredTokens | null {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      return getStoredUser()
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (params: LoginParams) => login(params),
    onSuccess: (res) => {
      const data = res.data
      if (data?.user_info) {
        setStoredUser(data.user_info)
        queryClient.setQueryData(['auth', 'user'], data.user_info)
      }
      if (data?.access_token && data?.refresh_token) {
        setStoredTokens({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in || 0,
        })
      }
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => {
      const tokens = getStoredTokens()
      return logout(tokens?.refresh_token)
    },
    onSuccess: () => {
      setStoredUser(null)
      setStoredTokens(null)
      queryClient.setQueryData(['auth', 'user'], null)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (params: RegisterParams) => register(params),
  })

  return {
    user: user as User | null,
    isLoggedIn: !!user,
    isLoading,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    isLoginPending: loginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    isRegisterPending: registerMutation.isPending,
  }
}

export function useCaptcha(enabled = false) {
  const { data, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ['auth', 'captcha'],
    queryFn: () => getCaptcha(),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  const checkMutation = useMutation({
    mutationFn: (params: CheckCaptchaParams) => checkCaptcha(params),
  })

  const captchaData = data?.data
  const captchaExpireTime = captchaData?.time && dataUpdatedAt ? dataUpdatedAt + captchaData.time : 0

  return {
    captcha: captchaData,
    captchaId: captchaData?.captcha_id,
    captchaExpireTime,
    refreshCaptcha: refetch,
    isRefreshing: isFetching,
    checkCaptcha: checkMutation.mutateAsync,
  }
}
