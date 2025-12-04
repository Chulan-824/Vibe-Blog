import { createFileRoute } from '@tanstack/react-router'
import { BubbleCanvas } from '@/components/BubbleCanvas'
import linkIcon from '@/assets/img/wy.jpg'

export const Route = createFileRoute('/links')({
  component: Links,
})

interface LinkItem {
  name: string
  href: string
  icon?: string
  des: string
}

const linksList: LinkItem[] = [
  { name: '欢迎加入', href: 'https://www.baidu.com', des: '热爱并坚持使用.欢迎分享' },
  { name: '欢迎加入', href: 'https://www.baidu.com', des: '热爱并坚持使用.欢迎分享' },
  { name: '欢迎加入', href: 'https://www.baidu.com', des: '热爱并坚持使用.欢迎分享' },
  { name: '欢迎加入', href: 'https://www.baidu.com', des: '热爱并坚持使用.欢迎分享' },
  { name: '欢迎加入', href: 'https://www.baidu.com', des: '热爱并坚持使用.欢迎分享' },
  { name: '欢迎加入', href: 'https://www.baidu.com', des: '热爱并坚持使用.欢迎分享' },
  { name: '欢迎加入', href: 'https://www.baidu.com', des: '热爱并坚持使用.欢迎分享' },
  { name: '欢迎加入', href: 'https://www.baidu.com', des: '热爱并坚持使用.欢迎分享' },
]

function Links() {
  return (
    <div className="w-full">
      {/* Header with Canvas */}
      <div className="relative h-[260px] w-full">
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center text-white">
          <h2 className="text-2xl font-normal">友情链接</h2>
          <p className="mt-2">真常应物,真常得性;常应常静,常清静矣</p>
        </div>
        <BubbleCanvas height={260} />
      </div>

      {/* Main Content */}
      <div className="mx-auto box-border w-full max-w-[1360px] px-12 py-8">
        {/* Rules */}
        <div className="box-border w-full bg-white p-5">
          <h3 className="mb-4 border-l-4 border-[#6bc30d] pl-4 text-2xl font-bold leading-6">
            链接申请说明
          </h3>
          <p className="my-6 pl-4 leading-7 text-[#515250]">
            <span className="text-red-500">✕</span> 经常宕机&nbsp;
            <span className="text-red-500">✕</span> 不合法规&nbsp;
            <span className="text-red-500">✕</span> 插边球站&nbsp;
            <span className="text-red-500">✕</span> 红标报毒&nbsp;
            <span className="text-green-500">✓</span> 原创优先&nbsp;
            <span className="text-green-500">✓</span> 技术优先
          </p>
          <p className="my-6 pl-4 leading-7 text-[#515250]">
            交换友链可在留言板留言.本站链接如下：
            <br />
            名称：楚岚
            <br />
            网址：https://www.chulan.fun
            <br />
            图标：https://www.chulan.fun
            <br />
            描述：楚岚·一个认真的普通人
          </p>
        </div>

        {/* Links Grid */}
        <div className="mt-5 w-full">
          <ul className="flex flex-wrap justify-between">
            {linksList.map((item, index) => (
              <li
                key={index}
                className="mt-[2%] box-border h-[150px] w-[23.5%] cursor-pointer bg-white transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white p-5 text-[#333]"
                >
                  <img
                    src={item.icon || linkIcon}
                    alt={item.name}
                    className="float-left h-10 w-10 rounded-full"
                  />
                  <h3 className="h-5 overflow-hidden px-4 py-2.5 font-normal">
                    {item.name}
                  </h3>
                  <p className="mt-4 line-clamp-3 h-15 overflow-hidden text-ellipsis text-[13px] clear-both">
                    {item.des}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
