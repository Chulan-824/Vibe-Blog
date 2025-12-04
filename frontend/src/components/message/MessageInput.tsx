import { useState, useRef } from 'react'
import { EmojiPicker } from './EmojiPicker'

interface MessageInputProps {
  onSubmit: (content: string) => void
  disabled?: boolean
}

export function MessageInput({ onSubmit, disabled }: MessageInputProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    if (!content.trim()) return
    onSubmit(content)
    setContent('')
  }

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.slice(0, start) + emoji + content.slice(end)
      setContent(newContent)
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      }, 0)
    } else {
      setContent(prev => prev + emoji)
    }
  }

  return (
    <div className="mt-4">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的留言..."
        className="w-full h-32 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex items-center justify-between mt-3">
        <EmojiPicker onSelect={insertEmoji} />
        <button
          onClick={handleSubmit}
          disabled={disabled || !content.trim()}
          className="px-6 py-2 bg-[#1E9FFF] text-white rounded hover:bg-[#1a8fe6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          提交留言
        </button>
      </div>
    </div>
  )
}
