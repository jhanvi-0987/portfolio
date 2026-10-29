import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { Briefcase } from 'lucide-react'
import { experience } from '../data/portfolio'
import { Reveal, SectionHead, Tilt } from './ui'

function Item({ job, i }) {
  return (
    <Reveal delay={i * 0.1} className={`t-item ${job.current ? 'current' : ''}`}>
      <span className="t-dot" />
      <Tilt as="article" className="card" max={4}>
        <div className="t-top">
          <div>
            <h3>{job.role}</h3>
            <div className="co">{job.company}</div>
          </div>
          <span className="period"><Briefcase size={13} /> {job.period}</span>
        </div>
        {job.blurb && <p className="t-blurb">{job.blurb}</p>}
        <ul className="points">
          {job.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <div className="tags">{job.tags.map((t) => <span key={t} className="chip mono">{t}</span>)}</div>
      </Tilt>
    </Reveal>
  )
}

export default function Experience() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 65%', 'end 55%'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })
  return (
    <section id="experience" className="section">
      <div className="container">
        <SectionHead eyebrow="Experience" title="Where I’ve been building." />
        <div className="timeline" ref={ref}>
          <motion.span className="t-progress" style={{ scaleY }} />
          {experience.map((job, i) => <Item key={job.company} job={job} i={i} />)}
        </div>
      </div>
    </section>
  )
}
