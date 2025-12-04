import { Link } from '@tanstack/react-router'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import aboutBg from '@/assets/img/22.jpg'

export function AboutSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLUListElement>()

  return (
    <section
      className="relative z-10 w-full bg-cover bg-fixed bg-center py-28"
      style={{ backgroundImage: `url(${aboutBg})` }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <ul
        ref={ref}
        className={`relative z-10 mx-auto flex justify-center gap-8 transition-all duration-600 ${
          isVisible ? 'w-[425px] opacity-100' : 'w-[1000px] opacity-0'
        }`}
      >
        <li className="group relative h-12 w-48 border border-white">
          <span className="absolute inset-0 w-0 bg-[#6bc30d] transition-all duration-500 group-hover:w-full" />
          <Link
            to="/about"
            className="relative z-10 flex h-full w-full items-center justify-center text-white"
          >
            关于
          </Link>
        </li>
        <li className="group relative h-12 w-48 border border-white">
          <span className="absolute inset-0 w-0 bg-[#6bc30d] transition-all duration-500 group-hover:w-full" />
          <Link
            to="/links"
            className="relative z-10 flex h-full w-full items-center justify-center text-white"
          >
            +友情链接
          </Link>
        </li>
      </ul>
    </section>
  )
}
