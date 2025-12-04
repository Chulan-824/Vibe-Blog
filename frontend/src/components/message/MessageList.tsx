import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMessageList, commitChildMessage } from '@/api/message'
import { useAuth } from '@/hooks/useAuth'
import type { Message } from '@/types/message'

function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  const pad = (n: number) => (n < 10 ? '0' : '') + n
  return `${date.getFullYear()}年${pad(date.getMonth() + 1)}月${pad(date.getDate())}日 ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

interface ReplyState {
  parentIndex: number
  childIndex?: number
  reUser: string
  content: string
}

export function MessageList() {
  const { user, isLoggedIn } = useAuth()
  const [limit, setLimit] = useState(5)
  const [replyState, setReplyState] = useState<ReplyState | null>(null)
  const loadingRef = useRef(false)

  const { data: messagesData, refetch } = useQuery({
    queryKey: ['messages', limit],
    queryFn: () => getMessageList(0, limit),
  })

  const messages: Message[] = messagesData?.data || []

  useEffect(() => {
    const handleScroll = () => {
      if (loadingRef.current) return
      const scrollTop = document.documentElement.scrollTop
      const clientHeight = document.documentElement.clientHeight
      const scrollHeight = document.documentElement.scrollHeight

      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadingRef.current = true
        setLimit((prev) => prev + 5)
        setTimeout(() => {
          loadingRef.current = false
        }, 500)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleReplyClick = (parentIndex: number, childIndex?: number) => {
    const msg = messages[parentIndex]
    const reUser =
      childIndex !== undefined
        ? msg.children?.[childIndex]?.user?.user || ''
        : msg.user?.user || ''

    if (
      replyState?.parentIndex === parentIndex &&
      replyState?.childIndex === childIndex
    ) {
      setReplyState(null)
    } else {
      setReplyState({ parentIndex, childIndex, reUser, content: '' })
    }
  }

  const handleChildSubmit = async (parentIndex: number) => {
    if (!isLoggedIn || !user) {
      alert('请先登录')
      return
    }
    if (!replyState?.content.trim()) return

    const parentMsg = messages[parentIndex]
    try {
      const res = await commitChildMessage({
        parentId: parentMsg._id,
        user: user._id,
        content: replyState.content,
        reUser: replyState.reUser,
      })
      if (res.code) {
        alert(res.msg || '评论失败')
      } else {
        alert('评论成功')
        setReplyState(null)
        refetch()
      }
    } catch {
      alert('服务器错误~请稍后再试')
    }
  }

  const isReplyOpen = (parentIndex: number, childIndex?: number) => {
    return (
      replyState?.parentIndex === parentIndex &&
      replyState?.childIndex === childIndex
    )
  }

  return (
    <ul className="w-full">
      {messages.map((item, index) => (
        <li key={item._id} className="border-b border-dotted border-gray-800 py-5">
          {/* Parent Comment */}
          <div className="flex">
            <div
              className="h-11 w-11 shrink-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${item.user?.photo})` }}
            />
            <div className="ml-3 flex-1 border-b border-dotted border-gray-400 pb-5">
              <div className="text-[#01aaed]">{item.user?.user}</div>
              <div
                className="min-h-8 break-all py-1 text-xs"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
              <div className="text-xs text-gray-500">
                <span className="px-4">{formatTime(item.date)}</span>
                <button
                  onClick={() => handleReplyClick(index)}
                  className="text-blue-600 hover:underline"
                >
                  {isReplyOpen(index, undefined) ? '收起' : '回复'}
                </button>
              </div>
            </div>
          </div>

          {/* Child Comments */}
          {item.children?.map((child, childIndex) => (
            <div key={child.date + Math.random()} className="flex pl-12 pt-5">
              <div
                className="h-11 w-11 shrink-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${child.user?.photo})` }}
              />
              <div className="ml-3 flex-1 text-xs">
                <div>
                  <span className="mx-1 text-[#01aaed]">{child.user?.user}</span>
                  回复
                  <span className="mx-1 text-[#01aaed]">{child.reUser}</span>
                  <span>{child.content}</span>
                </div>
                <div className="pl-5 pt-1 text-gray-500">
                  <span className="mr-2.5">{formatTime(child.date)}</span>
                  <button
                    onClick={() => handleReplyClick(index, childIndex)}
                    className="text-blue-600 hover:underline"
                  >
                    {isReplyOpen(index, childIndex) ? '收起' : '回复'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Reply Box */}
          <div
            className={`overflow-hidden pl-12 pt-2.5 transition-[height] duration-300 ${
              replyState?.parentIndex === index ? 'h-25' : 'h-0'
            }`}
          >
            <textarea
              value={replyState?.parentIndex === index ? replyState.content : ''}
              onChange={(e) =>
                setReplyState((prev) =>
                  prev ? { ...prev, content: e.target.value } : null
                )
              }
              placeholder={`回复【${replyState?.reUser || ''}】：`}
              className="box-border block h-15 w-full resize-none border border-gray-400 p-2.5"
            />
            <button
              onClick={() => handleChildSubmit(index)}
              className="mt-2 rounded bg-[#1E9FFF] px-3 py-1 text-xs text-white hover:bg-[#1a8fe6]"
            >
              提交
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
