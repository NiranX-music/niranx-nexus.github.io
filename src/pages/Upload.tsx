import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Music, FileText, Upload as UploadIcon, Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Upload() {
  const [musicFiles, setMusicFiles] = useState<File[]>([]);
  const [studyFiles, setStudyFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'uploading' | 'success' | 'error' }>({});
  
  const musicInputRef = useRef<HTMLInputElement>(null);
  const studyInputRef = useRef<HTMLInputElement>(null);

  const handleMusicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => 
        file.type.startsWith('audio/')
      );
      setMusicFiles(prev => [...prev, ...files]);
    }
  };

  const handleStudySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => 
        file.type === 'application/pdf' || 
        file.type.startsWith('image/') ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      );
      setStudyFiles(prev => [...prev, ...files]);
    }
  };

  const uploadMusicFiles = async () => {
    if (musicFiles.length === 0) return;
    
    setUploading(true);
    const user = (await supabase.auth.getUser()).data.user;

    for (const file of musicFiles) {
      try {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }));
        
        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('music-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('music-files')
          .getPublicUrl(filePath);

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('tracks')
          .insert({
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: 'Unknown Artist',
            audio_url: publicUrl,
            duration: 0,
            uploaded_by: user?.id
          });

        if (dbError) throw dbError;

        setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }));
        toast({
          title: "Music uploaded successfully!",
          description: `${file.name} has been uploaded to Studyverse servers.`,
        });
      } catch (error) {
        console.error('Upload error:', error);
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setUploading(false);
    setTimeout(() => {
      setMusicFiles([]);
      setUploadProgress({});
      setUploadStatus({});
    }, 3000);
  };

  const uploadStudyFiles = async () => {
    if (studyFiles.length === 0) return;
    
    setUploading(true);
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload study materials",
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    for (const file of studyFiles) {
      try {
        setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }));
        
        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('study-materials')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('study-materials')
          .getPublicUrl(filePath);

        // Determine category
        let category = 'other';
        if (file.type === 'application/pdf') category = 'documents';
        else if (file.type.startsWith('image/')) category = 'images';

        // Save metadata to database
        const { error: dbError } = await supabase
          .from('study_materials')
          .insert({
            name: file.name,
            type: file.type,
            url: publicUrl,
            size: file.size,
            category: category,
            user_id: user.id,
          });

        if (dbError) throw dbError;

        setUploadStatus(prev => ({ ...prev, [file.name]: 'success' }));
        toast({
          title: "Study material uploaded successfully!",
          description: `${file.name} has been uploaded to Studyverse servers.`,
        });
      } catch (error) {
        console.error('Upload error:', error);
        setUploadStatus(prev => ({ ...prev, [file.name]: 'error' }));
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    setUploading(false);
    setTimeout(() => {
      setStudyFiles([]);
      setUploadProgress({});
      setUploadStatus({});
    }, 3000);
  };

  const removeFile = (fileName: string, type: 'music' | 'study') => {
    if (type === 'music') {
      setMusicFiles(prev => prev.filter(f => f.name !== fileName));
    } else {
      setStudyFiles(prev => prev.filter(f => f.name !== fileName));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Upload to Studyverse</h1>
        <p className="text-muted-foreground">
          Upload your music and study materials to Studyverse cloud servers
        </p>
      </div>

      <Tabs defaultValue="music" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="music" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Music Files
          </TabsTrigger>
          <TabsTrigger value="study" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Study Materials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="music">
          <Card>
            <CardHeader>
              <CardTitle>Upload Music Files</CardTitle>
              <CardDescription>
                Upload your music files to Studyverse servers. Supported formats: MP3, WAV, M4A, OGG
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="music-upload">Select Music Files</Label>
                <div className="flex gap-2">
                  <Input
                    id="music-upload"
                    type="file"
                    ref={musicInputRef}
                    multiple
                    accept="audio/*"
                    onChange={handleMusicSelect}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => musicInputRef.current?.click()}
                    variant="outline"
                  >
                    Browse
                  </Button>
                </div>
              </div>

              {musicFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Selected Files ({musicFiles.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {musicFiles.map((file) => (
                      <div key={file.name} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <Music className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                            {uploadStatus[file.name] === 'success' && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {uploadStatus[file.name] === 'error' && (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            {!uploading && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(file.name, 'music')}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                        {uploadProgress[file.name] !== undefined && (
                          <Progress value={uploadProgress[file.name]} className="h-1" />
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={uploadMusicFiles}
                    disabled={uploading}
                    className="w-full"
                    size="lg"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Upload to Studyverse
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="study">
          <Card>
            <CardHeader>
              <CardTitle>Upload Study Materials</CardTitle>
              <CardDescription>
                Upload your study materials to share with the community. Supported formats: PDF, Images, Word documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="study-upload">Select Study Files</Label>
                <div className="flex gap-2">
                  <Input
                    id="study-upload"
                    type="file"
                    ref={studyInputRef}
                    multiple
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleStudySelect}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => studyInputRef.current?.click()}
                    variant="outline"
                  >
                    Browse
                  </Button>
                </div>
              </div>

              {studyFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Selected Files ({studyFiles.length})</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {studyFiles.map((file) => (
                      <div key={file.name} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <FileText className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                            {uploadStatus[file.name] === 'success' && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {uploadStatus[file.name] === 'error' && (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            {!uploading && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(file.name, 'study')}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                        {uploadProgress[file.name] !== undefined && (
                          <Progress value={uploadProgress[file.name]} className="h-1" />
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={uploadStudyFiles}
                    disabled={uploading}
                    className="w-full"
                    size="lg"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Upload to Studyverse
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
