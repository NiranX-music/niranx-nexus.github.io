import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw, Clock, GitBranch, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Version {
  id: string;
  project_id: string;
  version_number: number;
  label: string;
  snapshot: Record<string, string>; // filename -> content
  created_at: string;
}

export function XstellarVersionControl({
  projectId,
  currentFiles,
  onRestore,
}: {
  projectId: string | null;
  currentFiles: { filename: string; content: string }[];
  onRestore: (files: Record<string, string>) => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (projectId) loadVersions();
  }, [projectId]);

  const loadVersions = async () => {
    if (!projectId) return;
    setLoading(true);
    // Use localStorage as version store (no DB table needed)
    const stored = localStorage.getItem(`xstellar-versions-${projectId}`);
    if (stored) {
      try { setVersions(JSON.parse(stored)); } catch { setVersions([]); }
    }
    setLoading(false);
  };

  const saveVersion = () => {
    if (!projectId || currentFiles.length === 0) return;
    setSaving(true);
    const snapshot: Record<string, string> = {};
    currentFiles.forEach(f => { snapshot[f.filename] = f.content; });

    const newVersion: Version = {
      id: crypto.randomUUID(),
      project_id: projectId,
      version_number: versions.length + 1,
      label: label.trim() || `v${versions.length + 1}`,
      snapshot,
      created_at: new Date().toISOString(),
    };

    const updated = [newVersion, ...versions].slice(0, 50); // max 50 versions
    setVersions(updated);
    localStorage.setItem(`xstellar-versions-${projectId}`, JSON.stringify(updated));
    setLabel("");
    setSaving(false);
    toast({ title: "Version saved", description: `${newVersion.label} saved` });
  };

  const restoreVersion = (version: Version) => {
    onRestore(version.snapshot);
    toast({ title: "Restored", description: `Restored to ${version.label}` });
  };

  if (!projectId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Select a project to manage versions
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4" /> Version Control
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">{versions.length} versions</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <input
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Version label (optional)"
            className="flex-1 h-8 px-3 text-xs rounded-md border border-input bg-background"
          />
          <Button size="sm" className="h-8 text-xs" onClick={saveVersion} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
            Save
          </Button>
        </div>

        <ScrollArea className="h-[300px]">
          <AnimatePresence>
            {versions.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50 group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <History className="h-3 w-3 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{v.label}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => restoreVersion(v)}
                >
                  <RotateCcw className="h-3 w-3 mr-1" /> Restore
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          {versions.length === 0 && !loading && (
            <p className="text-xs text-muted-foreground text-center py-6">No versions saved yet</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
