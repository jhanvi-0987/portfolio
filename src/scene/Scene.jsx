import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

const { damp, lerp, clamp } = THREE.MathUtils
const pointer = { x: 0, y: 0 }
// Palette: ink #161c12 · olive #3b4a2a · sage #7c8a5b · cream #e6e2d3 · gold #c9a66b
const GOLD = '#c9a66b'
const OLIVE = '#3b4a2a'
const SAGE = '#7c8a5b'
const CREAM = '#e6e2d3'

/* ---------- Armillary sphere: wireframe globe + three gyroscope rings ---------- */
function Gyro({ dark }) {
  const root = useRef()
  const tilt = useRef()
  const rings = useRef([])
  const pulses = useRef([])
  const core = useRef()
  const fadeMats = useRef([])
  const { viewport, size } = useThree()
  const brand = dark ? GOLD : OLIVE

  const reg = (m) => {
    if (m && !fadeMats.current.includes(m)) fadeMats.current.push(m)
  }

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const sy = window.scrollY
    const vh = window.innerHeight
    const s = sy / vh
    const w = clamp(1 - sy / (vh * 0.85), 0, 1) // 1 while the hero is on screen

    // anchor on the hero stage element so the sculpture sits in the layout at any screen size
    let ax = viewport.width * 0.22, ay = 0, heroScale = 1
    const stage = document.getElementById('hero-stage')
    if (stage) {
      const r = stage.getBoundingClientRect()
      ax = ((r.left + r.width / 2) / size.width - 0.5) * viewport.width
      ay = -((r.top + r.height / 2) / size.height - 0.5) * viewport.height
      heroScale = clamp(((r.width / size.width) * viewport.width * 0.82) / 4.2, 0.4, 1.1)
    }
    const ambX = viewport.width * (viewport.width < 6 ? 0.34 : 0.41)
    const ambY = viewport.height * 0.14 * Math.sin(s * 0.8 + 0.5)
    const ambScale = Math.min(0.42, heroScale * 0.55)

    const g = root.current
    g.position.x = damp(g.position.x, lerp(ambX, ax, w), 5, dt)
    g.position.y = damp(g.position.y, lerp(ambY, ay, w) + Math.sin(t * 0.9) * 0.06, 5, dt)
    g.position.z = damp(g.position.z, lerp(-2.4, 0, w), 4, dt)
    g.scale.setScalar(damp(g.scale.x, lerp(ambScale, heroScale, w), 5, dt))

    // whole sculpture: slow spin + mouse look + scroll-driven turn
    tilt.current.rotation.y = damp(tilt.current.rotation.y, t * 0.18 + pointer.x * 0.6 + s * Math.PI * 0.6, 3, dt)
    tilt.current.rotation.x = damp(tilt.current.rotation.x, 0.35 - pointer.y * 0.35, 3, dt)

    // each ring spins in its own plane at its own speed
    rings.current.forEach((r, i) => { if (r) r.rotation.z += dt * (0.55 - i * 0.2) * (i % 2 ? -1 : 1) })
    core.current.rotation.y += dt * 0.35
    core.current.rotation.x += dt * 0.2

    // ripple pulses
    pulses.current.forEach((m, i) => {
      if (!m) return
      const p = (t * 0.4 + i * 0.5) % 1
      m.scale.setScalar(1 + p * 1.6)
      m.material.opacity = (1 - p) * 0.5
    })
    const fade = lerp(0.3, 1, w)
    fadeMats.current.forEach((m) => { m.opacity = (m.userData.base ?? 1) * fade })
  })

  const metal = { color: brand, metalness: 0.95, roughness: 0.28, envMapIntensity: 1.5, transparent: true }
  // [radius, tube, tiltX, tiltY, colour, node colour]
  const specs = [
    [1.25, 0.04, 1.2, 0.2, brand, CREAM],
    [1.6, 0.03, 0.4, 0.9, SAGE, brand],
    [1.95, 0.022, 1.0, -0.8, CREAM, SAGE],
  ]

  return (
    <group ref={root}>
      <group ref={tilt}>
        {/* globe */}
        <mesh ref={core}>
          <icosahedronGeometry args={[0.78, 2]} />
          <meshBasicMaterial color={SAGE} wireframe transparent ref={(m) => { if (m) { m.userData.base = 0.85; reg(m) } }} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial {...metal} ref={reg} />
        </mesh>
        {/* gyroscope rings with a node riding each */}
        {specs.map(([r, tube, tx, ty, col, nodeCol], i) => (
          <group key={i} rotation={[tx, ty, 0]}>
            <group ref={(m) => (rings.current[i] = m)}>
              <mesh>
                <torusGeometry args={[r, tube, 16, 120]} />
                <meshStandardMaterial {...metal} color={col} ref={reg} />
              </mesh>
              {[0, Math.PI].map((a) => (
                <mesh key={a} position={[Math.cos(a) * r, Math.sin(a) * r, 0]}>
                  <sphereGeometry args={[0.07 + (2 - i) * 0.02, 20, 20]} />
                  <meshStandardMaterial color={nodeCol} emissive={nodeCol} emissiveIntensity={0.5} transparent ref={reg} />
                </mesh>
              ))}
            </group>
          </group>
        ))}
        {/* expanding signal pulses */}
        {[0, 1].map((i) => (
          <mesh key={i} ref={(m) => (pulses.current[i] = m)} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.0, 1.015, 96]} />
            <meshBasicMaterial color={SAGE} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Rig() {
  useEffect(() => {
    const move = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return null
}

export default function Scene({ dark = true, paused = false }) {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 760
  return (
    <Canvas
      className="scene"
      frameloop={paused ? 'never' : 'always'}
      dpr={[1, mobile ? 1.5 : 1.8]}
      camera={{ position: [0, 0, 7], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <Rig />
      <ambientLight intensity={dark ? 0.35 : 0.7} />
      <pointLight position={[4, 3, 4]} intensity={dark ? 30 : 18} color={GOLD} />
      <pointLight position={[-4, -2, 3]} intensity={dark ? 24 : 12} color={SAGE} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={dark ? 3 : 4} color={CREAM} position={[0, 5, -3]} scale={[12, 3, 1]} />
        <Lightformer form="rect" intensity={2.4} color={GOLD} position={[-5, 1, 2]} scale={[2, 6, 1]} />
        <Lightformer form="rect" intensity={2.4} color={SAGE} position={[5, 0, 2]} scale={[2, 6, 1]} />
        <Lightformer form="ring" intensity={2} position={[0, 0, 5]} scale={4} />
      </Environment>
      <Gyro dark={dark} />
    </Canvas>
  )
}
