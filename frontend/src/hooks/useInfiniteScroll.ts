import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  threshold?: number
  onLoadMore: () => void
  enabled?: boolean
}

export function useInfiniteScroll({
  threshold = 200,
  onLoadMore,
  enabled = true,
}: UseInfiniteScrollOptions) {
  const loadingRef = useRef(false)

  const handleScroll = useCallback(() => {
    if (!enabled || loadingRef.current) return

    const scrollTop = document.documentElement.scrollTop
    const clientHeight = document.documentElement.clientHeight
    const scrollHeight = document.documentElement.scrollHeight

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loadingRef.current = true
      onLoadMore()
      setTimeout(() => {
        loadingRef.current = false
      }, 500)
    }
  }, [enabled, threshold, onLoadMore])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return {
    setLoading: (loading: boolean) => {
      loadingRef.current = loading
    },
  }
}
