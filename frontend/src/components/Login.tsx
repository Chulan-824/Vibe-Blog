import { useState } from 'react'
import { Modal } from './ui/Modal'
import { useAuth } from '@/hooks/useAuth'

interface LoginProps {
  open: boolean
  onClose: () => void
  onSwitchToRegister?: () => void
}

const usernamePattern = /^[\w\u4e00-\u9fa5\uac00-\ud7ff\u0800-\u4e00-]{2,7}$/
const passwordPattern = /^[\w<>,.?|;':"{}!@#$%^&*()/\-[\]\\]{6,18}$/

export function Login({ open, onClose, onSwitchToRegister }: LoginProps) {
  const { login, isLoginPending } = useAuth()
  const [form, setForm] = useState({ user: '', pwd: '' })
  const [errors, setErrors] = useState<{ user?: string; pwd?: string }>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!form.user) {
      newErrors.user = '请输入用户名'
    } else if (!usernamePattern.test(form.user)) {
      newErrors.user = '请输入正确格式用户名'
    }
    if (!form.pwd) {
      newErrors.pwd = '请输入密码'
    } else if (!passwordPattern.test(form.pwd)) {
      newErrors.pwd = '请输入正确格式密码'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      const res = await login(form)
      if (res.code) {
        setMessage({ type: 'error', text: res.msg || '登录失败' })
      } else {
        setMessage({ type: 'success', text: res.msg || '登录成功' })
        setTimeout(() => {
          onClose()
          window.location.reload()
        }, 1500)
      }
    } catch {
      setMessage({ type: 'error', text: '登录失败请稍后再试~' })
    }
  }

  const handleClose = () => {
    setForm({ user: '', pwd: '' })
    setErrors({})
    setMessage(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="登录"
      footer={
        <button
          type="submit"
          form="login-form"
          disabled={isLoginPending}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoginPending ? '登录中...' : '登录'}
        </button>
      }
    >
      {message && (
        <div
          className={`mb-4 p-3 rounded text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}
      <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            用户名
          </label>
          <input
            type="text"
            value={form.user}
            onChange={(e) => setForm({ ...form, user: e.target.value })}
            onBlur={validate}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.user && (
            <p className="mt-1 text-sm text-red-500">{errors.user}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            type="password"
            value={form.pwd}
            onChange={(e) => setForm({ ...form, pwd: e.target.value })}
            onBlur={validate}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.pwd && (
            <p className="mt-1 text-sm text-red-500">{errors.pwd}</p>
          )}
        </div>
        {onSwitchToRegister && (
          <p className="text-sm text-gray-500">
            还没有账号？{' '}
            <button
              type="button"
              onClick={() => {
                handleClose()
                onSwitchToRegister()
              }}
              className="text-blue-500 hover:underline"
            >
              立即注册
            </button>
          </p>
        )}
      </form>
    </Modal>
  )
}
