import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, Clock, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface QueryResult {
  query: string;
  data: any[] | null;
  error: string | null;
  executedAt: string;
  duration: number;
}

export function XstellarSQLEditor() {
  const [query, setQuery] = useState("SELECT * FROM profiles LIMIT 10;");
  const [results, setResults] = useState<QueryResult[]>([]);
  const [running, setRunning] = useState(false);

  const executeQuery = async () => {
    if (!query.trim()) return;

    // Only allow SELECT queries for safety
    const trimmed = query.trim().toLowerCase();
    if (!trimmed.startsWith("select")) {
      toast({
        title: "Read-only",
        description: "Only SELECT queries are allowed in the SQL Editor for safety. Use migrations for write operations.",
        variant: "destructive",
      });
      return;
    }

    setRunning(true);
    const start = performance.now();

    try {
      // Use a raw RPC or the from() API based on query
      // For safety, we parse the table name from SELECT queries
      const tableMatch = query.match(/from\s+(\w+)/i);
      if (!tableMatch) {
        setResults(prev => [{
          query,
          data: null,
          error: "Could not parse table name from query",
          executedAt: new Date().toISOString(),
          duration: performance.now() - start,
        }, ...prev]);
        return;
      }

      const tableName = tableMatch[1];
      const limitMatch = query.match(/limit\s+(\d+)/i);
      const limit = limitMatch ? parseInt(limitMatch[1]) : 50;

      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .limit(Math.min(limit, 100));

      const duration = performance.now() - start;

      setResults(prev => [{
        query,
        data: error ? null : data,
        error: error ? error.message : null,
        executedAt: new Date().toISOString(),
        duration,
      }, ...prev]);

      if (error) {
        toast({ title: "Query Error", description: error.message, variant: "destructive" });
      }
    } catch (e: any) {
      setResults(prev => [{
        query,
        data: null,
        error: e.message,
        executedAt: new Date().toISOString(),
        duration: performance.now() - start,
      }, ...prev]);
    } finally {
      setRunning(false);
    }
  };

  const latestResult = results[0];
  const columns = latestResult?.data?.length ? Object.keys(latestResult.data[0]) : [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">SQL Editor (Read-Only)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM profiles LIMIT 10;"
            className="font-mono text-sm min-h-[120px] bg-muted/30"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                executeQuery();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <Button onClick={executeQuery} disabled={running} size="sm" className="gap-2">
              <Play className="h-3.5 w-3.5" />
              {running ? "Running..." : "Run Query"}
            </Button>
            <span className="text-xs text-muted-foreground">⌘+Enter to execute</span>
          </div>
        </CardContent>
      </Card>

      {latestResult && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {latestResult.error ? (
                  <><AlertCircle className="h-4 w-4 text-destructive" /> Error</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4 text-green-500" /> Results</>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {latestResult.data && (
                  <Badge variant="secondary">{latestResult.data.length} rows</Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {latestResult.duration.toFixed(0)}ms
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {latestResult.error ? (
              <div className="p-4 text-sm text-destructive bg-destructive/5 rounded-b-lg">
                {latestResult.error}
              </div>
            ) : latestResult.data && latestResult.data.length > 0 ? (
              <ScrollArea className="h-[40vh]">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((col) => (
                          <TableHead key={col} className="text-xs whitespace-nowrap">{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {latestResult.data.map((row, i) => (
                        <TableRow key={i}>
                          {columns.map((col) => (
                            <TableCell key={col} className="text-xs max-w-[200px] truncate font-mono">
                              {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col] ?? "NULL")}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No results</div>
            )}
          </CardContent>
        </Card>
      )}

      {results.length > 1 && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Query History</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setResults([])}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.slice(1, 10).map((r, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(r.query)}
                  className="w-full text-left p-2 rounded-md hover:bg-muted text-xs font-mono truncate flex items-center gap-2"
                >
                  {r.error ? (
                    <AlertCircle className="h-3 w-3 text-destructive shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" />
                  )}
                  <span className="truncate">{r.query}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
