import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getArticleHot } from '@/api/article'
import {
  HeroSection,
  SideMenu,
  HotArticles,
  AboutSection,
} from '@/components/home'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  const { data: hotArticles } = useQuery({
    queryKey: ['articles', 'hot'],
    queryFn: () => getArticleHot(3),
  })

  return (
    <div className="-mt-[60px] select-none">
      <HeroSection />
      <SideMenu open={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} />
      <HotArticles articles={hotArticles?.data?.list} />
      <AboutSection />
    </div>
  )
}
