import { createFileRoute } from '@tanstack/react-router'
import { BubbleCanvas } from '@/components/BubbleCanvas'
import bgImg from '@/assets/img/bg.jpg'

export const Route = createFileRoute('/about')({
  component: About,
})

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white p-5 text-base">
      <h1 className="mb-4 border-l-4 border-[#6bc30d] pl-4 text-2xl font-bold leading-6">
        {title}
      </h1>
      {children}
    </section>
  )
}

function About() {
  return (
    <div className="w-full">
      {/* Header with Canvas */}
      <div className="relative h-[260px] w-full">
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h2 className="text-2xl font-normal">关于</h2>
          <p className="mt-2">真常应物,真常得性;常应常静,常清静矣</p>
        </div>
        <BubbleCanvas height={260} />
      </div>

      {/* Main Content */}
      <div className="mx-auto box-border w-full max-w-[1360px] px-12 py-8">
        <div className="w-full bg-white">
          <article className="p-2.5">
            <Section title="关于我">
              <p className="mx-0 my-6 pl-4 leading-7">沉迷撸码，日渐消瘦。</p>
            </Section>

            <Section title="关于本站">
              <p className="mx-0 my-6 pl-4 leading-7">
                本站建于2020年1月，主要是个人爱好写着玩。
              </p>
              <span className="pl-4">本站结构：</span>
              <ul className="pl-4">
                <li className="leading-8">
                  前 端 ：
                  <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[#bd4147]">
                    Layui + ElementUI
                  </code>
                </li>
                <li className="leading-8">
                  后 端 ：
                  <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[#bd4147]">
                    nodeJS + MongoDB
                  </code>
                </li>
              </ul>
              <p className="mx-0 my-6 pl-4 leading-7">
                本站采用阿里云提供的服务器ESC和存储对象OSS。
              </p>
            </Section>

            <Section title="关于版权">
              <p className="mx-0 my-6 pl-4 leading-7">
                本站采用「{' '}
                <a
                  href="https://creativecommons.org/licenses/by-nc/4.0/deed.zh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0366d6]"
                >
                  署名-非商业性使用 4.0 国际 (CC BY-NC 4.0)
                </a>
                」创作共享协议。
                只要在使用时注明出处，那么您可以可以对本站所有原创内容进行转载、节选、二次创作，但是您不得对其用于商业目的。
              </p>
            </Section>

            <Section title="特别说明">
              <ul className="pl-4">
                <li className="leading-8">
                  本站文章仅代表个人观点，和任何组织或个人无关。
                </li>
                <li className="leading-8">
                  本站前端开发代码没有考虑对IE浏览器的兼容。
                </li>
              </ul>
              <div className="mt-8">
                <img
                  src={bgImg}
                  alt="background"
                  className="h-80 w-full object-cover"
                />
              </div>
            </Section>
          </article>
        </div>
      </div>
    </div>
  )
}
