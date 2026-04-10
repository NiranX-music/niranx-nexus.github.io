import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AIChatMessageProps {
  role: "user" | "assistant";
  content: string;
  index: number;
}

function renderMarkdown(text: string) {
  // Simple markdown: bold, italic, code blocks, inline code, lists, headers
  let html = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-background/80 rounded-lg p-2 my-1 text-xs overflow-x-auto border border-border"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-background/60 px-1 rounded text-xs font-mono">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^### (.+)$/gm, '<h4 class="font-semibold text-sm mt-2 mb-1">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="font-semibold mt-2 mb-1">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="font-bold mt-2 mb-1">$1</h2>')
    .replace(/^- (.+)$/gm, '<li class="ml-3 list-disc text-sm">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-3 list-decimal text-sm">$2</li>')
    .replace(/\n/g, "<br/>");
  return html;
}

export default function AIChatMessage({ role, content, index }: AIChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<"up" | "down" | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: role === "user" ? 20 : -20, y: 5 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}
    >
      <div className="group relative">
        <div
          className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
            role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {role === "assistant" ? (
            <div
              className="prose-sm [&_pre]:my-1 [&_code]:text-xs [&_li]:my-0.5"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdown(content), {
                ALLOWED_TAGS: ['p','b','i','em','strong','ul','ol','li','code','pre','blockquote','h1','h2','h3','h4','a','br'],
                ALLOWED_ATTR: ['href','target','rel','class'],
              }) }}
            />
          ) : (
            content
          )}
        </div>

        {role === "assistant" && content && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCopy}>
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-5 w-5 ${rating === "up" ? "text-green-500" : ""}`}
              onClick={() => setRating(rating === "up" ? null : "up")}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-5 w-5 ${rating === "down" ? "text-destructive" : ""}`}
              onClick={() => setRating(rating === "down" ? null : "down")}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
