import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Share2, FileText, Image, Music, Video, Send, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function ShareTarget() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [destination, setDestination] = useState('notes');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Get shared data from URL params
    setTitle(searchParams.get('title') || '');
    setText(searchParams.get('text') || '');
    setUrl(searchParams.get('url') || '');
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('audio/')) return Music;
    if (file.type.startsWith('video/')) return Video;
    return FileText;
  };

  const handleShare = async () => {
    if (!user) {
      toast.error('Please sign in to save shared content');
      navigate('/auth');
      return;
    }

    setIsProcessing(true);

    try {
      switch (destination) {
        case 'notes':
          // Save to quick notes or tasks as notes substitute
          const noteContent = [title, text, url].filter(Boolean).join('\n\n');
          await supabase.from('tasks').insert({
            user_id: user.id,
            title: title || 'Shared Note',
            description: noteContent,
            priority: 'low',
            status: 'pending'
          });
          toast.success('Saved as note!');
          break;

        case 'tasks':
          // Save as task
          await supabase.from('tasks').insert({
            user_id: user.id,
            title: title || text || 'Shared Task',
            description: [text, url].filter(Boolean).join('\n'),
            priority: 'medium',
            status: 'pending'
          });
          toast.success('Added to tasks!');
          break;

        case 'cloud':
          // Save files to cloud storage
          if (files.length > 0) {
            for (const file of files) {
              const filePath = `${user.id}/${Date.now()}-${file.name}`;
              const { error: uploadError } = await supabase.storage
                .from('my-cloud')
                .upload(filePath, file);
              
              if (!uploadError) {
                await (supabase as any).from('user_cloud_files').insert({
                  user_id: user.id,
                  file_name: file.name,
                  file_path: filePath,
                  file_size: file.size,
                  file_type: file.type,
                  is_folder: false
                });
              }
            }
            toast.success('Files saved to My Cloud!');
          } else if (url) {
            // Save URL as a task/bookmark
            await supabase.from('tasks').insert({
              user_id: user.id,
              title: title || 'Shared Link',
              description: url,
              priority: 'low',
              status: 'pending'
            });
            toast.success('Link saved!');
          }
          break;

        case 'xflow':
          // Create XFlow post
          navigate('/niranx/xflow/create', {
            state: { 
              prefill: { 
                content: [title, text, url].filter(Boolean).join('\n\n'),
                files 
              }
            }
          });
          return;
      }

      navigate('/niranx');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to save shared content');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Share to NiranX
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Title */}
            {title && (
              <div>
                <label className="text-sm text-muted-foreground">Title</label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Title"
                />
              </div>
            )}

            {/* Text */}
            {(text || !title && !url) && (
              <div>
                <label className="text-sm text-muted-foreground">Content</label>
                <Textarea 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  placeholder="Enter content..."
                  rows={4}
                />
              </div>
            )}

            {/* URL */}
            {url && (
              <div>
                <label className="text-sm text-muted-foreground">URL</label>
                <Input 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)} 
                  placeholder="https://..."
                />
              </div>
            )}

            {/* Files */}
            {files.length > 0 && (
              <div>
                <label className="text-sm text-muted-foreground">Files</label>
                <div className="space-y-2 mt-1">
                  {files.map((file, index) => {
                    const FileIcon = getFileIcon(file);
                    return (
                      <div 
                        key={index} 
                        className="flex items-center gap-2 p-2 bg-muted rounded-lg"
                      >
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* File input for additional files */}
            <div>
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange}
                className="hidden"
                id="share-files"
              />
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('share-files')?.click()}
                className="w-full"
              >
                Add Files
              </Button>
            </div>

            {/* Destination */}
            <div>
              <label className="text-sm text-muted-foreground">Save to</label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notes">Notes</SelectItem>
                  <SelectItem value="tasks">Tasks</SelectItem>
                  <SelectItem value="cloud">My Cloud</SelectItem>
                  <SelectItem value="xflow">XFlow Post</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/niranx')}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleShare}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
