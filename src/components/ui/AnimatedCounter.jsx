import React, { useState, useEffect } from 'react';

export default function AnimatedCounter({ end, duration = 1500, decimals = 0, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const target = Number(end);

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(easeProgress * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [end, duration]);

  return (
    <span>
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}
