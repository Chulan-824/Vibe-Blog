import { useEffect, useRef } from 'react'

class Bubble {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  dead: boolean
  color: string

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.vx = Math.random() * 3 - 1.5
    this.vy = Math.random() * 3 - 1.5
    this.r = Math.random() * 3 + 3
    this.dead = false
    this.color = '#' + Math.random().toString(16).slice(2, 8)
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.globalCompositeOperation = 'lighter'
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fill()
  }

  update() {
    this.r *= 0.96
    this.x += this.vx
    this.y += this.vy
    if (this.r < 0.01) {
      this.dead = true
    }
  }
}

interface BubbleCanvasProps {
  height?: number
}

export function BubbleCanvas({ height = 260 }: BubbleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bubblesRef = useRef<Bubble[]>([])
  const animateRef = useRef(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Reset animation state on mount
    animateRef.current = true
    bubblesRef.current = []

    const updateCanvasSize = () => {
      canvas.width = document.documentElement.offsetWidth
      canvas.height = height
    }

    updateCanvasSize()

    const autoInterval = setInterval(() => {
      bubblesRef.current.push(
        new Bubble(canvas.width * Math.random(), canvas.height * Math.random())
      )
    }, 30)

    const handleResize = () => {
      canvas.width = document.documentElement.offsetWidth
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      bubblesRef.current.push(new Bubble(e.clientX - rect.left, e.clientY - rect.top))
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      bubblesRef.current.forEach((bubble) => {
        bubble.render(ctx)
        bubble.update()
      })
      bubblesRef.current = bubblesRef.current.filter((bubble) => !bubble.dead)
      if (animateRef.current) {
        requestAnimationFrame(render)
      }
    }

    window.addEventListener('resize', handleResize)
    canvas.addEventListener('mousemove', handleMouseMove)
    render()

    return () => {
      animateRef.current = false
      clearInterval(autoInterval)
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [height])

  return (
    <canvas
      ref={canvasRef}
      height={height}
      className="block w-full bg-[#222]"
    />
  )
}
