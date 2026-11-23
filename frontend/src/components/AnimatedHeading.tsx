import { useEffect, useMemo, useRef } from 'react'
import type { ElementType, ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type AnimatedHeadingProps = {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  children?: ReactNode
}

export default function AnimatedHeading({
  text,
  as: Tag = 'h1',
  className = '',
  delay = 0,
  children,
}: AnimatedHeadingProps) {
  const headingRef = useRef<HTMLElement | null>(null)

  const words = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean),
    [text]
  )

  useEffect(() => {
    const heading = headingRef.current
    if (!heading) return

    const media = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    )

    if (media.matches) return

    const context = gsap.context(() => {
      const elements = heading.querySelectorAll(
        '[data-orv-word]'
      )

      gsap.fromTo(
        elements,
        {
          y: 22,
          autoAlpha: 0,
          filter: 'blur(7px)',
        },
        {
          y: 0,
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration: 0.75,
          stagger: 0.13,
          delay,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility,filter',
          scrollTrigger: {
            trigger: heading,
            start: 'top 90%',
            once: true,
          },
        }
      )
    }, heading)

    return () => context.revert()
  }, [text, delay])

  return (
    <Tag
      ref={headingRef}
      className={className}
      aria-label={text}
    >
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span
            key={`${index}-${word}`}
            className="inline-block overflow-hidden align-bottom"
          >
            <span
              data-orv-word
              className="inline-block"
            >
              {word}
            </span>
            {index < words.length - 1 ? '\u00A0' : ''}
          </span>
        ))}
      </span>
      {children}
    </Tag>
  )
}