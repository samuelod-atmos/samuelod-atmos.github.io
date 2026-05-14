/**
 * Streamline generation from wind field
 * Generates flow lines that follow wind vectors
 */

export interface Streamline {
  points: number[]; // flat array of [x, y, z, x, y, z, ...]
  count: number;
}

export interface WindVectorData {
  u: number;
  v: number;
  magnitude: number;
}

export class StreamlineGenerator {
  private windField: (lat: number, lon: number) => WindVectorData;
  private resolution: number;
  private maxSteps: number;
  private stepSize: number;

  constructor(
    windField: (lat: number, lon: number) => WindVectorData,
    resolution: number = 0.5, // degrees
    maxSteps: number = 100,
    stepSize: number = 0.5
  ) {
    this.windField = windField;
    this.resolution = resolution;
    this.maxSteps = maxSteps;
    this.stepSize = stepSize;
  }

  /**
   * Convert lat/lon to 3D sphere coordinates
   */
  private latLonToCartesian(lat: number, lon: number, radius: number = 1): [number, number, number] {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;

    const x = radius * Math.cos(latRad) * Math.cos(lonRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.sin(lonRad);

    return [x, y, z];
  }

  /**
   * Generate streamline from starting lat/lon
   */
  generateStreamline(startLat: number, startLon: number): Streamline {
    const points: number[] = [];
    let lat = startLat;
    let lon = startLon;

    for (let step = 0; step < this.maxSteps; step++) {
      // Get wind at current position
      const wind = this.windField(lat, lon);
      const magnitude = wind.magnitude;

      if (magnitude < 0.01) break; // Stop if wind is too weak

      // Add current point
      const [x, y, z] = this.latLonToCartesian(lat, lon);
      points.push(x, y, z);

      // Move to next point following wind
      // Normalize wind and step forward
      const windLen = Math.sqrt(wind.u * wind.u + wind.v * wind.v);
      if (windLen > 0) {
        const du = (wind.u / windLen) * this.stepSize;
        const dv = (wind.v / windLen) * this.stepSize;

        lon += du; // u-component affects longitude
        lat += dv; // v-component affects latitude
      }

      // Wrap longitude around
      if (lon > 180) lon -= 360;
      if (lon < -180) lon += 360;

      // Stop if latitude goes out of bounds
      if (lat > 85 || lat < -85) break;
    }

    return {
      points,
      count: points.length / 3,
    };
  }

  /**
   * Generate multiple streamlines across the globe
   */
  generateStreamlines(count: number): Streamline[] {
    const streamlines: Streamline[] = [];

    // Create seed points in a grid pattern across the globe
    const latSpacing = 180 / Math.sqrt(count);
    const lonSpacing = 360 / Math.sqrt(count);

    for (let lat = -85; lat < 85; lat += latSpacing) {
      for (let lon = -180; lon < 180; lon += lonSpacing) {
        if (streamlines.length >= count) break;

        // Add randomness to seed points
        const jitteredLat = lat + (Math.random() - 0.5) * 10;
        const jitteredLon = lon + (Math.random() - 0.5) * 10;

        const streamline = this.generateStreamline(jitteredLat, jitteredLon);
        if (streamline.count > 2) {
          streamlines.push(streamline);
        }
      }
      if (streamlines.length >= count) break;
    }

    return streamlines;
  }
}
