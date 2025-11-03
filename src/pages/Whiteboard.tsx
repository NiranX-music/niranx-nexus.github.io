import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Pen, Eraser, Square, Circle, Type, Undo, Redo, 
  Download, Save, Trash2, Palette, PenTool 
} from 'lucide-react';
import { toast } from 'sonner';

type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text';
type DrawAction = {
  type: Tool;
  points?: { x: number; y: number }[];
  color?: string;
  width?: number;
  text?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
};

export default function Whiteboard() {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [history, setHistory] = useState<DrawAction[]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [title, setTitle] = useState('Untitled Whiteboard');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    setStartPos(pos);

    if (currentTool === 'pen' || currentTool === 'eraser') {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'pen' || currentTool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const pos = getMousePos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'rectangle') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
    } else if (currentTool === 'circle') {
      const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        ctx.font = `${brushSize * 10}px Arial`;
        ctx.fillStyle = currentColor;
        ctx.fillText(text, startPos.x, startPos.y);
      }
    }

    // Save to history
    saveToHistory();
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const imageData = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({ type: currentTool });
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      // Redraw from history
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      // Redraw from history
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
    setHistoryStep(0);
    toast.success('Canvas cleared');
  };

  const saveWhiteboard = async () => {
    if (!user) {
      toast.error('Please log in to save');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const imageData = canvas.toDataURL();
      const { error } = await supabase
        .from('whiteboards')
        .insert({
          user_id: user.id,
          title,
          canvas_data: { image: imageData },
        });

      if (error) throw error;
      toast.success('Whiteboard saved!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${title}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Downloaded!');
  };

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold gradient-text">Whiteboard</h1>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="max-w-xs"
            placeholder="Whiteboard title..."
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={saveWhiteboard} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={downloadImage} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[250px_1fr] gap-6">
        <Card className="p-4 space-y-6 h-fit glass-card">
          <div>
            <Label className="text-sm font-semibold mb-3 block">Tools</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={currentTool === 'pen' ? 'default' : 'outline'}
                onClick={() => setCurrentTool('pen')}
                className="flex-col h-auto py-3"
              >
                <Pen className="w-5 h-5 mb-1" />
                <span className="text-xs">Pen</span>
              </Button>
              <Button
                variant={currentTool === 'eraser' ? 'default' : 'outline'}
                onClick={() => setCurrentTool('eraser')}
                className="flex-col h-auto py-3"
              >
                <Eraser className="w-5 h-5 mb-1" />
                <span className="text-xs">Eraser</span>
              </Button>
              <Button
                variant={currentTool === 'rectangle' ? 'default' : 'outline'}
                onClick={() => setCurrentTool('rectangle')}
                className="flex-col h-auto py-3"
              >
                <Square className="w-5 h-5 mb-1" />
                <span className="text-xs">Rectangle</span>
              </Button>
              <Button
                variant={currentTool === 'circle' ? 'default' : 'outline'}
                onClick={() => setCurrentTool('circle')}
                className="flex-col h-auto py-3"
              >
                <Circle className="w-5 h-5 mb-1" />
                <span className="text-xs">Circle</span>
              </Button>
              <Button
                variant={currentTool === 'text' ? 'default' : 'outline'}
                onClick={() => setCurrentTool('text')}
                className="flex-col h-auto py-3"
              >
                <Type className="w-5 h-5 mb-1" />
                <span className="text-xs">Text</span>
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-3 block">
              <Palette className="w-4 h-4 inline mr-2" />
              Color
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    currentColor === color ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="mt-2 h-10"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold mb-3 block">
              <PenTool className="w-4 h-4 inline mr-2" />
              Brush Size: {brushSize}px
            </Label>
            <Slider
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              min={1}
              max={50}
              step={1}
              className="mb-2"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold mb-3 block">Actions</Label>
            <Button onClick={undo} variant="outline" className="w-full" disabled={historyStep <= 0}>
              <Undo className="w-4 h-4 mr-2" />
              Undo
            </Button>
            <Button onClick={redo} variant="outline" className="w-full" disabled={historyStep >= history.length - 1}>
              <Redo className="w-4 h-4 mr-2" />
              Redo
            </Button>
            <Button onClick={clearCanvas} variant="destructive" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="w-full h-[600px] border border-border rounded-lg cursor-crosshair bg-white"
            style={{ touchAction: 'none' }}
          />
        </Card>
      </div>
    </div>
  );
}