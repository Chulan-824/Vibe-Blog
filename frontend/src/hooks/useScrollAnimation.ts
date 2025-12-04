import { useEffect, useRef, useState } from 'react'

export function useScrollAnimation<T extends HTMLElement>(threshold = 100) {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      if (rect.top < windowHeight - threshold) {
        setIsVisible(true)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return { ref, isVisible }
}
