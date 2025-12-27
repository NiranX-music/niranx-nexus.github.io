import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radio, Database, Plug, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import FerqXRadio from "@/components/integrations/FerqXRadio";
import TheAudioDBIntegration from "@/components/integrations/TheAudioDBIntegration";

export default function Integrations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || "radio");

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

      {/* Nexus X AI Feature Card */}
      <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-accent/10 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold gradient-text mb-1">Nexus X AI</h2>
              <p className="text-muted-foreground">
                30+ AI Models - Vision, Code, Math, Creative & more with intelligent responses
              </p>
            </div>
            <Button 
              onClick={() => navigate('/niranx/bytez-ai')}
              className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              size="lg"
            >
              <Sparkles className="h-4 w-4" />
              Open Nexus X AI
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="radio" className="gap-2">
            <Radio className="h-4 w-4" />
            FerqX Radio
          </TabsTrigger>
          <TabsTrigger value="audiodb" className="gap-2">
            <Database className="h-4 w-4" />
            TheAudioDB
          </TabsTrigger>
        </TabsList>

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
