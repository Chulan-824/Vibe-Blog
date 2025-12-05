import { Link } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import heroBg from '@/assets/img/11.jpg'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    })
  }

  return (
    <section
      className="relative h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white animate-in fade-in zoom-in duration-1000">
          <h1 className="text-4xl font-normal">楚 岚</h1>
          <h2 className="mt-5 text-sm font-normal tracking-[10px]">
            真常应物,真常得性;常应常静,常清静矣
          </h2>
          <Link
            to="/blog"
            className="mt-8 inline-block rounded bg-[#1E9FFF] px-5 py-2.5 text-sm text-white transition-opacity hover:opacity-80"
          >
            Enter Blog
          </Link>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full text-white hover:bg-[#6bc30d]"
      >
        <ChevronDown className="h-9 w-9" />
      </Button>
    </section>
  )
}
