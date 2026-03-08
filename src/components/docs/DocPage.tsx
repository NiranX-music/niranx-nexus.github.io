import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Check, ChevronRight, ExternalLink, Info, Zap, AlertTriangle } from "lucide-react";
import { useState, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DocPageProps {
  breadcrumb: string;
  title: string;
  description: string;
  badge?: string;
  children: ReactNode;
}

export function DocPage({ breadcrumb, title, description, badge, children }: DocPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <Link to="/docs/welcome" className="hover:text-foreground">Docs</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary">{breadcrumb}</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
          {badge && <Badge variant="outline">{badge}</Badge>}
        </div>
        <p className="text-muted-foreground mt-2 text-lg">{description}</p>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_li]:text-muted-foreground [&_ul]:space-y-1">
        {children}
      </div>
    </motion.div>
  );
}

export function DocCodeBlock({ code, language = "typescript" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group rounded-lg overflow-hidden border border-border/50 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border/50">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copy}>
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm bg-muted/30">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function DocCallout({ type = "info", title, children }: { type?: "info" | "tip" | "warning"; title: string; children: ReactNode }) {
  const styles = {
    info: "border-blue-500/30 bg-blue-500/5",
    tip: "border-primary/30 bg-primary/5",
    warning: "border-amber-500/30 bg-amber-500/5",
  };
  const icons = { info: Info, tip: Zap, warning: AlertTriangle };
  const Icon = icons[type];
  return (
    <div className={cn("border rounded-lg p-4 my-4", styles[type])}>
      <div className="flex items-center gap-2 font-semibold mb-1">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export function DocFeatureCard({ title, description, link }: { title: string; description: string; link?: string }) {
  const content = (
    <Card className="hover:border-primary/50 transition-all cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}
