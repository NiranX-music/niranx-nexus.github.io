import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, ZoomIn, ZoomOut, Maximize2, Plus, Link2,
  Brain, Atom, BookOpen, Code, Calculator, Beaker
} from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  category: string;
  x: number;
  y: number;
  size: number;
  connections: string[];
  description: string;
}

const categoryColors: Record<string, { fill: string; stroke: string; text: string }> = {
  Mathematics: { fill: "hsl(var(--primary) / 0.15)", stroke: "hsl(var(--primary))", text: "text-primary" },
  Physics: { fill: "hsl(315 100% 60% / 0.15)", stroke: "hsl(315 100% 60%)", text: "text-accent" },
  Chemistry: { fill: "hsl(45 100% 55% / 0.15)", stroke: "hsl(45 100% 55%)", text: "text-yellow-400" },
  Biology: { fill: "hsl(140 70% 45% / 0.15)", stroke: "hsl(140 70% 45%)", text: "text-green-400" },
  "Computer Science": { fill: "hsl(210 100% 55% / 0.15)", stroke: "hsl(210 100% 55%)", text: "text-blue-400" },
};

const sampleNodes: GraphNode[] = [
  { id: "calc", label: "Calculus", category: "Mathematics", x: 400, y: 250, size: 50, connections: ["linalg", "diffeq", "physics1"], description: "Derivatives, integrals, limits" },
  { id: "linalg", label: "Linear Algebra", category: "Mathematics", x: 250, y: 150, size: 40, connections: ["calc", "ml"], description: "Matrices, vectors, transformations" },
  { id: "diffeq", label: "Differential Eq.", category: "Mathematics", x: 550, y: 150, size: 38, connections: ["calc", "physics1"], description: "ODEs and PDEs" },
  { id: "physics1", label: "Mechanics", category: "Physics", x: 600, y: 350, size: 45, connections: ["calc", "diffeq", "thermo"], description: "Force, motion, energy" },
  { id: "thermo", label: "Thermodynamics", category: "Physics", x: 700, y: 200, size: 36, connections: ["physics1", "chem1"], description: "Heat, entropy, energy transfer" },
  { id: "chem1", label: "Organic Chem", category: "Chemistry", x: 750, y: 350, size: 42, connections: ["thermo", "bio1"], description: "Carbon compounds, reactions" },
  { id: "bio1", label: "Cell Biology", category: "Biology", x: 600, y: 450, size: 40, connections: ["chem1", "genetics"], description: "Cell structure and function" },
  { id: "genetics", label: "Genetics", category: "Biology", x: 450, y: 450, size: 38, connections: ["bio1", "ml"], description: "DNA, heredity, mutations" },
  { id: "ml", label: "Machine Learning", category: "Computer Science", x: 300, y: 350, size: 44, connections: ["linalg", "genetics", "algo"], description: "Neural networks, training" },
  { id: "algo", label: "Algorithms", category: "Computer Science", x: 200, y: 280, size: 36, connections: ["ml", "linalg"], description: "Sorting, graphs, complexity" },
];

export default function KnowledgeGraph() {
  const [nodes] = useState<GraphNode[]>(sampleNodes);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const filteredNodes = nodes.filter(n =>
    n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highlightedConnections = hoveredNode
    ? nodes.find(n => n.id === hoveredNode)?.connections || []
    : selectedNode?.connections || [];

  const categories = [...new Set(nodes.map(n => n.category))];

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono">
            Knowledge <span className="text-primary">Graph</span>
          </h1>
          <p className="text-sm text-muted-foreground">Visualize connections between your study topics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48 h-9 rounded-xl bg-muted/50 border-border/40 text-sm"
            />
          </div>
          <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setZoom(1)}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Badge key={cat} variant="outline" className={`font-mono text-[10px] ${categoryColors[cat]?.text || ""}`}>
            <span className="h-2 w-2 rounded-full mr-1.5" style={{ background: categoryColors[cat]?.stroke }} />
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        {/* Graph Canvas */}
        <Card className="bg-card/30 border-border/40 overflow-hidden">
          <CardContent className="p-0 relative" style={{ height: "550px" }}>
            <svg
              ref={svgRef}
              viewBox="0 0 950 550"
              className="w-full h-full"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            >
              {/* Grid Background */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border) / 0.15)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Connections */}
              {nodes.map(node =>
                node.connections.map(connId => {
                  const target = nodes.find(n => n.id === connId);
                  if (!target || node.id > connId) return null;
                  const isHighlighted =
                    highlightedConnections.includes(connId) && (hoveredNode === node.id || selectedNode?.id === node.id) ||
                    highlightedConnections.includes(node.id) && (hoveredNode === connId || selectedNode?.id === connId);
                  return (
                    <line
                      key={`${node.id}-${connId}`}
                      x1={node.x} y1={node.y}
                      x2={target.x} y2={target.y}
                      stroke={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--border) / 0.3)"}
                      strokeWidth={isHighlighted ? 2 : 1}
                      strokeDasharray={isHighlighted ? "none" : "4 4"}
                      className="transition-all duration-300"
                    />
                  );
                })
              )}

              {/* Nodes */}
              {filteredNodes.map(node => {
                const colors = categoryColors[node.category] || categoryColors.Mathematics;
                const isActive = hoveredNode === node.id || selectedNode?.id === node.id;
                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    {/* Glow */}
                    {isActive && (
                      <circle cx={node.x} cy={node.y} r={node.size + 8} fill={colors.fill} className="animate-pulse" />
                    )}
                    {/* Circle */}
                    <circle
                      cx={node.x} cy={node.y}
                      r={node.size}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      className="transition-all duration-200"
                    />
                    {/* Label */}
                    <text
                      x={node.x} y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="currentColor"
                      fontSize={node.size > 40 ? 11 : 9}
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {node.label}
                    </text>
                    {/* Connection count */}
                    <circle cx={node.x + node.size * 0.7} cy={node.y - node.size * 0.7} r={8} fill={colors.stroke} />
                    <text
                      x={node.x + node.size * 0.7}
                      y={node.y - node.size * 0.7}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="white"
                      fontSize={8}
                      fontWeight="700"
                    >
                      {node.connections.length}
                    </text>
                  </g>
                );
              })}
            </svg>
          </CardContent>
        </Card>

        {/* Details Panel */}
        <div className="space-y-4">
          {selectedNode ? (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="bg-card/50 border-border/40">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-bold font-mono">{selectedNode.label}</h3>
                  </div>
                  <Badge variant="outline" className={`font-mono text-[10px] ${categoryColors[selectedNode.category]?.text}`}>
                    {selectedNode.category}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{selectedNode.description}</p>

                  <div className="border-t border-border/30 pt-3">
                    <h4 className="text-xs font-mono text-muted-foreground mb-2 flex items-center gap-1">
                      <Link2 className="h-3 w-3" /> CONNECTIONS
                    </h4>
                    <div className="space-y-1.5">
                      {selectedNode.connections.map(connId => {
                        const conn = nodes.find(n => n.id === connId);
                        if (!conn) return null;
                        return (
                          <button
                            key={connId}
                            onClick={() => setSelectedNode(conn)}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono hover:bg-primary/10 transition-colors text-left"
                          >
                            <span className="h-2 w-2 rounded-full" style={{ background: categoryColors[conn.category]?.stroke }} />
                            <span>{conn.label}</span>
                            <span className="text-muted-foreground ml-auto">{conn.category}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="bg-card/50 border-border/40">
              <CardContent className="p-6 text-center">
                <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-sm mb-1">Select a Topic</h3>
                <p className="text-xs text-muted-foreground">Click on any node to explore its connections and details</p>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="bg-card/50 border-border/40">
            <CardContent className="p-4 space-y-2">
              <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Graph Stats</h4>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold font-mono text-primary">{nodes.length}</div>
                  <div className="text-[9px] text-muted-foreground uppercase">Topics</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold font-mono text-primary">
                    {nodes.reduce((sum, n) => sum + n.connections.length, 0) / 2}
                  </div>
                  <div className="text-[9px] text-muted-foreground uppercase">Links</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold font-mono text-primary">{categories.length}</div>
                  <div className="text-[9px] text-muted-foreground uppercase">Subjects</div>
                </div>
                <div className="p-2 rounded-lg bg-muted/30">
                  <div className="text-lg font-bold font-mono text-primary">
                    {(nodes.reduce((sum, n) => sum + n.connections.length, 0) / nodes.length).toFixed(1)}
                  </div>
                  <div className="text-[9px] text-muted-foreground uppercase">Avg Links</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
