import React, { useRef, useEffect, useState } from "react";

const PARTICLE_COLOR = "#4285F4";
const PARTICLE_RADIUS = 6;
const WIDTH = 1100;
const HEIGHT = 600;

function randomParticle() {
  // Assign a random radius between 2 and 8 (simulate size diversity)
  const radius = 2 + Math.random() * 6;
  return {
    x: Math.random() * WIDTH,
    y: Math.random() * HEIGHT,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    radius,
    stuck: false,
  };
}

const SOURCE_X = 40;
const SOURCE_Y = HEIGHT - 40;
const SOURCE_RADIUS = 8;
const SOURCE_COLOR = "#888";
const EMIT_INTERVAL = 1000; // ms
const EMIT_PARTICLE_RADIUS = 4;

// Atmospheric flow: constant rightward drift (with max speed limit)
const FLOW_VX = 0.3; // desired drift speed
const MAX_SPEED = 0.3; // maximum allowed speed

export default function AerosolParticles() {
  const [numParticles, setNumParticles] = useState(30);
  const [particles, setParticles] = useState(() => Array.from({ length: 30 }, randomParticle));
  const canvasRef = useRef(null);
  const emitTimeout = useRef();

  // Emit new particle from source every second
  useEffect(() => {
    function emitParticle() {
      setParticles((prev) => [
        {
          x: SOURCE_X,
          y: SOURCE_Y,
          vx: (Math.random() * 0.5), // rightward
          vy: -Math.random() * 1.2 - 0.5, // upward
          radius: EMIT_PARTICLE_RADIUS,
          stuck: false,
        },
        ...prev.filter((p) => !p.stuck), // keep only non-stuck particles
      ]);
      emitTimeout.current = setTimeout(emitParticle, EMIT_INTERVAL);
    }
    emitTimeout.current = setTimeout(emitParticle, EMIT_INTERVAL);
    return () => clearTimeout(emitTimeout.current);
  }, []);

  // Update particles when numParticles changes
  useEffect(() => {
    setParticles((prev) => {
      if (numParticles > prev.length) {
        return [...prev, ...Array.from({ length: numParticles - prev.length }, randomParticle)];
      } else {
        return prev.slice(0, numParticles);
      }
    });
  }, [numParticles]);

  // Animate particles
  useEffect(() => {
    let animationId;
    function animate() {
      setParticles((prev) =>
        prev.map((p) => {
          // Gravity: larger particles fall faster
          const gravity = 0.0001 * (p.radius / 12); // scale gravity by radius
          let x = p.x + p.vx;
          let y = p.y + p.vy + gravity;
          let vx = p.vx, vy = p.vy + gravity;
          // Bounce off walls
          if (x < p.radius) x = WIDTH - p.radius;
          if (x > WIDTH - p.radius) x = p.radius;
          // Bounce off top
          if (y < p.radius) {
            y = p.radius;
            vy *= -1;
          }
          // Stick to ground if touching bottom
          let stuck = p.stuck || false;
          if (y >= HEIGHT - p.radius) {
            y = HEIGHT - p.radius;
            vy = 0;
            vx = 0;
            stuck = true;
          }
          if (stuck) {
            vy = 0;
            vx = 0;
          }
          vx += FLOW_VX;

          // Swirl region (e.g., a vortex)
          const SWIRL_CENTER_X = WIDTH * 0.6;
          const SWIRL_CENTER_Y = HEIGHT * 0.4;
          const SWIRL_RADIUS = 120;
          const SWIRL_STRENGTH = 0.0018; // adjust for more/less swirl
          const dx = x - SWIRL_CENTER_X;
          const dy = y - SWIRL_CENTER_Y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < SWIRL_RADIUS) {
            // Perpendicular velocity for swirling (circular motion)
            const swirlAngle = Math.atan2(dy, dx) + Math.PI / 2;
            vx += Math.cos(swirlAngle) * SWIRL_STRENGTH * (1 - dist / SWIRL_RADIUS);
            vy += Math.sin(swirlAngle) * SWIRL_STRENGTH * (1 - dist / SWIRL_RADIUS);
          }
          // Calculate current speed
          let speed = Math.sqrt(vx * vx + vy * vy);
          // Only add drift if below max speed
          if (speed < MAX_SPEED) {
            // Add less drift as speed approaches max
            const driftFactor = 1 - speed / MAX_SPEED;
            vx += FLOW_VX * driftFactor;
          }

          // After all velocity changes, clamp to max speed
          speed = Math.sqrt(vx * vx + vy * vy);
          if (speed > MAX_SPEED) {
            vx = (vx / speed) * MAX_SPEED;
            //vy = (vy / speed) * MAX_SPEED;
          }
          return {
            x: Math.max(p.radius, Math.min(WIDTH - p.radius, x)),
            y: Math.max(p.radius, Math.min(HEIGHT - p.radius, y)),
            vx,
            vy,
            radius: p.radius,
            stuck,
          };
        })
      );
      animationId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [particles.length]);

  // Draw particles
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // Draw smoke stack
    ctx.save();
    ctx.fillStyle = SOURCE_COLOR;
    ctx.fillRect(SOURCE_X - 10, SOURCE_Y, 20, 30);
    ctx.beginPath();
    ctx.arc(SOURCE_X, SOURCE_Y, SOURCE_RADIUS, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    // Draw particles
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
      ctx.fillStyle = PARTICLE_COLOR;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }, [particles]);

  return (
    <div style={{ textAlign: "center" }}>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ background: "rgba(0,0,0,0.08)", borderRadius: "8px", marginBottom: "1rem" }}
      />
      <div style={{ margin: "1rem 0" }}>
        <label htmlFor="numParticles">Number of particles: </label>
        <input
          id="numParticles"
          type="range"
          min={1}
          max={100}
          value={numParticles}
          onChange={(e) => setNumParticles(Number(e.target.value))}
        />
        <span style={{ marginLeft: "1rem" }}>{numParticles}</span>
      </div>
    </div>
  );
}
