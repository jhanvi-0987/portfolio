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

/* ---------- Smart glasses ---------- */
function Glasses({ dark }) {
  const brand = dark ? GOLD : OLIVE
  const root = useRef()
  const tilt = useRef()
  const scan = useRef()
  const sat = useRef([])
  const pulse = useRef([])
  const fadeMats = useRef([])
  const { viewport, size } = useThree()

  const reg = (m) => {
    if (m && !fadeMats.current.includes(m)) fadeMats.current.push(m)
  }

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const sy = window.scrollY
    const vh = window.innerHeight
    const s = sy / vh
    const w = clamp(1 - sy / (vh * 0.85), 0, 1) // 1 while hero is on screen

    // anchor on the hero stage element so the model sits in the layout on any screen size
    let ax = viewport.width * 0.22, ay = 0, heroScale = 1
    const stage = document.getElementById('hero-stage')
    if (stage) {
      const r = stage.getBoundingClientRect()
      ax = ((r.left + r.width * 0.56) / size.width - 0.5) * viewport.width // sit slightly right so the temple arm stays clear of the text
      ay = -((r.top + r.height / 2) / size.height - 0.5) * viewport.height
      heroScale = clamp(((r.width / size.width) * viewport.width * 0.9) / 3.2, 0.5, 1.3)
    }
    const side = 1
    const ambX = viewport.width * (viewport.width < 6 ? 0.34 : 0.41)
    const ambY = viewport.height * 0.14 * Math.sin(s * 0.8 + 0.5)
    const ambScale = Math.min(0.5, heroScale * 0.55)

    const g = root.current
    g.position.x = damp(g.position.x, lerp(ambX, ax, w), 5, dt)
    g.position.y = damp(g.position.y, lerp(ambY, ay, w) + Math.sin(t * 0.9) * 0.08, 5, dt)
    g.position.z = damp(g.position.z, lerp(-2.4, 0, w), 4, dt)
    g.scale.setScalar(damp(g.scale.x, lerp(ambScale, heroScale, w), 5, dt))

    // rotation: mouse look + scroll-driven spin
    const ry = pointer.x * 0.55 + Math.sin(t * 0.5) * 0.18 + s * Math.PI * 0.8 + 0.22
    const rx = -pointer.y * 0.3 + 0.08
    tilt.current.rotation.y = damp(tilt.current.rotation.y, ry, 4, dt)
    tilt.current.rotation.x = damp(tilt.current.rotation.x, rx, 4, dt)
    tilt.current.rotation.z = damp(tilt.current.rotation.z, side * 0.12 * (1 - w), 4, dt)

    scan.current.rotation.z = -t * 1.6
    sat.current.forEach((m, i) => {
      if (!m) return
      const a = t * (0.5 + i * 0.18) + i * 2.1
      m.position.set(Math.cos(a) * (1.75 + i * 0.2), Math.sin(a * 1.3) * 0.9, Math.sin(a) * (1.4 + i * 0.2))
      m.rotation.x += dt * 0.8
      m.rotation.y += dt * 0.6
    })
    pulse.current.forEach((m, i) => {
      if (!m) return
      const p = (t * 0.55 + i * 0.5) % 1
      m.scale.setScalar(1 + p * 5)
      m.material.opacity = (1 - p) * 0.7
    })
    const fade = lerp(0.3, 1, w)
    fadeMats.current.forEach((m) => {
      m.opacity = (m.userData.base ?? 1) * fade
    })
  })

  const frame = { color: brand, metalness: 0.95, roughness: 0.28, envMapIntensity: 1.5, transparent: true }
  const lens = { color: dark ? CREAM : SAGE, transparent: true, opacity: 0.22, roughness: 0.04, metalness: 0.15, clearcoat: 1, side: THREE.DoubleSide, envMapIntensity: 2.4 }

  return (
    <group ref={root}>
      <group ref={tilt}>
        {[-1, 1].map((d) => (
          <group key={d} position={[d * 0.8, 0, 0]} scale={[1, 0.84, 1]}>
            <mesh>
              <torusGeometry args={[0.64, 0.085, 28, 72]} />
              <meshStandardMaterial {...frame} ref={reg} />
            </mesh>
            <mesh position={[0, 0, -0.01]}>
              <circleGeometry args={[0.62, 64]} />
              <meshPhysicalMaterial {...lens} ref={(m) => { if (m) { m.userData.base = 0.22; reg(m) } }} />
            </mesh>
            {/* hinge + temple arm */}
            <mesh position={[d * 0.66, 0.18, -0.06]}>
              <boxGeometry args={[0.14, 0.24, 0.22]} />
              <meshStandardMaterial {...frame} ref={reg} />
            </mesh>
            <mesh position={[d * 0.72, 0.18, -0.78]} rotation={[Math.PI / 2, 0, d * -0.04]} scale={[1, 1, 1 / 0.84]}>
              <cylinderGeometry args={[0.045, 0.045, 1.4, 16]} />
              <meshStandardMaterial {...frame} ref={reg} />
            </mesh>
          </group>
        ))}
        {/* bridge */}
        <mesh position={[0, 0.14, 0]}>
          <torusGeometry args={[0.2, 0.05, 16, 40, Math.PI]} />
          <meshStandardMaterial {...frame} ref={reg} />
        </mesh>
        {/* scanning ring inside the right lens */}
        <group position={[0.8, 0, 0.02]} scale={[1, 0.84, 1]}>
          <mesh ref={scan}>
            <torusGeometry args={[0.44, 0.014, 8, 80, Math.PI * 1.25]} />
            <meshBasicMaterial color={SAGE} transparent ref={reg} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.05, 0.075, 32]} />
            <meshBasicMaterial color={SAGE} transparent ref={reg} />
          </mesh>
        </group>
        {/* camera sensor + BLE pulses */}
        <group position={[-1.5, 0.3, 0.02]}>
          <mesh>
            <sphereGeometry args={[0.055, 20, 20]} />
            <meshBasicMaterial color={SAGE} transparent ref={reg} />
          </mesh>
          {[0, 1].map((i) => (
            <mesh key={i} ref={(m) => (pulse.current[i] = m)}>
              <ringGeometry args={[0.06, 0.07, 48]} />
              <meshBasicMaterial color={SAGE} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
        {/* orbiting satellites */}
        {[
          <icosahedronGeometry key="a" args={[0.17, 0]} />,
          <octahedronGeometry key="b" args={[0.15, 0]} />,
          <torusGeometry key="c" args={[0.13, 0.04, 8, 24]} />,
        ].map((geo, i) => (
          <mesh key={i} ref={(m) => (sat.current[i] = m)}>
            {geo}
            <meshStandardMaterial color={i === 1 ? SAGE : brand} emissive={i === 1 ? SAGE : brand} emissiveIntensity={0.5} wireframe={i === 0} transparent ref={reg} />
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
      <Glasses dark={dark} />
    </Canvas>
  )
}
