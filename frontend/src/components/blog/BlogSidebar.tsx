import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getArticleInfo, getArticleHot, searchArticle } from '@/api/article'
import { getVisitor } from '@/api/visitor'
import { Button } from '@/components/ui/button'

interface BlogSidebarProps {
  currentTag: number
  onTagChange: (index: number) => void
}

export function BlogSidebar({ currentTag, onTagChange }: BlogSidebarProps) {
  const [isFixed, setIsFixed] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchResults, setSearchResults] = useState<{ _id: string; title: string }[]>([])
  const [hoverIndex, setHoverIndex] = useState(currentTag)

  const { data: articleInfo } = useQuery({
    queryKey: ['article', 'info'],
    queryFn: () => getArticleInfo(),
  })

  const { data: hotArticles } = useQuery({
    queryKey: ['article', 'hot'],
    queryFn: () => getArticleHot(8),
  })

  const { data: visitors } = useQuery({
    queryKey: ['visitors'],
    queryFn: () => getVisitor(),
  })

  const tags = ['全部文章', ...(articleInfo?.data?.tags || [])]
  const recommend = hotArticles?.data?.list?.[0]

  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(document.documentElement.scrollTop >= 900)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setHoverIndex(currentTag)
  }, [currentTag])

  useEffect(() => {
    const timer = setTimeout(async () => {
      const keywords = searchInput.trim()
      if (keywords) {
        try {
          const res = await searchArticle(keywords)
          setSearchResults(res.data?.list || [])
        } catch {
          setSearchResults([])
        }
      } else {
        setSearchResults([])
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  return (
    <aside className="w-[300px]">
      {/* Search */}
      <div
        className={`w-full bg-white pb-5 ${
          isFixed ? 'fixed top-20 z-[3] w-[300px] animate-[searchMove_0.5s_ease-in-out_forwards]' : ''
        }`}
      >
        <div className="relative z-[2] box-border h-20 w-full bg-gray-500 p-5">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="请输入搜索内容"
            className="relative z-[3] h-10 w-full rounded-full border-0 pl-4 pr-10 outline-none"
          />
          <Search className="absolute right-8 top-7 z-[4] h-5 w-5 text-gray-500" />
          {searchResults.length > 0 && (
            <ul className="absolute top-11 w-[260px] rounded-b-lg bg-white pt-6 shadow">
              {searchResults.map((item) => (
                <li key={item._id} className="h-10 overflow-hidden px-1.5 leading-8">
                  <Link
                    to="/article/$id"
                    params={{ id: item._id }}
                    className="block h-full w-full hover:bg-gray-200"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Tags */}
        <div
          className="relative mt-5 w-full"
          onMouseLeave={() => setHoverIndex(currentTag)}
        >
          <ul className="w-full">
            {tags.map((tag, index) => (
              <li
                key={tag}
                className="relative z-[1] box-border h-10 w-full leading-10"
                onMouseEnter={() => setHoverIndex(index)}
              >
                <Button
                  variant="ghost"
                  onClick={() => onTagChange(index)}
                  className="block h-full w-full justify-start rounded-none border-b border-dotted border-gray-200 px-8 text-left text-[#787977]"
                >
                  {tag}
                </Button>
              </li>
            ))}
          </ul>
          <div
            className="absolute left-0 box-border h-10 w-full border-r-4 border-black bg-black/5 transition-[top] duration-300"
            style={{ top: `${hoverIndex * 40}px` }}
          />
        </div>
      </div>

      {/* Hot Articles */}
      <div className="mt-5 box-border w-full bg-white px-5 py-4">
        <h3 className="border-b border-[#e8e9e7] pb-2.5 text-lg font-normal text-[#383937]">
          热门文章
        </h3>
        <ul className="mt-4">
          {hotArticles?.data?.list?.slice(0, 8).map((item, index) => (
            <li key={item._id} className="my-2 h-8 overflow-hidden leading-8">
              <i
                className={`mr-2.5 inline-block h-5.5 w-5.5 rounded-full text-center text-xs leading-5.5 ${
                  index === 0
                    ? 'bg-[#e24d46] text-white'
                    : index === 1
                      ? 'bg-[#2ea7e0] text-white'
                      : index === 2
                        ? 'bg-[#6bc30d] text-white'
                        : 'bg-[#edefee] text-[#666]'
                }`}
              >
                {index + 1}
              </i>
              <Link
                to="/article/$id"
                params={{ id: item._id }}
                className="text-sm text-[#787977] hover:text-[#6bc30d] hover:underline"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommend */}
      {recommend && (
        <div className="mt-5 box-border w-full bg-white px-5 py-4">
          <h3 className="border-b border-[#e8e9e7] pb-2.5 text-lg font-normal text-[#383937]">
            置顶推荐
          </h3>
          <ul className="mt-4">
            <li className="my-2 h-8 overflow-hidden leading-8">
              <i className="mr-2.5 inline-block h-5.5 w-5.5 rounded-full bg-[#e24d46] text-center text-xs leading-5.5 text-white">
                1
              </i>
              <Link
                to="/article/$id"
                params={{ id: recommend._id }}
                className="text-sm text-[#787977] hover:text-[#6bc30d] hover:underline"
              >
                {recommend.title}
              </Link>
            </li>
          </ul>
        </div>
      )}

      {/* Visitors */}
      <div className="mt-5 box-border w-full bg-white px-5 py-4">
        <h3 className="border-b border-[#e8e9e7] pb-2.5 text-lg font-normal text-[#383937]">
          最近访客
        </h3>
        <ul className="mt-2.5 flex flex-wrap after:clear-both after:block after:h-0 after:w-0 after:content-['']">
          {visitors?.data?.list?.slice(0, 8).map((item) => (
            <li
              key={item._id}
              className="relative m-[1%] h-15 w-[23%] bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${item.user?.avatar})` }}
            >
              <p className="absolute bottom-0 left-0 h-5 w-full truncate bg-black/30 text-center text-xs leading-5 text-white">
                {item.user?.user_name}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        @keyframes searchMove {
          0% { top: -500px }
          40% { top: 81px }
          65% { top: 70px }
          100% { top: 81px }
        }
      `}</style>
    </aside>
  )
}
