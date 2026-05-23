import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { navigationConfig } from "@/components/layout/AppSidebar";
import { useCustomSidebarGroups } from "@/hooks/useCustomSidebarGroups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Row = {
  source: "built-in" | "database";
  kind: "group" | "item";
  key: string;
  title: string;
  url?: string;
  group?: string;
  duplicate: boolean;
};

export default function SidebarDebug() {
  const { groups: dbGroups, pages: dbPages, loading } = useCustomSidebarGroups();
  const [auditLog, setAuditLog] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("sidebar_integrity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => setAuditLog(data || []));
  }, []);

  const rows = useMemo<Row[]>(() => {
    const out: Row[] = [];
    const groupTitleCount = new Map<string, number>();
    const itemUrlCount = new Map<string, number>();

    Object.entries(navigationConfig).forEach(([key, cfg]: any) => {
      const t = cfg.title.trim().toLowerCase();
      groupTitleCount.set(t, (groupTitleCount.get(t) || 0) + 1);
      cfg.items.forEach((it: any) => {
        itemUrlCount.set(it.url, (itemUrlCount.get(it.url) || 0) + 1);
      });
    });
    dbGroups.forEach((g) => {
      const t = g.name.trim().toLowerCase();
      groupTitleCount.set(t, (groupTitleCount.get(t) || 0) + 1);
    });
    dbPages.forEach((p) => {
      itemUrlCount.set(p.url, (itemUrlCount.get(p.url) || 0) + 1);
    });

    Object.entries(navigationConfig).forEach(([key, cfg]: any) => {
      const t = cfg.title.trim().toLowerCase();
      out.push({
        source: "built-in", kind: "group", key, title: cfg.title,
        duplicate: (groupTitleCount.get(t) || 0) > 1,
      });
      cfg.items.forEach((it: any) => {
        out.push({
          source: "built-in", kind: "item", key: `${key}:${it.url}`,
          title: it.title, url: it.url, group: cfg.title,
          duplicate: (itemUrlCount.get(it.url) || 0) > 1,
        });
      });
    });
    dbGroups.forEach((g) => {
      const t = g.name.trim().toLowerCase();
      out.push({
        source: "database", kind: "group", key: g.id, title: g.name,
        duplicate: (groupTitleCount.get(t) || 0) > 1,
      });
    });
    dbPages.forEach((p) => {
      out.push({
        source: "database", kind: "item", key: p.id, title: p.title, url: p.url,
        duplicate: (itemUrlCount.get(p.url) || 0) > 1,
      });
    });
    return out;
  }, [dbGroups, dbPages]);

  const dupCount = rows.filter((r) => r.duplicate).length;

  return (
    <div className="container max-w-7xl py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Sidebar Debug</h1>
        <p className="text-sm text-muted-foreground">
          Built-in vs database sidebar entries. {dupCount > 0 ? `${dupCount} duplicate(s) detected.` : "No duplicates detected."}
        </p>
      </div>

      <Tabs defaultValue="entries">
        <TabsList>
          <TabsTrigger value="entries">Entries ({rows.length})</TabsTrigger>
          <TabsTrigger value="audit">Audit Log ({auditLog.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          <Card>
            <CardHeader><CardTitle className="text-sm">All sidebar entries</CardTitle></CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[70vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Kind</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Dup</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
                    ) : rows.map((r) => (
                      <TableRow key={`${r.source}-${r.kind}-${r.key}`} className={r.duplicate ? "bg-destructive/10" : ""}>
                        <TableCell><Badge variant={r.source === "built-in" ? "secondary" : "default"}>{r.source}</Badge></TableCell>
                        <TableCell>{r.kind}</TableCell>
                        <TableCell className="font-medium">{r.title}</TableCell>
                        <TableCell className="font-mono text-xs">{r.url || "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.group || "—"}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{r.key}</TableCell>
                        <TableCell>{r.duplicate && <Badge variant="destructive">DUP</Badge>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader><CardTitle className="text-sm">Dedupe Audit Log</CardTitle></CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[70vh]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>When</TableHead>
                      <TableHead>Kind</TableHead>
                      <TableHead>Identifier</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLog.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-muted-foreground">No events yet</TableCell></TableRow>
                    ) : auditLog.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs">{new Date(e.created_at).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{e.duplicate_kind}</Badge></TableCell>
                        <TableCell className="font-mono text-xs">{e.identifier}</TableCell>
                        <TableCell className="font-mono text-xs">{JSON.stringify(e.details)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
