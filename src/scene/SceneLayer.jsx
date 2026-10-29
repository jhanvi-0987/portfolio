import { Component, Suspense, lazy, useEffect, useState } from 'react'

const Scene = lazy(() => import('./Scene'))

class Boundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function SceneLayer({ dark, paused }) {
  const [ok, setOk] = useState(false)
  useEffect(() => setOk(hasWebGL()), [])
  if (!ok) return null
  return (
    <div className="scene-layer" aria-hidden="true">
      <Boundary>
        <Suspense fallback={null}>
          <Scene dark={dark} paused={paused} />
        </Suspense>
      </Boundary>
    </div>
  )
}
