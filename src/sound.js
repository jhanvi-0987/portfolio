// Tiny synthesized UI sound engine (Web Audio) — no audio files needed.
let ctx = null
let master = null
let on = true
try {
  on = localStorage.getItem('sound') !== 'off'
} catch {}
const subs = new Set()
// Browsers only allow audio after a user gesture — stay silent (and warning-free) until then.
let unlocked = false
if (typeof window !== 'undefined') {
  const unlock = () => {
    unlocked = true
    window.removeEventListener('pointerdown', unlock, true)
    window.removeEventListener('keydown', unlock, true)
  }
  window.addEventListener('pointerdown', unlock, true)
  window.addEventListener('keydown', unlock, true)
}

function ac() {
  if (!on || !unlocked) return null
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext
    if (!C) return null
    ctx = new C()
    master = ctx.createGain()
    master.gain.value = 0.7
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

function tone({ freq, to, dur = 0.08, type = 'sine', vol = 0.12, delay = 0 }) {
  const c = ac()
  if (!c) return
  const t = c.currentTime + delay
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + dur + 0.02)
}

function whoosh() {
  const c = ac()
  if (!c) return
  const len = Math.floor(c.sampleRate * 0.4)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  const f = c.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = 1.2
  const t = c.currentTime
  f.frequency.setValueAtTime(350, t)
  f.frequency.exponentialRampToValueAtTime(2600, t + 0.35)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.12)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
  src.connect(f).connect(g).connect(master)
  src.start(t)
}

function tick({ freq = 2400, q = 0.9, dur = 0.035, vol = 0.2 }) {
  const c = ac()
  if (!c) return
  const len = Math.floor(c.sampleRate * dur)
  const buf = c.createBuffer(1, len, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = c.createBufferSource()
  src.buffer = buf
  const f = c.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = freq
  f.Q.value = q
  const g = c.createGain()
  const t = c.currentTime
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(master)
  src.start(t)
}

export const sfx = {
  // soft tactile tap: a short filtered tick on top of a low, quickly-fading thump
  click: () => {
    tick({ freq: 2600, q: 1.1, dur: 0.03, vol: 0.22 })
    tone({ freq: 210, to: 85, dur: 0.075, type: 'sine', vol: 0.24 })
  },
  hover: () => tick({ freq: 4200, q: 1.5, dur: 0.012, vol: 0.05 }),
  toggle: (up = true) => {
    tone({ freq: up ? 520 : 780, to: up ? 780 : 520, dur: 0.1, type: 'triangle', vol: 0.12 })
    tone({ freq: up ? 780 : 520, to: up ? 1170 : 390, dur: 0.12, type: 'sine', vol: 0.08, delay: 0.06 })
  },
  success: () => [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.2, vol: 0.09, delay: i * 0.07 })),
  whoosh,
  chime: () => [659, 880, 1319].forEach((f, i) => tone({ freq: f, dur: 0.4, vol: 0.07, delay: i * 0.11 })),
}

export const isSoundOn = () => on
export function setSoundOn(v) {
  on = v
  try {
    localStorage.setItem('sound', v ? 'on' : 'off')
  } catch {}
  subs.forEach((f) => f())
  if (v) sfx.toggle(true)
}
export const subscribeSound = (f) => {
  subs.add(f)
  return () => subs.delete(f)
}
