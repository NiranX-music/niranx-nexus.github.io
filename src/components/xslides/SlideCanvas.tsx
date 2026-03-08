import { useRef, useMemo } from 'react';

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  style?: Record<string, string>;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  background?: string;
}

interface SlideCanvasProps {
  slide: Slide;
  scale?: number;
  editable?: boolean;
  onUpdateElement?: (elementId: string, updates: Partial<SlideElement>) => void;
  selectedElement?: string | null;
  onSelectElement?: (id: string | null) => void;
}

export default function SlideCanvas({ slide, scale = 0.5, editable = false, onUpdateElement, selectedElement, onSelectElement }: SlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative overflow-hidden flex items-center justify-center flex-1" ref={containerRef}>
      <div
        className="relative bg-background border border-border shadow-lg"
        style={{
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          background: slide.background || 'hsl(var(--background))',
        }}
        onClick={() => onSelectElement?.(null)}
      >
        {slide.elements.map(el => (
          <div
            key={el.id}
            onClick={(e) => { e.stopPropagation(); onSelectElement?.(el.id); }}
            className={`absolute cursor-pointer transition-shadow ${selectedElement === el.id ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 hover:ring-primary/50'}`}
            style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
          >
            {el.type === 'text' && (
              <div
                contentEditable={editable && selectedElement === el.id}
                suppressContentEditableWarning
                onBlur={(e) => onUpdateElement?.(el.id, { content: e.currentTarget.innerText })}
                className="w-full h-full flex items-center text-foreground outline-none"
                style={{ fontSize: el.style?.fontSize || '32px', fontWeight: el.style?.fontWeight || 'normal', textAlign: (el.style?.textAlign as any) || 'left', color: el.style?.color }}
              >
                {el.content}
              </div>
            )}
            {el.type === 'image' && (
              <img src={el.src} alt="" className="w-full h-full object-contain" />
            )}
            {el.type === 'shape' && (
              <div className="w-full h-full rounded-lg" style={{ backgroundColor: el.style?.backgroundColor || 'hsl(var(--primary))' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
