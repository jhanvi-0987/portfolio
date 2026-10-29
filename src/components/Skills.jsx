import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { skillGroups } from '../data/portfolio'
import { Icon, SectionHead, Reveal } from './ui'

const blurbs = {
  mobile: 'Cross-platform apps with real native depth where it matters.',
  arch: 'Structured, testable code that scales with the product.',
  ai: 'Voice, vision and accessibility working together.',
  data: 'Reliable data flow from cloud to local storage.',
  tools: 'The workflow that keeps releases boring — in a good way.',
}

export default function Skills() {
  const [id, setId] = useState(skillGroups[0].id)
  const group = skillGroups.find((g) => g.id === id)
  return (
    <section id="skills" className="section">
      <div className="container">
        <SectionHead eyebrow="Toolkit" title="Skills across the whole mobile stack." lede="From UI down to Bluetooth, with testing and accessibility built in." />
        <Reveal className="skills-wrap">
          <div className="skill-tabs" role="tablist" aria-label="Skill categories">
            {skillGroups.map((g) => (
              <button key={g.id} role="tab" aria-selected={g.id === id} className={`skill-tab ${g.id === id ? 'on' : ''}`} onClick={() => setId(g.id)}>
                <span className="ico"><Icon name={g.icon} size={18} /></span>
                {g.title}
                <span className="count">{String(g.items.length).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
          <div className="skill-panel" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.div key={group.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}>
                <h3>{group.title}</h3>
                <p>{blurbs[group.id]}</p>
                <div className="chips">
                  {group.items.map((s, i) => (
                    <motion.span key={s} className="chip" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                      {s}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
