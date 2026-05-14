// Streamline vertex shader
#include <common>

uniform float time;
uniform float speed;

varying float vLife;
varying float vDistance;

void main() {
  // Calculate position along streamline based on time
  vDistance = position.z; // Use z as a parameter for position along line
  
  // Create flowing animation
  float flowOffset = mod((time * speed) + vDistance, 1.0);
  vLife = smoothstep(0.0, 0.1, flowOffset) * smoothstep(1.0, 0.7, flowOffset);
  
  // Project to screen
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = 2.0;
}
