"use client";

import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function TShirt({ color = '#3B82F6', design = 'NanoDrip' }: { color?: string; design?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* T-Shirt Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 2.5, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* T-Shirt Sleeves */}
      <mesh position={[-1.2, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 1, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[1.2, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 1, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Text Design */}
      <Text
        position={[0, 0.2, 0.06]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
      >
        {design}
      </Text>
    </group>
  );
}

function Hoodie({ color = '#1F2937', design = 'NanoDrip' }: { color?: string; design?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Hoodie Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 2.8, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Hood */}
      <mesh position={[0, 1.6, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.8, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Sleeves */}
      <mesh position={[-1.3, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1.5, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[1.3, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1.5, 0.15]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Pocket */}
      <mesh position={[0, -0.5, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.6, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Text Design */}
      <Text
        position={[0, 0.5, 0.08]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
      >
        {design}
      </Text>
    </group>
  );
}

interface Product3DProps {
  type: 'tshirt' | 'hoodie';
  color?: string;
  design?: string;
  className?: string;
}

export default function Product3D({ 
  type, 
  color = '#3B82F6', 
  design = 'NanoDrip',
  className = "h-96 w-full"
}: Product3DProps) {
  const [isRotating, setIsRotating] = useState(true);

  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      onMouseEnter={() => setIsRotating(false)}
      onMouseLeave={() => setIsRotating(true)}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 6], fov: 50 }}
        className="rounded-lg bg-gradient-to-br from-background to-secondary/10"
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Suspense fallback={null}>
          {type === 'tshirt' ? (
            <TShirt color={color} design={design} />
          ) : (
            <Hoodie color={color} design={design} />
          )}
        </Suspense>
        
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          autoRotate={isRotating}
          autoRotateSpeed={2}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </motion.div>
  );
}