import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Pen, Wand2, BookOpen, FileText, 
  Sparkles, Copy, Check, RefreshCw,
  Target, Lightbulb, MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AIProviderSelector, useAIProvider } from "@/components/ai/AIProviderSelector";

type WritingMode = "improve" | "expand" | "summarize" | "paraphrase" | "grammar" | "creative";

const writingModes: { id: WritingMode; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "improve", label: "Improve", icon: <Sparkles className="h-4 w-4" />, description: "Enhance clarity and flow" },
  { id: "expand", label: "Expand", icon: <BookOpen className="h-4 w-4" />, description: "Add more details" },
  { id: "summarize", label: "Summarize", icon: <FileText className="h-4 w-4" />, description: "Condense key points" },
  { id: "paraphrase", label: "Paraphrase", icon: <RefreshCw className="h-4 w-4" />, description: "Rewrite differently" },
  { id: "grammar", label: "Grammar", icon: <Check className="h-4 w-4" />, description: "Fix grammar issues" },
  { id: "creative", label: "Creative", icon: <Wand2 className="h-4 w-4" />, description: "Make it engaging" },
];

export default function AIWritingAssistant() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [selectedMode, setSelectedMode] = useState<WritingMode>("improve");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider("writing_assistant");

  const processText = async () => {
    if (!inputText.trim()) {
      toast({ title: "Please enter some text", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-writing-assistant", {
        body: { 
          text: inputText, 
          mode: selectedMode,
          provider,
          model
        },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast({ title: "Rate limit exceeded", description: "Please try again later", variant: "destructive" });
        } else if (error.message?.includes("402")) {
          toast({ title: "Credits required", description: "Please add credits to continue", variant: "destructive" });
        } else {
          throw error;
        }
        return;
      }

      setOutputText(data.result);
      toast({ title: "Text processed successfully!" });
    } catch (error: any) {
      console.error("Error processing text:", error);
      toast({ title: "Processing failed", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <Pen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Writing Assistant</h1>
              <p className="text-muted-foreground">Transform your writing with AI</p>
            </div>
          </div>
          <AIProviderSelector
            selectedProvider={provider}
            selectedModel={model}
            onProviderChange={setProvider}
            onModelChange={setModel}
          />
        </div>

        {/* Writing Modes */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {writingModes.map((mode) => (
                <motion.button
                  key={mode.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedMode === mode.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {mode.icon}
                    <span className="font-medium text-sm">{mode.label}</span>
                  </div>
                  <p className="text-xs opacity-80">{mode.description}</p>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Editor */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Input */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Your Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type your text here..."
                className="min-h-[300px] resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-muted-foreground">
                  {inputText.split(/\s+/).filter(Boolean).length} words
                </span>
                <Button
                  onClick={processText}
                  disabled={isProcessing || !inputText.trim()}
                  className="bg-gradient-to-r from-violet-500 to-purple-600"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  {isProcessing ? "Processing..." : "Transform"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                AI Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] p-4 rounded-lg bg-muted/30 border border-border/50">
                <AnimatePresence mode="wait">
                  {outputText ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-pre-wrap"
                    >
                      {outputText}
                    </motion.p>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-muted-foreground text-center py-20"
                    >
                      Your transformed text will appear here
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-muted-foreground">
                  {outputText.split(/\s+/).filter(Boolean).length} words
                </span>
                {outputText && (
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="border-border/50 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-violet-500 mt-0.5" />
              <div>
                <h3 className="font-medium mb-1">Pro Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use "Improve" for general enhancements to clarity and readability</li>
                  <li>• "Expand" adds more context and supporting details</li>
                  <li>• "Creative" makes your writing more engaging and vivid</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
