import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
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
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { loginSchema, getErrorMessage } from '@/lib/schemas/auth'

interface LoginProps {
  open: boolean
  onClose: () => void
  onSwitchToRegister?: () => void
}

export function Login({ open, onClose, onSwitchToRegister }: LoginProps) {
  const { login, isLoginPending } = useAuth()
  const toast = useToast()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { user_name: '', password: '' },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await login(value)
        if (res.code) {
          setErrorMessage(res.msg || '登录失败')
        } else {
          toast.success(res.msg || '登录成功')
          handleClose()
          window.location.reload()
        }
      } catch {
        setErrorMessage('登录失败请稍后再试~')
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
          <DialogTitle>登录</DialogTitle>
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

          {onSwitchToRegister && (
            <p className="text-sm text-gray-500">
              还没有账号？{' '}
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  handleClose()
                  onSwitchToRegister()
                }}
                className="h-auto p-0"
              >
                立即注册
              </Button>
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isLoginPending}>
              {isLoginPending ? '登录中...' : '登录'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
