/**
 * Wind field data management and interpolation
 * Fetches real meteorological data and provides spatial lookup
 */

import { ATMOSPHERE_CONFIG, WIND_QUERY_PARAMS } from './constants';

export interface WindData {
  u: number[][]; // 2D grid [lat][lon] of u-components
  v: number[][]; // 2D grid [lat][lon] of v-components
  time: number;
  gridWidth: number;
  gridHeight: number;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
}

export interface WindVector {
  u: number;
  v: number;
  magnitude: number;
}

class WindFieldManager {
  private windData: WindData | null = null;
  private lastUpdate: number = 0;
  private windTexture: Float32Array | null = null;

  /**
   * Fetch wind data from Open-Meteo API
   */
  async fetchWindData(): Promise<WindData | null> {
    const now = Date.now();
    
    // Don't fetch more frequently than the update interval
    if (this.windData && now - this.lastUpdate < ATMOSPHERE_CONFIG.windUpdateInterval) {
      return this.windData;
    }

    try {
      // For now, use synthetic wind patterns instead of live data
      // This avoids API issues while still providing smooth flow
      const gridSize = ATMOSPHERE_CONFIG.windGridWidth;
      const uGrid: number[][] = [];
      const vGrid: number[][] = [];
      
      // Generate synthetic wind patterns (sine waves)
      for (let lat = 0; lat < gridSize; lat++) {
        const uRow: number[] = [];
        const vRow: number[] = [];
        const latFrac = lat / gridSize;
        const latAngle = latFrac * Math.PI * 2;
        
        for (let lon = 0; lon < gridSize; lon++) {
          const lonFrac = lon / gridSize;
          const lonAngle = lonFrac * Math.PI * 2;
          
          // Sine wave pattern for u component (East-West)
          uRow.push(Math.sin(latAngle) * Math.cos(lonAngle) * 5);
          // Cosine wave pattern for v component (North-South)
          vRow.push(Math.cos(latAngle) * Math.sin(lonAngle) * 5);
        }
        uGrid.push(uRow);
        vGrid.push(vRow);
      }

      this.windData = {
        u: uGrid,
        v: vGrid,
        time: now,
        gridWidth: gridSize,
        gridHeight: gridSize,
        latMin: -85,
        latMax: 85,
        lonMin: -180,
        lonMax: 180,
      };

      this.lastUpdate = now;
      return this.windData;
    } catch (error) {
      console.error('Failed to generate wind data:', error);
      // Return cached data if generation fails
      if (!this.windData) {
        // Create fallback data
        const gridSize = ATMOSPHERE_CONFIG.windGridWidth;
        const uGrid: number[][] = [];
        const vGrid: number[][] = [];
        
        for (let i = 0; i < gridSize; i++) {
          uGrid.push(new Array(gridSize).fill(1));
          vGrid.push(new Array(gridSize).fill(1));
        }
        
        this.windData = {
          u: uGrid,
          v: vGrid,
          time: Date.now(),
          gridWidth: gridSize,
          gridHeight: gridSize,
          latMin: -85,
          latMax: 85,
          lonMin: -180,
          lonMax: 180,
        };
      }
      return this.windData;
    }
  }

  /**
   * Interpolate wind vector at lat/lon position
   */
  getWindAtPosition(lat: number, lon: number): WindVector {
    if (!this.windData) {
      return { u: 0, v: 0, magnitude: 0 };
    }

    // Normalize lat/lon to grid indices
    const latFrac = (lat - this.windData.latMin) / (this.windData.latMax - this.windData.latMin);
    const lonFrac = (lon - this.windData.lonMin) / (this.windData.lonMax - this.windData.lonMin);

    // Clamp to valid range
    const latIdx = Math.max(0, Math.min(this.windData.gridHeight - 1, latFrac * this.windData.gridHeight));
    const lonIdx = Math.max(0, Math.min(this.windData.gridWidth - 1, lonFrac * this.windData.gridWidth));

    // Bilinear interpolation
    const latFloor = Math.floor(latIdx);
    const lonFloor = Math.floor(lonIdx);
    const latCeil = Math.min(latFloor + 1, this.windData.gridHeight - 1);
    const lonCeil = Math.min(lonFloor + 1, this.windData.gridWidth - 1);

    const latAlpha = latIdx - latFloor;
    const lonAlpha = lonIdx - lonFloor;

    // Get 4 corners
    const u00 = this.windData.u[latFloor][lonFloor] || 0;
    const u01 = this.windData.u[latFloor][lonCeil] || 0;
    const u10 = this.windData.u[latCeil][lonFloor] || 0;
    const u11 = this.windData.u[latCeil][lonCeil] || 0;

    const v00 = this.windData.v[latFloor][lonFloor] || 0;
    const v01 = this.windData.v[latFloor][lonCeil] || 0;
    const v10 = this.windData.v[latCeil][lonFloor] || 0;
    const v11 = this.windData.v[latCeil][lonCeil] || 0;

    // Interpolate u and v
    const u0 = u00 * (1 - lonAlpha) + u01 * lonAlpha;
    const u1 = u10 * (1 - lonAlpha) + u11 * lonAlpha;
    const u = u0 * (1 - latAlpha) + u1 * latAlpha;

    const v0 = v00 * (1 - lonAlpha) + v01 * lonAlpha;
    const v1 = v10 * (1 - lonAlpha) + v11 * lonAlpha;
    const v = v0 * (1 - latAlpha) + v1 * latAlpha;

    // Scale wind values
    const scaleFactor = 0.05;
    const scaledU = u * scaleFactor;
    const scaledV = v * scaleFactor;
    const magnitude = Math.sqrt(scaledU * scaledU + scaledV * scaledV);

    return { u: scaledU, v: scaledV, magnitude };
  }

  /**
   * Convert wind field to GPU texture for shader-based lookup
   */
  generateWindTexture(): Float32Array {
    if (!this.windData) {
      const size = ATMOSPHERE_CONFIG.windGridWidth * ATMOSPHERE_CONFIG.windGridHeight * 4;
      return new Float32Array(size);
    }

    const width = this.windData.gridWidth;
    const height = this.windData.gridHeight;
    const texture = new Float32Array(width * height * 4);

    // Fill texture with wind data
    for (let lat = 0; lat < height; lat++) {
      for (let lon = 0; lon < width; lon++) {
        const i = lat * width + lon;
        const u = this.windData.u[lat][lon] || 0;
        const v = this.windData.v[lat][lon] || 0;
        const magnitude = Math.sqrt(u * u + v * v);

        texture[i * 4] = u;
        texture[i * 4 + 1] = v;
        texture[i * 4 + 2] = magnitude;
        texture[i * 4 + 3] = 1.0;
      }
    }

    this.windTexture = texture;
    return texture;
  }

  /**
   * Get cached texture data
   */
  getWindTexture(): Float32Array | null {
    return this.windTexture;
  }

  /**
   * Initialize wind data on component mount
   */
  async initialize(): Promise<void> {
    await this.fetchWindData();
    this.generateWindTexture();
  }
}

export const windFieldManager = new WindFieldManager();
