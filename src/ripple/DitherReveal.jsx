import { useEffect, useRef } from 'react'
import { isRippleEnabled } from './rippleEngine'

const RADIUS = 35

export default function DitherReveal({ src, ditheredSrc, alt, className }) {
  const containerRef = useRef(null)
  const circleRef = useRef(null)
  const enabled = isRippleEnabled()

  useEffect(() => {
    if (!enabled) return undefined
    const container = containerRef.current
    const circle = circleRef.current
    if (!container || !circle) return undefined

    let lastX = 0
    let lastY = 0

    const setCircle = (x, y, r) => {
      circle.style.cx = `${x}px`
      circle.style.cy = `${y}px`
      circle.style.r = `${r}px`
    }

    const onMove = (e) => {
      const rect = container.getBoundingClientRect()
      lastX = e.clientX - rect.left
      lastY = e.clientY - rect.top
      setCircle(lastX, lastY, RADIUS)
    }

    const onLeave = () => setCircle(lastX, lastY, 0)

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)
    return () => {
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled])

  if (!enabled) {
    return <img src={src} alt={alt} className={className} />
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="dither-ripple-edge" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.14" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <mask id="dither-reveal-mask">
            <circle
              ref={circleRef}
              cx="0"
              cy="0"
              r="0"
              fill="white"
              filter="url(#dither-ripple-edge)"
              style={{ transition: 'cx 350ms ease-out, cy 350ms ease-out, r 350ms ease-out' }}
            />
          </mask>
        </defs>
      </svg>
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover object-bottom" />
      <img
        src={ditheredSrc}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom"
        style={{ WebkitMaskImage: 'url(#dither-reveal-mask)', maskImage: 'url(#dither-reveal-mask)' }}
      />
    </div>
  )
}
