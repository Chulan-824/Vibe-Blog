import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/diary')({
  component: Diary,
})

interface DiaryItem {
  txt: string
  img: string[]
  date: string
}

const diaryList: DiaryItem[] = [
  { txt: '这是我写的第1篇日志。', img: ['/img/diary/11.jpg', '/img/diary/22.jpg'], date: '2020/1/5' },
  { txt: '这是我写的第2篇日志。', img: [], date: '2020/1/5' },
  { txt: '这是我写的第3篇日志。', img: [], date: '2020/1/5' },
  { txt: '这是我写的第4篇日志。', img: [], date: '2020/1/5' },
  { txt: '这是我写的第5篇日志。', img: ['/img/diary/bg.jpg'], date: '2020/1/5' },
  { txt: '这是我写的第6篇日志。', img: [], date: '2020/1/5' },
]

function Diary() {
  return (
    <div className="mx-auto box-border w-full max-w-[1360px] px-12 py-5">
      <div className="box-border w-full bg-white py-8 pl-[20%] pr-[8%]">
        <div className="relative border-l-2 border-gray-200">
          {diaryList.map((item, index) => (
            <div key={index} className="relative pb-8 pl-8">
              {/* Timeline dot */}
              <div className="absolute -left-2 top-1 h-3 w-3 rounded-full bg-[#6bc30d]" />
              {/* Timestamp */}
              <div className="absolute -left-36 -top-1 text-xl font-bold text-[#6bc30d]">
                {item.date}
              </div>
              {/* Card */}
              <div className="rounded border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm leading-8">{item.txt}</p>
                {item.img.map((src, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={src}
                    alt=""
                    className="mt-2 w-full"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
