import React, { useRef, useEffect } from "react";

function NewtonsAttractor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#4285F4";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    let x = 0.1, y = 0, a = 0.9, b = -0.6013, c = 2.0, d = 0.5;
    for (let i = 0; i < 10000; i++) {
      let x1 = Math.sin(a * y) - Math.cos(b * x);
      let y1 = Math.sin(c * x) - Math.cos(d * y);
      x = x1;
      y = y1;
      ctx.lineTo(
        canvas.width / 2 + x * 100,
        canvas.height / 2 + y * 100
      );
    }
    ctx.stroke();
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

export default NewtonsAttractor;
