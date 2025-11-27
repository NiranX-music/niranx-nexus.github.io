import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Download, 
  Trash2, 
  Search,
  Folder,
  FolderOpen,
  FolderPlus,
  ChevronRight,
  Home,
  ArrowLeft,
  File,
  Loader2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number;
  url: string;
  folder_path: string;
  created_at: string;
  uploaded_by?: string;
}

interface FolderNode {
  name: string;
  path: string;
  files: FileItem[];
  subfolders: FolderNode[];
}

const FolderFileManager = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

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

      const fileItems: FileItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: item.type as FileItem['type'],
        size: item.size,
        url: item.url,
        folder_path: item.folder_path || '/',
        created_at: item.created_at,
        uploaded_by: item.uploaded_by
      }));

      setFiles(fileItems);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const buildFolderTree = (): FolderNode => {
    const root: FolderNode = {
      name: 'Root',
      path: '/',
      files: [],
      subfolders: []
    };

    files.forEach(file => {
      const parts = file.folder_path.split('/').filter(p => p);
      let current = root;

      parts.forEach((part, index) => {
        const path = '/' + parts.slice(0, index + 1).join('/');
        let subfolder = current.subfolders.find(f => f.name === part);
        
        if (!subfolder) {
          subfolder = {
            name: part,
            path: path,
            files: [],
            subfolders: []
          };
          current.subfolders.push(subfolder);
        }
        current = subfolder;
      });

      current.files.push(file);
    });

    return root;
  };

  const getCurrentFolder = (): FolderNode => {
    const tree = buildFolderTree();
    if (currentPath === '/') return tree;

    const parts = currentPath.split('/').filter(p => p);
    let current = tree;

    for (const part of parts) {
      const subfolder = current.subfolders.find(f => f.name === part);
      if (!subfolder) return tree;
      current = subfolder;
    }

    return current;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files",
        variant: "destructive",
      });
      return;
    }
    
    for (const file of selectedFiles) {
      const fileId = Math.random().toString(36).substr(2, 9);
      setUploadingFiles(prev => new Set(prev).add(fileId));

      try {
        const filePath = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('files')
          .getPublicUrl(filePath);

        const fileType = getFileType(file.type, file.name);
        const { data: dbData, error: dbError } = await supabase
          .from('study_materials')
          .insert({
            name: file.name,
            type: fileType,
            size: file.size,
            url: publicUrl,
            folder_path: currentPath,
            user_id: user.id,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        const newFile: FileItem = {
          id: dbData.id,
          name: dbData.name,
          type: dbData.type as FileItem['type'],
          size: dbData.size,
          url: dbData.url,
          folder_path: dbData.folder_path || '/',
          created_at: dbData.created_at,
          uploaded_by: dbData.uploaded_by
        };
        
        setFiles(prev => [newFile, ...prev]);
        
        toast({
          title: "File Uploaded! 📁",
          description: `${file.name} uploaded to ${currentPath}`,
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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Folder name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const newPath = currentPath === '/' 
      ? `/${newFolderName}`
      : `${currentPath}/${newFolderName}`;

    // Check if folder already exists
    const folderExists = files.some(f => f.folder_path.startsWith(newPath));
    
    if (folderExists) {
      toast({
        title: "Folder Exists",
        description: "A folder with this name already exists",
        variant: "destructive",
      });
      return;
    }

    // Create a placeholder file to represent the folder
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create folders",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('study_materials')
        .insert({
          name: '.folder',
          type: 'other',
          size: 0,
          url: '',
          folder_path: newPath,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const folderFile: FileItem = {
        id: data.id,
        name: '.folder',
        type: 'other',
        size: 0,
        url: '',
        folder_path: newPath,
        created_at: data.created_at,
        uploaded_by: data.uploaded_by
      };

      setFiles(prev => [folderFile, ...prev]);
      setShowNewFolderDialog(false);
      setNewFolderName('');
      
      toast({
        title: "Folder Created! 📁",
        description: `Created ${newFolderName} in ${currentPath}`,
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create folder",
        variant: "destructive",
      });
    }
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
        title: "Deleted 🗑️",
        description: "Item removed successfully",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const getFileType = (mimeType: string, fileName: string): FileItem['type'] => {
    if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) return 'pdf';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('video')) return 'video';
    if (mimeType.includes('audio')) return 'audio';
    if (mimeType.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.doc') || fileName.endsWith('.docx')) return 'document';
    return 'other';
  };

  const getFileIcon = (type: FileItem['type']) => {
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
        return <File className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const navigateToFolder = (path: string) => {
    setCurrentPath(path);
    setSearchTerm('');
  };

  const goBack = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    setCurrentPath(parts.length === 0 ? '/' : '/' + parts.join('/'));
  };

  const currentFolder = getCurrentFolder();
  const breadcrumbs = currentPath === '/' ? ['Root'] : ['Root', ...currentPath.split('/').filter(p => p)];

  const filteredFiles = searchTerm
    ? currentFolder.files.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : currentFolder.files.filter(file => file.name !== '.folder');

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
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>File Manager</CardTitle>
              <p className="text-sm text-muted-foreground">
                {files.length} total files
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewFolderDialog(true)}
              className="glass-button"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
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
              {uploadingFiles.size > 0 ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateToFolder('/')}
            disabled={currentPath === '/'}
          >
            <Home className="w-4 h-4" />
          </Button>
          {currentPath !== '/' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center gap-1 flex-wrap">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <span className={index === breadcrumbs.length - 1 ? "font-semibold" : "text-muted-foreground"}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search in current folder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Folders */}
        {currentFolder.subfolders.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Folders</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {currentFolder.subfolders.map((folder) => (
                <div
                  key={folder.path}
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all cursor-pointer group bg-muted/30"
                  onClick={() => navigateToFolder(folder.path)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Folder className="w-8 h-8 text-primary group-hover:text-primary-glow transition-colors" />
                    <span className="text-sm font-medium text-center truncate w-full">
                      {folder.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {folder.files.filter(f => f.name !== '.folder').length} files
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {filteredFiles.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Files</h3>
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
                        {formatFileSize(file.size)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.url, '_blank');
                        }}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
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
          </div>
        )}

        {currentFolder.subfolders.length === 0 && filteredFiles.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>This folder is empty</p>
            <p className="text-sm">Upload files or create subfolders to get started</p>
          </div>
        )}
      </CardContent>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder in {currentPath}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') createFolder();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createFolder}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      {selectedFile && (
        <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedFile.name}</DialogTitle>
              <DialogDescription>
                {formatFileSize(selectedFile.size)} • {new Date(selectedFile.created_at).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-auto">
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

              {selectedFile.type === 'video' && (
                <video 
                  src={selectedFile.url} 
                  controls 
                  className="w-full rounded-lg"
                />
              )}

              {selectedFile.type === 'audio' && (
                <audio 
                  src={selectedFile.url} 
                  controls 
                  className="w-full"
                />
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => window.open(selectedFile.url, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => setSelectedFile(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default FolderFileManager;