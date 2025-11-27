import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Download, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  BookOpen,
  Brain,
  Sparkles,
  Tag,
  Folder,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  ZoomIn,
  ZoomOut,
  Loader2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';

interface StudyFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number;
  url: string;
  category?: string;
  tags?: string[];
  notes?: string;
  summary?: string;
  flashcards?: Array<{
    question: string;
    answer: string;
  }>;
  uploaded_by?: string;
  created_at: string;
}

const StudyMaterialHub = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<StudyFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<StudyFile | null>(null);
  const [filter, setFilter] = useState<'all' | 'pdf' | 'image' | 'video' | 'audio'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load files from Supabase
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert database data to StudyFile format
      const studyFiles: StudyFile[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type as StudyFile['type'],
        size: item.size,
        url: item.url,
        category: item.category,
        tags: item.tags || [],
        notes: item.notes,
        summary: item.summary,
        flashcards: Array.isArray(item.flashcards) ? item.flashcards as Array<{question: string; answer: string}> : undefined,
        uploaded_by: item.uploaded_by,
        created_at: item.created_at
      }));

      setFiles(studyFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to load study materials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload and share study materials",
        variant: "destructive",
      });
      return;
    }
    
    for (const file of selectedFiles) {
      const fileId = Math.random().toString(36).substr(2, 9);
      setUploadingFiles(prev => new Set(prev).add(fileId));

      try {
        // Upload file to Supabase Storage
        const filePath = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('files')
          .getPublicUrl(filePath);

        // Save metadata to database
        const fileType = getFileType(file.type, file.name);
        const { data: dbData, error: dbError } = await supabase
          .from('study_materials')
          .insert({
            name: file.name,
            type: fileType,
            size: file.size,
            url: publicUrl,
            category: 'Uncategorized',
            tags: [],
            user_id: user.id,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Add to local state - convert to StudyFile format
        const newStudyFile: StudyFile = {
          id: dbData.id,
          name: dbData.name,
          type: dbData.type as StudyFile['type'],
          size: dbData.size,
          url: dbData.url,
          category: dbData.category,
          tags: dbData.tags || [],
          notes: dbData.notes,
          summary: dbData.summary,
          flashcards: Array.isArray(dbData.flashcards) ? dbData.flashcards as Array<{question: string; answer: string}> : undefined,
          uploaded_by: dbData.uploaded_by,
          created_at: dbData.created_at
        };
        setFiles(prev => [newStudyFile, ...prev]);
        
        toast({
          title: "File Uploaded! 📁",
          description: `${file.name} has been uploaded and is now visible to all users`,
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      } finally {
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileType = (mimeType: string, fileName: string): StudyFile['type'] => {
    if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('audio')) return 'audio';
    if (mimeType.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: StudyFile['type']) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-green-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      setFiles(prev => prev.filter(file => file.id !== fileId));
      if (selectedFile?.id === fileId) {
        setSelectedFile(null);
      }
      
      toast({
        title: "File Deleted 🗑️",
        description: "File removed from study materials",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  const generateAISummary = async (file: StudyFile) => {
    setIsGeneratingAI(true);
    
    // Simulate AI processing
    setTimeout(async () => {
      const mockSummary = `This document covers key concepts related to ${file.category}. The main topics include fundamental principles, practical applications, and advanced techniques. Important points to remember for your studies.`;
      
      const mockFlashcards = [
        { question: `What is the main concept in ${file.name}?`, answer: "The fundamental principle discussed in the document." },
        { question: "What are the practical applications?", answer: "Real-world scenarios where these concepts apply." },
        { question: "What should you remember for exams?", answer: "Key formulas, definitions, and examples." }
      ];

      try {
        const { error } = await supabase
          .from('study_materials')
          .update({ 
            summary: mockSummary, 
            flashcards: mockFlashcards 
          })
          .eq('id', file.id);

        if (error) throw error;

        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, summary: mockSummary, flashcards: mockFlashcards }
            : f
        ));

        toast({
          title: "AI Summary Generated! 🤖",
          description: "Summary and flashcards have been created",
        });
      } catch (error) {
        console.error('Error saving AI summary:', error);
        toast({
          title: "Error",
          description: "Failed to save AI summary",
          variant: "destructive",
        });
      }

      setIsGeneratingAI(false);
    }, 2000);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.category && file.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesType = filter === 'all' || file.type === filter;
    const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = Array.from(new Set(files.map(f => f.category).filter(Boolean)));

  if (loading) {
    return (
      <Card className="widget">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="widget">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Shared Study Materials</CardTitle>
              <p className="text-sm text-muted-foreground">
                {files.length} files shared by the community
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="glass-button"
              disabled={uploadingFiles.size > 0}
            >
              {uploadingFiles.size > 0 ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploadingFiles.size > 0 ? 'Uploading...' : 'Upload & Share'}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search shared materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pdf">PDFs</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* File Upload Area */}
        <div 
          className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const droppedFiles = Array.from(e.dataTransfer.files);
            if (fileInputRef.current) {
              const dt = new DataTransfer();
              droppedFiles.forEach(file => dt.items.add(file));
              fileInputRef.current.files = dt.files;
              handleFileUpload({ target: { files: dt.files } } as any);
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
          <p className="text-sm text-muted-foreground">
            Upload and share study materials with the entire community
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3,.wav"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
              onClick={() => setSelectedFile(file)}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  {getFileIcon(file.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{file.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)} • {file.category || 'Uncategorized'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    By {file.uploaded_by || 'Anonymous'} • {new Date(file.created_at).toLocaleDateString()}
                  </p>
                  
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {file.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.url, '_blank');
                    }}
                    title="Download/View"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {file.type === 'pdf' && !file.summary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        generateAISummary(file);
                      }}
                      disabled={isGeneratingAI}
                      title="Generate AI Summary"
                    >
                      <Brain className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.id);
                    }}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredFiles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No study materials found</p>
            <p className="text-sm">Be the first to upload and share materials with the community!</p>
          </div>
        )}

        {/* File Viewer Modal */}
        {selectedFile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{selectedFile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Uploaded by {selectedFile.uploaded_by || 'Anonymous'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedFile.url, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
              
              <div className="p-4 max-h-[70vh] overflow-auto">
                {selectedFile.type === 'image' && (
                  <img 
                    src={selectedFile.url} 
                    alt={selectedFile.name}
                    className="max-w-full h-auto rounded-lg"
                  />
                )}
                
                {selectedFile.type === 'pdf' && (
                  <iframe
                    src={selectedFile.url}
                    className="w-full h-[60vh] rounded-lg"
                    title={selectedFile.name}
                  />
                )}
                
                {selectedFile.summary && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Summary
                    </h4>
                    <p className="text-sm">{selectedFile.summary}</p>
                    
                    {selectedFile.flashcards && selectedFile.flashcards.length > 0 && (
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Flashcards</h5>
                        <div className="space-y-2">
                          {selectedFile.flashcards.map((card, index) => (
                            <div key={index} className="p-3 bg-background rounded border">
                              <p className="font-medium text-sm">{card.question}</p>
                              <p className="text-sm text-muted-foreground mt-1">{card.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudyMaterialHub;