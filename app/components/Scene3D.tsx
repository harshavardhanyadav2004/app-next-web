"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Float, Environment } from "@react-three/drei"

function FloatingShape() {
  return (
    <Float floatIntensity={2} rotationIntensity={2}>
      <mesh>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.4} />
      </mesh>
    </Float>
  )
}

export default function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <Environment preset="sunset" />
      <FloatingShape />
      <OrbitControls enableZoom={false} />
    </Canvas>
  )
}