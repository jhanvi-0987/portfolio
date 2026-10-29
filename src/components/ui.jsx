import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, useInView, animate, useMotionValue, useSpring } from 'framer-motion'
import {
  Accessibility, AudioLines, Database, Glasses, Layers, Mic, ScanText,
  ShieldCheck, Smartphone, Sparkles, Users, Wrench,
} from 'lucide-react'

const icons = { Accessibility, AudioLines, Database, Glasses, Layers, Mic, ScanText, ShieldCheck, Smartphone, Users, Wrench }

export const Icon = ({ name, ...props }) => {
  const C = icons[name] || Sparkles
  return <C {...props} />
}

export const GithubIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
)

export const LinkedinIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
)

export function Reveal({ children, delay = 0, y = 28, className, as = 'div' }) {
  const M = motion[as]
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </M>
  )
}

export function SectionHead({ eyebrow, title, lede }) {
  return (
    <Reveal className="section-head">
      <span className="eyebrow">{eyebrow}</span>
      <SplitText as="h2" className="h2" text={title} />
      {lede && <p className="lede">{lede}</p>}
    </Reveal>
  )
}

export function CountUp({ value, suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, value, { duration: 1.6, ease: 'easeOut', onUpdate: setN })
    return () => c.stop()
  }, [inView, value])
  return (
    <span ref={ref}>
      {n.toFixed(decimals)}
      {suffix}
    </span>
  )
}

const EASE = [0.22, 1, 0.36, 1]

// Kinetic text. by="words" | "chars". `start` gates the animation (e.g. after the preloader);
// without `start`, it plays when scrolled into view.
export function SplitText({ text, as = 'span', by = 'words', className, wordClass, start, delay = 0, stagger, y = '115%' }) {
  const Tag = motion[as]
  const step = stagger ?? (by === 'chars' ? 0.03 : 0.07)
  const words = text.split(' ')
  let idx = 0
  // observe the (unclipped) wrapper — the animated words sit outside their overflow mask until revealed
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, margin: '-60px' })
  const go = start === undefined ? seen : start
  const anim = { animate: go ? { y: 0, rotateX: 0, opacity: 1 } : {} }
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, wi) => (
        <Fragment key={wi}>
        <span className="sc-word" aria-hidden="true">
          {by === 'chars' ? (
            [...w].map((c, ci) => (
              <motion.span key={ci} className={`sc-char ${wordClass || ''}`} initial={{ y, rotateX: -70, opacity: 0 }} {...anim} transition={{ duration: 0.8, ease: EASE, delay: delay + step * idx++ }}>
                {c}
              </motion.span>
            ))
          ) : (
            <motion.span className={`sc-char ${wordClass || ''}`} initial={{ y, rotateX: -60, opacity: 0 }} {...anim} transition={{ duration: 0.9, ease: EASE, delay: delay + step * idx++ }}>
              {w}
            </motion.span>
          )}
        </span>
        {wi < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  )
}

// 3D tilt-on-hover with a glare that follows the cursor.
export function Tilt({ as = 'div', max = 7, className = '', style, children, onMouseMove, onMouseLeave, ...rest }) {
  const M = motion[as]
  const ref = useRef(null)
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 20 })
  const can = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <M
      ref={ref}
      className={`tilt ${className}`}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000, ...style }}
      onMouseMove={(e) => {
        onMouseMove?.(e)
        if (!can()) return
        const r = ref.current.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width
        const py = (e.clientY - r.top) / r.height
        ry.set((px - 0.5) * max * 2)
        rx.set(-(py - 0.5) * max * 2)
        ref.current.style.setProperty('--cx', `${e.clientX - r.left}px`)
        ref.current.style.setProperty('--cy', `${e.clientY - r.top}px`)
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e)
        rx.set(0)
        ry.set(0)
      }}
      {...rest}
    >
      {children}
    </M>
  )
}
