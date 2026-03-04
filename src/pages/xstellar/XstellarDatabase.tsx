import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Database, Shield, Table2 } from "lucide-react";

interface TableInfo {
  name: string;
  rowCount: number | null;
  hasRLS: boolean;
}

// Known tables from the schema
const KNOWN_TABLES = [
  "accessibility_preferences", "achievements", "admin_api_keys_registry", "admin_custom_pages",
  "admin_editable_content", "admin_notifications", "admin_requests", "admin_role_assignments",
  "admin_settings", "ai_conversations", "ai_generations", "ai_messages", "ai_solver_conversations",
  "ai_solver_messages", "album_artists", "album_tracks", "albums", "analytics_snapshots",
  "app_categories", "ar_flashcard_sessions", "artist_catalogue_folders", "artist_followers",
  "artist_sessions", "artists", "attendance_records", "audit_log", "backblaze_files",
  "blocked_sites", "blog_edits", "blogs", "bookmark_collections", "bytez_conversations",
  "bytez_messages", "chat_room_members", "chat_rooms", "claimed_daily_rewards",
  "class_recordings", "classroom_announcements", "classroom_debates", "classroom_members",
  "classroom_videos", "classrooms", "collaborative_experiments", "course_progress",
  "custom_themes", "daily_challenges", "daily_rewards", "debate_awards", "debate_awards_given",
  "debate_bookmarks", "debate_categories", "debate_comments", "debate_topics", "debate_votes",
  "exams", "exam_resources", "favorites", "feedback_suggestions", "flashcard_decks",
  "flashcards", "focus_sessions", "generated_courses", "generated_websites",
  "leaderboard_entries", "live_classes", "notifications", "notification_preferences",
  "personal_apps", "profiles", "quick_notes", "recent_pages", "reward_tiers",
  "sidebar_groups", "sidebar_pages", "study_streaks", "streak_milestones",
  "tasks", "tracks", "user_achievements", "user_currency", "user_debate_stats",
  "user_profiles", "user_roles", "user_cloud_storage",
];

export function XstellarDatabase() {
  const [search, setSearch] = useState("");
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Build table list from known tables
    setTables(KNOWN_TABLES.map(name => ({ name, rowCount: null, hasRLS: true })));
  }, []);

  const filteredTables = tables.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const loadTableData = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*")
        .limit(50);
      if (!error) setTableData(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 min-w-0">
      {/* Table List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" /> Tables ({filteredTables.length})
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh]">
            <div className="space-y-0.5 p-2">
              {filteredTables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => loadTableData(table.name)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between group ${
                    selectedTable === table.name
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Table2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{table.name}</span>
                  </span>
                  {table.hasRLS && (
                    <Shield className="h-3 w-3 text-green-500 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Table Data */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {selectedTable ? (
              <>
                <Table2 className="h-4 w-4" />
                {selectedTable}
                <Badge variant="secondary" className="ml-2">{tableData.length} rows</Badge>
              </>
            ) : (
              "Select a table to view data"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : selectedTable && tableData.length > 0 ? (
            <ScrollArea className="h-[60vh]">
              <div className="overflow-x-auto min-w-0">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col} className="text-xs whitespace-nowrap">{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, i) => (
                      <TableRow key={i}>
                        {columns.map((col) => (
                          <TableCell key={col} className="text-xs max-w-[200px] truncate">
                            {typeof row[col] === "object" ? JSON.stringify(row[col]) : String(row[col] ?? "")}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          ) : selectedTable ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No data in this table</div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Click a table on the left to browse its data
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
