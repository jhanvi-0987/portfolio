import { sfx } from '../sound'
import { H, GROUND, LEN, BLOCK, BLOCK_Y, buildLevel } from './level'
import { skillGroups } from '../data/portfolio'

// Palette — flat colour only.
const INK = '#161c12', OLIVE = '#3b4a2a', SAGE = '#7c8a5b', CREAM = '#e6e2d3', GOLD = '#c9a66b'
const PW = 26, PH = 54
const GRAV = 0.62, JUMP = 13.4, MAXSPEED = 5.4

const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else ctx.rect(x, y, w, h)
}

const wrap = (ctx, text, maxW) => {
  const out = []
  let line = ''
  for (const w of text.split(' ')) {
    const t = line ? `${line} ${w}` : w
    if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w } else line = t
  }
  if (line) out.push(line)
  return out
}
const fit = (ctx, text, maxW) => {
  if (ctx.measureText(text).width <= maxW) return text
  while (text.length > 1 && ctx.measureText(`${text}…`).width > maxW) text = text.slice(0, -1)
  return `${text}…`
}

export class Engine {
  constructor(canvas, cb = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.cb = cb
    this.level = buildLevel()
    this.keys = { left: false, right: false, jump: false, jumpPressed: false }
    this.interactQueued = false
    this.paused = false
    this.vw = 960
    this.pad = 0 // CSS px kept free at the bottom (on-screen controls)
    this.dpr = 1
    this.t = 0
    this.raf = 0
    this.last = 0
    this.acc = 0
    this.stars = Array.from({ length: 90 }, (_, i) => ({
      x: ((i * 997) % 1000) / 1000, y: (((i * 613) % 1000) / 1000) * 300,
      r: 0.6 + (((i * 37) % 10) / 10) * 1.4, p: 0.02 + ((i * 13) % 10) / 220,
    }))
    this.reset()
  }

  reset() {
    const L = this.level
    this.p = { x: 120, y: GROUND - PH, vx: 0, vy: 0, dir: 1, grounded: true, coyote: 0, buffer: 0, walk: 0, squash: 0, inv: 0 }
    this.coins = L.coins.map((c) => ({ ...c, got: false }))
    this.bugs = L.bugs.map(([x0, x1], i) => ({ x: x0 + (x1 - x0) / 2, x0, x1, dir: i % 2 ? 1 : -1, speed: 0.9 + (i % 3) * 0.15, alive: true, dead: 0 }))
    this.stations = L.stations.map((s) => ({ ...s, visited: false }))
    this.blocks = L.blocks.map((b) => ({ ...b, used: false, bump: 0 }))
    this.blockSurfaces = this.blocks.map((b) => ({ x0: b.x - BLOCK / 2, x1: b.x + BLOCK / 2, y: BLOCK_Y }))
    this.cards = {}
    this.finished = false
    this.checkpoint = 120
    this.stats = { coins: 0, bugs: 0, details: 0 }
    this.zone = ''
    this.particles = []
    this.texts = []
    this.flash = 0
    this.shake = 0
    this.cam = 0
    this.pct = -1
    this.emit()
  }

  emit() {
    const s = this.stats
    this.cb.onStats?.({ ...s, totalCoins: this.coins.length, totalDetails: this.blocks.length })
  }

  /* ---------- lifecycle ---------- */
  start() {
    cancelAnimationFrame(this.raf)
    this.last = performance.now()
    const loop = (now) => {
      this.acc += Math.min(64, now - this.last)
      this.last = now
      while (this.acc >= 1000 / 60) {
        if (!this.paused) this.step()
        this.t++
        this.acc -= 1000 / 60
      }
      this.draw()
      this.raf = requestAnimationFrame(loop)
    }
    this.raf = requestAnimationFrame(loop)
  }
  stop() { cancelAnimationFrame(this.raf) }
  pause() { this.paused = true }
  resume() {
    this.paused = false
    this.keys.left = this.keys.right = this.keys.jump = this.keys.jumpPressed = false
  }
  resize(w, h) {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    this.dpr = dpr
    this.canvas.width = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)
    this.vw = w / Math.min(h / H, w / 600)
  }
  setKey(name, down) {
    if (name === 'jump' && down && !this.keys.jump) this.keys.jumpPressed = true
    this.keys[name] = down
  }
  interact() { this.interactQueued = true }

  /* ---------- simulation ---------- */
  fx(x, y, n, colors, spread = 3) {
    for (let i = 0; i < n; i++) {
      this.particles.push({ x, y, vx: (Math.random() - 0.5) * spread * 2, vy: -Math.random() * spread, life: 24 + Math.random() * 16, max: 40, c: colors[i % colors.length], s: 2 + Math.random() * 3 })
    }
  }

  hurt() {
    if (this.p.inv > 0) return
    sfx.hurt()
    this.flash = 1
    this.shake = 12
    this.fx(this.p.x, this.p.y + PH / 2, 14, [CREAM, GOLD], 4)
    this.respawn()
  }

  respawn() {
    const p = this.p
    p.x = this.checkpoint
    p.y = GROUND - PH
    p.vx = p.vy = 0
    p.grounded = true
    p.inv = 90
  }

  bump(b) {
    b.bump = 10
    const first = !b.used
    if (first) {
      b.used = true
      this.stats.details = this.blocks.filter((q) => q.used).length
      this.emit()
    }
    this.cards[b.sec] = { block: b, h: b.h, t: b.t, age: 0 }
    sfx.coin()
    this.fx(b.x, BLOCK_Y, first ? 10 : 4, [GOLD, CREAM], 3)
    this.cb.onReveal?.(`${b.h}. ${b.t}`)
  }

  step() {
    const p = this.p, k = this.keys, L = this.level
    const dir = (k.right ? 1 : 0) - (k.left ? 1 : 0)
    p.vx += (dir * MAXSPEED - p.vx) * (p.grounded ? 0.22 : 0.12)
    if (dir) p.dir = dir
    if (Math.abs(p.vx) < 0.05) p.vx = 0

    if (k.jumpPressed) { p.buffer = 7; k.jumpPressed = false }
    p.coyote = p.grounded ? 7 : Math.max(0, p.coyote - 1)
    p.buffer = Math.max(0, p.buffer - 1)
    if (p.buffer > 0 && p.coyote > 0) {
      p.vy = -JUMP; p.grounded = false; p.coyote = 0; p.buffer = 0; p.squash = 0.32
      sfx.jump()
      this.fx(p.x, p.y + PH, 5, [CREAM], 2)
    }
    p.vy += GRAV + (!k.jump && p.vy < 0 ? 0.55 : 0) // release early = shorter hop
    if (p.vy > 16) p.vy = 16

    const prevFeet = p.y + PH
    const prevY = p.y
    p.x = Math.max(16, Math.min(LEN - 16, p.x + p.vx))
    p.y += p.vy

    // bump "?" blocks from below
    if (p.vy < 0) {
      for (const b of this.blocks) {
        const bottom = BLOCK_Y + BLOCK
        if (prevY >= bottom - 2 && p.y < bottom && Math.abs(p.x - b.x) < BLOCK / 2 + 10) {
          p.y = bottom; p.vy = 2
          this.bump(b)
          break
        }
      }
    }

    const wasGrounded = p.grounded
    p.grounded = false
    if (p.vy >= 0) {
      for (const s of L.surfaces.concat(this.blockSurfaces)) {
        if (p.x + 11 > s.x0 && p.x - 11 < s.x1 && prevFeet <= s.y + 1 && p.y + PH >= s.y) {
          p.y = s.y - PH; p.vy = 0; p.grounded = true
          if (!wasGrounded) { p.squash = -0.3; this.fx(p.x, s.y, 6, [CREAM, SAGE], 2.2) }
          break
        }
      }
    }
    if (p.y > H + 160) this.hurt()
    p.squash *= 0.84
    p.walk += Math.abs(p.vx) * 0.13
    if (p.inv > 0) p.inv--

    // coins
    for (const c of this.coins) {
      if (c.got) continue
      if (Math.hypot(c.x - p.x, c.y - (p.y + PH / 2)) < 32) {
        c.got = true
        this.stats.coins = this.coins.filter((q) => q.got).length
        sfx.coin()
        this.fx(c.x, c.y, 8, [GOLD, CREAM], 3)
        this.texts.push({ x: c.x, y: c.y - 24, text: c.label, life: 70 })
        this.emit()
        this.cb.onCoin?.(c.label)
      }
    }

    // bugs
    for (const b of this.bugs) {
      if (!b.alive) { if (b.dead > 0) b.dead--; continue }
      b.x += b.dir * b.speed
      if (b.x < b.x0) b.dir = 1
      if (b.x > b.x1) b.dir = -1
      const overlapX = Math.abs(p.x - b.x) < 14 + 15
      const bugTop = GROUND - 22
      if (overlapX && p.y + PH > bugTop + 2 && p.y < GROUND) {
        if (p.vy > 1 && prevFeet <= bugTop + 12) {
          b.alive = false; b.dead = 24
          p.vy = k.jump ? -11.5 : -8.5; p.grounded = false
          this.stats.bugs++
          sfx.stomp()
          this.fx(b.x, GROUND - 10, 10, [SAGE, CREAM, GOLD], 3.2)
          this.texts.push({ x: b.x, y: GROUND - 40, text: 'Bug fixed!', life: 60 })
          this.emit()
        } else this.hurt()
      }
    }

    // checkpoints (signposts)
    for (const st of this.stations) {
      if (!st.visited && Math.abs(p.x - st.x) < 50) {
        st.visited = true
        this.checkpoint = st.x
        sfx.success()
        this.texts.push({ x: st.x, y: GROUND - 175, text: st.finish ? 'Finish!' : 'Checkpoint', life: 80 })
        if (st.finish && !this.finished) { this.finished = true; this.cb.onFinish?.() }
      }
    }

    // zone + progress
    let zone = L.zones[0][1]
    for (const [zx, name] of L.zones) if (p.x >= zx) zone = name
    if (zone !== this.zone) { this.zone = zone; this.cb.onZone?.(zone) }
    const pct = Math.round((p.x / LEN) * 100)
    if (pct !== this.pct) { this.pct = pct; this.cb.onProgress?.(pct) }

    // fx
    for (const q of this.particles) { q.x += q.vx; q.y += q.vy; q.vy += 0.18; q.life-- }
    this.particles = this.particles.filter((q) => q.life > 0)
    for (const b of this.blocks) if (b.bump > 0) b.bump--
    for (const k of Object.values(this.cards)) k.age++
    for (const t of this.texts) { t.y -= 0.5; t.life-- }
    this.texts = this.texts.filter((t) => t.life > 0)
    this.flash *= 0.9
    this.shake *= 0.88

    // camera
    const target = Math.max(0, Math.min(LEN - this.vw, p.x - this.vw * 0.4 + p.dir * 60))
    this.cam += (target - this.cam) * 0.1
  }

  /* ---------- rendering ---------- */
  onGround(x) {
    return this.level.ground.some(([a, b]) => x > a + 12 && x < b - 12)
  }

  hills(par, base, amp, alpha, seed) {
    const { ctx } = this
    ctx.globalAlpha = alpha
    ctx.fillStyle = OLIVE
    ctx.beginPath()
    ctx.moveTo(0, H + 900)
    for (let sx = 0; sx <= this.vw + 16; sx += 16) {
      const wx = sx + this.cam * par
      ctx.lineTo(sx, base - amp * (0.55 * Math.sin(wx * 0.0042 + seed) + 0.3 * Math.sin(wx * 0.0097 + seed * 2) + 0.15 * Math.sin(wx * 0.021)))
    }
    ctx.lineTo(this.vw + 16, H + 900)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1
  }

  draw() {
    const { ctx, canvas, cam, vw } = this
    const s = Math.min(canvas.height / H, canvas.width / 600)
    const offY = (canvas.height - this.pad * this.dpr) / s - H // extra sky when the screen is taller than the level
    const t = this.t
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = INK
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const sh = this.shake > 0.5 ? [(Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake] : [0, 0]
    ctx.setTransform(s, 0, 0, s, sh[0] * s, (offY + sh[1]) * s)

    // sky: stars, gold moon, two olive hill layers
    ctx.fillStyle = CREAM
    for (const st of this.stars) {
      ctx.globalAlpha = 0.35 + 0.35 * Math.sin(t * 0.03 + st.x * 40)
      const x = (((st.x * vw - cam * st.p) % vw) + vw) % vw
      ctx.fillRect(x, st.y, st.r, st.r)
    }
    ctx.globalAlpha = 1
    ctx.fillStyle = GOLD
    ctx.globalAlpha = 0.28 // dim, so the gold section titles in front of it stay readable
    ctx.beginPath(); ctx.arc(vw * 0.8, 96, 46, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = CREAM; ctx.globalAlpha = 0.14; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(vw * 0.8, 96, 60, 0, Math.PI * 2); ctx.stroke()
    ctx.globalAlpha = 1
    this.hills(0.12, 335, 90, 0.35, 1.3)
    this.hills(0.3, 395, 62, 0.62, 4.1)

    ctx.save()
    ctx.translate(-cam, 0)
    const x0 = cam - 80, x1 = cam + vw + 80

    // pines (decor)
    for (let i = 0; i < LEN / 150; i++) {
      const wx = i * 150 + ((i * 53) % 70)
      if (wx < x0 || wx > x1 || !this.onGround(wx)) continue
      if (this.level.stations.some((q) => Math.abs(q.x - wx) < 100)) continue
      const h = 62 + ((i * 37) % 48)
      ctx.fillStyle = OLIVE
      ctx.fillRect(wx - 3, GROUND - 14, 6, 16)
      ctx.fillStyle = SAGE
      ctx.globalAlpha = 0.5
      for (let j = 0; j < 3; j++) {
        const w = h * (0.52 - j * 0.12), y = GROUND - 12 - j * h * 0.27
        ctx.beginPath(); ctx.moveTo(wx - w / 2, y); ctx.lineTo(wx + w / 2, y); ctx.lineTo(wx, y - h * 0.34); ctx.closePath(); ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    // ground
    for (const [a, b] of this.level.ground) {
      if (b < x0 || a > x1) continue
      ctx.fillStyle = OLIVE
      ctx.fillRect(a, GROUND, b - a, 900)
      ctx.fillStyle = GOLD
      ctx.fillRect(a, GROUND, b - a, 5)
      ctx.fillStyle = INK
      ctx.globalAlpha = 0.22
      for (let y = GROUND + 28; y < H; y += 28) {
        for (let x = Math.max(a, Math.floor(x0 / 46) * 46) + ((y / 28) % 2) * 23; x < Math.min(b, x1); x += 46) ctx.fillRect(x, y, 20, 3)
      }
      ctx.globalAlpha = 1
    }

    // platforms
    for (const [px, py, w] of this.level.platforms) {
      if (px + w < x0 || px > x1) continue
      ctx.fillStyle = SAGE; rr(ctx, px, py, w, 18, 6); ctx.fill()
      ctx.fillStyle = GOLD; rr(ctx, px, py, w, 5, 3); ctx.fill()
    }

    // start sign
    this.sign(300, 'HI, I’M JAHANVI', 'Flutter developer  →')

    // section titles + panels in the sky
    for (const sec of this.level.sections) {
      if (sec.cx < cam - 500 || sec.cx > cam + vw + 500) continue
      this.section(sec)
    }

    // signposts
    for (const st of this.stations) {
      if (st.x < x0 - 100 || st.x > x1 + 100) continue
      this.station(st, t)
    }

    // "?" blocks
    for (const b of this.blocks) {
      if (b.x < x0 - 40 || b.x > x1 + 40) continue
      this.block(b, t)
    }

    // coins
    this.coins.forEach((c, i) => {
      if (c.got || c.x < x0 || c.x > x1) return
      const sx = Math.abs(Math.cos(t * 0.05 + i))
      const y = c.y + Math.sin(t * 0.04 + i) * 4
      ctx.save(); ctx.translate(c.x, y); ctx.scale(Math.max(0.15, sx), 1)
      ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = OLIVE; ctx.lineWidth = 2.5; ctx.stroke()
      ctx.fillStyle = CREAM; ctx.globalAlpha = 0.8; ctx.fillRect(-1.5, -6, 3, 12); ctx.globalAlpha = 1
      ctx.restore()
    })

    // bugs
    for (const b of this.bugs) {
      if (b.x < x0 || b.x > x1) continue
      if (b.alive || b.dead > 0) this.bug(b, t)
    }

    // player
    if (!(this.p.inv > 0 && Math.floor(t / 5) % 2)) this.player(t)

    // detail cards revealed by the blocks
    for (const sec of this.level.sections) {
      const card = this.cards[sec.id]
      if (card) this.card(sec, card)
    }

    // particles + floating labels
    for (const q of this.particles) {
      ctx.globalAlpha = Math.min(1, q.life / 20)
      ctx.fillStyle = q.c
      ctx.fillRect(q.x, q.y, q.s, q.s)
    }
    ctx.globalAlpha = 1
    ctx.font = '600 14px Manrope, system-ui, sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    for (const tx of this.texts) {
      ctx.globalAlpha = Math.min(1, tx.life / 20)
      const w = ctx.measureText(tx.text).width
      ctx.fillStyle = INK; rr(ctx, tx.x - w / 2 - 9, tx.y - 13, w + 18, 26, 13); ctx.fill()
      ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.fillStyle = CREAM; ctx.fillText(tx.text, tx.x, tx.y + 1)
    }
    ctx.globalAlpha = 1
    ctx.restore()

    if (this.flash > 0.02) {
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalAlpha = this.flash * 0.45
      ctx.fillStyle = CREAM
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1
    }
  }

  sign(x, l1, l2) {
    const { ctx } = this
    ctx.fillStyle = OLIVE; ctx.fillRect(x - 4, GROUND - 76, 8, 78)
    ctx.fillStyle = CREAM; rr(ctx, x - 96, GROUND - 130, 192, 62, 10); ctx.fill()
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.stroke()
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillStyle = INK; ctx.font = 'italic 700 17px Fraunces, Georgia, serif'
    ctx.fillText(l1, x, GROUND - 108)
    ctx.fillStyle = OLIVE; ctx.font = '600 13px Manrope, system-ui, sans-serif'
    ctx.fillText(l2, x, GROUND - 84)
  }

  station(st, t) {
    const { ctx } = this
    const x = st.x, by = GROUND - 150, bw = 130, bh = 46
    ctx.fillStyle = OLIVE; ctx.fillRect(x - 4, by + bh, 8, GROUND - by - bh)
    ctx.fillStyle = GOLD; rr(ctx, x - 16, GROUND - 8, 32, 8, 3); ctx.fill()
    if (st.finish) {
      const top = GROUND - 230
      ctx.fillStyle = OLIVE; ctx.fillRect(x - 3, top, 6, by - top)
      ctx.fillStyle = GOLD
      ctx.beginPath(); ctx.moveTo(x + 3, top + 4)
      ctx.lineTo(x + 56, top + 18 + Math.sin(t * 0.08) * 5)
      ctx.lineTo(x + 3, top + 34); ctx.closePath(); ctx.fill()
    }
    ctx.fillStyle = st.visited ? GOLD : CREAM
    rr(ctx, x - bw / 2, by, bw, bh, 9); ctx.fill()
    ctx.strokeStyle = st.visited ? CREAM : GOLD; ctx.lineWidth = 3; ctx.stroke()
    ctx.fillStyle = INK
    ctx.font = 'italic 700 17px Fraunces, Georgia, serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(st.label, x, by + bh / 2 + 1)
    if (st.visited) {
      const my = by - 18
      ctx.strokeStyle = SAGE; ctx.lineWidth = 4; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(x - 8, my); ctx.lineTo(x - 2, my + 6); ctx.lineTo(x + 9, my - 6); ctx.stroke()
      ctx.lineCap = 'butt'
    }
  }

  section(sec) {
    const { ctx } = this
    const dx = Math.abs(this.p.x - sec.cx)
    const a = Math.max(0, Math.min(1, 1.45 - dx / 640))
    if (a < 0.03) return
    ctx.globalAlpha = a
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillStyle = GOLD; ctx.font = 'italic 500 48px Fraunces, Georgia, serif'
    ctx.fillText(sec.title, sec.cx, 88)
    ctx.fillStyle = CREAM; ctx.font = '600 16px Manrope, system-ui, sans-serif'
    ctx.fillText(fit(ctx, sec.sub, 640), sec.cx, 126)
    if (sec.kind === 'skills') this.skillsBoard(sec)
    if (sec.kind === 'panel') this.panelBoard(sec)
    if (sec.items.length) {
      // small hint above the first block, until something has been opened
      const used = this.blocks.some((b) => b.sec === sec.id && b.used)
      if (!used) {
        ctx.fillStyle = GOLD; ctx.font = '600 13px Manrope, system-ui, sans-serif'
        ctx.fillText('Jump up and bump the ? blocks to read the details', sec.cx, 262 + Math.sin(this.t * 0.06) * 3)
      }
    }
    ctx.globalAlpha = 1
  }

  skillsBoard(sec) {
    const { ctx } = this
    const w = 520, x = sec.cx - w / 2, y = 156
    ctx.fillStyle = INK; ctx.globalAlpha *= 0.78; rr(ctx, x, y, w, 170, 14); ctx.fill()
    ctx.globalAlpha = Math.min(1, ctx.globalAlpha / 0.78)
    ctx.strokeStyle = OLIVE; ctx.lineWidth = 2; ctx.stroke()
    ctx.textBaseline = 'middle'
    skillGroups.forEach((g, gi) => {
      const rowY = y + 28 + gi * 29
      ctx.textAlign = 'left'; ctx.fillStyle = CREAM; ctx.font = '600 14px Manrope, system-ui, sans-serif'
      ctx.fillText(g.title, x + 22, rowY)
      const mine = this.coins.filter((c) => c.group === gi)
      mine.forEach((c, i) => {
        ctx.fillStyle = c.got ? GOLD : OLIVE
        ctx.beginPath(); ctx.arc(x + 270 + i * 26, rowY, 8, 0, Math.PI * 2); ctx.fill()
      })
      ctx.textAlign = 'right'; ctx.fillStyle = SAGE; ctx.font = '500 12px "JetBrains Mono", monospace'
      ctx.fillText(`${mine.filter((c) => c.got).length}/${mine.length}`, x + w - 22, rowY)
    })
  }

  panelBoard(sec) {
    const { ctx } = this
    const hs = { h: 40, p: 30, big: 70 }
    const total = sec.panel.reduce((n, l) => n + hs[l.k], 0) + 36
    const w = 560, x = sec.cx - w / 2, y = 156
    ctx.fillStyle = INK; ctx.globalAlpha *= 0.78; rr(ctx, x, y, w, total, 14); ctx.fill()
    ctx.globalAlpha = Math.min(1, ctx.globalAlpha / 0.78)
    ctx.strokeStyle = OLIVE; ctx.lineWidth = 2; ctx.stroke()
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    let ly = y + 18
    for (const l of sec.panel) {
      ly += hs[l.k] / 2
      if (l.k === 'h') { ctx.fillStyle = CREAM; ctx.font = '500 26px Fraunces, Georgia, serif' }
      else if (l.k === 'p') { ctx.fillStyle = CREAM; ctx.font = '500 15px Manrope, system-ui, sans-serif' }
      else { ctx.fillStyle = GOLD; ctx.font = 'italic 500 50px Fraunces, Georgia, serif' }
      ctx.fillText(fit(ctx, l.t, w - 40), sec.cx, ly)
      ly += hs[l.k] / 2
    }
  }

  block(b, t) {
    const { ctx } = this
    const off = b.bump > 0 ? -Math.sin((b.bump / 10) * Math.PI) * 9 : 0
    const x = b.x - BLOCK / 2, y = BLOCK_Y + off
    if (!b.used) {
      ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 0.08 + b.x)
      rr(ctx, x - 5, y - 5, BLOCK + 10, BLOCK + 10, 12); ctx.stroke(); ctx.globalAlpha = 1
    }
    ctx.fillStyle = b.used ? SAGE : GOLD; rr(ctx, x, y, BLOCK, BLOCK, 9); ctx.fill()
    ctx.strokeStyle = OLIVE; ctx.lineWidth = 3; ctx.stroke()
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    if (b.used) {
      ctx.strokeStyle = CREAM; ctx.lineWidth = 4; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(b.x - 9, y + 23); ctx.lineTo(b.x - 2, y + 30); ctx.lineTo(b.x + 11, y + 15); ctx.stroke(); ctx.lineCap = 'butt'
    } else {
      ctx.fillStyle = INK; ctx.font = '700 26px Fraunces, Georgia, serif'
      ctx.fillText('?', b.x, y + BLOCK / 2 + 2)
    }
  }

  card(sec, card) {
    const { ctx } = this
    const W = 470, pad = 16
    ctx.font = '500 14.5px Manrope, system-ui, sans-serif'
    let lines = wrap(ctx, card.t, W - pad * 2)
    if (lines.length > 5) { lines = lines.slice(0, 5); lines[4] = fit(ctx, `${lines[4]} …`, W - pad * 2) }
    const h = pad + 22 + lines.length * 20 + pad - 4
    const e = 1 - Math.pow(1 - Math.min(1, card.age / 12), 3)
    const b = card.block
    const cx = Math.max(sec.cx - 90, Math.min(sec.cx + 90, b.x))
    const x = cx - W / 2, bottom = 296, y = bottom - h
    ctx.save()
    ctx.translate(cx, bottom); ctx.scale(0.86 + 0.14 * e, 0.86 + 0.14 * e); ctx.translate(-cx, -bottom)
    ctx.globalAlpha = e
    ctx.fillStyle = '#1e2718'; rr(ctx, x, y, W, h, 14); ctx.fill()
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke()
    const px = Math.max(x + 30, Math.min(x + W - 30, b.x))
    ctx.fillStyle = '#1e2718'
    ctx.beginPath(); ctx.moveTo(px - 10, bottom - 1); ctx.lineTo(px + 10, bottom - 1); ctx.lineTo(px, bottom + 10); ctx.closePath(); ctx.fill()
    ctx.strokeStyle = GOLD; ctx.beginPath(); ctx.moveTo(px - 10, bottom); ctx.lineTo(px, bottom + 10); ctx.lineTo(px + 10, bottom); ctx.stroke()
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
    ctx.fillStyle = GOLD; ctx.font = '500 11.5px "JetBrains Mono", monospace'
    ctx.fillText(fit(ctx, card.h.toUpperCase(), W - pad * 2), x + pad, y + pad + 5)
    ctx.fillStyle = CREAM; ctx.font = '500 14.5px Manrope, system-ui, sans-serif'
    lines.forEach((ln, i) => ctx.fillText(ln, x + pad, y + pad + 28 + i * 20))
    ctx.restore()
  }

  bug(b, t) {
    const { ctx } = this
    ctx.save(); ctx.translate(b.x, GROUND)
    if (!b.alive) {
      ctx.fillStyle = SAGE; ctx.beginPath(); ctx.ellipse(0, -3, 17, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); return
    }
    ctx.scale(b.dir, 1)
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.lineCap = 'round'
    for (let i = -1; i <= 1; i++) {
      const sw = Math.sin(t * 0.3 + i * 2) * 3
      ctx.beginPath(); ctx.moveTo(i * 8, -8); ctx.lineTo(i * 8 + sw, 0); ctx.stroke()
    }
    ctx.fillStyle = SAGE; ctx.beginPath(); ctx.ellipse(0, -12, 17, 12, 0, Math.PI, 0); ctx.lineTo(17, -8); ctx.lineTo(-17, -8); ctx.fill()
    ctx.fillStyle = INK
    ctx.beginPath(); ctx.arc(-4, -16, 2.6, 0, Math.PI * 2); ctx.arc(5, -14, 2.2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = CREAM; ctx.beginPath(); ctx.arc(13, -12, 3.6, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(14, -12, 1.6, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = INK; ctx.lineWidth = 1.8
    ctx.beginPath(); ctx.moveTo(14, -21); ctx.lineTo(19, -28); ctx.stroke()
    ctx.restore()
  }

  player(t) {
    const { ctx } = this
    const p = this.p
    ctx.save()
    ctx.translate(p.x, p.y + PH)
    ctx.scale(p.dir * (1 - p.squash * 0.6), 1 + p.squash)
    const moving = p.grounded && Math.abs(p.vx) > 0.6
    // legs
    ctx.fillStyle = CREAM
    for (const sgn of [-1, 1]) {
      const sw = moving ? Math.sin(p.walk * 1.6 + (sgn > 0 ? Math.PI : 0)) * 5 : 0
      const lift = p.grounded ? 0 : 5
      rr(ctx, sgn * 6 - 3.5 + sw, -11 - lift, 7, 11, 3); ctx.fill()
    }
    // body
    ctx.fillStyle = SAGE; rr(ctx, -11, -31, 22, 21, 7); ctx.fill()
    ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(0, -21, 3.2, 0, Math.PI * 2); ctx.fill()
    // head
    ctx.fillStyle = CREAM; rr(ctx, -17, -54, 34, 26, 10); ctx.fill()
    // smart glasses
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2.8
    ctx.fillStyle = SAGE
    for (const sgn of [-1, 1]) {
      ctx.globalAlpha = 0.45
      ctx.beginPath(); ctx.arc(sgn * 7.5, -41, 7, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
      ctx.beginPath(); ctx.arc(sgn * 7.5, -41, 7, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.beginPath(); ctx.moveTo(-1, -42); ctx.lineTo(1, -42); ctx.stroke()
    ctx.fillStyle = INK
    ctx.beginPath(); ctx.arc(-6, -41, 2.2, 0, Math.PI * 2); ctx.arc(9, -41, 2.2, 0, Math.PI * 2); ctx.fill()
    // antenna with blinking BLE light
    ctx.strokeStyle = OLIVE; ctx.lineWidth = 2.4
    ctx.beginPath(); ctx.moveTo(0, -54); ctx.lineTo(0, -62); ctx.stroke()
    ctx.fillStyle = Math.floor(t / 25) % 2 ? GOLD : SAGE
    ctx.beginPath(); ctx.arc(0, -64, 3.4, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
  }
}
