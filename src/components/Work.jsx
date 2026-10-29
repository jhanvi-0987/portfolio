import { ArrowUpRight } from 'lucide-react'
import { caseStudy, projects } from '../data/portfolio'
import { GithubIcon, Icon, Reveal, SectionHead, Tilt } from './ui'
import Device from './Device'

function Project({ p, i }) {
  return (
    <Reveal delay={i * 0.1} className="">
      <Tilt as="article" className="card project" style={{ height: '100%' }}>
        <span className="p-num">0{i + 1} / PROJECT</span>
        <div className="p-bar" style={{ background: p.accent }} />
        <h3>{p.title}</h3>
        <p className="sub">{p.subtitle}</p>
        <ul className="points">{p.points.map((t) => <li key={t}>{t}</li>)}</ul>
        <div className="p-foot">
          <div className="tags" style={{ margin: 0 }}>{p.stack.map((s) => <span key={s} className="chip mono">{s}</span>)}</div>
          {p.repo && (
            <a href={p.repo} target="_blank" rel="noreferrer" className="btn ghost sm"><GithubIcon width="16" height="16" /> Code <ArrowUpRight size={14} /></a>
          )}
        </div>
      </Tilt>
    </Reveal>
  )
}

export default function Work() {
  return (
    <section id="work" className="section">
      <div className="container">
        <SectionHead eyebrow={caseStudy.eyebrow} title="Production work & side projects." />
        <Reveal className="case">
          <div className="case-grid">
            <div>
              <div className="case-head">
                <div>
                  <h2 className="accent-text">{caseStudy.title}</h2>
                  <p>{caseStudy.tagline}</p>
                </div>
                <span className="live"><span className="pulse" /> {caseStudy.status}</span>
              </div>
              <div className="pillars">
                {caseStudy.pillars.map((p) => (
                  <Tilt key={p.title} className="pillar" max={9}>
                    <div className="ico"><Icon name={p.icon} size={22} /></div>
                    <h4>{p.title}</h4>
                    <p>{p.text}</p>
                  </Tilt>
                ))}
              </div>
            </div>
            <div className="case-device"><Device /></div>
          </div>
        </Reveal>
        <div className="projects" style={{ marginTop: 20 }}>
          {projects.map((p, i) => <Project key={p.title} p={p} i={i} />)}
        </div>
      </div>
    </section>
  )
}
