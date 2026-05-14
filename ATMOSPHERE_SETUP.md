# Atmospheric Flow Visualization

## Overview

This is an interactive 3D visualization of real-time atmospheric wind patterns. Particles follow meteorological wind vectors from the Open-Meteo API, creating a scientifically-grounded yet aesthetically minimal representation.

## Architecture

```
AtmosphereFlow.tsx (main wrapper)
├── Canvas (react-three/fiber)
├── AtmosphereScene
│   ├── Lighting
│   ├── Camera + OrbitControls
│   ├── ParticleSystem
│   │   ├── GLSL vertex shader (particle.vert.glsl)
│   │   ├── GLSL fragment shader (particle.frag.glsl)
│   │   └── Attribute buffers (position, velocity, lifetime)
│   └── Background sphere
└── CSS styling

Data flow:
WindField.ts → (fetches from Open-Meteo) → Wind vectors → ParticleSystem → GPU shaders
```

## Key Files

| File | Purpose |
|------|---------|
| `AtmosphereFlow.tsx` | Main React component, Canvas setup |
| `ParticleSystem.tsx` | GPU particle system with custom shaders |
| `WindField.ts` | Data fetching & interpolation from Open-Meteo API |
| `constants.ts` | Configuration and API parameters |
| `particle.vert.glsl` | Vertex shader for particle motion |
| `particle.frag.glsl` | Fragment shader for particle appearance |
| `atmosphere.css` | Styling for the container |
| `atmosphere.astro` | Astro page for the visualization |

## How It Works

### 1. **Data Fetching** (WindField.ts)
- Calls Open-Meteo API on component mount
- Fetches u/v wind components at 10m altitude
- Caches data with 1-hour TTL to avoid rate limiting
- Returns wind vectors for any position

### 2. **Particle System** (ParticleSystem.tsx)
- Creates 15,000 particles with random initial positions
- Each particle has:
  - Position (x, y, z)
  - Velocity (influenced by wind)
  - Lifetime (4 seconds default)
- Particles respawn when lifetime expires
- Uses GPU-accelerated shaders for smooth animation

### 3. **Rendering** (GLSL Shaders)
- **Vertex Shader**: Moves particles based on velocity and time
- **Fragment Shader**: Renders particles as glowing blue-cyan dots
- Uses point sprites for efficiency
- Additive blending creates glow effect

### 4. **Interactivity** (OrbitControls)
- Drag to rotate
- Scroll to zoom
- Auto-rotation (optional)

## Customization

### Change Particle Count
Edit in `constants.ts`:
```typescript
particleCount: 15000, // increase for more particles
```
*Note: Higher counts impact performance*

### Adjust Colors
In `particle.frag.glsl`:
```glsl
// Change cyan (young) and blue (old) colors
vec3 color = mix(
  vec3(0.2, 0.8, 1.0),  // ← modify young particle color
  vec3(0.1, 0.3, 0.8),  // ← modify old particle color
  vLife
);
```

### Modify Wind Location
In `constants.ts` > `WIND_QUERY_PARAMS`:
```typescript
latitude: 40,      // change latitude
longitude: -100,   // change longitude
```

### Change Background Color
In `constants.ts`:
```typescript
backgroundColor: 0x0a0e27, // hex color value
```

### Disable Auto-Rotation
When using the component:
```jsx
<AtmosphereFlow autoRotate={false} />
```

## Performance Considerations

1. **Particle Count**: Default 15,000 is optimized for 60fps on modern hardware
2. **Wind Data**: Updated hourly to balance accuracy vs. API calls
3. **GPU Rendering**: Shaders use efficient point rendering
4. **Additive Blending**: Creates glow without expensive post-processing

**Performance Tips:**
- Reduce `particleCount` for slower devices
- Use `client:only="react"` in Astro to avoid hydration overhead
- Consider lazy-loading with Suspense on slower connections

## API Reference

### Open-Meteo API
- **Free tier**: 10,000 requests/day
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Data**: u/v wind components at 10m altitude
- **Resolution**: ~11km grid worldwide
- **No authentication required**

### Component Props

```typescript
interface AtmosphereFlowProps {
  autoRotate?: boolean;    // enable/disable auto-rotation (default: true)
  showControls?: boolean;  // show status indicator (default: true)
}
```

## Troubleshooting

**Particles not moving?**
- Check browser console for fetch errors
- Verify internet connection (needs to fetch wind data)
- Wind data might be loading (check status indicator)

**Poor performance?**
- Reduce particle count in `constants.ts`
- Close other browser tabs
- Try on a different browser

**Shaders not compiling?**
- Ensure shader files are in `shaders/` directory
- Check for syntax errors in `.glsl` files
- Verify Three.js version compatibility

## Future Enhancements

Potential improvements:
1. **Multiple locations**: Let users select different coordinates
2. **Wind speed overlay**: Show scalar wind speed as color/transparency
3. **Time controls**: Play/pause, speed up/slow down
4. **Data sources**: Add NOAA, ECMWF, other meteorological APIs
5. **Mobile optimization**: Reduce particles on mobile devices
6. **2D mode**: Fallback for older devices

## Related Documentation

- [Open-Meteo API Docs](https://open-meteo.com/en/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [react-three-fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Earth Nullschool](https://earth.nullschool.net/) - Inspiration
