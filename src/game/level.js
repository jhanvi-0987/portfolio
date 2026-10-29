import { caseStudy, education, experience, profile, projects, skillGroups } from '../data/portfolio'

// Logical world units: the canvas is always H tall; width follows the screen.
export const H = 540
export const GROUND = 440
export const LEN = 7800
export const BLOCK_Y = 310 // top of the "?" blocks
export const BLOCK = 44

export function buildLevel() {
  // solid ground with gaps to jump over
  const gaps = [[1280, 1430], [1960, 2120], [2760, 2930], [3860, 4020], [5420, 5590], [6240, 6400]]
  const ground = []
  let x = 0
  for (const [a, b] of gaps) { ground.push([x, a]); x = b }
  ground.push([x, LEN])

  // one-way floating platforms (only in the skills run): [x, y(top), width]
  const platforms = [[1540, 340, 150], [1760, 265, 130], [2180, 340, 160], [2420, 270, 140], [2640, 340, 120], [3000, 330, 150], [3220, 260, 130]]

  const surfaces = [
    ...ground.map(([x0, x1]) => ({ x0, x1, y: GROUND })),
    ...platforms.map(([px, y, w]) => ({ x0: px, x1: px + w, y })),
  ]

  // skills become coins (first five of each group)
  const coins = []
  skillGroups.forEach((g, gi) => g.items.slice(0, 5).forEach((label) => {
    const i = coins.length
    const cx = 1520 + i * 74
    let y = 360 - 70 * Math.sin(i * 0.55)
    for (const [px, py, w] of platforms) if (cx > px - 12 && cx < px + w + 12 && Math.abs(y - py) < 36) y = py - 34
    coins.push({ x: cx, y, label, group: gi })
  }))

  // Sections: big title in the sky, optional "?" blocks that reveal details, optional static panel.
  const sections = [
    {
      id: 'about', cx: 924, bx: 840, title: 'About me', sub: 'Software that people can actually rely on.',
      items: [
        { h: 'Who I am', t: profile.summary },
        { h: 'How I work', t: 'Native Kotlin and Swift bridged into Flutter through Platform Channels, with accessibility treated as a core requirement, not an afterthought.' },
        { h: 'By the numbers', t: '1+ years building mobile  ·  40+ languages localized  ·  2 platforms in production  ·  B.Tech CGPA 8.93' },
      ],
    },
    { id: 'skills', cx: 3660, kind: 'skills', title: 'Skills', sub: 'Your haul from the road. Each dot is a skill coin you collected.', items: [] },
    {
      id: 'experience', cx: 4482, bx: 4230, title: 'Experience', sub: 'Sunbots Innovation LLP  ·  Flutter Developer  ·  Sep 2025 – Present',
      items: [
        ...experience[0].points.map((t) => ({ h: 'Sunbots Innovation LLP', t })),
        ...experience[1].points.map((t) => ({ h: 'Muster Dekho · Intern · Jan – Jun 2025', t })),
      ],
    },
    {
      id: 'smarton', cx: 5170, bx: 4960, title: 'SmartOn', sub: caseStudy.tagline,
      items: caseStudy.pillars.map((p) => ({ h: p.title, t: p.text })),
    },
    {
      id: 'projects', cx: 6000, bx: 5790, title: 'Projects', sub: 'TeamFlow  ·  GrosSync',
      items: projects.flatMap((p) => p.points.map((t) => ({ h: `${p.title} · ${p.subtitle}`, t: `${t}  [${p.stack.slice(0, 4).join(', ')}]` }))),
    },
    {
      id: 'education', cx: 6900, kind: 'panel', title: 'Education', sub: 'Foundation',
      panel: [{ t: education.degree, k: 'h' }, { t: `${education.school}  ·  ${education.period}`, k: 'p' }, { t: education.score, k: 'big' }],
      items: [],
    },
    { id: 'contact', cx: 7400, title: 'Let’s talk.', sub: profile.email, items: [] },
  ]

  // "?" blocks, one row per section
  const blocks = []
  for (const s of sections) s.items.forEach((it, i) => blocks.push({ sec: s.id, i, x: s.bx + i * 84, h: it.h, t: it.t }))

  const stations = [
    { id: 'about', x: 560, label: 'ABOUT' },
    { id: 'skills', x: 3290, label: 'SKILLS' },
    { id: 'experience', x: 4090, label: 'EXPERIENCE' },
    { id: 'smarton', x: 4830, label: 'SMARTON' },
    { id: 'projects', x: 5660, label: 'PROJECTS' },
    { id: 'education', x: 6500, label: 'EDUCATION' },
    { id: 'contact', x: 7560, label: 'CONTACT', finish: true },
  ]

  const bugs = [[1050, 1230], [2250, 2650], [3000, 3400], [4760, 4920], [6600, 6800], [7000, 7300]]
  const zones = [[0, 'Welcome'], [1450, 'Skills'], [3950, 'Experience'], [4800, 'SmartOn'], [5560, 'Projects'], [6420, 'Education'], [7200, 'Contact']]

  return { ground, platforms, surfaces, coins, sections, blocks, stations, bugs, zones }
}
