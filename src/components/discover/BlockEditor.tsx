import { useState } from "react";
import { ContentBlock } from "@/types/discover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, ChevronUp, ChevronDown, Type, Hash, Code2, Image as ImageIcon, Sigma, Link2, Quote, Minus, List, Video, FileCode } from "lucide-react";
import { ContentBlockRenderer } from "./ContentBlockRenderer";

const BLOCK_TYPES = [
  { type: "heading", label: "Heading", icon: Hash },
  { type: "text", label: "Text", icon: Type },
  { type: "markdown", label: "Markdown", icon: FileCode },
  { type: "html", label: "HTML", icon: Code2 },
  { type: "code", label: "Code", icon: Code2 },
  { type: "latex", label: "LaTeX", icon: Sigma },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "embed", label: "Embed", icon: Link2 },
  { type: "video", label: "Video", icon: Video },
  { type: "quote", label: "Quote", icon: Quote },
  { type: "list", label: "List", icon: List },
  { type: "divider", label: "Divider", icon: Minus },
] as const;

function defaultBlock(type: string): ContentBlock {
  switch (type) {
    case "heading": return { type: "heading", value: "Section title", level: 2 };
    case "text": return { type: "text", value: "Write something...", size: "md" };
    case "markdown": return { type: "markdown", value: "**Bold** and *italic* and `code`" };
    case "html": return { type: "html", value: "<p>Custom HTML</p>" };
    case "code": return { type: "code", value: "console.log('hello');", language: "javascript" };
    case "latex": return { type: "latex", value: "E = mc^2", display: true };
    case "image": return { type: "image", src: "", caption: "" };
    case "embed": return { type: "embed", url: "https://", height: 480 };
    case "video": return { type: "video", url: "" };
    case "quote": return { type: "quote", value: "Quote text" };
    case "list": return { type: "list", items: ["First item", "Second item"], ordered: false };
    case "divider": return { type: "divider" };
    default: return { type: "text", value: "" };
  }
}

interface Props {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function BlockEditor({ blocks, onChange }: Props) {
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  const update = (i: number, patch: Partial<ContentBlock>) => {
    const next = [...blocks];
    next[i] = { ...next[i], ...patch } as ContentBlock;
    onChange(next);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(blocks.filter((_, idx) => idx !== i));
  const add = (type: string) => onChange([...blocks, defaultBlock(type)]);

  return (
    <div className="space-y-3">
      {blocks.map((block, i) => (
        <div key={i} className="rounded-xl border border-border bg-card/50 overflow-hidden">
          <div className="flex items-center gap-1 px-3 py-2 bg-muted/40 border-b border-border">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-mono uppercase text-muted-foreground">{block.type}</span>
            <div className="flex-1" />
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setPreviewIdx(previewIdx === i ? null : i)}>
              👁
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => move(i, -1)}><ChevronUp className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => move(i, 1)}><ChevronDown className="h-3.5 w-3.5" /></Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => remove(i)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
          <div className="p-3 space-y-2">
            {block.type === "heading" && (
              <>
                <Select value={String(block.level)} onValueChange={(v) => update(i, { level: Number(v) as any })}>
                  <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">H1</SelectItem>
                    <SelectItem value="2">H2</SelectItem>
                    <SelectItem value="3">H3</SelectItem>
                    <SelectItem value="4">H4</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={block.value} onChange={(e) => update(i, { value: e.target.value })} />
              </>
            )}
            {(block.type === "text" || block.type === "markdown" || block.type === "html" || block.type === "quote") && (
              <>
                {block.type === "text" && (
                  <Select value={(block as any).size || "md"} onValueChange={(v) => update(i, { size: v as any })}>
                    <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                      <SelectItem value="xl">XL</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <Textarea value={(block as any).value} onChange={(e) => update(i, { value: e.target.value })} rows={4} className="font-mono text-sm" />
              </>
            )}
            {block.type === "code" && (
              <>
                <Input placeholder="Language (e.g. javascript, python)" value={block.language || ""} onChange={(e) => update(i, { language: e.target.value })} className="h-8" />
                <Textarea value={block.value} onChange={(e) => update(i, { value: e.target.value })} rows={10} className="font-mono text-xs" placeholder="Paste any length of code..." />
              </>
            )}
            {block.type === "latex" && (
              <Textarea value={block.value} onChange={(e) => update(i, { value: e.target.value })} rows={3} className="font-mono text-sm" placeholder="\\frac{a}{b}" />
            )}
            {block.type === "image" && (
              <>
                <Input placeholder="Image URL" value={block.src} onChange={(e) => update(i, { src: e.target.value })} />
                <Input placeholder="Caption (optional)" value={block.caption || ""} onChange={(e) => update(i, { caption: e.target.value })} />
              </>
            )}
            {(block.type === "embed" || block.type === "video") && (
              <Input placeholder="URL" value={block.url} onChange={(e) => update(i, { url: e.target.value })} />
            )}
            {block.type === "list" && (
              <Textarea value={block.items.join("\n")} onChange={(e) => update(i, { items: e.target.value.split("\n") })} rows={4} placeholder="One item per line" />
            )}
            {block.type === "divider" && <p className="text-xs text-muted-foreground">— horizontal rule —</p>}

            {previewIdx === i && (
              <div className="mt-3 p-3 rounded-lg bg-background border border-border">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <ContentBlockRenderer block={block} />
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-dashed border-border p-3">
        <p className="text-xs text-muted-foreground mb-2">Add block:</p>
        <div className="flex flex-wrap gap-1.5">
          {BLOCK_TYPES.map((b) => {
            const Icon = b.icon;
            return (
              <Button key={b.type} size="sm" variant="outline" className="h-8 text-xs" onClick={() => add(b.type)}>
                <Icon className="h-3 w-3 mr-1" /> {b.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
