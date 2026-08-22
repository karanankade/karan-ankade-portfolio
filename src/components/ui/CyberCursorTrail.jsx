import React, { useEffect, useRef } from 'react';

export default function CyberCursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Check if the user is on a touch-first mobile or tablet device
    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches;

    // Check if reduced motion is requested
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouchDevice || prefersReducedMotion) {
      return; // Gracefully bypass cursor particle rendering on mobile/touch to conserve battery & GPU
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const colors = ['#00f3ff', '#00ff88', '#9d4edd', '#ff007f'];

    const createParticle = (x, y, burst = false) => {
      const count = burst ? 10 : 2;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = burst ? Math.random() * 3 + 1 : Math.random() * 1.0 + 0.3;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: burst ? Math.random() * 2.5 + 1.5 : Math.random() * 1.8 + 0.8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: burst ? 0.025 + Math.random() * 0.02 : 0.035 + Math.random() * 0.02
        });
      }
    };

    const handleMouseMove = (e) => {
      createParticle(e.clientX, e.clientY, false);
    };

    const handleClick = (e) => {
      createParticle(e.clientX, e.clientY, true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998
      }}
    />
  );
}
