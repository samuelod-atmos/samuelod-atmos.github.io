/**
 * Configuration constants for atmospheric flow visualization
 */

export const ATMOSPHERE_CONFIG = {
  // Particle system
  particleCount: 25000,
  particleLifetime: 4.0, // seconds
  particleSize: 1.5,
  
  // Speed
  baseSpeed: 2.0,
  maxSpeed: 5.0,
  
  // Wind field
  windGridWidth: 64,
  windGridHeight: 64,
  windUpdateInterval: 3600000, // 1 hour in ms
  
  // Rendering
  backgroundColor: 0x0a0e27, // Deep space blue
  particleOpacity: 0.8,
  
  // Data source
  openMeteoBaseUrl: 'https://api.open-meteo.com/v1/forecast',
  
  // Simulation bounds (normalized coordinates)
  boundsX: [-2, 2],
  boundsY: [-2, 2],
  boundsZ: [-1, 1],
  
  // Camera
  cameraDistance: 3.5,
  autoRotate: true,
  autoRotateSpeed: 0.3,
} as const;

export const WIND_QUERY_PARAMS = {
  latitude: 40,
  longitude: -100,
  hourly: 'u_component_of_wind_10m,v_component_of_wind_10m',
  timezone: 'UTC',
} as const;
