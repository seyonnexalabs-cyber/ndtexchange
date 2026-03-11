
import React from 'react';
import { cn } from '@/lib/utils';

const HEXAGONS = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  size: 36 + (i * 19) % 64,
  x: (i * 41 + 13) % 100,
  y: (i * 57 + 9) % 100,
  delay: (i * 0.65) % 5,
  duration: 7 + (i * 1.1) % 7,
  opacity: 0.05 + (i % 5) * 0.025,
  stroke: i % 3 === 0,
}));

function HexShape({ size, stroke }: { size: number; stroke: boolean }) {
  const r = size / 2;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${r + r * Math.cos(a)},${r + r * Math.sin(a)}`;
  }).join(' ');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <polygon
        points={pts}
        fill={stroke ? 'none' : 'rgba(30,144,255,0.9)'}
        stroke={stroke ? 'rgba(30,144,255,0.9)' : 'none'}
        strokeWidth={stroke ? 1.5 : 0}
      />
    </svg>
  );
}

const HoneycombHero = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <section className={cn("relative w-full overflow-hidden flex items-center justify-center py-20 md:py-24", className)}>
      <style>{`
        @keyframes hch-float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          33%      { transform: translateY(-26px) rotate(13deg); }
          66%      { transform: translateY(13px) rotate(-9deg); }
        }
        @keyframes hch-grid {
          0%,100% { opacity: .08; }
          50%      { opacity: .18; }
        }
      `}</style>

      {/* Deep gradient base */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg,#020b18 0%,#041830 40%,#062040 70%,#0a2d58 100%)' }} />

      {/* Hex grid tile pattern */}
      <div
        className="hch-grid absolute inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='92' viewBox='0 0 80 92'%3E%3Cpolygon points='40,2 76,22 76,62 40,82 4,62 4,22' fill='none' stroke='hsl(var(--primary-foreground))' stroke-width='0.7'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 92px',
        }}
      />

      {/* Floating ambient hexagons */}
      {HEXAGONS.map((h) => (
        <div
          key={h.id}
          className="absolute z-0 pointer-events-none"
          style={{
            left: `${h.x}%`,
            top: `${h.y}%`,
            opacity: h.opacity,
            animation: `hch-float ${h.duration}s ${h.delay}s ease-in-out infinite`,
          }}
        >
          <HexShape size={h.size} stroke={h.stroke} />
        </div>
      ))}

      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 container mx-auto">
        {children}
      </div>
    </section>
  );
};

export default HoneycombHero;
