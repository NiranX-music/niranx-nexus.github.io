import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  GitBranch, Plus, Trash2, Edit3, Check, X, ZoomIn, ZoomOut,
  Download, Palette, Sparkles, Maximize, Link2, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MindNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  parentId: string | null;
  children: string[];
  collapsed: boolean;
}

const NODE_COLORS = [
  "hsl(var(--primary))",
  "#f97316", "#eab308", "#22c55e", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#ef4444",
];

const XMap = () => {
  const [nodes, setNodes] = useState<MindNode[]>([
    { id: "root", text: "Central Idea", x: 400, y: 300, color: "hsl(var(--primary))", parentId: null, children: ["n1", "n2", "n3"], collapsed: false },
    { id: "n1", text: "Subtopic A", x: 200, y: 150, color: "#3b82f6", parentId: "root", children: ["n4"], collapsed: false },
    { id: "n2", text: "Subtopic B", x: 600, y: 150, color: "#22c55e", parentId: "root", children: [], collapsed: false },
    { id: "n3", text: "Subtopic C", x: 400, y: 480, color: "#f97316", parentId: "root", children: [], collapsed: false },
    { id: "n4", text: "Detail 1", x: 80, y: 80, color: "#8b5cf6", parentId: "n1", children: [], collapsed: false },
  ]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const addChild = useCallback((parentId: string) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;
    const newId = crypto.randomUUID();
    const angle = (parent.children.length * 60 + 30) * (Math.PI / 180);
    const dist = 150;
    const newNode: MindNode = {
      id: newId,
      text: "New Node",
      x: parent.x + Math.cos(angle) * dist,
      y: parent.y + Math.sin(angle) * dist,
      color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
      parentId,
      children: [],
      collapsed: false,
    };
    setNodes(prev => [
      ...prev.map(n => n.id === parentId ? { ...n, children: [...n.children, newId] } : n),
      newNode,
    ]);
    setEditingNode(newId);
    setEditText("New Node");
  }, [nodes]);

  const deleteNode = useCallback((nodeId: string) => {
    if (nodeId === "root") { toast.error("Cannot delete root node"); return; }
    const toRemove = new Set<string>();
    const collect = (id: string) => {
      toRemove.add(id);
      nodes.find(n => n.id === id)?.children.forEach(collect);
    };
    collect(nodeId);
    const node = nodes.find(n => n.id === nodeId)!;
    setNodes(prev => prev
      .filter(n => !toRemove.has(n.id))
      .map(n => n.id === node.parentId ? { ...n, children: n.children.filter(c => c !== nodeId) } : n)
    );
    setSelectedNode(null);
    toast.success("Node deleted");
  }, [nodes]);

  const startEdit = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setEditingNode(nodeId);
    setEditText(node.text);
  };

  const saveEdit = () => {
    if (!editingNode) return;
    setNodes(prev => prev.map(n => n.id === editingNode ? { ...n, text: editText } : n));
    setEditingNode(null);
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (editingNode === nodeId) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const node = nodes.find(n => n.id === nodeId)!;
    setDragging(nodeId);
    setDragOffset({ x: e.clientX / zoom - node.x, y: e.clientY / zoom - node.y });
    setSelectedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const newX = e.clientX / zoom - dragOffset.x;
    const newY = e.clientY / zoom - dragOffset.y;
    setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x: newX, y: newY } : n));
  };

  const handleMouseUp = () => setDragging(null);

  const getVisibleNodes = () => {
    const hidden = new Set<string>();
    nodes.filter(n => n.collapsed).forEach(n => {
      const hideChildren = (id: string) => {
        const node = nodes.find(nd => nd.id === id);
        node?.children.forEach(c => { hidden.add(c); hideChildren(c); });
      };
      hideChildren(n.id);
    });
    return nodes.filter(n => !hidden.has(n.id));
  };

  const visible = getVisibleNodes();
  const selected = nodes.find(n => n.id === selectedNode);

  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GitBranch className="h-8 w-8 text-primary" />
            XMap
          </h1>
          <p className="text-muted-foreground mt-1">Visual mind mapping with drag-and-drop nodes</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Badge variant="outline">{nodes.length} nodes</Badge>
        </div>
      </motion.div>

      <div className="flex gap-4">
        {/* Canvas */}
        <Card className="flex-1 overflow-hidden">
          <div
            ref={canvasRef}
            className="relative h-[600px] cursor-crosshair bg-muted/30 overflow-hidden select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}>
              {visible.map(node =>
                node.parentId && visible.find(n => n.id === node.parentId) ? (
                  <line
                    key={`line-${node.id}`}
                    x1={nodes.find(n => n.id === node.parentId)!.x + 60}
                    y1={nodes.find(n => n.id === node.parentId)!.y + 20}
                    x2={node.x + 60}
                    y2={node.y + 20}
                    stroke="hsl(var(--muted-foreground) / 0.3)"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                  />
                ) : null
              )}
            </svg>

            <div style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}>
              {visible.map(node => (
                <motion.div
                  key={node.id}
                  className={cn(
                    "absolute px-4 py-2 rounded-xl border-2 shadow-lg cursor-grab active:cursor-grabbing min-w-[120px] max-w-[200px] text-center transition-shadow",
                    selectedNode === node.id && "ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl"
                  )}
                  style={{
                    left: node.x,
                    top: node.y,
                    backgroundColor: `color-mix(in srgb, ${node.color} 15%, hsl(var(--card)))`,
                    borderColor: node.color,
                  }}
                  onMouseDown={e => handleMouseDown(e, node.id)}
                  onDoubleClick={() => startEdit(node.id)}
                  whileHover={{ scale: 1.05 }}
                >
                  {editingNode === node.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingNode(null); }}
                        className="h-6 text-xs px-1"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={saveEdit}><Check className="h-3 w-3" /></Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium block truncate">{node.text}</span>
                      {node.children.length > 0 && (
                        <button
                          className="absolute -right-2 -bottom-2 bg-background border rounded-full w-5 h-5 flex items-center justify-center text-[10px] text-muted-foreground hover:text-primary"
                          onClick={e => { e.stopPropagation(); setNodes(prev => prev.map(n => n.id === node.id ? { ...n, collapsed: !n.collapsed } : n)); }}
                        >
                          {node.collapsed ? `+${node.children.length}` : <ChevronRight className="h-3 w-3" />}
                        </button>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </Card>

        {/* Properties Panel */}
        <Card className="w-64 shrink-0 hidden lg:block">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <div>
                  <label className="text-xs text-muted-foreground">Label</label>
                  <Input value={selected.text} onChange={e => setNodes(prev => prev.map(n => n.id === selected.id ? { ...n, text: e.target.value } : n))} className="mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Color</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {NODE_COLORS.map(c => (
                      <button
                        key={c}
                        className={cn("w-6 h-6 rounded-full border-2 transition-transform hover:scale-110", selected.color === c ? "border-foreground scale-110" : "border-transparent")}
                        style={{ backgroundColor: c }}
                        onClick={() => setNodes(prev => prev.map(n => n.id === selected.id ? { ...n, color: c } : n))}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" className="gap-1 justify-start" onClick={() => addChild(selected.id)}>
                    <Plus className="h-3 w-3" /> Add Child
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 justify-start" onClick={() => startEdit(selected.id)}>
                    <Edit3 className="h-3 w-3" /> Edit
                  </Button>
                  {selected.id !== "root" && (
                    <Button size="sm" variant="outline" className="gap-1 justify-start text-destructive" onClick={() => deleteNode(selected.id)}>
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Click a node to edit its properties. Double-click to rename.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default XMap;
