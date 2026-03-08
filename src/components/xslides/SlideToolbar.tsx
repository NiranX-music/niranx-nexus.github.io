import { Type, Image, Square, Palette, Play, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SlideToolbarProps {
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: () => void;
  onChangeBackground: () => void;
  onPresent: () => void;
}

export default function SlideToolbar({ onAddText, onAddImage, onAddShape, onChangeBackground, onPresent }: SlideToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
      <Button variant="ghost" size="sm" onClick={onAddText}><Type className="h-4 w-4 mr-1" /> Text</Button>
      <Button variant="ghost" size="sm" onClick={onAddImage}><Image className="h-4 w-4 mr-1" /> Image</Button>
      <Button variant="ghost" size="sm" onClick={onAddShape}><Square className="h-4 w-4 mr-1" /> Shape</Button>
      <Button variant="ghost" size="sm" onClick={onChangeBackground}><Palette className="h-4 w-4 mr-1" /> Background</Button>
      <div className="flex-1" />
      <Button onClick={onPresent} size="sm"><Play className="h-4 w-4 mr-1" /> Present</Button>
    </div>
  );
}
