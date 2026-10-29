import { useEffect, useRef, useState } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark'
    } catch {
      return 'dark'
    }
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))]
}

export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [ids])
  return active
}

// Writes pointer position into CSS vars on the element so ::before glows can follow the cursor.
export function useGlow() {
  const ref = useRef(null)
  const onMouseMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--cx', `${e.clientX - r.left}px`)
    el.style.setProperty('--cy', `${e.clientY - r.top}px`)
  }
  return { ref, onMouseMove }
}

export function useTyped(words, { speed = 55, hold = 1700 } = {}) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setText(words[0])
      return
    }
    let w = 0, i = 0, dir = 1, t
    const tick = () => {
      const word = words[w]
      i += dir
      setText(word.slice(0, i))
      if (dir === 1 && i === word.length) {
        dir = -1
        t = setTimeout(tick, hold)
      } else if (dir === -1 && i === 0) {
        dir = 1
        w = (w + 1) % words.length
        t = setTimeout(tick, 300)
      } else {
        t = setTimeout(tick, dir === 1 ? speed : speed / 2)
      }
    }
    t = setTimeout(tick, 600)
    return () => clearTimeout(t)
  }, [words, speed, hold])
  return text
}
