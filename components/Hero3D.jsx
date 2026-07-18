'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, ContactShadows, PresentationControls, Sparkles, useGLTF, Center } from '@react-three/drei'

function Model() {
  // Cargamos el modelo GLB de VERA desde la carpeta public
  const { scene } = useGLTF('/vape.glb')
  
  // Usamos el hook useRef para animar la rotación lentamente
  const groupRef = useRef()
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2 // Rotación constante muy sutil
    }
  })

  return (
    <group ref={groupRef}>
      <Center scale={1.5}>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

export default function Hero3D() {
  return (
    <div className="w-full h-full min-h-[400px] md:h-[500px] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.25} penumbra={1} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#4466ff" />
        
        <PresentationControls 
          global 
          config={{ mass: 1, tension: 170, friction: 26 }} 
          rotation={[0, 0, 0]} 
          polar={[-Math.PI / 4, Math.PI / 4]} 
          azimuth={[-Math.PI, Math.PI]}
        >
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <Model />
            <Sparkles count={100} scale={6} size={2} speed={0.4} opacity={0.3} color="#88aaff" />
          </Float>
        </PresentationControls>

        <Environment preset="city" />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} color="#000000" />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/vape.glb')
