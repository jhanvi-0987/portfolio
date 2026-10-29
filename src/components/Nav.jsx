import { useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Moon, Sun, X, ArrowUpRight, Volume2, VolumeX } from 'lucide-react'
import { isSoundOn, setSoundOn, sfx, subscribeSound } from '../sound'
import { profile } from '../data/portfolio'

export const sections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
]

export default function Nav({ active, theme, toggleTheme }) {
  const [open, setOpen] = useState(false)
  const sound = useSyncExternalStore(subscribeSound, isSoundOn)
  return (
    <>
      <div className="nav-wrap">
        <motion.nav
          className="nav"
          aria-label="Primary"
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <a href="#home" className="logo">
            <i /> {profile.firstName}
          </a>
          <div className="nav-links">
            {sections.slice(1, -1).map((s) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'active' : ''}>
                {s.label}
              </a>
            ))}
          </div>
          <button className="icon-btn" data-sound="none" onClick={() => (sound ? (sfx.toggle(false), setSoundOn(false)) : setSoundOn(true))} aria-label={sound ? 'Mute sound effects' : 'Unmute sound effects'} aria-pressed={!sound}>
            {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <a href="#contact" className="btn primary sm cta">
            Let’s talk <ArrowUpRight size={15} />
          </a>
          <button className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </motion.nav>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? 'active' : ''} onClick={() => setOpen(false)}>
                {s.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
