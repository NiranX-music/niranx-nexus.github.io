import { useEffect, useState, useCallback } from 'react';
import type { Slide } from './SlideCanvas';

interface PresentationModeProps {
  slides: Slide[];
  startIndex?: number;
  onExit: () => void;
}

export default function PresentationMode({ slides, startIndex = 0, onExit }: PresentationModeProps) {
  const [current, setCurrent] = useState(startIndex);

  const navigate = useCallback((dir: number) => {
    setCurrent(prev => Math.max(0, Math.min(slides.length - 1, prev + dir)));
  }, [slides.length]);

  useEffect(() => {
    const el = document.documentElement;
    el.requestFullscreen?.().catch(() => {});

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
      if (e.key === 'ArrowRight' || e.key === ' ') navigate(1);
      if (e.key === 'ArrowLeft') navigate(-1);
    };
    const fsHandler = () => { if (!document.fullscreenElement) onExit(); };

    document.addEventListener('keydown', handler);
    document.addEventListener('fullscreenchange', fsHandler);
    return () => {
      document.removeEventListener('keydown', handler);
      document.removeEventListener('fullscreenchange', fsHandler);
      if (document.fullscreenElement) document.exitFullscreen();
    };
  }, [navigate, onExit]);

  const slide = slides[current];
  if (!slide) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center cursor-none" onClick={() => navigate(1)}>
      <div
        className="relative"
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${Math.min(window.innerWidth / 1920, window.innerHeight / 1080)})`,
          transformOrigin: 'center center',
          background: slide.background || '#000',
        }}
      >
        {slide.elements.map(el => (
          <div key={el.id} className="absolute" style={{ left: el.x, top: el.y, width: el.width, height: el.height }}>
            {el.type === 'text' && (
              <div className="w-full h-full flex items-center" style={{ fontSize: el.style?.fontSize || '32px', fontWeight: el.style?.fontWeight, textAlign: (el.style?.textAlign as any), color: el.style?.color || '#fff' }}>
                {el.content}
              </div>
            )}
            {el.type === 'image' && <img src={el.src} alt="" className="w-full h-full object-contain" />}
            {el.type === 'shape' && <div className="w-full h-full rounded-lg" style={{ backgroundColor: el.style?.backgroundColor || 'hsl(var(--primary))' }} />}
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        {current + 1} / {slides.length}
      </div>
    </div>
  );
}
