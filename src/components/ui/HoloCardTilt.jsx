import React, { useState, useRef } from 'react';

export default function HoloCardTilt({ children, style = {}, className = '' }) {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // max -10deg to 10deg
    const rotateY = ((x - centerX) / centerX) * 10;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlarePos({ x: glareX, y: glareY, opacity: 0.18 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out, box-shadow 0.2s ease-out',
        transform,
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform',
        ...style
      }}
    >
      {/* Holographic Sheen Layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 10,
          opacity: glarePos.opacity,
          transition: 'opacity 0.2s ease-out',
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(0, 243, 255, 0.4) 0%, rgba(157, 78, 221, 0.3) 35%, rgba(255, 0, 127, 0) 70%)`
        }}
      />
      {children}
    </div>
  );
}
