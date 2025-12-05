import { useForm } from '@tanstack/react-form'
import { useState, useSyncExternalStore } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { useAuth, useCaptcha } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { registerSchema, getErrorMessage } from '@/lib/schemas/auth'

interface RegisterProps {
  open: boolean
  onClose: () => void
  onSwitchToLogin?: () => void
}

function useCountdown(targetTime: number) {
  const getSnapshot = () => {
    if (targetTime <= 0) return 0
    const remaining = Math.ceil((targetTime - Date.now()) / 1000)
    return remaining > 0 ? remaining : 0
  }

  const subscribe = (callback: () => void) => {
    const interval = setInterval(callback, 1000)
    return () => clearInterval(interval)
  }

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function Register({ open, onClose, onSwitchToLogin }: RegisterProps) {
  const { register, isRegisterPending } = useAuth()
  const { captcha, captchaId, refreshCaptcha, isRefreshing, captchaExpireTime } =
    useCaptcha(open)
  const toast = useToast()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const countdown = useCountdown(captchaExpireTime)

  const form = useForm({
    defaultValues: { user_name: '', password: '', checkPwd: '', captchaCode: '' },
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async ({ value }) => {
      if (!captchaId) return

      try {
        const res = await register({
          user_name: value.user_name,
          password: value.password,
          captcha_code: value.captchaCode,
          captcha_id: captchaId,
        })
        if (res.code) {
          setErrorMessage(res.msg || '注册失败')
          refreshCaptcha()
        } else {
          toast.success('注册成功！')
          handleClose()
          onSwitchToLogin?.()
        }
      } catch {
        setErrorMessage('注册失败请稍后再试~')
        refreshCaptcha()
      }
    },
  })

  const handleClose = () => {
    form.reset()
    setErrorMessage(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>注册</DialogTitle>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded text-sm bg-red-50 text-red-600">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field name="user_name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>用户名</Label>
                <Input
                  id={field.name}
                  type="text"
                  autoComplete="username"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>密码</Label>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="checkPwd">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>确认密码</Label>
                <Input
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="captchaCode">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>验证码</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id={field.name}
                    type="text"
                    autoComplete="off"
                    className="flex-1"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  {captcha?.captcha_data ? (
                    <img
                      src={captcha.captcha_data}
                      alt="验证码"
                      className="h-10 w-24 shrink-0 object-contain"
                    />
                  ) : (
                    <div className="h-10 w-24 shrink-0 flex items-center justify-center text-gray-400 text-sm">
                      loading...
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="w-24 shrink-0"
                    onClick={() => refreshCaptcha()}
                    disabled={countdown > 0 || isRefreshing}
                  >
                    {countdown > 0 ? `${countdown}s` : '刷新'}
                  </Button>
                </div>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-red-500">
                    {getErrorMessage(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {onSwitchToLogin && (
            <p className="text-sm text-gray-500">
              已有账号？{' '}
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  handleClose()
                  onSwitchToLogin()
                }}
                className="h-auto p-0"
              >
                立即登录
              </Button>
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isRegisterPending}>
              {isRegisterPending ? '注册中...' : '立即注册'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
