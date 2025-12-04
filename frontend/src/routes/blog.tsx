import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BlogSidebar, ArticleList } from '@/components/blog'

export const Route = createFileRoute('/blog')({
  component: Blog,
})

function Blog() {
  const [currentTag, setCurrentTag] = useState(0)

  return (
    <div className="w-full select-none pt-5">
      <div className="mx-auto box-border flex w-full max-w-[1360px] px-12">
        <ArticleList tagIndex={currentTag} />
        <BlogSidebar currentTag={currentTag} onTagChange={setCurrentTag} />
      </div>
    </div>
  )
}
