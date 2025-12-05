import { createContext } from 'react'

export interface ToastContextValue {
  toast: {
    success: (message: string) => void
    error: (message: string) => void
    info: (message: string) => void
  }
}

export const ToastContext = createContext<ToastContextValue | null>(null)
