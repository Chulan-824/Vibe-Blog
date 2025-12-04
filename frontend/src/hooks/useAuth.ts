import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { checkLogin, login, logout, register, getVCode, checkVCode } from '@/api/auth'
import type { LoginParams, RegisterParams, User } from '@/types/auth'

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        const res = await checkLogin()
        return res.userInfo || null
      } catch {
        return null
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (params: LoginParams) => login(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
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

export function useVCode(enabled = false) {
  const { data, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: ['auth', 'vcode'],
    queryFn: () => getVCode(),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  const checkMutation = useMutation({
    mutationFn: (code: string) => checkVCode(code),
  })

  // Calculate expiration timestamp
  const vcodeExpireTime = data?.time && dataUpdatedAt ? dataUpdatedAt + data.time : 0

  return {
    vcode: data,
    vcodeExpireTime,
    refreshVCode: refetch,
    isRefreshing: isFetching,
    checkVCode: checkMutation.mutateAsync,
  }
}
