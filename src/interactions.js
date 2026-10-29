import { sfx } from './sound'

const RIPPLE = '.btn, .icon-btn, .skill-tab, .mobile-menu a'
const CLICKABLE = 'a[href], button, .skill-tab'
const HOVER = '.btn, .nav-links a, .icon-btn, .skill-tab, .mobile-menu a'
const MAGNETIC = '.btn, .icon-btn:not(.to-top)'

// Global, delegated: click ripple + click sounds + hover tick + magnetic pull.
export function installInteractions() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let hovered = null
  let magnet = null

  const onClick = (e) => {
    const el = e.target.closest(CLICKABLE)
    if (!el) return
    const sound = el.dataset.sound
    if (sound !== 'none') {
      if (sound && sfx[sound]) sfx[sound]()
      else if (el.getAttribute('href')?.startsWith('#')) sfx.whoosh()
      else sfx.click()
    }
    const host = e.target.closest(RIPPLE)
    if (host && !reduce) {
      const r = host.getBoundingClientRect()
      const size = Math.max(r.width, r.height) * 2
      const s = document.createElement('span')
      s.className = 'ripple'
      s.style.cssText = `width:${size}px;height:${size}px;left:${(e.clientX || r.left + r.width / 2) - r.left - size / 2}px;top:${(e.clientY || r.top + r.height / 2) - r.top - size / 2}px`
      host.appendChild(s)
      setTimeout(() => s.remove(), 700)
    }
  }

  const onOver = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return
    const el = e.target.closest?.(HOVER)
    if (el && el !== hovered) sfx.hover()
    hovered = el
  }

  const reset = (el) => {
    el.style.setProperty('--tx', '0px')
    el.style.setProperty('--ty', '0px')
  }
  const onMove = (e) => {
    if (!fine || reduce) return
    const el = e.target.closest?.(MAGNETIC)
    if (magnet && magnet !== el) reset(magnet)
    magnet = el || null
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--tx', `${(e.clientX - (r.left + r.width / 2)) * 0.1}px`)
    el.style.setProperty('--ty', `${(e.clientY - (r.top + r.height / 2)) * 0.14}px`)
  }

  document.addEventListener('click', onClick)
  document.addEventListener('pointerover', onOver)
  document.addEventListener('pointermove', onMove, { passive: true })
  return () => {
    document.removeEventListener('click', onClick)
    document.removeEventListener('pointerover', onOver)
    document.removeEventListener('pointermove', onMove)
  }
}
