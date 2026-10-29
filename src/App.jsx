import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import Lenis from 'lenis'
import { profile } from './data/portfolio'
import { useActiveSection, useTheme } from './hooks'
import { installInteractions } from './interactions'
import SceneLayer from './scene/SceneLayer'
import Nav, { sections } from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Work from './components/Work'
import Contact, { Education } from './components/Contact'
import Cursor from './components/Cursor'
import Preloader from './components/Preloader'

const Game = lazy(() => import('./game/Game'))
const ids = sections.map((s) => s.id)

export default function App() {
  const [theme, toggleTheme] = useTheme()
  const [loaded, setLoaded] = useState(false)
  const [game, setGame] = useState(false)
  const openGame = useCallback(() => setGame(true), [])
  const closeGame = useCallback(() => setGame(false), [])
  const active = useActiveSection(ids)
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const done = useCallback(() => setLoaded(true), [])

  useEffect(() => installInteractions(), [])

  // lock scroll while the preloader plays
  useEffect(() => {
    document.documentElement.style.overflow = loaded ? '' : 'hidden'
  }, [loaded])

  // smooth, inertial scrolling (disabled for reduced-motion users)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 })
    let raf
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    const onAnchor = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const el = document.querySelector(a.getAttribute('href'))
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el, { offset: a.getAttribute('href') === '#home' ? 0 : -60, duration: 1.4 })
    }
    document.addEventListener('click', onAnchor)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('click', onAnchor); lenis.destroy() }
  }, [])

  return (
    <>
      <AnimatePresence>{!loaded && <Preloader onDone={done} />}</AnimatePresence>
      <Cursor />
      {game && (
        <Suspense fallback={null}>
          <Game onExit={closeGame} />
        </Suspense>
      )}
      <motion.div className="progress" style={{ scaleX }} />
      <div className="backdrop" aria-hidden="true" />
      <SceneLayer dark={theme === 'dark'} paused={game} />
      <Nav active={active} theme={theme} toggleTheme={toggleTheme} onPlay={openGame} />
      <main>
        <Hero ready={loaded} onPlay={openGame} />
        <Marquee />
        <About />
        <Skills />
        <Experience />
        <Work />
        <Education />
        <Contact />
      </main>
      <footer>
        <div className="container">
          <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
          <span>Designed & built with React · Three.js</span>
        </div>
      </footer>
      <a href="#home" className="icon-btn to-top" aria-label="Back to top" style={{ background: 'var(--bg-2)' }}><ArrowUp size={17} /></a>
    </>
  )
}
