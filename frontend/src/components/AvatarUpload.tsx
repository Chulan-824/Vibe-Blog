import { useState, useRef } from 'react'
import { Modal } from './ui/Modal'
import { uploadAvatar } from '@/api/upload'
import { Plus } from 'lucide-react'

interface AvatarUploadProps {
  open: boolean
  onClose: () => void
}

export function AvatarUpload({ open, onClose }: AvatarUploadProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return '上传头像图片只能是 JPG/PNG/GIF 格式!'
    }
    if (file.size / 1024 > 50) {
      return '上传头像图片大小不能超过 50KB!'
    }
    return null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setImageUrl(URL.createObjectURL(file))
    setUploading(true)

    try {
      await uploadAvatar(file)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch {
      setError('上传失败，请重试')
      setImageUrl('')
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setImageUrl('')
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="头像上传">
      <div className="flex flex-col items-center">
        <div
          onClick={() => inputRef.current?.click()}
          className="w-[178px] h-[178px] border border-dashed border-gray-300 rounded-md cursor-pointer flex items-center justify-center overflow-hidden hover:border-blue-500 transition-colors"
        >
          {imageUrl ? (
            <img src={imageUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <Plus className="w-7 h-7 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        {uploading && <p className="mt-3 text-sm text-blue-500">上传中...</p>}
        <p className="mt-3 text-xs text-gray-500">支持 JPG/PNG/GIF，大小不超过 50KB</p>
      </div>
    </Modal>
  )
}
