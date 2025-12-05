import { useState, useRef } from 'react'
import { EmojiPicker } from './EmojiPicker'
import { Button } from '@/components/ui/button'

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
        <Button
          onClick={handleSubmit}
          disabled={disabled || !content.trim()}
        >
          提交留言
        </Button>
      </div>
    </div>
  )
}
