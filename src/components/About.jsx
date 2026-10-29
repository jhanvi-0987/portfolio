import { Check } from 'lucide-react'
import { stats } from '../data/portfolio'
import { CountUp, Reveal, SectionHead } from './ui'

const focus = [
  'Native Kotlin & Swift bridged into Flutter through Platform Channels',
  'Accessibility treated as a core requirement, not an afterthought',
  'Tested, stable releases: unit, widget and integration coverage',
]

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container about-grid">
        <div>
          <SectionHead eyebrow="About" title="Software that people can actually rely on." />
          <Reveal className="about-copy" delay={0.1}>
            <p>
              I’m a <strong>Flutter developer</strong> with over a year of experience building cross-platform
              products — and I’ve spent most of it on <strong>SmartOn</strong>, an app that helps blind and
              low-vision people see the world through voice and smart glasses.
            </p>
            <p>
              That work lives where Flutter meets the hardware: <strong>BLE connections</strong>, background
              handling, audio sessions on iOS, OCR and speech. I’m comfortable dropping into Kotlin and Swift
              when the platform demands it, and I care about the details screen readers depend on.
            </p>
            <ul className="focus-list">
              {focus.map((f) => (
                <li key={f}><Check size={18} /> {f}</li>
              ))}
            </ul>
          </Reveal>
        </div>
        <div className="stats">
          {stats.map((s, i) => (
            <Reveal key={s.label} className="stat" delay={0.1 + i * 0.08}>
              <div className="num"><CountUp {...s} /></div>
              <div className="lab">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
