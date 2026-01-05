import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Network, Plus, Trash2, Save, Download, 
  Sparkles, Palette, Link, ZoomIn, ZoomOut,
  Move, MousePointer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MindMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  category?: string;
}

interface Connection {
  from: string;
  to: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(220, 70%, 50%)",
  "hsl(280, 70%, 50%)",
  "hsl(340, 70%, 50%)",
  "hsl(160, 70%, 40%)",
  "hsl(40, 70%, 50%)",
];

export default function MindMapBuilder() {
  const [nodes, setNodes] = useState<MindMapNode[]>([
    { id: "center", label: "Central Topic", x: 400, y: 300, color: COLORS[0] },
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [title, setTitle] = useState("My Mind Map");
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState<"select" | "connect">("select");
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const addNode = useCallback((label: string, category?: string, color?: string) => {
    const centerNode = nodes.find(n => n.id === "center");
    const angle = (nodes.length * 45) * (Math.PI / 180);
    const radius = 150 + Math.floor(nodes.length / 8) * 100;
    
    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      label,
      x: (centerNode?.x || 400) + Math.cos(angle) * radius,
      y: (centerNode?.y || 300) + Math.sin(angle) * radius,
      color: color || COLORS[nodes.length % COLORS.length],
      category,
    };
    
    setNodes(prev => [...prev, newNode]);
    
    // Auto-connect to center or selected node
    if (selectedNode) {
      setConnections(prev => [...prev, { from: selectedNode, to: newNode.id }]);
    } else if (nodes.length > 0) {
      setConnections(prev => [...prev, { from: "center", to: newNode.id }]);
    }
    
    setNewNodeLabel("");
  }, [nodes, selectedNode]);

  const deleteNode = useCallback((nodeId: string) => {
    if (nodeId === "center") return;
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (mode === "connect") {
      if (connectingFrom === null) {
        setConnectingFrom(nodeId);
      } else if (connectingFrom !== nodeId) {
        // Check if connection already exists
        const exists = connections.some(
          c => (c.from === connectingFrom && c.to === nodeId) ||
               (c.from === nodeId && c.to === connectingFrom)
        );
        if (!exists) {
          setConnections(prev => [...prev, { from: connectingFrom, to: nodeId }]);
        }
        setConnectingFrom(null);
      }
    } else {
      setSelectedNode(nodeId === selectedNode ? null : nodeId);
    }
  }, [mode, connectingFrom, selectedNode, connections]);

  const handleNodeDrag = useCallback((nodeId: string, deltaX: number, deltaY: number) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, x: node.x + deltaX / zoom, y: node.y + deltaY / zoom }
        : node
    ));
  }, [zoom]);

  const getSuggestions = async () => {
    const centerNode = nodes.find(n => n.id === "center");
    if (!centerNode) return;

    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-mindmap-nodes', {
        body: {
          centralTopic: centerNode.label,
          existingNodes: nodes,
          provider: 'lovable',
        },
      });

      if (error) throw error;
      setSuggestions(data.suggestions || []);
    } catch (error: any) {
      toast({ 
        title: "Failed to get suggestions", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const addSuggestion = (suggestion: any) => {
    addNode(suggestion.label, suggestion.category);
    setSuggestions(prev => prev.filter(s => s.label !== suggestion.label));
  };

  const saveMindMap = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in to save", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from('mind_maps').insert({
        user_id: user.id,
        title,
        nodes: nodes as any,
        connections: connections as any,
      });

      if (error) throw error;
      toast({ title: "Mind map saved!" });
    } catch (error: any) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    }
  };

  const exportAsImage = () => {
    toast({ title: "Export feature coming soon!" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 border-r bg-card p-4 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold"
              placeholder="Mind Map Title"
            />
          </div>

          {/* Add Node */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Add Node</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                placeholder="Node label..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newNodeLabel.trim()) {
                    addNode(newNodeLabel.trim());
                  }
                }}
              />
              <Button 
                onClick={() => newNodeLabel.trim() && addNode(newNodeLabel.trim())}
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Node
              </Button>
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={getSuggestions}
                variant="secondary"
                className="w-full"
                size="sm"
                disabled={isLoadingSuggestions}
              >
                {isLoadingSuggestions ? "Thinking..." : "Get Ideas"}
              </Button>
              
              {suggestions.length > 0 && (
                <div className="space-y-2 mt-2">
                  {suggestions.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-2 rounded-lg bg-accent/50 cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => addSuggestion(s)}
                    >
                      <p className="font-medium text-sm">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {s.category}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Node */}
          {selectedNode && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Selected Node</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  value={nodes.find(n => n.id === selectedNode)?.label || ""}
                  onChange={(e) => {
                    setNodes(prev => prev.map(n => 
                      n.id === selectedNode ? { ...n, label: e.target.value } : n
                    ));
                  }}
                />
                <div className="flex gap-1">
                  {COLORS.map((color, i) => (
                    <button
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-transparent hover:border-foreground transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setNodes(prev => prev.map(n => 
                          n.id === selectedNode ? { ...n, color } : n
                        ));
                      }}
                    />
                  ))}
                </div>
                {selectedNode !== "center" && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={() => deleteNode(selectedNode)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Button onClick={saveMindMap} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Mind Map
            </Button>
            <Button onClick={exportAsImage} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Image
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden bg-accent/20">
          {/* Toolbar */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button
              variant={mode === "select" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("select")}
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button
              variant={mode === "connect" ? "default" : "outline"}
              size="sm"
              onClick={() => { setMode("connect"); setConnectingFrom(null); }}
            >
              <Link className="h-4 w-4" />
            </Button>
            <div className="border-l mx-2" />
            <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm flex items-center px-2 bg-background rounded-md border">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {mode === "connect" && connectingFrom && (
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="secondary" className="animate-pulse">
                Click another node to connect
              </Badge>
            </div>
          )}

          {/* Mind Map Canvas */}
          <div 
            ref={canvasRef}
            className="w-full h-full"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
          >
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {connections.map((conn, i) => {
                const fromNode = nodes.find(n => n.id === conn.from);
                const toNode = nodes.find(n => n.id === conn.to);
                if (!fromNode || !toNode) return null;
                
                return (
                  <line
                    key={i}
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>

            {nodes.map((node) => (
              <motion.div
                key={node.id}
                className={`absolute cursor-pointer select-none ${
                  selectedNode === node.id ? 'ring-2 ring-primary ring-offset-2' : ''
                } ${connectingFrom === node.id ? 'ring-2 ring-green-500' : ''}`}
                style={{
                  left: node.x,
                  top: node.y,
                  transform: "translate(-50%, -50%)",
                }}
                drag={mode === "select"}
                dragMomentum={false}
                onDrag={(_, info) => handleNodeDrag(node.id, info.delta.x, info.delta.y)}
                onClick={() => handleNodeClick(node.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div 
                  className="px-4 py-2 rounded-xl shadow-lg border-2 min-w-[100px] text-center"
                  style={{ 
                    backgroundColor: node.color,
                    borderColor: selectedNode === node.id ? 'hsl(var(--primary))' : 'transparent',
                  }}
                >
                  <span className="text-white font-medium text-sm drop-shadow-md">
                    {node.label}
                  </span>
                  {node.category && (
                    <span className="block text-white/70 text-xs mt-0.5">
                      {node.category}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
