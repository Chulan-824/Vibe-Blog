const UPLOAD_BASE_URL = 'http://47.96.127.142:80'

export const uploadAvatar = async (file: File): Promise<{ success: boolean; url?: string }> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${UPLOAD_BASE_URL}/upload/avatar`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('上传失败')
  }

  const data = await response.json()
  return data
}
