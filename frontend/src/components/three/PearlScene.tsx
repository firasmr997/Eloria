import { Environment, Float, Lightformer, MeshDistortMaterial } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export interface PearlSceneProps {
  /** Render loop: 'always' while visible, 'never' offscreen, 'demand' for a single static frame. */
  frameloop: 'always' | 'never' | 'demand'
  /** Lighter geometry on small or low-power screens. */
  lite: boolean
  still: boolean
  /** Called once the first frame has rendered, so the wrapper can fade the pearl in. */
  onReady?: () => void
}

/** Nacre: a warm white body, strong clear coat and thin-film iridescence that shifts towards rose and gold. */
const PEARL = {
  color: '#f1e5d6',
  roughness: 0.16,
  metalness: 0.18,
  clearcoat: 1,
  clearcoatRoughness: 0.05,
  iridescence: 1,
  iridescenceIOR: 1.6,
  iridescenceThicknessRange: [260, 780] as [number, number],
  sheen: 1,
  sheenColor: new THREE.Color('#e3c39b'),
  sheenRoughness: 0.3,
  envMapIntensity: 1.25,
}

function Pearl({ lite, still }: { lite: boolean; still: boolean }) {
  const group = useRef<THREE.Group>(null)
  const segments = lite ? 72 : 144

  // The pearl leans gently towards the pointer.
  useFrame(({ pointer }, delta) => {
    if (!group.current || still) return
    const g = group.current
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, pointer.x * 0.35, 2.2, delta)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.25, 2.2, delta)
    g.position.x = THREE.MathUtils.damp(g.position.x, pointer.x * 0.08, 2, delta)
  })

  return (
    <group ref={group}>
      <Float speed={still ? 0 : 1.1} rotationIntensity={still ? 0 : 0.25} floatIntensity={still ? 0 : 0.6}>
        <mesh>
          <sphereGeometry args={[1, segments, segments]} />
          <MeshDistortMaterial {...PEARL} distort={0.24} speed={still ? 0 : 1.15} />
        </mesh>
      </Float>
    </group>
  )
}

/** Procedural studio light (no HDR download): warm key, ivory fill, champagne rim. */
function Studio() {
  return (
    <Environment resolution={128} frames={1}>
      {/* A mid-tone stone surround gives the lights something to read against in the reflections. */}
      <color attach="background" args={['#b9a58e']} />
      <Lightformer form="rect" intensity={4} color="#fff6ea" position={[-3, 2.5, 3]} scale={[5, 4, 1]} />
      <Lightformer form="rect" intensity={2.2} color="#f9f2e8" position={[3.5, 0.5, 2]} scale={[3, 5, 1]} />
      <Lightformer form="ring" intensity={2.4} color="#e0c08e" position={[2, 2.5, -3]} scale={3} />
      <Lightformer form="rect" intensity={1.4} color="#d9b2a6" position={[0, -3, 1.5]} scale={[6, 1.5, 1]} />
      <Lightformer form="circle" intensity={3} color="#ffffff" position={[-1.2, 1.6, 4]} scale={0.8} />
    </Environment>
  )
}

export default function PearlScene({ frameloop, lite, still, onReady }: PearlSceneProps) {
  return (
    <Canvas
      onCreated={() => requestAnimationFrame(() => onReady?.())}
      frameloop={frameloop}
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      camera={{ position: [0, 0, 4.4], fov: 32 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
      aria-hidden
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[-2, 3, 4]} intensity={1.1} color="#fff1dc" />
      <Pearl lite={lite} still={still} />
      <Studio />
    </Canvas>
  )
}
