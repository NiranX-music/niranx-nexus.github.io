import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  DropdownMenuSeparator,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Grid,
  List,
  Save,
  Plus,
  User,
  Check,
  Link,
  Copy,
} from 'lucide-react';
import { useGoogleDrive, DriveFile, DriveAccount } from '@/hooks/useGoogleDrive';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
  const { user, session } = useAuth();
  const { accountId: urlAccountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
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
    accounts,
    currentAccountId,
    switchAccount,
    disconnectAccount,
    loadAccounts,
  } = useGoogleDrive();

  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [saveToXDialogOpen, setSaveToXDialogOpen] = useState(false);
  const [fileToSave, setFileToSave] = useState<DriveFile | null>(null);
  const [isSavingToX, setIsSavingToX] = useState(false);
  const [cloudFolders, setCloudFolders] = useState<any[]>([]);
  const [selectedCloudFolder, setSelectedCloudFolder] = useState<string>('root');
  const [newCloudFolderName, setNewCloudFolderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync URL account ID with current account
  useEffect(() => {
    if (urlAccountId && accounts.length > 0 && urlAccountId !== currentAccountId) {
      const accountExists = accounts.find(a => a.id === urlAccountId);
      if (accountExists) {
        switchAccount(urlAccountId);
      } else {
        // Invalid account ID, redirect to main page
        navigate('/niranx/google-drive', { replace: true });
      }
    }
  }, [urlAccountId, accounts, currentAccountId, switchAccount, navigate]);

  // Navigate to account URL when account changes (if not already there)
  const handleAccountSwitch = (accountId: string) => {
    switchAccount(accountId);
    navigate(`/niranx/google-drive/account/${accountId}`);
  };

  const copyAccountUrl = (accountId: string) => {
    const url = `${window.location.origin}/niranx/google-drive/account/${accountId}`;
    navigator.clipboard.writeText(url);
    toast.success('Account URL copied to clipboard');
  };

  const getAccountUrl = (accountId: string) => {
    return `${window.location.origin}/niranx/google-drive/account/${accountId}`;
  };

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

  const loadCloudFolders = async () => {
    if (!user) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from('user_cloud_files').select('id, file_name').eq('user_id', user.id).eq('is_folder', true);
    setCloudFolders(data || []);
  };

  const handleSaveToX = async () => {
    if (!fileToSave || !user || !session) return;

    setIsSavingToX(true);
    try {
      // First download the file from Google Drive
      const { data, error } = await supabase.functions.invoke('google-drive', {
        body: { 
          action: 'download-file', 
          fileId: fileToSave.id, 
          mimeType: fileToSave.mimeType,
          accountId: currentAccountId,
        },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error || data?.error) {
        throw new Error(data?.error || 'Failed to download file');
      }

      // Convert base64 to blob
      const byteCharacters = atob(data.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.contentType || 'application/octet-stream' });

      // Upload to Supabase storage
      const filePath = `${user.id}/${Date.now()}-${fileToSave.name}`;
      const { error: uploadError } = await supabase.storage
        .from('my-cloud')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Determine parent folder
      let parentId: string | null = null;
      if (newCloudFolderName.trim()) {
        // Create new folder first
        const { data: folderData, error: folderError } = await supabase
          .from('user_cloud_files')
          .insert({
            user_id: user.id,
            file_name: newCloudFolderName.trim(),
            file_path: '',
            file_size: 0,
            file_type: 'folder',
            is_folder: true,
            parent_id: selectedCloudFolder === 'root' ? null : selectedCloudFolder,
          })
          .select()
          .single();
        if (!folderError && folderData) {
          parentId = folderData.id;
        }
      } else if (selectedCloudFolder !== 'root') {
        parentId = selectedCloudFolder;
      }

      // Save file reference to database
      const { error: dbError } = await supabase
        .from('user_cloud_files')
        .insert({
          user_id: user.id,
          file_name: fileToSave.name,
          file_path: filePath,
          file_size: parseInt(fileToSave.size || '0'),
          file_type: data.contentType || 'application/octet-stream',
          parent_id: parentId,
          source: 'google_drive',
          source_id: fileToSave.id,
        });

      if (dbError) throw dbError;

      toast.success(`Saved "${fileToSave.name}" to X Servers`);
      setSaveToXDialogOpen(false);
      setFileToSave(null);
      setNewCloudFolderName('');
      setSelectedCloudFolder('root');
    } catch (error: any) {
      console.error('Error saving to X:', error);
      toast.error(error.message || 'Failed to save file to X Servers');
    } finally {
      setIsSavingToX(false);
    }
  };

  const openSaveToXDialog = async (file: DriveFile) => {
    setFileToSave(file);
    await loadCloudFolders();
    setSaveToXDialogOpen(true);
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

  if (!isConnected && accounts.length === 0) {
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
              Connect your Google Drive accounts to browse, upload, download, and manage your files directly from NiranX.
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
                <Save className="h-4 w-4 text-yellow-500" />
                Save files to X Servers (My Cloud)
              </li>
              <li className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-orange-500" />
                Connect multiple Google accounts
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
          <div className="flex items-center gap-2 flex-wrap mt-1">
            {accounts.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {connectedEmail || 'Select Account'}
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center">
                      <DropdownMenuItem
                        onClick={() => handleAccountSwitch(account.id)}
                        className="flex-1 flex items-center justify-between"
                      >
                        <span className="truncate">{account.google_email}</span>
                        {account.id === currentAccountId && <Check className="h-4 w-4 ml-2 flex-shrink-0" />}
                      </DropdownMenuItem>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyAccountUrl(account.id);
                        }}
                        title="Copy account URL"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={connect}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Badge variant="secondary">{connectedEmail}</Badge>
            )}
            {currentAccountId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyAccountUrl(currentAccountId)}
                className="gap-1 text-xs text-muted-foreground"
              >
                <Link className="h-3 w-3" />
                Copy URL
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => listFiles(currentFolderId)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {accounts.length > 1 && currentAccountId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnectAccount(currentAccountId)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect Account
            </Button>
          )}
          {accounts.length <= 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={disconnect}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          )}
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

      {/* Files View */}
      <Card>
        <ScrollArea className="h-[calc(100vh-320px)]">
          <CardContent className="py-4">
            {isLoading && files.length === 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              )
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Folder className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium">This folder is empty</p>
                <p className="text-sm">Upload files or create folders to get started</p>
              </div>
            ) : viewMode === 'grid' ? (
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
                                  <>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        downloadFile(file);
                                      }}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openSaveToXDialog(file);
                                      }}
                                    >
                                      <Save className="h-4 w-4 mr-2" />
                                      Save to X Servers
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
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
            ) : (
              <>
                <div className="space-y-1">
                  {files.map((file) => {
                    const Icon = getFileIcon(file.mimeType);
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

                    return (
                      <div
                        key={file.id}
                        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => handleFileClick(file)}
                      >
                        <div className={`p-2 rounded-lg ${isFolder ? 'bg-blue-500/10 text-blue-500' : 'bg-muted'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{file.name}</p>
                        </div>
                        {!isFolder && (
                          <p className="text-xs text-muted-foreground hidden sm:block">
                            {formatFileSize(file.size)}
                          </p>
                        )}
                        {file.modifiedTime && (
                          <p className="text-xs text-muted-foreground hidden md:block">
                            {format(new Date(file.modifiedTime), 'MMM d, yyyy')}
                          </p>
                        )}
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
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadFile(file);
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openSaveToXDialog(file);
                                  }}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save to X Servers
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
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

      {/* Save to X Servers Dialog */}
      <Dialog open={saveToXDialogOpen} onOpenChange={setSaveToXDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save to X Servers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Save "{fileToSave?.name}" to your X Cloud storage
            </p>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Folder</label>
              <Select value={selectedCloudFolder} onValueChange={setSelectedCloudFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">My Cloud (Root)</SelectItem>
                  {cloudFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.file_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Or Create New Folder</label>
              <Input
                placeholder="New folder name (optional)"
                value={newCloudFolderName}
                onChange={(e) => setNewCloudFolderName(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSaveToX}
              disabled={isSavingToX}
              className="w-full"
            >
              {isSavingToX ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save to X Servers
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}