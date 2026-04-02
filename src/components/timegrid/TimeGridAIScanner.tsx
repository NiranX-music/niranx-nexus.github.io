import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Brain, FileText, Sparkles, FileUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { TimeGridTask } from "@/hooks/useTimeGridTasks";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface Props {
  onTasksExtracted: (tasks: Partial<TimeGridTask>[]) => void;
}

export function TimeGridAIScanner({ onTasksExtracted }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [extractedCount, setExtractedCount] = useState(0);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const extractPdfText = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      fullText += `\n--- Page ${i} ---\n${pageText}`;
    }
    return fullText;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    if (file.type === "application/pdf") {
      setPdfLoading(true);
      try {
        const content = await extractPdfText(file);
        setText(content);
        toast.success(`Extracted text from ${file.name}`);
      } catch (err) {
        console.error("PDF extraction error:", err);
        toast.error("Failed to extract PDF text. Please paste content manually.");
      } finally {
        setPdfLoading(false);
      }
    } else {
      const content = await file.text();
      setText(content);
      toast.success(`Loaded ${file.name}`);
    }
    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  const handleScan = async () => {
    if (!text.trim()) {
      toast.error("Please provide text content to scan");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke("timegrid-ai-scanner", {
        body: { text: text.substring(0, 12000), documentType: "schedule" },
      });

      if (error) throw error;

      const tasks = data?.tasks || [];
      if (tasks.length === 0) {
        toast.info("No schedule items found in the document");
        return;
      }

      setExtractedCount(tasks.length);
      onTasksExtracted(tasks.map((t: any) => ({
        title: t.title,
        subject: t.subject || "",
        description: t.description || "",
        notes: t.notes || "",
        day_column: t.day_column || "Monday",
        time_row: t.start_time || "09:00",
        start_time: t.start_time || "09:00",
        end_time: t.end_time || "",
        duration_minutes: t.duration_minutes || 60,
        priority: t.priority || "medium",
        tags: t.tags || [],
        deadline: t.deadline ? new Date(t.deadline).toISOString() : null,
      })));

      toast.success(`Extracted ${tasks.length} tasks from document!`);
    } catch (e: any) {
      console.error("AI scan error:", e);
      toast.error("Failed to scan document: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="w-5 h-5 text-primary" />
          AI Document Scanner
          <Badge variant="secondary" className="text-[10px]">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Upload a PDF, text file, or paste any document — AI extracts tasks, times, subjects, and creates your schedule automatically.
        </p>

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".txt,.csv,.md,.pdf,.doc,.docx"
          onChange={handleFileUpload}
        />

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={pdfLoading}>
            {pdfLoading ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Reading PDF...</>
            ) : (
              <><Upload className="w-3.5 h-3.5 mr-1.5" />Upload File</>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={() => {
            setText(
              `Monday:\n9:00 AM - Physics class\n10:00 AM - Math homework\n\nTuesday:\n8:00 AM - Chemistry lab\n2:00 PM - Biology revision`
            );
            setFileName("");
          }}>
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Sample
          </Button>
        </div>

        {fileName && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
            <FileUp className="w-3 h-3" />
            <span className="truncate">{fileName}</span>
          </div>
        )}

        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste schedule text, syllabus, or timetable content here..."
          rows={5}
          className="text-xs"
        />

        <Button onClick={handleScan} disabled={loading || !text.trim()} className="w-full">
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" />Scan & Extract Tasks</>
          )}
        </Button>

        {extractedCount > 0 && (
          <p className="text-xs text-center text-primary font-medium">
            ✅ {extractedCount} tasks extracted and added to your grid!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
