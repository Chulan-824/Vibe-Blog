import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getArticleById, getArticleExtend } from '@/api/article'
import { sanitizeHtml } from '@/lib/sanitize'
import notFoundImg from '@/assets/404.gif'

export const Route = createFileRoute('/article/$id')({
  component: Article,
})

function formatDateTime(val: string) {
  const date = new Date(val)
  const pad = (n: number) => (n < 10 ? '0' : '') + n
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function parseDate(dateStr: string) {
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (!match) return { year: '', month: '', day: '' }
  return { year: match[1], month: match[2], day: match[3] }
}

function Article() {
  const { id } = Route.useParams()

  const {
    data: article,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['article', id],
    queryFn: () => getArticleById(id),
  })

  const { data: extendList } = useQuery({
    queryKey: ['article-extend', article?.tag],
    queryFn: () => getArticleExtend(article!.tag),
    enabled: !!article?.tag,
  })

  if (isLoading) {
    return (
      <div className="max-w-[1360px] mx-auto px-[50px] py-[70px]">
        <div className="bg-white p-5 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <img src={notFoundImg} alt="404 Not Found" className="max-w-full" />
        <Link
          to="/"
          className="mt-6 px-6 py-2 bg-[#6bc30d] text-white rounded hover:bg-[#5aa30b] transition-colors"
        >
          返回首页
        </Link>
      </div>
    )
  }

  const { year, month, day } = parseDate(article.date)

  return (
    <div className="max-w-[1360px] mx-auto px-[50px] py-[70px] text-[#515250]">
      <div className="relative bg-white p-5 w-full">
        {/* 标题区 */}
        <section className="pr-[130px] pb-[5px] border-b border-[#e8e9e7]">
          <h4 className="mt-[5px] text-xl font-normal text-[#515250]">
            {article.title}
          </h4>
          <p className="text-[#787977]">
            <small>
              作者：<a className="text-[#3e8bc7]">楚岚</a>
            </small>
            <small className="ml-2.5">
              围观群众：<i className="not-italic">{article.pv || 0}</i>
            </small>
            <small className="ml-2.5">
              更新于 <span>{formatDateTime(article.updateTime)}</span>
            </small>
          </p>
        </section>

        {/* 日期展示区 */}
        <section className="absolute right-2.5 top-[15px] w-[90px] bg-white px-5 pb-[5px] font-mono leading-8">
          <p className="text-center font-bold text-[40px] text-[#6bc30d] relative top-0.5">
            {day}
          </p>
          <p className="inline-block text-[#989997] text-lg">
            {month}<span className="text-sm">月</span>
          </p>
          <p className="inline-block text-[#989997] ml-2.5 text-lg">{year}</p>
        </section>

        {/* 内容区 */}
        <section
          className="border-b border-[#e1e2e0] pb-5 mt-5 min-h-[200px] leading-7 text-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
        />

        {/* 版权区 */}
        <section className="clear-both bg-[#f8f9f7] px-5 py-[15px] leading-[22px] text-xs text-[#787977]">
          <p className="text-[#212220] overflow-hidden whitespace-nowrap text-ellipsis">
            非特殊说明，本文版权归 楚岚 所有，转载请注明出处.
          </p>
          <p className="overflow-hidden whitespace-nowrap text-ellipsis">
            本文标题：
            <span className="text-[#3e8bc7]">{article.title}</span>
          </p>
        </section>

        {/* 延伸阅读 */}
        {extendList && extendList.length > 0 && (
          <section>
            <h6 className="my-5 border-l-[3px] border-[#6bc30d] min-h-[26px] leading-[26px] px-5 py-[5px] bg-[#f8f9f7] text-base font-normal text-[#585957]">
              延伸阅读
            </h6>
            <ol className="space-y-2">
              {extendList.map((item) => (
                <li
                  key={item._id}
                  className="overflow-hidden whitespace-nowrap text-ellipsis before:content-['◈'] before:mr-[5px] before:text-[#787977]"
                >
                  <Link
                    to="/article/$id"
                    params={{ id: item._id }}
                    className="text-[#3e8bc7] hover:text-[#6bc30d] hover:underline"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  )
}
