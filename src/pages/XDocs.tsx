import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FileText, Wand2, BookOpen, Download, Upload, Share2, Loader2 } from 'lucide-react';
import ExportMenu from '@/components/xoffice/ExportMenu';
import { exportDocAsPDF, exportDocAsDOCX } from '@/utils/exportUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DocumentToolbar from '@/components/xdocs/DocumentToolbar';
import DocumentList from '@/components/xdocs/DocumentList';
import TemplateSelector from '@/components/xdocs/TemplateSelector';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface XDoc {
  id: string;
  user_id: string;
  title: string;
  content: string;
  template: string;
  is_shared: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export default function XDocs() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<XDoc[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const selectedDoc = docs.find(d => d.id === selectedId);

  const fetchDocs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('xdocs_documents')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setDocs(data as XDoc[]);
  }, [user]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  useEffect(() => {
    if (selectedDoc && editorRef.current) {
      editorRef.current.innerHTML = selectedDoc.content || '';
      setTitle(selectedDoc.title);
    }
  }, [selectedId]);

  const autoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      if (!selectedId || !editorRef.current) return;
      setSaving(true);
      const content = editorRef.current.innerHTML;
      await supabase.from('xdocs_documents').update({ content, title }).eq('id', selectedId);
      setSaving(false);
      setDocs(prev => prev.map(d => d.id === selectedId ? { ...d, content, title, updated_at: new Date().toISOString() } : d));
    }, 1500);
  }, [selectedId, title]);

  const handleCommand = (cmd: string, value?: string) => {
    if (cmd === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) document.execCommand('createLink', false, url);
    } else if (cmd === 'insertImage') {
      const url = prompt('Enter image URL:');
      if (url) document.execCommand('insertImage', false, url);
    } else if (cmd === 'insertTable') {
      const html = '<table style="border-collapse:collapse;width:100%"><tr><td style="border:1px solid;padding:8px">Cell</td><td style="border:1px solid;padding:8px">Cell</td></tr><tr><td style="border:1px solid;padding:8px">Cell</td><td style="border:1px solid;padding:8px">Cell</td></tr></table>';
      document.execCommand('insertHTML', false, html);
    } else if (cmd === 'formatBlock') {
      document.execCommand('formatBlock', false, `<${value}>`);
    } else {
      document.execCommand(cmd, false, value);
    }
    autoSave();
  };

  const createDoc = async (template = 'blank', content = '') => {
    if (!user) return;
    const { data, error } = await supabase
      .from('xdocs_documents')
      .insert({ user_id: user.id, title: 'Untitled Document', content, template })
      .select()
      .single();
    if (data) {
      setDocs(prev => [data as XDoc, ...prev]);
      setSelectedId(data.id);
      toast.success('Document created');
    }
  };

  const deleteDoc = async (id: string) => {
    await supabase.from('xdocs_documents').delete().eq('id', id);
    setDocs(prev => prev.filter(d => d.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.success('Document deleted');
  };

  const handleAI = async (mode: string) => {
    if (!editorRef.current || !selectedId) return;
    const sel = window.getSelection();
    const text = sel?.toString() || editorRef.current.innerText;
    if (!text || text.length < 10) { toast.error('Select or write some text first'); return; }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-writing-assistant', {
        body: { text, mode, provider: 'lovable', model: 'google/gemini-2.5-flash' }
      });
      if (error) throw error;
      if (data?.result) {
        if (sel?.toString()) {
          document.execCommand('insertText', false, data.result);
        } else {
          editorRef.current.innerHTML = data.result;
        }
        autoSave();
        toast.success(`AI ${mode} applied`);
      }
    } catch { toast.error('AI processing failed'); }
    setAiLoading(false);
  };

  const exportMarkdown = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${title || 'document'}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-background">
        <div className="p-2 rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">XDocs</h1>
          <p className="text-xs text-muted-foreground">Smart Document Editor</p>
        </div>
        {saving && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
          <DocumentList
            documents={docs}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={() => setShowTemplates(true)}
            onDelete={deleteDoc}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={78}>
          {selectedId ? (
            <div className="flex flex-col h-full">
              {/* Title */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
                <Input
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); autoSave(); }}
                  className="border-none text-lg font-semibold bg-transparent focus-visible:ring-0 px-0"
                  placeholder="Document title..."
                />
                <div className="flex items-center gap-1">
                  <ExportMenu options={[
                    { label: 'PDF', icon: '📄', onClick: () => exportDocAsPDF(editorRef.current?.innerHTML || '', title) },
                    { label: 'DOCX', icon: '📝', onClick: () => exportDocAsDOCX(editorRef.current?.innerHTML || '', title) },
                    { label: 'Markdown', icon: '📋', onClick: exportMarkdown },
                  ]} />
                  <Button variant="ghost" size="sm" disabled={aiLoading} onClick={() => handleAI('improve')}>
                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" disabled={aiLoading} onClick={() => handleAI('grammar')}>Grammar</Button>
                  <Button variant="ghost" size="sm" disabled={aiLoading} onClick={() => handleAI('summarize')}>Summarize</Button>
                </div>
              </div>
              <DocumentToolbar onCommand={handleCommand} />
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={autoSave}
                className="flex-1 p-6 overflow-y-auto outline-none prose prose-sm max-w-none text-foreground
                  [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
                  [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3
                  [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2
                  [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:p-2
                  [&_a]:text-primary [&_a]:underline
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
                  bg-background"
                style={{ minHeight: 400 }}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <FileText className="h-16 w-16 opacity-20" />
              <p>Select or create a document</p>
              <Button onClick={() => setShowTemplates(true)}><BookOpen className="h-4 w-4 mr-2" /> New Document</Button>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      <TemplateSelector open={showTemplates} onClose={() => setShowTemplates(false)} onSelect={(t, c) => createDoc(t, c)} />
    </div>
  );
}
