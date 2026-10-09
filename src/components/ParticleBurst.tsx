import React, { useEffect, useRef } from 'react';

interface ParticleBurstProps {
  triggerKey: number; // increment to trigger a burst
  x?: number;
  y?: number;
  colorType?: 'go' | 'fanfare' | 'early';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  triggerKey,
  x,
  y,
  colorType = 'go',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!triggerKey || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const spawnX = x !== undefined ? x : rect.width / 2;
    const spawnY = y !== undefined ? y : rect.height / 2;

    const colors =
      colorType === 'go'
        ? ['#39FF88', '#00E5FF', '#FF4FD8', '#FFFFFF', '#70FFAF']
        : colorType === 'fanfare'
        ? ['#39FF88', '#00E5FF', '#FF4FD8', '#FFDF00', '#FF70A6']
        : ['#FF2A4D', '#FF4FD8', '#FFAA00', '#FFFFFF'];

    const count = colorType === 'fanfare' ? 70 : 45;
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 2;
      newParticles.push({
        x: spawnX,
        y: spawnY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (colorType === 'fanfare' ? 2 : 0),
        size: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
      });
    }

    particlesRef.current = [...particlesRef.current, ...newParticles];

    if (!animFrameRef.current) {
      const render = () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const alive: Particle[] = [];
        for (const p of particlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // gentle gravity
          p.vx *= 0.96; // drag
          p.vy *= 0.96;
          p.alpha -= p.decay;
          p.rotation += p.vRot;

          if (p.alpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
            alive.push(p);
          }
        }

        particlesRef.current = alive;

        if (alive.length > 0) {
          animFrameRef.current = requestAnimationFrame(render);
        } else {
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(render);
    }
  }, [triggerKey, colorType, x, y]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 h-full w-full"
    />
  );
};
