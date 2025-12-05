import { useState, useRef, useEffect } from 'react'
import { Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘',
  '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪',
  '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
  '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨',
  '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒',
  '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵',
  '👍', '👎', '👏', '🙌', '🤝', '❤️', '🧡', '💛',
  '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕',
  '🎉', '🎊', '🎈', '🎁', '✨', '🌟', '⭐', '🔥',
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        title="插入表情"
      >
        <Smile className="w-5 h-5" />
      </Button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-[280px] bg-white border rounded-lg shadow-lg p-2 z-50">
          <div className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto">
            {emojis.map((emoji, index) => (
              <Button
                key={index}
                type="button"
                variant="ghost"
                onClick={() => {
                  onSelect(emoji)
                  setOpen(false)
                }}
                className="w-8 h-8 p-0 text-lg"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
