import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { commitMessage } from '@/api/message'
import { MessageInput, MessageList } from '@/components/message'
import { useToast } from '@/hooks/useToast'

export const Route = createFileRoute('/message')({
  component: Message,
})

function Message() {
  const { user, isLoggedIn } = useAuth()
  const toast = useToast()

  const handleSubmit = async (content: string) => {
    if (!isLoggedIn || !user) {
      toast.error('请先登录')
      return
    }

    try {
      await commitMessage({ user: user._id, content })
      toast.success('留言成功')
      window.location.reload()
    } catch {
      toast.error('服务器错误~请稍后再试')
    }
  }

  return (
    <div className="w-full">
      <div className="mx-auto box-border max-w-[1360px] px-12 py-16">
        <div className="w-full bg-white">
          <article>
            <section className="box-border w-full p-5">
              <h2 className="text-center text-3xl font-bold">留言板</h2>
              <p className="my-4 text-center text-xl">沟通交流，拉近你我！</p>
              <MessageInput onSubmit={handleSubmit} />
            </section>
            <section className="box-border w-full p-5">
              <MessageList />
            </section>
          </article>
        </div>
      </div>
    </div>
  )
}
