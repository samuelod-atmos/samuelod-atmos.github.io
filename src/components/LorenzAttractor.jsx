import React, { useRef, useEffect } from "react";

// Lorenz system parameters
const sigma = 10;
const rho = 28;
const beta = 8 / 3;
const dt = 0.01;
const numPoints = 10000;

function LorenzAttractor() {
  const canvasRef = useRef(null);
  const animationRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let x = 0.01, y = 0, z = 0;
    let points = [];
    let frame = 0;
    const stepsPerFrame = .0000001; // Lower for slower animation

    function draw() {
      // Draw a small batch of points per frame for slow animation
      for (let j = 0; j < stepsPerFrame; j++) {
        const dx = sigma * (y - x) * dt;
        const dy = (x * (rho - z) - y) * dt;
        const dz = (x * y - beta * z) * dt;
        x += dx;
        y += dy;
        z += dz;
        points.push([x, z]); // 2D projection (x, z)
        if (points.length > numPoints) points.shift();
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(8, 8);
      // Draw the path
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const [px, pz] = points[i];
        if (i === 0) ctx.moveTo(px, pz);
        else ctx.lineTo(px, pz);
      }
      ctx.strokeStyle = "#4285F4";
      ctx.lineWidth = 0.5;
      ctx.stroke();
      // Draw the red dot at the current position
      if (points.length > 0) {
        const [lastX, lastZ] = points[points.length - 1];
        ctx.beginPath();
        ctx.arc(lastX, lastZ, 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = "#e53935";
        ctx.fill();
      }
      ctx.restore();
      frame++;
      animationRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{ background: "rgba(0,0,0,0.1)", display: "block", margin: "0 auto", borderRadius: "8px" }}
    />
  );
}

export default LorenzAttractor;
