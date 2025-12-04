import { Link } from '@tanstack/react-router'
import { LinkIcon } from 'lucide-react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import type { Article } from '@/types/article'

interface HotArticlesProps {
  articles?: Article[]
}

function formatDate(dateStr: string) {
  const match = dateStr?.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!match) return { year: '', month: '', day: '' }
  return { year: match[1], month: match[2], day: match[3] }
}

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const { ref, isVisible } = useScrollAnimation<HTMLLIElement>()
  const { year, month, day } = formatDate(article.date)

  return (
    <li
      ref={ref}
      className={`flex-1 px-2.5 transition-all duration-600 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="group relative h-60 overflow-hidden">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${article.surface})` }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-white/30 opacity-0 transition-all group-hover:-translate-y-0 group-hover:opacity-100">
          <Link
            to="/article/$id"
            params={{ id: article._id }}
            className="flex h-10 w-10 items-center justify-center bg-[#333] text-white"
          >
            <LinkIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="bg-[#faf9f9] p-6 text-left">
        <div className="mb-2 truncate">
          <Link
            to="/article/$id"
            params={{ id: article._id }}
            className="text-[#333] hover:text-[#777]"
          >
            {article.title}
          </Link>
        </div>
        <div className="mb-4 text-xs text-[#bbb]">
          {year}年{month}月{day}日
        </div>
        <div className="line-clamp-3 h-15 text-sm leading-5 text-[#999]">
          {article.content}
        </div>
        <Link
          to="/article/$id"
          params={{ id: article._id }}
          className="mt-4 inline-block text-[#29b6f6] transition-colors hover:text-[#333]"
        >
          阅读更多
        </Link>
      </div>
    </li>
  )
}

export function HotArticles({ articles }: HotArticlesProps) {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>()

  return (
    <section className="relative z-10 w-full overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-[1170px] text-center">
        <div
          ref={titleRef}
          className={`transition-all duration-500 ${
            titleVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'
          }`}
        >
          <h2 className="relative pb-8 text-3xl font-medium">
            热门文章
            <span className="absolute bottom-0 left-1/2 h-0.5 w-12 -translate-x-1/2 bg-[#00c2ff]" />
          </h2>
          <p className="mt-5 leading-6 text-[#888]">
            螃蟹在剥我的壳，笔记本在写我
            <br />
            漫天的我落在枫叶上雪花上，而你在想我。
          </p>
        </div>
        <ul className="mt-12 flex">
          {articles?.map((article, index) => (
            <ArticleCard key={article._id} article={article} index={index} />
          ))}
        </ul>
      </div>
    </section>
  )
}
