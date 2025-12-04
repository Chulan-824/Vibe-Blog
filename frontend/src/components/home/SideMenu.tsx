import { Link } from '@tanstack/react-router'

interface SideMenuProps {
  open: boolean
  onToggle: () => void
}

export function SideMenu({ open, onToggle }: SideMenuProps) {
  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={onToggle}
        className={`fixed right-14 top-10 z-[999] flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-full transition-colors ${
          open ? 'bg-black/10' : 'bg-transparent hover:bg-[#6bc30d]'
        }`}
      >
        <span
          className={`block h-0.5 w-6 bg-white transition-all ${
            open ? 'translate-y-2 rotate-45' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-white transition-all ${
            open ? '-translate-y-0 -rotate-45' : ''
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-white transition-all ${
            open ? 'opacity-0' : ''
          }`}
        />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[8] bg-black/50 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Sliding Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-[35%] origin-right -skew-x-12 bg-[#F9F9F8] transition-transform ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        />

        {/* Navigation Links */}
        <nav
          className={`absolute right-0 top-48 z-[101] transition-opacity ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {[
            { to: '/', label: '首页' },
            { to: '/blog', label: '博客' },
            { to: '/message', label: '留言' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onToggle}
              className="group relative block px-8 py-3 text-right text-xl text-[#686967] transition-colors hover:text-[#6bc30d]"
            >
              <span className="absolute left-0 top-1/2 h-px w-0 bg-[#6bc30d] opacity-0 transition-all group-hover:w-full group-hover:opacity-100" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Logo */}
        <div
          className={`absolute bottom-0 right-0 z-[101] p-6 font-['BarbaraHand'] text-5xl text-[#686967] transition-opacity ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Jack
        </div>
      </div>
    </>
  )
}
