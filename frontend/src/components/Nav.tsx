import { useState, useRef, useEffect } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { Login } from './Login'
import { Register } from './Register'
import { AvatarUpload } from './AvatarUpload'
import { Button } from '@/components/ui/button'

const navLinks = [
  { to: '/', label: '首页', name: 'Home' },
  { to: '/blog', label: '博客', name: 'Blog' },
  { to: '/message', label: '留言', name: 'Message' },
  { to: '/diary', label: '日记', name: 'Diary' },
  { to: '/links', label: '友链', name: 'Links' },
  { to: '/about', label: '关于', name: 'About' },
] as const

function NavLink({ to, label }: { to: string; label: string }) {
  const router = useRouterState()
  const pathname = router.location.pathname
  const isActive =
    to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <li>
      <Link
        to={to}
        className={`relative block h-[60px] leading-[60px] px-4 text-[15px] font-normal transition-colors hover:text-[#6bc30d] ${
          isActive ? 'text-[#6bc30d]' : 'text-[#212220]'
        }`}
      >
        {label}
        <span
          className={`absolute bottom-0 left-0 right-0 mx-auto h-[2px] bg-[#6bc30d] transition-all ${
            isActive ? 'w-full' : 'w-0'
          }`}
        />
      </Link>
    </li>
  )
}

function UserPopover({
  user,
  onLogout,
  onAvatarClick,
  toast,
}: {
  user: { user: string; avatar?: string }
  onLogout: () => void
  onAvatarClick: () => void
  toast: ReturnType<typeof useToast>
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await onLogout()
      window.location.reload()
    } catch {
      toast.error('退出失败')
    }
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-cover bg-center bg-gray-200 cursor-pointer border-2 border-transparent hover:border-[#6bc30d]"
        style={{
          backgroundImage: user.avatar ? `url(${user.avatar})` : undefined,
        }}
        title={user.user_name}
      />
      {open && (
        <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border p-4 min-w-[120px] z-50">
          <p className="text-sm text-gray-600 mb-3">欢迎登录：{user.user_name}</p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="w-full"
          >
            退出登录
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOpen(false)
              onAvatarClick()
            }}
            className="w-full mt-2"
          >
            修改头像
          </Button>
        </div>
      )}
    </div>
  )
}

export function Nav() {
  const { user, isLoggedIn, logout } = useAuth()
  const toast = useToast()
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showAvatar, setShowAvatar] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-[60px] bg-white border-b border-[#e8e9e7] z-[999]">
        <nav className="box-border w-full max-w-[1360px] h-[60px] mx-auto px-[50px] flex items-center">
          <div className="text-[40px] text-[#777] font-['BarbaraHand']">
            Jack
          </div>
          <ul className="flex ml-auto mr-[8%]">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} label={link.label} />
            ))}
          </ul>
          <div className="flex items-center gap-2">
            {isLoggedIn && user ? (
              <UserPopover user={user} onLogout={logout} onAvatarClick={() => setShowAvatar(true)} toast={toast} />
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => setShowLogin(true)}
                >
                  登录
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowRegister(true)}
                >
                  注册
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      <Login
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false)
          setShowRegister(true)
        }}
      />
      <Register
        open={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false)
          setShowLogin(true)
        }}
      />
      <AvatarUpload open={showAvatar} onClose={() => setShowAvatar(false)} />
    </>
  )
}
