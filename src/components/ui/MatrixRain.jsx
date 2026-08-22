import React, { useEffect, useRef } from 'react';

export default function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const parent = canvas.parentElement;
    let width = (canvas.width = parent ? parent.offsetWidth : window.innerWidth);
    let height = (canvas.height = parent ? parent.offsetHeight : 300);

    const handleResize = () => {
      if (parent) {
        width = canvas.width = parent.offsetWidth;
        height = canvas.height = parent.offsetHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンRHEL10CCNAOSPF010101';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = new Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(7, 9, 19, 0.15)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00ff88';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = Math.random() > 0.9 ? '#00f3ff' : '#00ff88';
        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.25,
        borderRadius: '16px'
      }}
    />
  );
}
