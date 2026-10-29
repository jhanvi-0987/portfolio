import { useState } from 'react'
import { Check, Download, ExternalLink, FileText, Mail } from 'lucide-react'
import { profile } from '../data/portfolio'
import { Reveal, SectionHead, Tilt } from './ui'

const inside = [
  'Professional summary & technical skills',
  'Experience at Sunbots Innovation LLP and Muster Dekho',
  'SmartOn: BLE smart glasses, voice AI, Document AI',
  'Projects: TeamFlow and GrosSync',
  'Education: B.Tech in Information Technology',
]

export default function Resume() {
  const [done, setDone] = useState(false)
  if (!profile.resume) return null
  const onDownload = () => {
    setDone(true)
    setTimeout(() => setDone(false), 2600)
  }
  return (
    <section id="resume" className="section">
      <div className="container">
        <SectionHead eyebrow="Resume" title="Take the full story with you." lede="Everything on this page in one clean, one-page PDF." />
        <div className="resume-grid">
          <Reveal className="resume-preview-wrap">
            <Tilt className="resume-preview" max={6}>
              <a href={profile.resume} target="_blank" rel="noreferrer" aria-label="Open resume PDF in a new tab">
                <img src="/resume-preview.jpg" alt="Preview of Jahanvi Makwana's one-page resume" loading="lazy" />
              </a>
              <span className="resume-tag"><FileText size={14} /> {profile.resumeMeta.format} · {profile.resumeMeta.pages} · {profile.resumeMeta.size}</span>
            </Tilt>
          </Reveal>

          <Reveal delay={0.12} className="resume-info">
            <h3>What’s inside</h3>
            <ul className="resume-list">
              {inside.map((t) => (
                <li key={t}><Check size={17} /> {t}</li>
              ))}
            </ul>
            <div className="resume-actions">
              <a className="btn primary" href={profile.resume} download="Jahanvi_Makwana_Resume.pdf" data-sound="success" onClick={onDownload}>
                {done ? <Check size={17} /> : <Download size={17} />} {done ? 'Downloading…' : 'Download resume'}
              </a>
              <a className="btn ghost" href={profile.resume} target="_blank" rel="noreferrer"><ExternalLink size={16} /> View in new tab</a>
              <a className="btn ghost" href={`mailto:${profile.email}?subject=Hello%20Jahanvi`}><Mail size={16} /> Email me</a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
