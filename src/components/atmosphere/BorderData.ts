/**
 * Land borders data for globe visualization
 * Simplified coastlines and country borders as line segments
 */

export interface BorderLine {
  points: number[]; // flat array [x, y, z, x, y, z, ...]
}

/**
 * Convert lat/lon to 3D cartesian coordinates
 */
function latLonToCartesian(lat: number, lon: number, radius: number = 1): [number, number, number] {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;

  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(lonRad);

  return [x, y, z];
}

/**
 * Generate simplified coastlines
 * Includes major continents and country borders
 */
export function generateBorders(): BorderLine[] {
  // Simplified coastline data (lat, lon pairs)
  // These are approximate major coastline segments
  const coastlineSegments: Array<Array<[number, number]>> = [
    // US East Coast
    [[25, -80], [30, -81], [35, -76], [40, -74], [45, -66]],
    // US West Coast
    [[32, -117], [37, -122], [45, -124], [48, -124]],
    // Central America
    [[17, -92], [14, -92], [9, -80]],
    // South America East
    [[0, -35], [-10, -35], [-20, -40], [-30, -50], [-35, -57]],
    // South America West
    [[-2, -78], [-10, -76], [-20, -70], [-30, -71]],
    // Europe
    [[55, -5], [58, 0], [60, 5], [58, 12], [55, 15], [52, 5], [50, -2], [45, -6]],
    // Africa North
    [[35, -6], [35, 5], [30, 30], [25, 35]],
    // Africa East
    [[10, 40], [0, 40], [-10, 35], [-20, 30], [-30, 25]],
    // Africa West
    [[15, -15], [10, -14], [5, -10], [0, -8], [-5, -12], [-15, -12]],
    // Middle East
    [[35, 35], [30, 40], [25, 55], [25, 65]],
    // India
    [[30, 70], [25, 85], [8, 80], [8, 68]],
    // Southeast Asia
    [[20, 95], [15, 105], [10, 110], [5, 110], [0, 105]],
    // China
    [[45, 85], [40, 95], [35, 110], [30, 120], [35, 125]],
    // Japan
    [[45, 140], [35, 140], [30, 130]],
    // Australia
    [[-10, 115], [-20, 120], [-30, 125], [-40, 145], [-40, 155]],
    // New Zealand
    [[-35, 170], [-45, 170], [-47, 165]],
    // Greenland
    [[80, -40], [75, -40], [70, -50], [70, -30]],
    // Arctic (simplified)
    [[75, 0], [70, 30], [70, 60], [70, 90], [70, 120], [70, 150], [75, 180]],
  ];

  // Convert line segments to BorderLine objects
  const borders: BorderLine[] = coastlineSegments.map((segment) => {
    const points: number[] = [];
    for (const [lat, lon] of segment) {
      const [x, y, z] = latLonToCartesian(lat, lon);
      points.push(x, y, z);
    }
    return { points };
  });

  return borders;
}

/**
 * Generate latitude/longitude grid lines
 */
export function generateGridLines(spacing: number = 30): BorderLine[] {
  const lines: BorderLine[] = [];

  // Latitude lines (parallels)
  for (let lat = -90; lat <= 90; lat += spacing) {
    if (lat === 0 || lat === 90 || lat === -90) continue; // Skip equator and poles
    const points: number[] = [];
    for (let lon = -180; lon <= 180; lon += 10) {
      const [x, y, z] = latLonToCartesian(lat, lon);
      points.push(x, y, z);
    }
    if (points.length > 0) {
      lines.push({ points });
    }
  }

  // Longitude lines (meridians)
  for (let lon = -180; lon < 180; lon += spacing) {
    if (lon % 60 !== 0) continue; // Only show major meridians
    const points: number[] = [];
    for (let lat = -85; lat <= 85; lat += 10) {
      const [x, y, z] = latLonToCartesian(lat, lon);
      points.push(x, y, z);
    }
    if (points.length > 0) {
      lines.push({ points });
    }
  }

  return lines;
}
