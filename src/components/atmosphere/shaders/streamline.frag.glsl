// Streamline fragment shader
varying float vLife;

void main() {
  // Bright cyan-blue color for streamlines
  vec3 color = vec3(0.3, 0.9, 1.0);
  
  // Alpha based on flow animation - boost visibility
  float alpha = vLife * 1.2;
  
  gl_FragColor = vec4(color, alpha);
}
