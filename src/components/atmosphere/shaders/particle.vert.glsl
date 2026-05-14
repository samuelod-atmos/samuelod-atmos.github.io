// Particle vertex shader
#include <common>

uniform sampler2D windTexture;
uniform float time;
uniform float speed;

attribute float aLifetime;
attribute float aMaxLifetime;
attribute vec3 aVelocity;

varying float vAlpha;
varying float vLife;

void main() {
  vLife = aLifetime / aMaxLifetime;
  vAlpha = smoothstep(0.0, 0.1, vLife) * smoothstep(1.0, 0.7, vLife);
  
  // Apply velocity and time
  vec3 pos = position + aVelocity * time * speed;
  
  // Apply perspective
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = 2.0 * (1.0 - vLife * 0.5) / length(mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
