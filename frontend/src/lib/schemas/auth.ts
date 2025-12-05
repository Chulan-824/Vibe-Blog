import { z } from 'zod'

export const usernameSchema = z
  .string()
  .min(1, '请输入用户名')
  .min(2, '用户名至少2个字符')
  .max(7, '用户名最多7个字符')
  .regex(/^[\w\u4e00-\u9fa5\uac00-\ud7ff\u0800-\u4e00-]+$/, '请输入正确格式用户名')

export const passwordSchema = z
  .string()
  .min(1, '请输入密码')
  .min(6, '密码至少6个字符')
  .max(18, '密码最多18个字符')
  .regex(/^[\w<>,.?|;':"{}!@#$%^&*()/\-[\]\\]+$/, '密码格式不正确')

export const loginSchema = z.object({
  user_name: usernameSchema,
  password: passwordSchema,
})

export const registerSchema = z
  .object({
    user_name: usernameSchema,
    password: passwordSchema,
    checkPwd: z.string().min(1, '请再次输入密码'),
    captchaCode: z.string().min(1, '请输入验证码'),
  })
  .refine((data) => data.password === data.checkPwd, {
    message: '两次密码不一致',
    path: ['checkPwd'],
  })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return ''
}
