import React, { useEffect, useRef, useState } from 'react';

const SKILLS_LIST = [
  'CCNA Routing', 'RHEL 10 Admin', 'ARIMA Analytics', 'K-Means Clustering',
  'React.js', 'Node.js & REST', 'Wireshark SOC', 'Python Security',
  'Subnetting IPv4/6', 'OSPF / EIGRP', 'Cyber Security', 'Digital Forensics',
  'MongoDB', 'Linux Terminal', 'Docker', 'Oracle AI'
];

export default function HoloSkillSphere() {
  const canvasRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const parent = canvas.parentElement;
    let width = (canvas.width = parent ? parent.offsetWidth : 400);
    let height = (canvas.height = parent ? Math.min(parent.offsetWidth, 450) : 400);

    const radius = Math.min(width, height) * 0.38;

    // Fibonacci sphere node placement
    const nodes = SKILLS_LIST.map((text, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / SKILLS_LIST.length);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
      return {
        text,
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi)
      };
    });

    let angleX = 0.003;
    let angleY = 0.005;
    let mouseX = 0;
    let mouseY = 0;
    let isDragging = false;

    const onMouseDown = () => (isDragging = true);
    const onMouseUp = () => (isDragging = false);
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - width / 2) * 0.0001;
      mouseY = (e.clientY - rect.top - height / 2) * 0.0001;
    };

    const onTouchStart = () => (isDragging = true);
    const onTouchEnd = () => (isDragging = false);
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const rect = canvas.getBoundingClientRect();
        mouseX = (e.touches[0].clientX - rect.left - width / 2) * 0.00015;
        mouseY = (e.touches[0].clientY - rect.top - height / 2) * 0.00015;
      }
    };

    const onResize = () => {
      if (parent) {
        width = canvas.width = parent.offsetWidth;
        height = canvas.height = Math.min(parent.offsetWidth, 450);
      }
    };

    window.addEventListener('resize', onResize);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });

    const rotateX = (node, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const y = node.y * cos - node.z * sin;
      const z = node.z * cos + node.y * sin;
      node.y = y;
      node.z = z;
    };

    const rotateY = (node, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = node.x * cos - node.z * sin;
      const z = node.z * cos + node.x * sin;
      node.x = x;
      node.z = z;
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const rx = mouseY !== 0 ? mouseY : angleX;
      const ry = mouseX !== 0 ? mouseX : angleY;

      nodes.forEach((node) => {
        rotateX(node, rx);
        rotateY(node, ry);
      });

      // Sort nodes by z index for correct depth rendering
      const sorted = [...nodes].sort((a, b) => a.z - b.z);

      sorted.forEach((node) => {
        const scale = (node.z + radius * 2) / (radius * 3);
        const alpha = Math.max(0.2, (node.z + radius) / (radius * 2));
        const projX = width / 2 + node.x;
        const projY = height / 2 + node.y;

        ctx.save();
        ctx.font = `${Math.floor(12 * scale + 4)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw connecting particle lines to center
        ctx.strokeStyle = `rgba(0, 243, 255, ${alpha * 0.15})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width / 2, height / 2);
        ctx.lineTo(projX, projY);
        ctx.stroke();

        // Draw node background badge
        ctx.fillStyle = `rgba(14, 18, 36, ${alpha * 0.85})`;
        ctx.strokeStyle = node.z > 0 ? `rgba(0, 243, 255, ${alpha})` : `rgba(157, 78, 221, ${alpha})`;
        ctx.lineWidth = node.z > 0 ? 1.5 : 1;

        const textMetrics = ctx.measureText(node.text);
        const paddingX = 10 * scale;
        const paddingY = 6 * scale;
        const bgW = textMetrics.width + paddingX * 2;
        const bgH = 20 * scale + paddingY;

        ctx.beginPath();
        ctx.roundRect(projX - bgW / 2, projY - bgH / 2, bgW, bgH, 6);
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = node.z > 0 ? `rgba(255, 255, 255, ${alpha})` : `rgba(180, 180, 220, ${alpha})`;
        ctx.shadowColor = node.z > 0 ? '#00f3ff' : '#9d4edd';
        ctx.shadowBlur = node.z > 0 ? 10 * alpha : 0;
        ctx.fillText(node.text, projX, projY);

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchmove', onTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <canvas ref={canvasRef} style={{ maxWidth: '100%', cursor: 'grab' }} />
    </div>
  );
}
