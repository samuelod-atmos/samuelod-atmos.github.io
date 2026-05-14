// Particle fragment shader
varying float vAlpha;
varying float vLife;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  // Soft circle falloff
  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  
  // Glow effect - brighter particles at birth
  float glow = exp(-dist * dist * 4.0);
  
  // Color: blue-cyan gradient based on lifetime
  vec3 color = mix(
    vec3(0.2, 0.8, 1.0),  // cyan (young)
    vec3(0.1, 0.3, 0.8),  // blue (old)
    vLife
  );
  
  gl_FragColor = vec4(color * (1.0 + glow * 0.5), alpha * vAlpha);
}
