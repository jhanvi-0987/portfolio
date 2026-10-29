import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Bluetooth } from 'lucide-react'

const bars = Array.from({ length: 21 }, (_, i) => i)

export default function Device() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), { stiffness: 120, damping: 14 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 120, damping: 14 })
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const leave = () => { mx.set(0); my.set(0) }

  return (
    <div className="device-wrap" onMouseMove={move} onMouseLeave={leave}>
      <div className="device-glow" />
      <motion.div
        className="device"
        style={{ rotateX: rx, rotateY: ry }}
        initial={{ opacity: 0, y: 60, rotateX: 20 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="screen" aria-hidden="true">
          <div className="notch" />
          <div className="scr-head"><span>SmartOn</span><span>9:41</span></div>
          <div className="scr-title">Listening…</div>
          <div className="wave">
            {bars.map((i) => (
              <span key={i} style={{ animationDelay: `${(i % 7) * 0.13}s`, animationDuration: `${0.8 + (i % 5) * 0.12}s` }} />
            ))}
          </div>
          <div className="bubble me">What’s in front of me?</div>
          <div className="bubble">A wooden table with a coffee cup, 2 steps ahead. A laptop sits to the right.</div>
          <div className="ble"><Bluetooth size={15} /> Smart glasses connected</div>
        </div>
      </motion.div>
    </div>
  )
}
