import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { ArrowLeft, ArrowRight, ArrowUp, Bug, Coins, HelpCircle, Mail, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { profile } from '../data/portfolio'
import { isSoundOn, setSoundOn, subscribeSound } from '../sound'
import { LinkedinIcon } from '../components/ui'
import { Engine } from './engine'
import { LEN, buildLevel } from './level'
import './game.css'

const LEVEL = buildLevel()
const EMPTY = { coins: 0, bugs: 0, details: 0, totalCoins: LEVEL.coins.length, totalDetails: LEVEL.blocks.length }

export default function Game({ onExit }) {
  const canvasRef = useRef(null)
  const engRef = useRef(null)
  const [hud, setHud] = useState(EMPTY)
  const [zone, setZone] = useState('Welcome')
  const [pct, setPct] = useState(0)
  const [note, setNote] = useState('')
  const [hint, setHint] = useState(true)
  const [finished, setFinished] = useState(false)
  const sound = useSyncExternalStore(subscribeSound, isSoundOn)

  const replay = useCallback(() => {
    engRef.current?.reset()
    setFinished(false)
    setHint(true)
  }, [])

  // engine lifecycle
  useEffect(() => {
    const canvas = canvasRef.current
    const eng = new Engine(canvas, {
      onStats: setHud,
      onReveal: (text) => setNote(text),
      onFinish: () => setFinished(true),
      onZone: setZone,
      onProgress: setPct,
    })
    engRef.current = eng
    if (import.meta.env.DEV) window.__game = eng
    const fit = () => {
      const touch = window.matchMedia('(pointer: coarse)').matches
      eng.pad = touch && canvas.clientHeight > canvas.clientWidth ? 150 : 0 // keep the level above the on-screen buttons
      eng.resize(canvas.clientWidth, canvas.clientHeight)
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(canvas)
    eng.start()
    return () => { ro.disconnect(); eng.stop(); if (import.meta.env.DEV) delete window.__game }
  }, [])

  // fade the controls hint after a while, or once the player has opened a detail
  useEffect(() => {
    if (!hint) return
    const t = setTimeout(() => setHint(false), 14000)
    return () => clearTimeout(t)
  }, [hint])
  useEffect(() => { if (hud.details > 0) setHint(false) }, [hud.details])

  // lock page scroll behind the game
  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = prev }
  }, [])

  // keyboard
  useEffect(() => {
    const map = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', KeyW: 'jump', Space: 'jump' }
    const down = (e) => {
      if (e.code === 'Escape') { e.preventDefault(); onExit(); return }
      const k = map[e.code]
      if (k) {
        e.preventDefault()
        document.activeElement?.blur?.() // so Space never re-presses a focused HUD button
        if (!e.repeat || k !== 'jump') engRef.current?.setKey(k, true)
      }
    }
    const up = (e) => {
      const k = map[e.code]
      if (k) engRef.current?.setKey(k, false)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [onExit])

  const hold = (name) => ({
    onPointerDown: (e) => { e.preventDefault(); engRef.current?.setKey(name, true) },
    onPointerUp: () => engRef.current?.setKey(name, false),
    onPointerCancel: () => engRef.current?.setKey(name, false),
    onPointerLeave: () => engRef.current?.setKey(name, false),
  })

  return (
    <div className="game" role="dialog" aria-modal="true" aria-label="Game mode: explore the portfolio as a level" data-lenis-prevent>
      <canvas ref={canvasRef} className="g-canvas" aria-hidden="true" />
      <div className="g-live" aria-live="polite">{note}</div>

      <header className="g-hud">
        <div className="g-pills">
          <span className="g-pill" title="Skill coins"><Coins size={16} /> {hud.coins}/{hud.totalCoins}</span>
          <span className="g-pill" title="Bugs fixed"><Bug size={16} /> {hud.bugs}</span>
          <span className="g-pill" title="Details unlocked from ? blocks"><HelpCircle size={16} /> {hud.details}/{hud.totalDetails}</span>
        </div>
        <span className="g-zone">{zone}</span>
        <div className="g-pills">
          <button className="icon-btn" data-sound="none" onClick={() => setSoundOn(!sound)} aria-label={sound ? 'Mute sound' : 'Unmute sound'}>
            {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          <button className="btn ghost sm" onClick={onExit}><X size={15} /> Exit game</button>
        </div>
      </header>

      <div className="g-progress" aria-hidden="true">
        <i style={{ width: `${pct}%` }} />
        {LEVEL.stations.map((s) => <b key={s.id} style={{ left: `${(s.x / LEN) * 100}%` }} />)}
      </div>

      {hint && !finished && (
        <div className="g-controls" role="note">
          <span className="g-keys-desktop"><kbd>←</kbd><kbd>→</kbd> move <kbd>Space</kbd> jump</span>
          <span className="g-keys-touch">Use the buttons to move and jump</span>
          <span>·  Bump the <b>?</b> blocks from below to read my details</span>
        </div>
      )}

      {finished && (
        <div className="g-end" role="status">
          <button className="g-end-x icon-btn" onClick={() => setFinished(false)} aria-label="Dismiss"><X size={16} /></button>
          <h3>You made it. Let’s build something accessible.</h3>
          <p>{hud.coins}/{hud.totalCoins} skill coins · {hud.bugs} bugs fixed · {hud.details}/{hud.totalDetails} details unlocked</p>
          <div className="g-actions">
            <a className="btn primary sm" href={`mailto:${profile.email}`}><Mail size={15} /> {profile.email}</a>
            {profile.linkedin && <a className="btn ghost sm" href={profile.linkedin} target="_blank" rel="noreferrer"><LinkedinIcon width="15" height="15" /> LinkedIn</a>}
            <button className="btn ghost sm" onClick={replay}><RotateCcw size={14} /> Play again</button>
            <button className="btn ghost sm" onClick={onExit}>Back to portfolio</button>
          </div>
        </div>
      )}

      <div className="g-touch" aria-hidden="true">
        <div>
          <button {...hold('left')}><ArrowLeft size={26} /></button>
          <button {...hold('right')}><ArrowRight size={26} /></button>
        </div>
        <button className="jump" {...hold('jump')}><ArrowUp size={26} /> Jump</button>
      </div>
    </div>
  )
}
