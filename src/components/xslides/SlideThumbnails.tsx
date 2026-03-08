import { Plus, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Slide } from './SlideCanvas';

interface SlideThumbnailsProps {
  slides: Slide[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
}

export default function SlideThumbnails({ slides, currentIndex, onSelect, onAdd, onDelete, onDuplicate }: SlideThumbnailsProps) {
  return (
    <div className="w-48 border-r border-border bg-muted/20 flex flex-col">
      <div className="p-2 border-b border-border">
        <Button onClick={onAdd} size="sm" className="w-full"><Plus className="h-4 w-4 mr-1" /> Add Slide</Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {slides.map((slide, i) => (
            <div key={slide.id} className="group relative">
              <button
                onClick={() => onSelect(i)}
                className={`w-full aspect-video rounded-md border-2 transition-colors overflow-hidden relative ${
                  currentIndex === i ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
                style={{ background: slide.background || 'hsl(var(--background))' }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] text-muted-foreground">
                    {slide.elements.length > 0 ? `${slide.elements.length} elements` : 'Empty'}
                  </span>
                </div>
                <span className="absolute top-1 left-1 text-[9px] font-bold text-muted-foreground bg-muted/80 px-1 rounded">
                  {i + 1}
                </span>
              </button>
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onDuplicate(i)} className="p-0.5 rounded bg-muted/80"><Copy className="h-3 w-3" /></button>
                {slides.length > 1 && (
                  <button onClick={() => onDelete(i)} className="p-0.5 rounded bg-muted/80"><Trash2 className="h-3 w-3 text-destructive" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
