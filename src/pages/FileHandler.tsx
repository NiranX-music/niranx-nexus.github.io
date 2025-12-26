import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { File, FileText, Image, Music, Video, Upload, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function FileHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Handle files from the File Handling API
    if ('launchQueue' in window) {
      (window as any).launchQueue.setConsumer(async (launchParams: any) => {
        if (!launchParams.files.length) return;
        
        const fileHandles = launchParams.files;
        const loadedFiles: File[] = [];
        
        for (const handle of fileHandles) {
          const file = await handle.getFile();
          loadedFiles.push(file);
        }
        
        setFiles(loadedFiles);
      });
    }
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('audio/')) return Music;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.includes('pdf') || file.type.includes('text')) return FileText;
    return File;
  };

  const handleOpenFile = (file: File) => {
    const url = URL.createObjectURL(file);
    
    if (file.type.startsWith('image/')) {
      navigate('/niranx/picture-share', { state: { imageUrl: url } });
    } else if (file.type.includes('pdf')) {
      navigate('/niranx/pdf-viewer', { state: { pdfUrl: url, fileName: file.name } });
    } else if (file.type.startsWith('audio/')) {
      // Handle audio files - could add to music player
      toast.info('Audio file received: ' + file.name);
    } else if (file.type.startsWith('video/')) {
      navigate('/niranx/video-player', { state: { videoUrl: url } });
    } else {
      // For text files, try to read content
      const reader = new FileReader();
      reader.onload = () => {
        navigate('/niranx/notes', { state: { content: reader.result, fileName: file.name } });
      };
      reader.readAsText(file);
    }
  };

  const handleUploadToCloud = async () => {
    if (!user || files.length === 0) {
      toast.error('Please sign in and select files');
      return;
    }

    setIsProcessing(true);

    try {
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
      
      toast.success('Files uploaded to My Cloud!');
      navigate('/niranx/my-cloud');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsProcessing(false);
    }
  };

  if (files.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5 text-primary" />
              File Handler
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No files received. You can open files with NiranX from your file manager.
            </p>
            <Button onClick={() => navigate('/niranx')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5 text-primary" />
              Open with NiranX
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {files.length} file(s) received. Choose an action:
            </p>

            {/* File list */}
            <div className="space-y-2">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file);
                return (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <FileIcon className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleOpenFile(file)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4">
              {files.length === 1 && (
                <Button 
                  className="w-full"
                  onClick={() => handleOpenFile(files[0])}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Open File
                </Button>
              )}
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleUploadToCloud}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Save to My Cloud
              </Button>
              
              <Button 
                variant="ghost"
                className="w-full"
                onClick={() => navigate('/niranx')}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
