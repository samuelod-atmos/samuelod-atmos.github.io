/**
 * Main atmospheric flow visualization component
 * Integrates Three.js canvas with particle system and wind data
 */

import React, { useEffect, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Globe } from './atmosphere/Globe';
import { windFieldManager } from './atmosphere/WindField';
import { ATMOSPHERE_CONFIG } from './atmosphere/constants';
import './styles/atmosphere.css';

interface AtmosphereFlowProps {
  autoRotate?: boolean;
  showControls?: boolean;
}

/**
 * Scene setup component
 */
const AtmosphereScene: React.FC<{ autoRotate: boolean }> = ({ autoRotate }) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 5, 10]} intensity={0.8} />
      <pointLight position={[-10, -5, -10]} intensity={0.2} color={0x1a4a8a} />

      {/* Camera with OrbitControls */}
      <PerspectiveCamera
        makeDefault
        position={[0, 0, 2.5]}
        fov={60}
        near={0.1}
        far={1000}
      />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        autoRotate={autoRotate}
        autoRotateSpeed={ATMOSPHERE_CONFIG.autoRotateSpeed}
        minDistance={1.3}
        maxDistance={5}
      />

      {/* Globe with streamlines */}
      <Suspense fallback={<mesh><sphereGeometry args={[1, 32, 32]} /><meshBasicMaterial color={0x333355} /></mesh>}>
        <Globe />
      </Suspense>

      {/* Space background */}
      <mesh scale={100}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={ATMOSPHERE_CONFIG.backgroundColor}
          side={THREE.BackSide}
        />
      </mesh>
    </>
  );
};

/**
 * Main AtmosphereFlow component
 */
export const AtmosphereFlow: React.FC<AtmosphereFlowProps> = ({
  autoRotate = ATMOSPHERE_CONFIG.autoRotate,
  showControls = true,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize wind data on mount
  useEffect(() => {
    const init = async () => {
      try {
        await windFieldManager.initialize();
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize atmosphere:', err);
        setError('Failed to load wind data. Using default values.');
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (error) {
    console.warn(error);
  }

  return (
    <div className="atmosphere-container">
      <Canvas
        className="atmosphere-canvas"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={[ATMOSPHERE_CONFIG.backgroundColor]} />
        <AtmosphereScene autoRotate={autoRotate} />
      </Canvas>

      {/* Status indicator */}
      {showControls && (
        <div className="atmosphere-status">
          {isLoading ? (
            <p>Loading atmospheric data...</p>
          ) : (
            <p>Real-time wind visualization</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AtmosphereFlow;
