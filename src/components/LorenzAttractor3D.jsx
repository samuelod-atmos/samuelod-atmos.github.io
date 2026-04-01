import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

// Lorenz system parameters
const sigma = 10;
const rho = 28;
const beta = 8 / 3;
const dt = 0.005;
const numPoints = 5000;

function generateLorenzPoints() {
  let x = 0.01, y = 0, z = 0;
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;
    x += dx;
    y += dy;
    z += dz;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

function LorenzLine() {
  const points = useMemo(() => generateLorenzPoints(), []);
  const lineRef = useRef();
  return (
    <line ref={lineRef}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="#4285F4" linewidth={2} />
    </line>
  );
}

function LorenzDot() {
  const points = useMemo(() => generateLorenzPoints(), []);
  const meshRef = useRef();
  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 60) % points.length;
    const idx = Math.floor(t);
    if (meshRef.current) {
      meshRef.current.position.copy(points[idx]);
    }
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#e53935" emissive="#e53935" />
    </mesh>
  );
}

export default function LorenzAttractor3D() {
  return (
    <Canvas camera={{ position: [0, 0, 60], fov: 60 }} style={{ width: "600px", height: "400px", background: "#111" }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={0.7} />
      <LorenzLine />
      <LorenzDot />
      <axesHelper args={[20]} />
      <gridHelper args={[60, 20]} />
      <OrbitControls />
    </Canvas>
  );
}
