/**
 * Globe borders renderer
 * Displays simplified coastlines and country borders on the globe
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { generateBorders } from './BorderData';

export const BorderRenderer: React.FC = () => {
  const borderMesh = useMemo(() => {
    const borders = generateBorders();
    const group = new THREE.Group();

    borders.forEach((border) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(border.points), 3));

      const material = new THREE.LineBasicMaterial({
        color: 0x4a9eff,
        transparent: true,
        opacity: 0.4,
        linewidth: 1,
      });

      const line = new THREE.Line(geometry, material);
      group.add(line);
    });

    return group;
  }, []);

  return <primitive object={borderMesh} />;
};
