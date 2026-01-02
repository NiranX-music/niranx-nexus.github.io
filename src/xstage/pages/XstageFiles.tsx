import { useState, useEffect, useRef } from 'react';
import { useXstage } from '../contexts/XstageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { XstageFile } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Folder,
  File,
  FileAudio,
  FileImage,
  FileVideo,
  FileText,
  Upload,
  Plus,
  MoreVertical,
  Download,
  Trash2,
  Link,
  ChevronRight,
  Grid,
  List,
  ArrowLeft,
  FolderUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return File;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
  return File;
};

const getFileColor = (mimeType: string | null) => {
  if (!mimeType) return 'text-muted-foreground';
  if (mimeType.startsWith('audio/')) return 'text-fuchsia-400';
  if (mimeType.startsWith('image/')) return 'text-cyan-400';
  if (mimeType.startsWith('video/')) return 'text-purple-400';
  if (mimeType.includes('pdf')) return 'text-red-400';
  return 'text-muted-foreground';
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const XstageFiles = () => {
  const { currentProject } = useXstage();
  const { user } = useAuth();
  const [files, setFiles] = useState<XstageFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewFile, setPreviewFile] = useState<XstageFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentProject) {
      fetchFiles();
    }
  }, [currentProject, currentFolder]);

  const fetchFiles = async () => {
    if (!currentProject) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('xstage_files')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('is_folder', { ascending: false })
        .order('name', { ascending: true });

      if (currentFolder) {
        query = query.eq('parent_id', currentFolder);
      } else {
        query = query.is('parent_id', null);
      }

      const { data, error } = await query;
      if (error) throw error;

      setFiles((data || []) as XstageFile[]);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = async (folderId: string | null, folderName?: string) => {
    if (folderId === null) {
      setCurrentFolder(null);
      setBreadcrumbs([]);
    } else {
      setCurrentFolder(folderId);
      if (folderName) {
        setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName }]);
      }
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentFolder(null);
      setBreadcrumbs([]);
    } else {
      const crumb = breadcrumbs[index];
      setCurrentFolder(crumb.id);
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  };

  const handleCreateFolder = async () => {
    if (!currentProject || !user || !newFolderName.trim()) return;

    try {
      const { error } = await supabase
        .from('xstage_files')
        .insert({
          project_id: currentProject.id,
          parent_id: currentFolder,
          name: newFolderName.trim(),
          is_folder: true,
          uploaded_by: user.id,
        });

      if (error) throw error;
      
      setShowNewFolder(false);
      setNewFolderName('');
      fetchFiles();
      toast.success('Folder created');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create folder');
    }
  };

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || !currentProject || !user) return;

    const filesArray = Array.from(fileList);
    setUploading(true);
    setUploadProgress({ current: 0, total: filesArray.length });

    try {
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const filePath = `${currentProject.id}/${user.id}/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('xstage-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('xstage-files')
          .getPublicUrl(filePath);

        const { error } = await supabase
          .from('xstage_files')
          .insert({
            project_id: currentProject.id,
            parent_id: currentFolder,
            name: file.name,
            is_folder: false,
            file_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
          });

        if (error) throw error;
        setUploadProgress({ current: i + 1, total: filesArray.length });
      }

      fetchFiles();
      toast.success('Files uploaded');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !currentProject || !user) return;

    const filesArray = Array.from(e.target.files);
    if (filesArray.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: filesArray.length });

    try {
      // Extract folder structure from webkitRelativePath
      const folderMap = new Map<string, string>(); // path -> folder id
      
      // Get root folder name from first file's path
      const firstFilePath = (filesArray[0] as any).webkitRelativePath || filesArray[0].name;
      const rootFolderName = firstFilePath.split('/')[0];

      // Create the root folder
      const { data: rootFolderData, error: rootFolderError } = await supabase
        .from('xstage_files')
        .insert({
          project_id: currentProject.id,
          parent_id: currentFolder,
          name: rootFolderName,
          is_folder: true,
          uploaded_by: user.id,
        })
        .select('id')
        .single();

      if (rootFolderError) throw rootFolderError;
      folderMap.set(rootFolderName, rootFolderData.id);

      // Process each file
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const relativePath = (file as any).webkitRelativePath || file.name;
        const pathParts = relativePath.split('/');
        
        // Create intermediate folders if needed
        let parentId = currentFolder;
        for (let j = 0; j < pathParts.length - 1; j++) {
          const folderPath = pathParts.slice(0, j + 1).join('/');
          
          if (!folderMap.has(folderPath)) {
            const parentPath = j > 0 ? pathParts.slice(0, j).join('/') : null;
            const parentFolderId = parentPath ? folderMap.get(parentPath) : currentFolder;

            const { data: folderData, error: folderError } = await supabase
              .from('xstage_files')
              .insert({
                project_id: currentProject.id,
                parent_id: parentFolderId,
                name: pathParts[j],
                is_folder: true,
                uploaded_by: user.id,
              })
              .select('id')
              .single();

            if (folderError) {
              // Folder might already exist, try to fetch it
              const { data: existingFolder } = await supabase
                .from('xstage_files')
                .select('id')
                .eq('project_id', currentProject.id)
                .eq('parent_id', parentFolderId)
                .eq('name', pathParts[j])
                .eq('is_folder', true)
                .single();

              if (existingFolder) {
                folderMap.set(folderPath, existingFolder.id);
              }
            } else {
              folderMap.set(folderPath, folderData.id);
            }
          }
          parentId = folderMap.get(folderPath) || parentId;
        }

        // Upload the file
        const storagePath = `${currentProject.id}/${user.id}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('xstage-files')
          .upload(storagePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('xstage-files')
          .getPublicUrl(storagePath);

        // Get the parent folder for this file
        const fileParentPath = pathParts.slice(0, -1).join('/');
        const fileParentId = folderMap.get(fileParentPath) || currentFolder;

        const { error } = await supabase
          .from('xstage_files')
          .insert({
            project_id: currentProject.id,
            parent_id: fileParentId,
            name: file.name,
            is_folder: false,
            file_url: publicUrl,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
          });

        if (error) throw error;
        setUploadProgress({ current: i + 1, total: filesArray.length });
      }

      fetchFiles();
      toast.success(`Folder "${rootFolderName}" uploaded with ${filesArray.length} files`);
    } catch (error: any) {
      console.error('Folder upload error:', error);
      toast.error(error.message || 'Failed to upload folder');
    } finally {
      setUploading(false);
      setUploadProgress({ current: 0, total: 0 });
      // Reset the input
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (file: XstageFile) => {
    try {
      const { error } = await supabase
        .from('xstage_files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;
      fetchFiles();
      toast.success(`${file.is_folder ? 'Folder' : 'File'} deleted`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handleCopyLink = async (file: XstageFile) => {
    if (file.file_url) {
      await navigator.clipboard.writeText(file.file_url);
      toast.success('Link copied to clipboard');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const folders = files.filter(f => f.is_folder);
  const regularFiles = files.filter(f => !f.is_folder);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Files</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button variant="outline" onClick={() => setShowNewFolder(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            multiple
          />
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFolderUpload}
            className="hidden"
            {...{ webkitdirectory: '', directory: '' } as any}
            multiple
          />
          <Button 
            variant="outline" 
            onClick={() => folderInputRef.current?.click()}
            disabled={uploading}
          >
            <FolderUp className="mr-2 h-4 w-4" />
            Upload Folder
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            className="bg-gradient-to-r from-cyan-500 to-fuchsia-500"
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm">
        <button
          onClick={() => navigateToBreadcrumb(-1)}
          className="text-muted-foreground hover:text-foreground"
        >
          Files
        </button>
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.id} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => navigateToBreadcrumb(i)}
              className={cn(
                i === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Drop Zone */}
      {/* Upload Progress */}
      {uploading && uploadProgress.total > 0 && (
        <div className="bg-muted/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading files...</span>
            <span className="font-medium">{uploadProgress.current} / {uploadProgress.total}</span>
          </div>
          <Progress value={(uploadProgress.current / uploadProgress.total) * 100} className="h-2" />
        </div>
      )}

      <div
        ref={dropRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          'min-h-[400px] rounded-xl border-2 border-dashed transition-colors',
          uploading ? 'border-cyan-500 bg-cyan-500/10' : 'border-border'
        )}
      >
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
            <Upload className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Drop files here</p>
            <p className="text-sm">or click Upload to browse</p>
          </div>
        ) : (
          <div className="p-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {/* Back button */}
                {currentFolder && (
                  <button
                    onClick={() => {
                      const parentIndex = breadcrumbs.length - 2;
                      navigateToBreadcrumb(parentIndex);
                    }}
                    className="aspect-square flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Back</span>
                  </button>
                )}

                {/* Folders */}
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className="aspect-square flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer relative group"
                    onDoubleClick={() => navigateToFolder(folder.id, folder.name)}
                  >
                    <Folder className="h-10 w-10 text-amber-400 mb-2" />
                    <span className="text-sm font-medium text-center truncate w-full">{folder.name}</span>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleDelete(folder)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}

                {/* Files */}
                {regularFiles.map((file) => {
                  const Icon = getFileIcon(file.mime_type);
                  const colorClass = getFileColor(file.mime_type);

                  return (
                    <div
                      key={file.id}
                      className="aspect-square flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:bg-muted transition-colors cursor-pointer relative group"
                      onClick={() => setPreviewFile(file)}
                    >
                      <Icon className={cn('h-10 w-10 mb-2', colorClass)} />
                      <span className="text-sm font-medium text-center truncate w-full">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => window.open(file.file_url!, '_blank')}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyLink(file)}>
                            <Link className="mr-2 h-4 w-4" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(file)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {/* Back button */}
                {currentFolder && (
                  <button
                    onClick={() => {
                      const parentIndex = breadcrumbs.length - 2;
                      navigateToBreadcrumb(parentIndex);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">Back</span>
                  </button>
                )}

                {files.map((file) => {
                  const Icon = file.is_folder ? Folder : getFileIcon(file.mime_type);
                  const colorClass = file.is_folder ? 'text-amber-400' : getFileColor(file.mime_type);

                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer group"
                      onClick={() => file.is_folder ? navigateToFolder(file.id, file.name) : setPreviewFile(file)}
                    >
                      <Icon className={cn('h-5 w-5 shrink-0', colorClass)} />
                      <span className="text-sm font-medium flex-1 truncate">{file.name}</span>
                      {!file.is_folder && (
                        <span className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(file.created_at), 'MMM d, yyyy')}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {!file.is_folder && (
                            <>
                              <DropdownMenuItem onClick={() => window.open(file.file_url!, '_blank')}>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyLink(file)}>
                                <Link className="mr-2 h-4 w-4" />
                                Copy Link
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(file)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {previewFile?.mime_type?.startsWith('image/') && previewFile.file_url && (
              <img src={previewFile.file_url} alt={previewFile.name} className="max-w-full max-h-[60vh] mx-auto rounded-lg" />
            )}
            {previewFile?.mime_type?.startsWith('video/') && previewFile.file_url && (
              <video src={previewFile.file_url} controls className="max-w-full max-h-[60vh] mx-auto rounded-lg" />
            )}
            {previewFile?.mime_type?.startsWith('audio/') && previewFile.file_url && (
              <audio src={previewFile.file_url} controls className="w-full" />
            )}
            {!previewFile?.mime_type?.startsWith('image/') && 
             !previewFile?.mime_type?.startsWith('video/') && 
             !previewFile?.mime_type?.startsWith('audio/') && (
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Preview not available</p>
                <Button onClick={() => window.open(previewFile?.file_url!, '_blank')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
