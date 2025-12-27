import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, Database, Plug, Sparkles } from "lucide-react";
import FerqXRadio from "@/components/integrations/FerqXRadio";
import TheAudioDBIntegration from "@/components/integrations/TheAudioDBIntegration";
import BytezAIChat from "@/components/integrations/BytezAIChat";

export default function Integrations() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "bytez");

  useEffect(() => {
    if (tabParam) setActiveTab(tabParam);
  }, [tabParam]);

  return (
    <div className="container mx-auto p-4 pb-32 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
          <Plug className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Integrations
          </h1>
          <p className="text-muted-foreground">Connect with external services and APIs</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="bytez" className="gap-2">
            <Sparkles className="h-4 w-4" />
            BYTEZ AI
          </TabsTrigger>
          <TabsTrigger value="radio" className="gap-2">
            <Radio className="h-4 w-4" />
            FerqX Radio
          </TabsTrigger>
          <TabsTrigger value="audiodb" className="gap-2">
            <Database className="h-4 w-4" />
            TheAudioDB
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bytez">
          <BytezAIChat />
        </TabsContent>

        <TabsContent value="radio">
          <FerqXRadio />
        </TabsContent>

        <TabsContent value="audiodb">
          <TheAudioDBIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
