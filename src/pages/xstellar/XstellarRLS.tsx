import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, ShieldCheck, ShieldAlert, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const RLS_POLICIES = [
  { table: "profiles", policies: ["Users can view own profile", "Users can update own profile", "Users can insert own profile"], enabled: true },
  { table: "tasks", policies: ["Users can CRUD own tasks"], enabled: true },
  { table: "flashcard_decks", policies: ["Users can manage own decks"], enabled: true },
  { table: "xstellar_projects", policies: ["Users can view own projects", "Users can create projects", "Admins can view all", "Published projects public"], enabled: true },
  { table: "xstellar_project_files", policies: ["Owner can manage files", "Published files readable"], enabled: true },
  { table: "admin_custom_pages", policies: ["Public read published", "Admin full access"], enabled: true },
  { table: "notifications", policies: ["Users can view own notifications"], enabled: true },
  { table: "user_roles", policies: ["Users can view own roles", "Admins can manage roles"], enabled: true },
  { table: "ai_conversations", policies: ["Users can manage own conversations"], enabled: true },
  { table: "debate_topics", policies: ["Authenticated can read", "Users can create", "Owner can update"], enabled: true },
  { table: "debate_comments", policies: ["Authenticated can read", "Users can create", "Owner can edit"], enabled: true },
  { table: "focus_sessions", policies: ["Users can manage own sessions"], enabled: true },
  { table: "study_streaks", policies: ["Users can view own streaks"], enabled: true },
  { table: "blogs", policies: ["Published blogs public", "Users can create"], enabled: true },
  { table: "chat_rooms", policies: ["Members can view", "Users can create"], enabled: true },
  { table: "chat_room_members", policies: ["Members can view", "Room creators can manage"], enabled: true },
];

export function XstellarRLS() {
  const [search, setSearch] = useState("");
  
  const filtered = RLS_POLICIES.filter(p => p.table.toLowerCase().includes(search.toLowerCase()));
  const enabledCount = filtered.filter(p => p.enabled).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{enabledCount}</p>
                <p className="text-xs text-muted-foreground">RLS Enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{filtered.length - enabledCount}</p>
                <p className="text-xs text-muted-foreground">RLS Disabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{filtered.reduce((a, p) => a + p.policies.length, 0)}</p>
                <p className="text-xs text-muted-foreground">Total Policies</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tables..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <ScrollArea className="h-[55vh]">
        <div className="space-y-3">
          {filtered.map(item => (
            <Card key={item.table}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{item.table}</span>
                    <Badge variant={item.enabled ? "default" : "destructive"} className="text-[10px] h-5">
                      {item.enabled ? "RLS ON" : "RLS OFF"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.policies.length} policies</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.policies.map(policy => (
                    <Badge key={policy} variant="outline" className="text-[10px]">{policy}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
