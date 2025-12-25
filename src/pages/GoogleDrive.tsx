import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  HardDrive,
  Folder,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Upload,
  Download,
  Trash2,
  MoreVertical,
  FolderPlus,
  ChevronRight,
  ExternalLink,
  LogOut,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useGoogleDrive, DriveFile } from '@/hooks/useGoogleDrive';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const getFileIcon = (mimeType: string) => {
  if (mimeType === 'application/vnd.google-apps.folder') return Folder;
  if (mimeType.startsWith('image/') || mimeType === 'application/vnd.google-apps.photo') return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('pdf')) return FileText;
  return File;
};

const formatFileSize = (bytes?: string) => {
  if (!bytes) return '';
  const size = parseInt(bytes);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export default function GoogleDrive() {
  const { user } = useAuth();
  const {
    isConnected,
    connectedEmail,
    isLoading,
    files,
    folderPath,
    nextPageToken,
    connect,
    disconnect,
    openFolder,
    navigateToFolder,
    uploadFile,
    downloadFile,
    deleteFile,
    createFolder,
    loadMore,
    listFiles,
    currentFolderId,
  } = useGoogleDrive();

  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadFiles = e.target.files;
    if (!uploadFiles?.length) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(uploadFiles)) {
        await uploadFile(file);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setFolderDialogOpen(false);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    await deleteFile(fileToDelete);
    setFileToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleFileClick = (file: DriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      openFolder(file);
    } else if (file.webViewLink) {
      window.open(file.webViewLink, '_blank');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <HardDrive className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground">Please sign in to access Google Drive integration.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-lg mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mb-4">
              <HardDrive className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Connect Google Drive</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Connect your Google Drive account to browse, upload, download, and manage your files directly from NiranX.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Folder className="h-4 w-4 text-blue-500" />
                Browse and navigate your files and folders
              </li>
              <li className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-green-500" />
                Upload files directly to Google Drive
              </li>
              <li className="flex items-center gap-2">
                <Download className="h-4 w-4 text-purple-500" />
                Download files to your device
              </li>
              <li className="flex items-center gap-2">
                <FolderPlus className="h-4 w-4 text-orange-500" />
                Create and organize folders
              </li>
            </ul>
            <Button
              onClick={connect}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <HardDrive className="h-5 w-5 mr-2" />
              )}
              Connect Google Drive
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Google Drive</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Connected as <Badge variant="secondary">{connectedEmail}</Badge>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => listFiles(currentFolderId)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={disconnect}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
              {folderPath.map((folder, index) => (
                <div key={folder.id ?? 'root'} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateToFolder(index)}
                    className="whitespace-nowrap"
                  >
                    {index === 0 ? <HardDrive className="h-4 w-4 mr-1" /> : null}
                    {folder.name}
                  </Button>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                    />
                    <Button
                      onClick={handleCreateFolder}
                      disabled={isCreatingFolder || !newFolderName.trim()}
                      className="w-full"
                    >
                      {isCreatingFolder ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FolderPlus className="h-4 w-4 mr-2" />
                      )}
                      Create Folder
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <Card>
        <ScrollArea className="h-[calc(100vh-320px)]">
          <CardContent className="py-4">
            {isLoading && files.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-lg" />
                ))}
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Folder className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">This folder is empty</p>
                <p className="text-sm">Upload files or create folders to get started</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {files.map((file) => {
                    const Icon = getFileIcon(file.mimeType);
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

                    return (
                      <Card
                        key={file.id}
                        className="group cursor-pointer hover:border-primary/50 transition-all"
                        onClick={() => handleFileClick(file)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className={`p-2 rounded-lg ${isFolder ? 'bg-blue-500/10 text-blue-500' : 'bg-muted'}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate text-sm">{file.name}</p>
                                {!isFolder && (
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                    {file.modifiedTime && (
                                      <> • {format(new Date(file.modifiedTime), 'MMM d, yyyy')}</>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {file.webViewLink && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(file.webViewLink, '_blank');
                                    }}
                                  >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open in Drive
                                  </DropdownMenuItem>
                                )}
                                {!isFolder && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadFile(file);
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFileToDelete(file);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {nextPageToken && (
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {fileToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the file from your Google Drive. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
