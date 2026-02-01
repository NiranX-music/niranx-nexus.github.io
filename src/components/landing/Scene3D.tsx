import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Box, Torus, Icosahedron, Stars } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, color, scale = 1, speed = 1, type = 'sphere' }: {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
  type?: 'sphere' | 'box' | 'torus' | 'icosahedron';
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });

  const getShape = () => {
    switch (type) {
      case 'sphere':
        return <Sphere ref={meshRef} args={[1, 32, 32]} scale={scale} position={position}>
          <MeshDistortMaterial color={color} distort={0.4} speed={2} roughness={0.2} metalness={0.8} transparent opacity={0.7} />
        </Sphere>;
      case 'box':
        return <Box ref={meshRef} args={[1, 1, 1]} scale={scale} position={position}>
          <MeshDistortMaterial color={color} distort={0.4} speed={2} roughness={0.2} metalness={0.8} transparent opacity={0.7} />
        </Box>;
      case 'torus':
        return <Torus ref={meshRef} args={[1, 0.4, 16, 32]} scale={scale} position={position}>
          <MeshDistortMaterial color={color} distort={0.4} speed={2} roughness={0.2} metalness={0.8} transparent opacity={0.7} />
        </Torus>;
      case 'icosahedron':
        return <Icosahedron ref={meshRef} args={[1, 0]} scale={scale} position={position}>
          <MeshDistortMaterial color={color} distort={0.4} speed={2} roughness={0.2} metalness={0.8} transparent opacity={0.7} />
        </Icosahedron>;
    }
  };

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={2}>
      {getShape()}
    </Float>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#a855f7"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function AnimatedRing({ radius, color, speed }: { radius: number; color: string; speed: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * speed) * 0.2;
      ringRef.current.rotation.z = state.clock.elapsedTime * speed * 0.5;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.6} />
    </mesh>
  );
}

function CentralOrb() {
  const orbRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime) * 0.1);
    }
  });

  return (
    <group>
      <Sphere ref={orbRef} args={[1.5, 64, 64]} position={[0, 0, -2]}>
        <MeshDistortMaterial
          color="#8b5cf6"
          attach="material"
          distort={0.3}
          speed={3}
          roughness={0.1}
          metalness={0.9}
          emissive="#4c1d95"
          emissiveIntensity={0.4}
        />
      </Sphere>
      <AnimatedRing radius={2.5} color="#a855f7" speed={0.5} />
      <AnimatedRing radius={3} color="#06b6d4" speed={0.3} />
      <AnimatedRing radius={3.5} color="#ec4899" speed={0.4} />
    </group>
  );
}

export function Scene3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#a855f7" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
        <spotLight position={[0, 10, 0]} intensity={0.8} color="#ec4899" angle={0.3} />
        
        <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
        
        <CentralOrb />
        
        <FloatingShape position={[-5, 2, -3]} color="#06b6d4" scale={0.6} speed={1.2} type="icosahedron" />
        <FloatingShape position={[5, -2, -4]} color="#ec4899" scale={0.5} speed={0.8} type="box" />
        <FloatingShape position={[-4, -3, -2]} color="#f59e0b" scale={0.4} speed={1.5} type="torus" />
        <FloatingShape position={[4, 3, -5]} color="#10b981" scale={0.7} speed={0.6} type="sphere" />
        <FloatingShape position={[0, 4, -6]} color="#8b5cf6" scale={0.5} speed={1} type="icosahedron" />
        
        <ParticleField />
      </Canvas>
    </div>
  );
}
