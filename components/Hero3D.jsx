'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, ContactShadows, PresentationControls, Sparkles } from '@react-three/drei'

function AbstractShape() {
  const meshRef = useRef()
  const wireframeRef = useRef()
  
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.15
    meshRef.current.rotation.y += delta * 0.2
    
    wireframeRef.current.rotation.x -= delta * 0.1
    wireframeRef.current.rotation.y -= delta * 0.15
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1.2, 0.4, 128, 32]} />
        <meshPhysicalMaterial 
          color="#1a1a1a" 
          metalness={0.9} 
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
      <mesh ref={wireframeRef} scale={1.2}>
        <icosahedronGeometry args={[2, 1]} />
        <meshBasicMaterial color="#4466ff" wireframe transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

export default function Hero3D() {
  return (
    <div className="w-full h-full min-h-[400px] md:h-[500px] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4466ff" />
        
        <PresentationControls 
          global 
          config={{ mass: 1, tension: 170, friction: 26 }} 
          rotation={[0, 0, 0]} 
          polar={[-Math.PI / 4, Math.PI / 4]} 
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <AbstractShape />
            <Sparkles count={100} scale={6} size={2} speed={0.4} opacity={0.3} color="#88aaff" />
          </Float>
        </PresentationControls>

        <Environment preset="city" />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} color="#000000" />
      </Canvas>
    </div>
  )
}
