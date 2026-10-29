import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Download, Accessibility, Globe, Mail, Bluetooth, MousePointer2 } from 'lucide-react'
import { profile } from '../data/portfolio'
import { useTyped } from '../hooks'
import { GithubIcon, LinkedinIcon, SplitText } from './ui'

const roles = [
  'Building accessible mobile apps',
  'Bridging Flutter with Kotlin & Swift',
  'Shipping AI voice experiences',
  'Connecting BLE smart glasses',
]

function FloatCard({ cls, icon, title, sub, delay, drift, ready }) {
  return (
    <motion.div
      className={`float-card ${cls}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={ready ? { opacity: 1, scale: 1, y: [0, drift, 0] } : {}}
      transition={{ opacity: { delay }, scale: { delay, type: 'spring', stiffness: 160, damping: 14 }, y: { duration: 5 + Math.abs(drift) / 4, repeat: Infinity, ease: 'easeInOut', delay } }}
    >
      <span className="ic">{icon}</span>
      <span>{title}<small>{sub}</small></span>
    </motion.div>
  )
}

export default function Hero({ ready }) {
  const typed = useTyped(roles)
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 520], [1, 0])
  const y = useTransform(scrollY, [0, 520], [0, -90])
  const scale = useTransform(scrollY, [0, 520], [1, 0.94])
  const item = (i) => ({
    initial: { opacity: 0, y: 24 },
    animate: ready ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.8, delay: 0.1 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
  })
  return (
    <section id="home" className="hero">
      <div className="container hero-grid">
        <motion.div style={{ opacity, y, scale }}>
          <motion.div className="badge" {...item(0)}>
            <span className="pulse" /> Open to Flutter roles · {profile.location}
          </motion.div>
          <h1>
            <SplitText className="line" text="Hi, I’m" by="chars" start={ready} delay={0.15} />
            <SplitText className="line" text={profile.name} by="words" wordClass="accent-text" start={ready} delay={0.45} stagger={0.14} />
          </h1>
          <motion.p className="role-line" {...item(4)} aria-label={roles.join(', ')}>
            <span aria-hidden="true">&gt; {typed}<span className="caret" /></span>
          </motion.p>
          <motion.p className="summary" {...item(5)}>{profile.summary}</motion.p>
          <motion.div className="hero-cta" {...item(6)}>
            <a href="#work" className="btn primary">View my work <ArrowRight size={17} /></a>
            {profile.resume ? (
              <a href={profile.resume} download className="btn ghost"><Download size={17} /> Resume</a>
            ) : (
              <a href={`mailto:${profile.email}`} className="btn ghost"><Mail size={17} /> Get in touch</a>
            )}
          </motion.div>
          {(profile.github || profile.linkedin) && (
            <motion.div className="socials" {...item(7)}>
              <span className="line" /> Find me on
              {profile.github && <a className="icon-btn" href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub"><GithubIcon /></a>}
              {profile.linkedin && <a className="icon-btn" href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><LinkedinIcon /></a>}
            </motion.div>
          )}
        </motion.div>

        {/* The WebGL smart glasses render behind this stage (see scene/Scene.jsx). */}
        <div className="stage" id="hero-stage" aria-hidden="true">
          <FloatCard ready={ready} cls="f1" delay={1.4} drift={-9} icon={<Accessibility size={17} />} title="TalkBack ready" sub="Screen-reader semantics" />
          <FloatCard ready={ready} cls="f2" delay={1.6} drift={10} icon={<Globe size={17} />} title="40+ languages" sub="Localized end to end" />
          <FloatCard ready={ready} cls="f3" delay={1.8} drift={-7} icon={<Bluetooth size={17} />} title="BLE connected" sub="Smart glasses · Kotlin + Swift" />
          <motion.div className="stage-hint" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : {}} transition={{ delay: 2.2 }}>
            <MousePointer2 size={13} /> Move your mouse
          </motion.div>
        </div>
      </div>
      <div className="scroll-hint" aria-hidden="true">SCROLL<i /></div>
    </section>
  )
}
