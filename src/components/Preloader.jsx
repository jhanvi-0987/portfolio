import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { sfx } from '../sound'

export default function Preloader({ onDone }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dur = reduce ? 300 : 1900
    const start = performance.now()
    let raf, t
    const safety = setTimeout(onDone, dur + 1500) // never let the loader block the site if frames stall
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
      else {
        sfx.chime()
        t = setTimeout(onDone, 320)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); clearTimeout(t); clearTimeout(safety) }
  }, [onDone])

  return (
    <motion.div
      className="preloader"
      role="status"
      aria-label="Loading"
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      initial={{ clipPath: 'inset(0 0 0% 0)' }}
    >
      <div className="pre-mark">
        <span className="pre-j accent-text">J</span>
        <svg className="pre-ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="54" />
          <circle cx="60" cy="60" r="54" className="arc" style={{ strokeDashoffset: 339 - (339 * n) / 100 }} />
        </svg>
      </div>
      <div className="pre-name">Jahanvi Makwana</div>
      <div className="pre-count">{String(n).padStart(3, '0')}</div>
    </motion.div>
  )
}
