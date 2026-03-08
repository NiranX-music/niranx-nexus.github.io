import { NexusShowcase } from "@/components/nexus/NexusShowcase";
import { Code } from "lucide-react";
export default function NexusDevTools() {
  return <NexusShowcase title="Dev Tools" subtitle="Developer" description="Code editors, API explorers, REST documentation, and developer utilities for building on the platform." icon={<Code className="h-8 w-8 text-primary" />} gradient="from-indigo-500/20 via-background to-blue-500/20" appLink="/niranx/api-console" highlights={["API Console", "REST Docs", "Code Playground", "API Explorer"]} features={[
    { title: "API Console", description: "Interactive API testing interface", icon: "🔧" },
    { title: "REST API Docs", description: "Complete REST API documentation", icon: "📖" },
    { title: "XAPI Explorer", description: "Browse and test 100+ free APIs", icon: "🌍" },
    { title: "Code Playground", description: "Write and test code in-browser", icon: "💻" },
    { title: "Integration Hub", description: "Connect external services", icon: "🔗" },
    { title: "Webhook Manager", description: "Configure event notifications", icon: "🔔" },
  ]} />;
}
