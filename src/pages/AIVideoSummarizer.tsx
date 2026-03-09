import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Video, Sparkles, Loader2, Clock, BookOpen, ListChecks } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AIVideoSummarizer = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ title: string; summary: string; keyPoints: string[]; timestamps: { time: string; topic: string }[] } | null>(null);

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match?.[1] || null;
  };

  const handleSummarize = async () => {
    if (!url.trim()) return toast.error('Please enter a YouTube URL');
    const videoId = extractVideoId(url);
    if (!videoId) return toast.error('Invalid YouTube URL');

    setLoading(true);
    setSummary(null);

    try {
      const { data, error } = await supabase.functions.invoke('ai-gateway', {
        body: {
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: `Analyze this YouTube video (ID: ${videoId}, URL: ${url}). Generate a comprehensive summary in JSON format with these fields:
              - title: The likely title/topic of the video
              - summary: A 3-4 paragraph detailed summary
              - keyPoints: Array of 5-8 key takeaways
              - timestamps: Array of objects with {time: "MM:SS", topic: "description"} for estimated key moments
              
              Return ONLY valid JSON, no markdown.`
            }
          ]
        }
      });

      if (error) throw error;

      const content = data?.choices?.[0]?.message?.content || data?.content;
      if (content) {
        try {
          const cleanJson = content.replace(/```json\n?|\n?```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          setSummary(parsed);
        } catch {
          setSummary({
            title: 'Video Analysis',
            summary: content,
            keyPoints: [],
            timestamps: []
          });
        }
      }
    } catch (err) {
      toast.error('Failed to summarize video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const videoId = extractVideoId(url);

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Video className="w-8 h-8 text-primary" />
          AI Video Summarizer
        </h1>
        <p className="text-muted-foreground">Paste a YouTube link and get AI-generated summaries with key points</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Paste YouTube URL here..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSummarize} disabled={loading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Summarize
            </Button>
          </div>

          {videoId && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                allowFullScreen
                title="YouTube video"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Analyzing video content...</p>
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {summary.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">{summary.summary}</p>
            </CardContent>
          </Card>

          {summary.keyPoints.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListChecks className="w-5 h-5 text-primary" />
                  Key Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {summary.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {summary.timestamps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  Key Moments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.timestamps.map((ts, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{ts.time}</span>
                      <span className="text-sm">{ts.topic}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AIVideoSummarizer;
