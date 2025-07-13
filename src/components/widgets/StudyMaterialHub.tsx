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
  ZoomOut
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudyFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number;
  url: string;
  uploadedAt: string;
  category: string;
  tags: string[];
  notes?: string;
  summary?: string;
  flashcards?: Array<{
    question: string;
    answer: string;
  }>;
}

interface EmbeddedResource {
  id: string;
  title: string;
  url: string;
  type: 'youtube' | 'website' | 'spotify' | 'soundcloud';
  category: string;
  addedAt: string;
}

const StudyMaterialHub = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<StudyFile[]>([]);
  const [embeddedResources, setEmbeddedResources] = useState<EmbeddedResource[]>([]);
  const [selectedFile, setSelectedFile] = useState<StudyFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'pdf' | 'image' | 'video' | 'audio'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddResource, setShowAddResource] = useState(false);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    category: '',
    type: 'website' as EmbeddedResource['type']
  });

  // Load data from localStorage
  useEffect(() => {
    const savedFiles = localStorage.getItem('studyverse-files');
    const savedResources = localStorage.getItem('studyverse-resources');
    
    if (savedFiles) {
      try {
        setFiles(JSON.parse(savedFiles));
      } catch (error) {
        console.error('Error loading files:', error);
      }
    }
    
    if (savedResources) {
      try {
        setEmbeddedResources(JSON.parse(savedResources));
      } catch (error) {
        console.error('Error loading resources:', error);
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('studyverse-files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('studyverse-resources', JSON.stringify(embeddedResources));
  }, [embeddedResources]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        
        const fileType = getFileType(file.type, file.name);
        const newFile: StudyFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: fileType,
          size: file.size,
          url: result,
          uploadedAt: new Date().toISOString(),
          category: 'Uncategorized',
          tags: [],
          notes: ''
        };
        
        setFiles(prev => [...prev, newFile]);
        
        toast({
          title: "File Uploaded! 📁",
          description: `${file.name} has been added to your study materials`,
        });
      };
      
      reader.readAsDataURL(file);
    });
    
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

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
    toast({
      title: "File Deleted 🗑️",
      description: "File removed from your study materials",
    });
  };

  const addEmbeddedResource = () => {
    if (!newResource.title.trim() || !newResource.url.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both title and URL",
        variant: "destructive",
      });
      return;
    }

    const resource: EmbeddedResource = {
      id: Math.random().toString(36).substr(2, 9),
      title: newResource.title,
      url: newResource.url,
      type: newResource.type,
      category: newResource.category || 'General',
      addedAt: new Date().toISOString()
    };

    setEmbeddedResources(prev => [...prev, resource]);
    setNewResource({ title: '', url: '', category: '', type: 'website' });
    setShowAddResource(false);
    
    toast({
      title: "Resource Added! 🌐",
      description: `${resource.title} has been added to your resources`,
    });
  };

  const generateAISummary = async (file: StudyFile) => {
    setIsGeneratingAI(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockSummary = `This document covers key concepts related to ${file.category}. The main topics include fundamental principles, practical applications, and advanced techniques. Important points to remember for your studies.`;
      
      const mockFlashcards = [
        { question: `What is the main concept in ${file.name}?`, answer: "The fundamental principle discussed in the document." },
        { question: "What are the practical applications?", answer: "Real-world scenarios where these concepts apply." },
        { question: "What should you remember for exams?", answer: "Key formulas, definitions, and examples." }
      ];

      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, summary: mockSummary, flashcards: mockFlashcards }
          : f
      ));

      setIsGeneratingAI(false);
      
      toast({
        title: "AI Summary Generated! 🤖",
        description: "Summary and flashcards have been created",
      });
    }, 2000);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filter === 'all' || file.type === filter;
    const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const categories = Array.from(new Set([...files.map(f => f.category), ...embeddedResources.map(r => r.category)]));

  return (
    <Card className="widget">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Study Material Hub</CardTitle>
              <p className="text-sm text-muted-foreground">
                {files.length} files • {embeddedResources.length} resources
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddResource(true)}
              className="glass-button"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Add Link
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="glass-button"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search files and resources..."
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
            Support for PDFs, images, videos, audio files, and documents
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

        {/* Files Grid/List */}
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-2"
        }>
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
                    {formatFileSize(file.size)} • {file.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                  
                  {file.tags.length > 0 && (
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
                      setSelectedFile(file);
                    }}
                  >
                    <Eye className="w-4 h-4" />
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
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Embedded Resources */}
        {embeddedResources.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Embedded Resources
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {embeddedResources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{resource.title}</h5>
                      <p className="text-sm text-muted-foreground">{resource.category}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredFiles.length === 0 && embeddedResources.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No study materials found</p>
            <p className="text-sm">Upload your first file or add a resource to get started!</p>
          </div>
        )}

        {/* Add Resource Modal */}
        {showAddResource && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-md w-full p-6">
              <h4 className="font-semibold mb-4">Add External Resource</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title*</label>
                  <Input
                    value={newResource.title}
                    onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Resource title..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">URL*</label>
                  <Input
                    value={newResource.url}
                    onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={newResource.category}
                    onChange={(e) => setNewResource(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Research, Videos, Tools"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={newResource.type}
                    onValueChange={(value: any) => setNewResource(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="spotify">Spotify</SelectItem>
                      <SelectItem value="soundcloud">SoundCloud</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={addEmbeddedResource} className="flex-1">
                  Add Resource
                </Button>
                <Button variant="outline" onClick={() => setShowAddResource(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* File Viewer Modal */}
        {selectedFile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-4xl w-full h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-semibold truncate">{selectedFile.name}</h4>
                <div className="flex gap-2">
                  {selectedFile.type === 'pdf' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPdfZoom(prev => Math.min(prev + 25, 200))}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPdfZoom(prev => Math.max(prev - 25, 50))}
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4">
                {selectedFile.type === 'pdf' && (
                  <iframe
                    src={selectedFile.url}
                    className="w-full h-full border rounded-lg"
                    style={{ transform: `scale(${pdfZoom / 100})`, transformOrigin: 'top left' }}
                  />
                )}
                
                {selectedFile.type === 'image' && (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.name}
                    className="max-w-full max-h-full mx-auto rounded-lg"
                  />
                )}
                
                {selectedFile.type === 'video' && (
                  <video
                    src={selectedFile.url}
                    controls
                    className="max-w-full max-h-full mx-auto rounded-lg"
                  />
                )}
                
                {selectedFile.type === 'audio' && (
                  <div className="flex items-center justify-center h-full">
                    <audio
                      src={selectedFile.url}
                      controls
                      className="w-full max-w-md"
                    />
                  </div>
                )}

                {/* AI-Generated Content */}
                {selectedFile.summary && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      AI Summary
                    </h5>
                    <p className="text-sm">{selectedFile.summary}</p>
                  </div>
                )}

                {selectedFile.flashcards && selectedFile.flashcards.length > 0 && (
                  <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <h5 className="font-medium mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      Generated Flashcards
                    </h5>
                    <div className="space-y-3">
                      {selectedFile.flashcards.map((card, index) => (
                        <div key={index} className="p-3 bg-card rounded-lg border">
                          <p className="font-medium text-sm mb-1">Q: {card.question}</p>
                          <p className="text-sm text-muted-foreground">A: {card.answer}</p>
                        </div>
                      ))}
                    </div>
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