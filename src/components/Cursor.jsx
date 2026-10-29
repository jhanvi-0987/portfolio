import { useEffect, useState } from 'react'
import { motion, useMotionValue } from 'framer-motion'

const INTERACTIVE = 'a, button, .skill-tab, .btn, .icon-btn'

// One circle locked to the pointer hotspot: ring and dot share a single position (no spring/lag),
// so they can never drift apart from where you are actually pointing.
export default function Cursor() {
  const [enabled] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  const [mode, setMode] = useState('hidden') // hidden | idle | hover | down
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  useEffect(() => {
    if (!enabled) return
    const root = document.documentElement
    const interactive = (t) => !!t?.closest?.(INTERACTIVE)
    const move = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return
      x.set(e.clientX)
      y.set(e.clientY)
      root.classList.add('has-cursor')
      setMode((m) => (m === 'down' ? m : interactive(e.target) ? 'hover' : 'idle'))
    }
    const down = () => setMode('down')
    const up = (e) => setMode(interactive(e.target) ? 'hover' : 'idle')
    const leave = () => setMode('hidden')
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.documentElement.addEventListener('mouseleave', leave)
    return () => {
      root.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [enabled, x, y])

  if (!enabled) return null
  return (
    <motion.div className="cursor" style={{ x, y }} data-mode={mode} aria-hidden="true">
      <span className="cursor-ring" />
      <span className="cursor-dot" />
    </motion.div>
  )
}
