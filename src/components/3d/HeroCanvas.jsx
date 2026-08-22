import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function ParticleNetwork({ activeColor = '#00f3ff', particleCount = 1000 }) {
  const pointsRef = useRef();

  // Generate 3D particle coordinates in a sphere based on device tier
  const [positions, colors] = useMemo(() => {
    const count = particleCount;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const baseColor = new THREE.Color(activeColor);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.8 + Math.random() * 3.2;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      cols[i * 3] = baseColor.r;
      cols[i * 3 + 1] = baseColor.g;
      cols[i * 3 + 2] = baseColor.b;
    }
    return [pos, cols];
  }, [activeColor, particleCount]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x += delta * 0.07;
      pointsRef.current.rotation.y += delta * 0.10;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.045}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function FloatingNodes() {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t / 4) * 0.25;
      groupRef.current.position.y = Math.sin(t / 2) * 0.18;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Cyber Core Wireframe Sphere */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.7, 2]} />
        <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.22} />
      </mesh>
      {/* Inner Glowing Core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.75, 16, 16]} />
        <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function HeroCanvas({ activeColor = '#00f3ff' }) {
  const [deviceConfig, setDeviceConfig] = useState({
    particleCount: 1000,
    dpr: [1, 2],
    isMobile: false
  });

  useEffect(() => {
    const updateDeviceConfig = () => {
      const width = window.innerWidth;
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      
      if (width < 640 || isTouch) {
        // Mobile / Small touch devices: lightweight particles & max 1.5 DPR
        setDeviceConfig({ particleCount: 380, dpr: [1, 1.5], isMobile: true });
      } else if (width < 1024) {
        // Tablet
        setDeviceConfig({ particleCount: 650, dpr: [1, 1.75], isMobile: false });
      } else if (width >= 2560) {
        // 2K / 4K / Ultra-wide
        setDeviceConfig({ particleCount: 1400, dpr: [1, 2], isMobile: false });
      } else {
        // Standard Desktop
        setDeviceConfig({ particleCount: 1000, dpr: [1, 2], isMobile: false });
      }
    };

    updateDeviceConfig();
    window.addEventListener('resize', updateDeviceConfig);
    return () => window.removeEventListener('resize', updateDeviceConfig);
  }, []);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'auto' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }} dpr={deviceConfig.dpr}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={activeColor} />
        
        <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.4}>
          <FloatingNodes />
        </Float>
        
        <ParticleNetwork activeColor={activeColor} particleCount={deviceConfig.particleCount} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={!deviceConfig.isMobile}
          autoRotate={true}
          autoRotateSpeed={0.4}
        />
      </Canvas>
    </div>
  );
}
