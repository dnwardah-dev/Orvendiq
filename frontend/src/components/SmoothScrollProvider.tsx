import { useEffect, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode
}) {
  useEffect(() => {
    const media = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )

    let cleanupLenis: (() => void) | undefined

    const setup = () => {
      cleanupLenis?.()
      cleanupLenis = undefined

      // Smooth by default; respect OS accessibility settings.
      if (media.matches) return

      const lenis = new Lenis({
        duration: 1.15,
        smoothWheel: true,
        autoRaf: false,
      })

      const syncScroll = () => ScrollTrigger.update()

      const tick = (time: number) => {
        lenis.raf(time * 1000)
      }

      lenis.on('scroll', syncScroll)
      gsap.ticker.add(tick)
      ScrollTrigger.refresh()

      cleanupLenis = () => {
        lenis.off('scroll', syncScroll)
        gsap.ticker.remove(tick)
        lenis.destroy()
      }
    }

    setup()
    media.addEventListener('change', setup)

    return () => {
      media.removeEventListener('change', setup)
      cleanupLenis?.()
    }
  }, [])

  return <>{children}</>
}