import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, FileText, Hash, Search } from "lucide-react";
import { PageTreeNode } from "@/types/discover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  tree: PageTreeNode[];
  search: string;
  onSearchChange: (v: string) => void;
  currentSlug?: string;
}

function TreeNode({ node, currentSlug, depth = 0 }: { node: PageTreeNode; currentSlug?: string; depth?: number }) {
  const [open, setOpen] = useState(true);
  const isActive = node.slug === currentSlug;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div className={cn(
        "flex items-center gap-1 group rounded-lg px-2 py-1.5 transition-colors",
        isActive ? "bg-primary/15 text-primary" : "hover:bg-muted/50 text-foreground/80"
      )}>
        {hasChildren ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-0.5 hover:bg-muted rounded"
          >
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} />
          </button>
        ) : (
          <span className="w-5" />
        )}
        <Link
          to={`/discover/${node.slug}`}
          className="flex-1 flex items-center gap-2 min-w-0 text-sm"
        >
          <FileText className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
          <span className="truncate">{node.title}</span>
        </Link>
      </div>
      {hasChildren && open && (
        <div className="ml-4 border-l border-border/50 pl-1 mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} currentSlug={currentSlug} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DiscoverSidebar({ tree, search, onSearchChange, currentSlug }: Props) {
  return (
    <aside className="w-72 flex-shrink-0 border-r border-border bg-card/30 backdrop-blur-sm flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <Link to="/discover" className="flex items-center gap-2 mb-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Hash className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-sm leading-tight">Discover</h2>
            <p className="text-[10px] text-muted-foreground leading-tight">NiranX Pages</p>
          </div>
        </Link>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search pages..."
            className="pl-8 h-9 text-sm rounded-lg bg-background/60"
          />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {tree.length === 0 ? (
          <p className="text-xs text-muted-foreground p-4 text-center">No pages yet</p>
        ) : (
          tree.map((node) => (
            <TreeNode key={node.id} node={node} currentSlug={currentSlug} />
          ))
        )}
      </nav>
    </aside>
  );
}
