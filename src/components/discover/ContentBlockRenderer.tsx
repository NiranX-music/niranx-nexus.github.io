import { useEffect, useRef, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentBlock } from "@/types/discover";
import { cn } from "@/lib/utils";

function highlight(text: string, query?: string) {
  if (!query) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.split(re).map((part, i) =>
    re.test(part) ? (
      <span key={i} className="bg-primary/30 text-foreground rounded px-0.5">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function MarkdownInline({ value, query }: { value: string; query?: string }) {
  // Lightweight markdown: **bold**, *italic*, `code`, [link](url), ==highlight==
  const nodes: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|==[^=]+==|\[[^\]]+\]\([^)]+\))/g;
  const parts = value.split(regex);
  parts.forEach((part, i) => {
    if (!part) return;
    if (part.startsWith("**")) nodes.push(<strong key={i}>{part.slice(2, -2)}</strong>);
    else if (part.startsWith("*")) nodes.push(<em key={i}>{part.slice(1, -1)}</em>);
    else if (part.startsWith("`")) nodes.push(<code key={i} className="px-1.5 py-0.5 rounded bg-muted text-primary font-mono text-sm">{part.slice(1, -1)}</code>);
    else if (part.startsWith("==")) nodes.push(<span key={i} className="bg-yellow-500/30 px-1 rounded">{part.slice(2, -2)}</span>);
    else if (part.startsWith("[")) {
      const m = /\[([^\]]+)\]\(([^)]+)\)/.exec(part);
      if (m) nodes.push(<a key={i} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">{m[1]}</a>);
    } else nodes.push(<span key={i}>{highlight(part, query)}</span>);
  });
  return <>{nodes}</>;
}

function CodeBlock({ value, language }: { value: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lineCount = value.split("\n").length;
  const isLong = lineCount > 30;

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-border bg-[#1e1e1e] group">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground uppercase">{language || "text"} · {lineCount} lines</span>
        <div className="flex items-center gap-2">
          {isLong && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? <><ChevronUp className="h-3 w-3 mr-1" />Collapse</> : <><ChevronDown className="h-3 w-3 mr-1" />Expand</>}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => {
              navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>
      <div className={cn("overflow-auto", isLong && !expanded && "max-h-96")}>
        <SyntaxHighlighter
          language={language || "text"}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{ margin: 0, padding: "1rem", background: "transparent", fontSize: "0.85rem" }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

function Latex({ value, display }: { value: string; display?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(value, ref.current, { throwOnError: false, displayMode: display });
      } catch (e) {
        if (ref.current) ref.current.textContent = value;
      }
    }
  }, [value, display]);
  return <span ref={ref} className={display ? "block my-4 text-center overflow-x-auto" : "inline-block"} />;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function ContentBlockRenderer({ block, query }: { block: ContentBlock; query?: string }) {
  const sizeMap: Record<string, string> = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  switch (block.type) {
    case "heading": {
      const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
      const cls: Record<number, string> = {
        1: "text-4xl font-bold mt-8 mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
        2: "text-3xl font-bold mt-7 mb-3 text-foreground",
        3: "text-2xl font-semibold mt-6 mb-2 text-foreground",
        4: "text-xl font-semibold mt-5 mb-2 text-foreground",
      };
      return <Tag className={cls[block.level]}>{highlight(block.value, query)}</Tag>;
    }
    case "text":
      return (
        <p className={cn("leading-relaxed text-foreground/90 my-3", sizeMap[block.size || "md"])}>
          <MarkdownInline value={block.value} query={query} />
        </p>
      );
    case "markdown":
      return (
        <div className="leading-relaxed text-foreground/90 my-3 space-y-3">
          {block.value.split("\n\n").map((para, i) => (
            <p key={i}><MarkdownInline value={para} query={query} /></p>
          ))}
        </div>
      );
    case "html":
      return (
        <div
          className="discover-html-block my-4 [&_a]:text-primary [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: block.value }}
        />
      );
    case "latex":
      return <Latex value={block.value} display={block.display !== false} />;
    case "code":
      return <CodeBlock value={block.value} language={block.language} />;
    case "image":
      return (
        <figure className="my-6">
          <img
            src={block.src}
            alt={block.alt || block.caption || ""}
            loading="lazy"
            className="rounded-xl w-full max-h-[600px] object-cover border border-border"
          />
          {block.caption && (
            <figcaption className="text-sm text-muted-foreground text-center mt-2 italic">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "embed": {
      const ytId = getYouTubeId(block.url);
      const src = ytId ? `https://www.youtube.com/embed/${ytId}` : block.url;
      return (
        <div className="my-6 rounded-xl overflow-hidden border border-border bg-muted/20" style={{ height: block.height || 480 }}>
          <iframe
            src={src}
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
            title="Embedded content"
          />
        </div>
      );
    }
    case "video": {
      const ytId = getYouTubeId(block.url);
      if (ytId) {
        return (
          <div className="my-6 aspect-video rounded-xl overflow-hidden border border-border">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video"
            />
          </div>
        );
      }
      return <video src={block.url} controls className="my-6 rounded-xl w-full border border-border" />;
    }
    case "quote":
      return (
        <blockquote className="my-6 border-l-4 border-primary pl-5 py-2 italic text-foreground/80 bg-primary/5 rounded-r-xl">
          <MarkdownInline value={block.value} query={query} />
          {block.cite && <footer className="text-sm text-muted-foreground mt-2 not-italic">— {block.cite}</footer>}
        </blockquote>
      );
    case "divider":
      return <hr className="my-8 border-border" />;
    case "list":
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag className={cn("my-4 space-y-1.5 ml-6", block.ordered ? "list-decimal" : "list-disc")}>
          {block.items.map((item, i) => (
            <li key={i} className="text-foreground/90 leading-relaxed">
              <MarkdownInline value={item} query={query} />
            </li>
          ))}
        </ListTag>
      );
    default:
      return null;
  }
}

export function blocksToPlainText(blocks: ContentBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "heading":
        case "text":
        case "markdown":
        case "quote":
        case "latex":
          return b.value;
        case "html":
          return b.value.replace(/<[^>]+>/g, " ");
        case "code":
          return `[code: ${b.language || "text"}]\n${b.value}`;
        case "image":
          return b.caption ? `[image: ${b.caption}]` : "";
        case "list":
          return b.items.join("\n");
        default:
          return "";
      }
    })
    .join("\n\n");
}
