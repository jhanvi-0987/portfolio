import { useState } from 'react'
import { GraduationCap, Mail, MapPin, Phone, Copy, Check, ArrowUpRight } from 'lucide-react'
import { education, profile } from '../data/portfolio'
import { GithubIcon, LinkedinIcon, Reveal, SectionHead } from './ui'

export function Education() {
  return (
    <section id="education" className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <SectionHead eyebrow="Education" title="Foundation." />
        <Reveal className="card edu">
          <div className="edu-l">
            <div className="ico"><GraduationCap size={28} /></div>
            <div>
              <h3>{education.degree}</h3>
              <p>{education.school} · {education.period}</p>
            </div>
          </div>
          <div className="score"><b>{education.score.replace('CGPA ', '')}</b><span>CGPA</span></div>
        </Reveal>
      </div>
    </section>
  )
}

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }
  return (
    <section id="contact" className="contact">
      <div className="container">
        <Reveal className="contact-card">
          <span className="eyebrow">Contact</span>
          <h2>Let’s build something <span className="accent-text">accessible.</span></h2>
          <p className="lede">Hiring for a Flutter role, or have a mobile idea in mind? I’d love to hear about it.</p>
          <div className="contact-actions">
            <a className="btn primary" href={`mailto:${profile.email}`}><Mail size={17} /> Email me <ArrowUpRight size={16} /></a>
            <button className="btn ghost" data-sound="success" onClick={copy}>{copied ? <Check size={17} /> : <Copy size={17} />} {copied ? 'Copied!' : 'Copy email'}</button>
            {profile.github && <a className="btn ghost" href={profile.github} target="_blank" rel="noreferrer"><GithubIcon /> GitHub</a>}
            {profile.linkedin && <a className="btn ghost" href={profile.linkedin} target="_blank" rel="noreferrer"><LinkedinIcon /> LinkedIn</a>}
          </div>
          <div className="contact-meta">
            <span><Mail size={16} /> {profile.email}</span>
            <a href={`tel:${profile.phone.replace(/\s/g, '')}`}><span><Phone size={16} /> {profile.phone}</span></a>
            <span><MapPin size={16} /> {profile.location}</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
