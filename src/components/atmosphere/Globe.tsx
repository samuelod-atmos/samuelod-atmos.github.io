/**
 * Globe with animated streamlines
 * Displays wind flow patterns on an Earth-like sphere
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ATMOSPHERE_CONFIG } from './constants';
import { windFieldManager } from './WindField';
import { BorderRenderer } from './BorderRenderer';

import streamlineVertexShader from './shaders/streamline.vert.glsl?raw';
import streamlineFragmentShader from './shaders/streamline.frag.glsl?raw';

// Inline streamline generation to avoid import issues
interface Streamline {
  points: number[];
  count: number;
}

function generateStreamlines(windFieldGetter: (lat: number, lon: number) => { u: number; v: number; magnitude: number }, count: number): Streamline[] {
  const streamlines: Streamline[] = [];
  const latSpacing = 180 / Math.sqrt(count);
  const lonSpacing = 360 / Math.sqrt(count);

  function latLonToCartesian(lat: number, lon: number, radius: number = 1): [number, number, number] {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    const x = radius * Math.cos(latRad) * Math.cos(lonRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.sin(lonRad);
    return [x, y, z];
  }

  for (let lat = -85; lat < 85; lat += latSpacing) {
    for (let lon = -180; lon < 180; lon += lonSpacing) {
      if (streamlines.length >= count) break;

      const points: number[] = [];
      let currLat = lat + (Math.random() - 0.5) * 10;
      let currLon = lon + (Math.random() - 0.5) * 10;

      for (let step = 0; step < 80; step++) {
        const wind = windFieldGetter(currLat, currLon);
        if (wind.magnitude < 0.01) break;

        const [x, y, z] = latLonToCartesian(currLat, currLon);
        points.push(x, y, z);

        const windLen = Math.sqrt(wind.u * wind.u + wind.v * wind.v);
        if (windLen > 0) {
          currLon += (wind.u / windLen) * 0.5;
          currLat += (wind.v / windLen) * 0.5;
        }

        if (currLon > 180) currLon -= 360;
        if (currLon < -180) currLon += 360;
        if (currLat > 85 || currLat < -85) break;
      }

      if (points.length > 6) {
        streamlines.push({ points, count: points.length / 3 });
      }
    }
    if (streamlines.length >= count) break;
  }

  return streamlines;
}

export const Globe: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const streamlineGroupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Generate streamlines
  const streamlines = useMemo(() => {
    return generateStreamlines(
      (lat, lon) => windFieldManager.getWindAtPosition(lat, lon),
      150 // number of streamlines
    );
  }, []);

  // Create streamline geometry and materials
  useEffect(() => {
    if (!streamlineGroupRef.current) return;

    streamlineGroupRef.current.clear();

    const material = new THREE.ShaderMaterial({
      vertexShader: streamlineVertexShader,
      fragmentShader: streamlineFragmentShader,
      uniforms: {
        time: { value: 0 },
        speed: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    materialRef.current = material;

    streamlines.forEach((streamline) => {
      if (streamline.count < 2) return;

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(streamline.points);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const line = new THREE.Line(geometry, material);
      streamlineGroupRef.current!.add(line);
    });
  }, [streamlines]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <group ref={groupRef}>
      {/* Globe sphere */}
      <mesh>
        <sphereGeometry args={[1, 64, 32]} />
        <meshPhongMaterial
          color={0x1a2a4a}
          emissive={0x0a0f1a}
          shininess={0}
          flatShading={false}
        />
      </mesh>

      {/* Subtle atmosphere glow */}
      <mesh scale={1.01}>
        <sphereGeometry args={[1, 64, 32]} />
        <meshBasicMaterial
          color={0x1a4a6a}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Borders */}
      <BorderRenderer />

      {/* Streamlines */}
      <group ref={streamlineGroupRef} />
    </group>
  );
};
