import { useEffect, useRef } from "react";

export default function ParticlesBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = containerRef.current;
    if (!canvas) return;

    console.log("Initializing custom particles");

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Track mouse position
    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    const grabDistance = 150;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Simple particle system
    const particles = [];
    const particleCount = 100;

    // Simple noise function for smooth random drift
    const noise = (x) => {
      return Math.sin(x) * 0.5 + Math.sin(x * 0.5) * 0.3 + Math.sin(x * 0.25) * 0.2;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 2 + 1;
        this.opacity =  Math.random() * 0.5 + 0.3;
        this.noiseOffsetX = Math.random() * 1000;
        this.noiseOffsetY = Math.random() * 1000;
      }

      update(time) {
        // Add stochastic brownian drift using noise
        const driftX = noise(time * 0.001 + this.noiseOffsetX) * 0.5;
        const driftY = noise(time * 0.0008 + this.noiseOffsetY) * 0.5;
        this.vx += driftX * 0.01;
        this.vy += driftY * 0.01;

        // Repulse from mouse
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < grabDistance) {
          const angle = Math.atan2(dy, dx);
          const force = (grabDistance - distance) / grabDistance * 0.1;
          this.vx += Math.cos(angle) * force;
          this.vy += Math.sin(angle) * force;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        //ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fillStyle = `rgba(246, 239, 239, 0.2)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      distanceTo(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return Math.sqrt(dx * dx + dy * dy);
      }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let animationTime = 0;
    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update(animationTime);
        particle.draw();
      });

      animationTime += 1;
      requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={containerRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
