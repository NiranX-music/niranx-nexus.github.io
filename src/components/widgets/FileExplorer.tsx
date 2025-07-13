import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  File, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Download,
  Eye,
  Trash2,
  FolderOpen,
  Search,
  Filter
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  category: 'documents' | 'media' | 'images' | 'other';
  uploadDate: Date;
}

const FileExplorer = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files from localStorage
  useEffect(() => {
    const savedFiles = localStorage.getItem('studyverse-files');
    if (savedFiles) {
      try {
        const parsed = JSON.parse(savedFiles);
        // Note: File URLs would be invalid after page reload
        // In a real app, you'd use a proper file storage solution
        setFiles(parsed.map((file: any) => ({
          ...file,
          uploadDate: new Date(file.uploadDate)
        })));
      } catch (error) {
        console.error('Error loading files:', error);
      }
    }
  }, []);

  // Save files to localStorage
  useEffect(() => {
    localStorage.setItem('studyverse-files', JSON.stringify(files));
  }, [files]);

  const getFileCategory = (type: string): FileItem['category'] => {
    if (type.startsWith('image/')) return 'images';
    if (type.startsWith('video/') || type.startsWith('audio/')) return 'media';
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'documents';
    return 'other';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    setIsUploading(true);

    const newFiles: FileItem[] = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      category: getFileCategory(file.type),
      uploadDate: new Date()
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setIsUploading(false);
    
    toast({
      title: "Files Uploaded!",
      description: `Added ${newFiles.length} file(s) to your explorer`,
    });
  };

  const deleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
    toast({
      title: "File Deleted",
      description: "File removed from your explorer",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || file.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCount = (category: string) => {
    if (category === 'all') return files.length;
    return files.filter(file => file.category === category).length;
  };

  const renderFilePreview = (file: FileItem) => {
    if (file.type.startsWith('image/')) {
      return (
        <img 
          src={file.url} 
          alt={file.name}
          className="max-w-full max-h-96 object-contain rounded-lg"
        />
      );
    }
    
    if (file.type.startsWith('video/')) {
      return (
        <video 
          src={file.url} 
          controls 
          className="max-w-full max-h-96 rounded-lg"
        >
          Your browser does not support video playback.
        </video>
      );
    }
    
    if (file.type.startsWith('audio/')) {
      return (
        <audio 
          src={file.url} 
          controls 
          className="w-full"
        >
          Your browser does not support audio playback.
        </audio>
      );
    }
    
    if (file.type.includes('pdf')) {
      return (
        <iframe 
          src={file.url} 
          className="w-full h-96 rounded-lg border"
          title={file.name}
        />
      );
    }
    
    return (
      <div className="flex items-center justify-center h-48 bg-muted rounded-lg">
        <div className="text-center">
          {getFileIcon(file.type)}
          <p className="mt-2 text-sm text-muted-foreground">Preview not available</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="widget col-span-1 md:col-span-2">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">File Explorer</h3>
              <p className="text-sm text-muted-foreground">
                {files.length} file{files.length !== 1 ? 's' : ''} stored
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="glass-button"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Add Files'}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept="*/*"
        />

        {/* Categories */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="text-xs">
              All ({categoryCount('all')})
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs">
              Docs ({categoryCount('documents')})
            </TabsTrigger>
            <TabsTrigger value="images" className="text-xs">
              Images ({categoryCount('images')})
            </TabsTrigger>
            <TabsTrigger value="media" className="text-xs">
              Media ({categoryCount('media')})
            </TabsTrigger>
            <TabsTrigger value="other" className="text-xs">
              Other ({categoryCount('other')})
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <TabsContent value={activeCategory} className="space-y-4">
            {/* File Grid */}
            {filteredFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`file-preview cursor-pointer ${
                      selectedFile?.id === file.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(file);
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {file.type.startsWith('image/') && (
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="w-full h-24 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No files found</p>
                <p className="text-sm">Upload some files to get started!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* File Preview Modal */}
        {selectedFile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg max-w-4xl max-h-[90vh] overflow-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">{selectedFile.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)} • {selectedFile.uploadDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = selectedFile.url;
                      a.download = selectedFile.name;
                      a.click();
                    }}
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
              
              {renderFilePreview(selectedFile)}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FileExplorer;