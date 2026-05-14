/**
 * GPU-accelerated particle system for wind visualization
 * Uses Three.js Points geometry with custom shaders
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ATMOSPHERE_CONFIG } from './constants';
import { windFieldManager } from './WindField';

import vertexShader from './shaders/particle.vert.glsl?raw';
import fragmentShader from './shaders/particle.frag.glsl?raw';

export const ParticleSystem: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Initialize particle data
  const particleData = useMemo(() => {
    const count = ATMOSPHERE_CONFIG.particleCount;
    
    // Position buffer
    const positions = new Float32Array(count * 3);
    // Lifetime attributes
    const lifetimes = new Float32Array(count);
    const maxLifetimes = new Float32Array(count);
    // Velocity from wind field
    const velocities = new Float32Array(count * 3);

    const [minX, maxX] = ATMOSPHERE_CONFIG.boundsX;
    const [minY, maxY] = ATMOSPHERE_CONFIG.boundsY;
    const [minZ, maxZ] = ATMOSPHERE_CONFIG.boundsZ;

    for (let i = 0; i < count; i++) {
      // Random initial position
      positions[i * 3] = Math.random() * (maxX - minX) + minX;
      positions[i * 3 + 1] = Math.random() * (maxY - minY) + minY;
      positions[i * 3 + 2] = Math.random() * (maxZ - minZ) + minZ;

      // Random lifetime (staggered)
      const lifetime = Math.random() * ATMOSPHERE_CONFIG.particleLifetime;
      lifetimes[i] = lifetime;
      maxLifetimes[i] = ATMOSPHERE_CONFIG.particleLifetime;

      // Get wind at this position
      const wind = windFieldManager.getWindAtPosition(
        (positions[i * 3] - minX) / (maxX - minX),
        (positions[i * 3 + 1] - minY) / (maxY - minY)
      );

      // Initialize velocity with wind direction
      const windInfluence = 0.5;
      velocities[i * 3] = wind.u * windInfluence;
      velocities[i * 3 + 1] = wind.v * windInfluence;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1; // Small vertical component
    }

    return {
      positions,
      lifetimes,
      maxLifetimes,
      velocities,
    };
  }, []);

  // Create geometry
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3));
    geom.setAttribute('aLifetime', new THREE.BufferAttribute(particleData.lifetimes, 1));
    geom.setAttribute('aMaxLifetime', new THREE.BufferAttribute(particleData.maxLifetimes, 1));
    geom.setAttribute('aVelocity', new THREE.BufferAttribute(particleData.velocities, 3));
    return geom;
  }, [particleData]);

  // Create material with shaders
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        speed: { value: ATMOSPHERE_CONFIG.baseSpeed },
        windTexture: { value: null },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
  }, []);

  if (materialRef.current) {
    materialRef.current = material;
  } else {
    materialRef.current = material;
  }

  // Reset particles that have exceeded lifetime
  useFrame(({ clock }) => {
    if (!pointsRef.current || !materialRef.current) return;

    const elapsed = clock.getElapsedTime();
    materialRef.current.uniforms.time.value = elapsed;

    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const lifeAttr = geometry.getAttribute('aLifetime') as THREE.BufferAttribute;
    const maxLifeAttr = geometry.getAttribute('aMaxLifetime') as THREE.BufferAttribute;
    const velAttr = geometry.getAttribute('aVelocity') as THREE.BufferAttribute;

    const positions = posAttr.array as Float32Array;
    const lifetimes = lifeAttr.array as Float32Array;
    const maxLifetimes = maxLifeAttr.array as Float32Array;
    const velocities = velAttr.array as Float32Array;

    const [minX, maxX] = ATMOSPHERE_CONFIG.boundsX;
    const [minY, maxY] = ATMOSPHERE_CONFIG.boundsY;
    const [minZ, maxZ] = ATMOSPHERE_CONFIG.boundsZ;

    let needsUpdate = false;

    for (let i = 0; i < ATMOSPHERE_CONFIG.particleCount; i++) {
      lifetimes[i] += clock.getDelta();

      // Reset particle if lifetime exceeded
      if (lifetimes[i] > maxLifetimes[i]) {
        positions[i * 3] = Math.random() * (maxX - minX) + minX;
        positions[i * 3 + 1] = Math.random() * (maxY - minY) + minY;
        positions[i * 3 + 2] = Math.random() * (maxZ - minZ) + minZ;
        lifetimes[i] = 0;

        // Update velocity for new particle position
        const wind = windFieldManager.getWindAtPosition(
          (positions[i * 3] - minX) / (maxX - minX),
          (positions[i * 3 + 1] - minY) / (maxY - minY)
        );
        const windInfluence = 0.5;
        velocities[i * 3] = wind.u * windInfluence;
        velocities[i * 3 + 1] = wind.v * windInfluence;

        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      posAttr.needsUpdate = true;
      lifeAttr.needsUpdate = true;
      velAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material}>
    </points>
  );
};
