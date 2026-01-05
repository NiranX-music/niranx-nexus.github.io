import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Pencil, Eraser, Square, Circle, Type, 
  Download, Trash2, Undo, Redo, Users,
  Palette, MousePointer, Share2, Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type Tool = "select" | "pen" | "eraser" | "rectangle" | "circle" | "text";

const colors = [
  "#1e1e1e", "#ef4444", "#f97316", "#eab308", 
  "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"
];

export default function CollaborativeWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#1e1e1e");
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [boardName, setBoardName] = useState("Untitled Board");
  const { toast } = useToast();
  const { user } = useAuth();

  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === "select" || tool === "text") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    lastPos.current = { x, y };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === "select" || tool === "text") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? brushSize * 3 : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toast({ title: "Canvas cleared" });
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${boardName}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast({ title: "Image downloaded!" });
  };

  const saveBoard = async () => {
    if (!user) {
      toast({ title: "Please login to save", variant: "destructive" });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const imageData = canvas.toDataURL();
      const { error } = await supabase.from("ai_generations").insert([{
        user_id: user.id,
        tool_type: "whiteboard",
        prompt: boardName,
        result_data: JSON.parse(JSON.stringify({ imageData, name: boardName })),
      }]);

      if (error) throw error;
      toast({ title: "Board saved!" });
    } catch (error: any) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    }
  };

  const shareBoard = () => {
    const shareUrl = `${window.location.origin}/whiteboard?id=shared-${Date.now()}`;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: "Share link copied!", description: "Share this link with collaborators" });
  };

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "select", icon: <MousePointer className="h-4 w-4" />, label: "Select" },
    { id: "pen", icon: <Pencil className="h-4 w-4" />, label: "Pen" },
    { id: "eraser", icon: <Eraser className="h-4 w-4" />, label: "Eraser" },
    { id: "rectangle", icon: <Square className="h-4 w-4" />, label: "Rectangle" },
    { id: "circle", icon: <Circle className="h-4 w-4" />, label: "Circle" },
    { id: "text", icon: <Type className="h-4 w-4" />, label: "Text" },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-4">
          <Input
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="w-64 font-medium"
          />
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {collaborators.length + 1} online
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={shareBoard}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={saveBoard}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCanvas}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      <div className="flex-1 flex gap-4">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-16"
        >
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur">
            <CardContent className="p-2 flex flex-col gap-2">
              {tools.map((t) => (
                <Button
                  key={t.id}
                  variant={tool === t.id ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setTool(t.id)}
                  title={t.label}
                  className="w-full"
                >
                  {t.icon}
                </Button>
              ))}
              
              <div className="h-px bg-border my-2" />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={clearCanvas}
                title="Clear"
                className="w-full text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="h-px bg-border my-2" />

              {/* Colors */}
              <div className="grid grid-cols-2 gap-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-md border-2 transition-transform ${
                      color === c ? "border-primary scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <span className="text-xs text-muted-foreground">Size</span>
                <Slider
                  value={[brushSize]}
                  onValueChange={([v]) => setBrushSize(v)}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1"
        >
          <Card className="h-full border-border/50 bg-card/50 backdrop-blur overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
