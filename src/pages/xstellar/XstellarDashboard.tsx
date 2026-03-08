import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Database, Terminal, HardDrive, Zap, Sparkles,
  Key, ScrollText, FileCode, Globe, Code, Rocket, FolderOpen, Shield,
  Blocks, GitBranch, BarChart3
} from "lucide-react";
import { XstellarOverview } from "./XstellarOverview";
import { XstellarDatabase } from "./XstellarDatabase";
import { XstellarSQLEditor } from "./XstellarSQLEditor";
import { XstellarStorage } from "./XstellarStorage";
import { XstellarEdgeFunctions } from "./XstellarEdgeFunctions";
import { XstellarAI } from "./XstellarAI";
import { XstellarSecrets } from "./XstellarSecrets";
import { XstellarLogs } from "./XstellarLogs";
import { XstellarPageCreator } from "./XstellarPageCreator";
import { XstellarAICoder } from "./XstellarAICoder";
import { XstellarPublish } from "./XstellarPublish";
import { XstellarProjects } from "./XstellarProjects";
import { XstellarRLS } from "./XstellarRLS";
import { XstellarTemplates } from "./XstellarTemplates";
import { XstellarComponentLibrary } from "./XstellarComponentLibrary";
import { XstellarAnalytics } from "./XstellarAnalytics";
import { toast } from "@/hooks/use-toast";

export default function XstellarDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading } = useAdminCheck();
  const [activeTab, setActiveTab] = useState("overview");

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/niranx/dashboard" replace />;
  }

  const handleUseTemplate = (template: any) => {
    toast({ title: "Template loaded", description: `${template.name} applied. Switch to AI Coder or Projects to use it.` });
    setActiveTab("ai-coder");
  };

  const handleInsertComponent = (html: string, css: string) => {
    toast({ title: "Component copied", description: "Paste it into your project code." });
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "templates", label: "Templates", icon: Blocks },
    { id: "components", label: "Components", icon: Code },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "database", label: "Database", icon: Database },
    { id: "sql", label: "SQL Editor", icon: Terminal },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "edge-functions", label: "Edge Functions", icon: Zap },
    { id: "ai", label: "AI", icon: Sparkles },
    { id: "ai-coder", label: "AI Coder", icon: Code },
    { id: "rls", label: "RLS Policies", icon: Shield },
    { id: "secrets", label: "Secrets", icon: Key },
    { id: "logs", label: "Logs", icon: ScrollText },
    { id: "page-creator", label: "Page Creator", icon: FileCode },
    { id: "publish", label: "Publish", icon: Rocket },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Globe className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Xstellar</h1>
            <p className="text-sm text-muted-foreground">Developer & Infrastructure Platform</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="flex flex-nowrap gap-1 h-auto p-1 bg-muted/50 backdrop-blur-sm w-max sm:w-auto sm:flex-wrap">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5 text-xs whitespace-nowrap">
                <tab.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="overview"><XstellarOverview /></TabsContent>
        <TabsContent value="projects"><XstellarProjects /></TabsContent>
        <TabsContent value="templates"><XstellarTemplates onUseTemplate={handleUseTemplate} /></TabsContent>
        <TabsContent value="components"><XstellarComponentLibrary onInsert={handleInsertComponent} /></TabsContent>
        <TabsContent value="analytics"><XstellarAnalytics /></TabsContent>
        <TabsContent value="database"><XstellarDatabase /></TabsContent>
        <TabsContent value="sql"><XstellarSQLEditor /></TabsContent>
        <TabsContent value="storage"><XstellarStorage /></TabsContent>
        <TabsContent value="edge-functions"><XstellarEdgeFunctions /></TabsContent>
        <TabsContent value="ai"><XstellarAI /></TabsContent>
        <TabsContent value="ai-coder"><XstellarAICoder /></TabsContent>
        <TabsContent value="rls"><XstellarRLS /></TabsContent>
        <TabsContent value="secrets"><XstellarSecrets /></TabsContent>
        <TabsContent value="logs"><XstellarLogs /></TabsContent>
        <TabsContent value="page-creator"><XstellarPageCreator /></TabsContent>
        <TabsContent value="publish"><XstellarPublish /></TabsContent>
      </Tabs>
    </div>
  );
}
