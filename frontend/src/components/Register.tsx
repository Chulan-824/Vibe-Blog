import { useState, useSyncExternalStore } from 'react'
import { Modal } from './ui/Modal'
import { useAuth, useVCode } from '@/hooks/useAuth'

interface RegisterProps {
  open: boolean
  onClose: () => void
  onSwitchToLogin?: () => void
}

const usernamePattern = /^[\w\u4e00-\u9fa5\uac00-\ud7ff\u0800-\u4e00-]{2,7}$/
const passwordPattern = /^[\w<>,.?|;':"{}!@#$%^&*()/\-[\]\\]{6,18}$/

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
  const { vcode, refreshVCode, isRefreshing, vcodeExpireTime } = useVCode(open)
  const [form, setForm] = useState({ user: '', pwd: '', checkPwd: '', svgCode: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const countdown = useCountdown(vcodeExpireTime)

  const handleRefreshVCode = async () => {
    await refreshVCode()
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.user) {
      newErrors.user = '请输入用户名'
    } else if (!usernamePattern.test(form.user)) {
      newErrors.user = '2-7位，数字 字母 _ - 中日韩文'
    }
    if (!form.pwd) {
      newErrors.pwd = '请输入密码'
    } else if (!passwordPattern.test(form.pwd)) {
      newErrors.pwd = '6-18位，不允许出现奇怪的字符哦~'
    }
    if (!form.checkPwd) {
      newErrors.checkPwd = '请再次输入密码'
    } else if (form.checkPwd !== form.pwd) {
      newErrors.checkPwd = '两次密码不一致'
    }
    if (!form.svgCode) {
      newErrors.svgCode = '请输入验证码'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      const res = await register({ user: form.user, pwd: form.pwd, svgCode: form.svgCode })
      if (res.code) {
        setMessage({ type: 'error', text: res.msg || '注册失败' })
        handleRefreshVCode()
      } else {
        setMessage({ type: 'success', text: '注册成功！' })
        setTimeout(() => {
          handleClose()
          onSwitchToLogin?.()
        }, 1500)
      }
    } catch {
      setMessage({ type: 'error', text: '注册失败请稍后再试~' })
      handleRefreshVCode()
    }
  }

  const handleClose = () => {
    setForm({ user: '', pwd: '', checkPwd: '', svgCode: '' })
    setErrors({})
    setMessage(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="注册"
      footer={
        <button
          type="submit"
          form="register-form"
          disabled={isRegisterPending}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRegisterPending ? '注册中...' : '立即注册'}
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
      <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            用户名
          </label>
          <input
            type="text"
            value={form.user}
            onChange={(e) => setForm({ ...form, user: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {errors.pwd && (
            <p className="mt-1 text-sm text-red-500">{errors.pwd}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            确认密码
          </label>
          <input
            type="password"
            value={form.checkPwd}
            onChange={(e) => setForm({ ...form, checkPwd: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {errors.checkPwd && (
            <p className="mt-1 text-sm text-red-500">{errors.checkPwd}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            验证码
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={form.svgCode}
              onChange={(e) => setForm({ ...form, svgCode: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div
              className="h-10 w-24 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: vcode?.data || 'loading...' }}
            />
            <button
              type="button"
              onClick={handleRefreshVCode}
              disabled={countdown > 0 || isRefreshing}
              className="text-sm text-blue-500 hover:underline disabled:text-gray-400 disabled:no-underline whitespace-nowrap"
            >
              {countdown > 0 ? `${countdown}s后可刷新` : '刷新'}
            </button>
          </div>
          {errors.svgCode && (
            <p className="mt-1 text-sm text-red-500">{errors.svgCode}</p>
          )}
        </div>
        {onSwitchToLogin && (
          <p className="text-sm text-gray-500">
            已有账号？{' '}
            <button
              type="button"
              onClick={() => {
                handleClose()
                onSwitchToLogin()
              }}
              className="text-blue-500 hover:underline"
            >
              立即登录
            </button>
          </p>
        )}
      </form>
    </Modal>
  )
}
