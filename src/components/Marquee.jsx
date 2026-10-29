import { motion, useScroll, useTransform } from 'framer-motion'
import { marquee } from '../data/portfolio'

function Row({ items, reverse, shift }) {
  const row = [...items, ...items]
  return (
    <motion.div style={{ x: shift }}>
      <div className={`marquee-track ${reverse ? 'rev' : ''}`}>
        {row.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </motion.div>
  )
}

export default function Marquee() {
  const { scrollY } = useScroll()
  const a = useTransform(scrollY, [0, 4000], [0, -520])
  const b = useTransform(scrollY, [0, 4000], [0, 520])
  return (
    <div className="marquee" aria-hidden="true">
      <Row items={marquee} shift={a} />
      <Row items={[...marquee].reverse()} reverse shift={b} />
    </div>
  )
}
