import React, { useEffect, useRef } from 'react';

export const AmbientCursorGlow: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check capability: desktop fine pointer + hover capable + not reduced motion
    const hasFinePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    let rafId: number | null = null;
    let targetX = -500;
    let targetY = -500;
    let currentX = -500;
    let currentY = -500;
    let isVisible = false;

    const handlePointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible && glowRef.current) {
        isVisible = true;
        glowRef.current.style.opacity = '1';
      }
    };

    const handlePointerLeave = () => {
      isVisible = false;
      if (glowRef.current) {
        glowRef.current.style.opacity = '0';
      }
    };

    const handlePointerEnter = () => {
      isVisible = true;
      if (glowRef.current) {
        glowRef.current.style.opacity = '1';
      }
    };

    const animate = () => {
      // Smooth interpolation for subtle lag
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('pointerenter', handlePointerEnter, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerenter', handlePointerEnter);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="ambient-cursor-glow"
      className="pointer-events-none fixed inset-0 z-10 overflow-hidden hidden lg:block"
    >
      <div
        ref={glowRef}
        className="absolute w-[360px] h-[360px] -left-[180px] -top-[180px] rounded-full pointer-events-none transition-opacity duration-300 opacity-0 will-change-transform"
        style={{
          background: 'radial-gradient(circle at center, var(--cursor-ambient-glow, rgba(193, 232, 255, 0.038)) 0%, rgba(193, 232, 255, 0.01) 45%, transparent 70%)',
        }}
      />
    </div>
  );
};
