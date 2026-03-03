import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollText, RefreshCw, Search, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface LogEntry {
  id: string;
  action: string;
  user_id: string;
  created_at: string;
  details: any;
}

export function XstellarLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error) setLogs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user_id.toLowerCase().includes(search.toLowerCase())
  );

  const getLogIcon = (action: string) => {
    if (action.includes("error") || action.includes("fail")) return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
    if (action.includes("warn")) return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
    return <Info className="h-3.5 w-3.5 text-blue-500" />;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <ScrollText className="h-4 w-4" /> Audit Logs
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 w-48"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={loadLogs}>
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredLogs.length > 0 ? (
          <ScrollArea className="h-[60vh]">
            <div className="space-y-0">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-muted/50">
                  <div className="mt-0.5">{getLogIcon(log.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{log.action}</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {log.user_id.slice(0, 8)}...
                      </Badge>
                    </div>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-1 truncate font-mono">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {search ? "No logs matching filter" : "No audit logs found"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
