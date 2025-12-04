import { useState, useEffect, useCallback } from 'react'
import { Link } from '@tanstack/react-router'
import { Send, Eye, MessageCircle } from 'lucide-react'
import { getArticleShow } from '@/api/article'
import type { Article } from '@/types/article'

interface ArticleListProps {
  tagIndex: number
}

function formatDate(dateStr: string) {
  const match = dateStr?.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!match) return { year: '', month: '', day: '' }
  return { year: match[1], month: match[2], day: match[3] }
}

const TAGS = ['', 'HTML&Css', 'JavaScript', 'Node', 'Vue&React', 'Other']

export function ArticleList({ tagIndex }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [skip, setSkip] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [noMore, setNoMore] = useState(false)
  const limit = 5

  const loadArticles = useCallback(
    async (reset = false) => {
      if (isLoading) return
      setIsLoading(true)

      const currentSkip = reset ? 0 : skip
      const tag = TAGS[tagIndex] || ''

      try {
        const res = await getArticleShow({ skip: currentSkip, limit, tag })
        const data = res.data || []

        if (reset) {
          setArticles(data)
          setSkip(limit)
          setNoMore(data.length < limit)
        } else {
          if (data.length > 0) {
            setArticles((prev) => [...prev, ...data])
            setSkip(currentSkip + limit)
          } else {
            setNoMore(true)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    },
    [tagIndex, skip, isLoading]
  )

  // Reset when tag changes
  useEffect(() => {
    setArticles([])
    setSkip(0)
    setNoMore(false)
    document.documentElement.scrollTop = 0

    const tag = TAGS[tagIndex] || ''
    getArticleShow({ skip: 0, limit, tag }).then((res) => {
      const data = res.data || []
      setArticles(data)
      setSkip(limit)
      setNoMore(data.length < limit)
    })
  }, [tagIndex])

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (noMore || isLoading) return
      const scrollTop = document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight
      const scrollHeight = document.documentElement.scrollHeight

      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadArticles(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [noMore, isLoading, loadArticles])

  return (
    <div className="flex-1 pr-5">
      {articles.map((item, index) => {
        const { year, month, day } = formatDate(item.date)
        return (
          <section
            key={item._id}
            className="relative mb-5 box-border w-full animate-[articleShow_0.5s_forwards] overflow-hidden bg-white px-8 pb-6 pt-5"
          >
            {index === 0 && (
              <span className="absolute -left-4.5 top-2 w-18 -rotate-45 bg-[#ff5722] text-center text-xs leading-5 text-white">
                置顶
              </span>
            )}
            <h5 className="border-b border-[#e8e9e7] py-1.5 pr-32 text-lg font-normal">
              <span className="align-bottom text-base text-[#2ea7e0]">
                【{item.type || item.tag}】
              </span>
              <Link
                to="/article/$id"
                params={{ id: item._id }}
                className="text-black no-underline hover:text-[#6bc30d] hover:underline"
              >
                {item.title}
              </Link>
            </h5>
            <div className="absolute right-2.5 top-2.5 h-18 w-22 bg-white px-5 pb-1.5 font-mono">
              <p className="relative top-0.5 text-center text-4xl font-bold text-[#6bc30d]">
                {day}
              </p>
              <p className="inline-block text-lg text-[#989997]">
                {month}<span className="text-sm">月</span>
              </p>
              <p className="ml-2.5 inline-block text-lg text-[#989997]">{year}</p>
            </div>
            <div className="relative mt-5 min-h-50 leading-7">
              <Link
                to="/article/$id"
                params={{ id: item._id }}
                className="group relative float-left mr-5 block h-45 w-75 overflow-hidden border border-[#e8e9e7] bg-cover bg-top"
                style={{ backgroundImage: `url(${item.surface})` }}
              >
                <i className="absolute left-0 top-0 block h-full w-0 -translate-x-10 skew-x-[-15deg] shadow-[0_0_30px_20px_rgba(255,255,255,0.2)] transition-transform duration-500 group-hover:translate-x-[350px] group-hover:delay-500" />
              </Link>
              {item.content}
            </div>
            <div className="relative before:absolute before:left-25 before:right-0 before:top-5 before:h-px before:bg-[#d0d0d0] before:content-['']">
              <Link
                to="/article/$id"
                params={{ id: item._id }}
                className="font-bold leading-10 text-[#383937] no-underline hover:text-[#6bc30d] hover:underline"
              >
                继续阅读
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Send className="mr-1.5 h-4.5 w-4.5 text-[#666]" />
                <span className="m-0.5 bg-[#f1f2f0] px-1.5 py-0.5 text-xs text-[#787977] transition-all hover:bg-[#6bc30d] hover:text-white">
                  {item.tag}
                </span>
              </div>
              <div className="flex items-center text-[#666]">
                <span className="flex items-center">
                  <Eye className="mr-1 h-4 w-4" />
                  <span className="mr-3">{item.pv || 0}</span>
                </span>
                <span className="ml-5 flex items-center">
                  <MessageCircle className="mr-1 h-4 w-4" />
                  <span>{item.comment?.length || 0}</span>
                </span>
              </div>
            </div>
          </section>
        )
      })}

      {isLoading && (
        <div className="relative h-10.5 bg-white text-center">
          <span className="inline-block h-10.5 align-middle leading-10.5">加载中</span>
          <svg viewBox="25 25 50 50" className="inline-block h-10.5 w-10.5 animate-spin align-middle">
            <circle
              cx="50"
              cy="50"
              r="20"
              fill="none"
              strokeWidth="2"
              stroke="#409eff"
              strokeLinecap="round"
              strokeDasharray="90,150"
              strokeDashoffset="0"
            />
          </svg>
        </div>
      )}

      {noMore && (
        <p className="h-8 bg-white text-center text-xs leading-8">
          哼╭(╯^╰)╮我也是有底线的！！
        </p>
      )}

      <style>{`
        @keyframes articleShow {
          from { opacity: 0.5; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
