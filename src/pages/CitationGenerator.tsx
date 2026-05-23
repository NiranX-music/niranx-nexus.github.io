import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Copy, Plus, Trash2, FileText, Globe, Video, Newspaper, Sparkles, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderSelector, useAIProvider } from '@/components/ai/AIProviderSelector';
import { motion, AnimatePresence } from 'framer-motion';

interface Citation {
  id: string;
  type: 'book' | 'website' | 'journal' | 'video' | 'other';
  formatted: string;
  raw: Record<string, string>;
}

const CITATION_STYLES = [
  { id: 'apa7', name: 'APA 7th Edition' },
  { id: 'mla9', name: 'MLA 9th Edition' },
  { id: 'chicago', name: 'Chicago Style' },
  { id: 'harvard', name: 'Harvard' },
  { id: 'ieee', name: 'IEEE' },
  { id: 'ama', name: 'AMA' },
];

const SOURCE_TYPES = [
  { id: 'book', name: 'Book', icon: BookOpen },
  { id: 'website', name: 'Website', icon: Globe },
  { id: 'journal', name: 'Journal Article', icon: FileText },
  { id: 'video', name: 'Video', icon: Video },
  { id: 'other', name: 'Other', icon: Newspaper },
];

export default function CitationGenerator() {
  const { toast } = useToast();
  const { provider, model, setProvider, setModel } = useAIProvider('citation-generator');
  const [style, setStyle] = useState('apa7');
  const [sourceType, setSourceType] = useState<'book' | 'website' | 'journal' | 'video' | 'other'>('website');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Form fields
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [publisher, setPublisher] = useState('');
  const [accessDate, setAccessDate] = useState(new Date().toISOString().split('T')[0]);

  const generateCitation = async () => {
    if (!title.trim() && !url.trim()) {
      toast({ title: 'Please enter a title or URL', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    try {
      const styleName = CITATION_STYLES.find(s => s.id === style)?.name || style;
      
      const prompt = `Generate a properly formatted ${styleName} citation for this source:
Type: ${sourceType}
${url ? `URL: ${url}` : ''}
${title ? `Title: ${title}` : ''}
${authors ? `Authors: ${authors}` : ''}
${publishDate ? `Publication Date: ${publishDate}` : ''}
${publisher ? `Publisher/Site: ${publisher}` : ''}
Access Date: ${accessDate}

Return ONLY the formatted citation text, nothing else. Make sure it follows ${styleName} format exactly with proper italics indicated by underscores (e.g., _Title_), proper punctuation, and correct ordering of elements.`;

      let functionName = 'ai-chat';
      if (provider === 'openrouter') functionName = 'openrouter-chat';
      else if (provider === 'perplexity') functionName = 'perplexity-chat';

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          messages: [{ role: 'user', content: prompt }],
          model: model,
        },
      });

      if (error) throw error;

      const formatted = data?.choices?.[0]?.message?.content || data?.content || '';

      const newCitation: Citation = {
        id: Date.now().toString(),
        type: sourceType,
        formatted: formatted.trim(),
        raw: { url, title, authors, publishDate, publisher, accessDate },
      };

      setCitations([...citations, newCitation]);
      
      // Reset form
      setUrl('');
      setTitle('');
      setAuthors('');
      setPublishDate('');
      setPublisher('');

      toast({ title: 'Citation generated!', description: 'Added to your bibliography' });
    } catch (error) {
      console.error('Citation generation error:', error);
      toast({ title: 'Failed to generate citation', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCitation = async (citation: Citation) => {
    await navigator.clipboard.writeText(citation.formatted);
    setCopiedId(citation.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: 'Copied to clipboard!' });
  };

  const copyAllCitations = async () => {
    const allCitations = citations.map(c => c.formatted).join('\n\n');
    await navigator.clipboard.writeText(allCitations);
    toast({ title: 'All citations copied!' });
  };

  const removeCitation = (id: string) => {
    setCitations(citations.filter(c => c.id !== id));
  };

  const getSourceIcon = (type: string) => {
    const source = SOURCE_TYPES.find(s => s.id === type);
    return source ? <source.icon className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Citation Generator</h1>
          <p className="text-muted-foreground">Create perfect citations in any style</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Citation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Add Source
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AIProviderSelector
              selectedProvider={provider}
              selectedModel={model}
              onProviderChange={setProvider}
              onModelChange={setModel}
              compact
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Citation Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITATION_STYLES.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Source Type</Label>
                <Select value={sourceType} onValueChange={(v: any) => setSourceType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex items-center gap-2">
                          <s.icon className="h-4 w-4" />
                          {s.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(sourceType === 'website' || sourceType === 'video') && (
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Article or book title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Author(s)</Label>
              <Input
                placeholder="Last, First; Last, First"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Publication Date</Label>
                <Input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Publisher / Website</Label>
                <Input
                  placeholder="Publisher name"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={generateCitation} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Citation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Bibliography */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bibliography ({citations.length})</CardTitle>
            {citations.length > 0 && (
              <Button variant="outline" size="sm" onClick={copyAllCitations}>
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {citations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No citations yet</p>
                <p className="text-sm">Add sources to build your bibliography</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {citations.map((citation) => (
                    <motion.div
                      key={citation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="group relative p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-background rounded-lg">
                          {getSourceIcon(citation.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-relaxed break-words"
                             dangerouslySetInnerHTML={{ 
                               __html: DOMPurify.sanitize(
                                 citation.formatted.replace(/_([^_]+)_/g, '<em>$1</em>'),
                                 { ALLOWED_TAGS: ['em', 'i', 'b', 'strong'], ALLOWED_ATTR: [] }
                               )
                             }} 
                          />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyCitation(citation)}
                          >
                            {copiedId === citation.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeCitation(citation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
