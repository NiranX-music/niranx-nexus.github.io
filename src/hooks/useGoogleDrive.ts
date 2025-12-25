import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  iconLink?: string;
  parents?: string[];
}

export interface DriveListResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

export function useGoogleDrive() {
  const { user, session } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: 'My Drive' }
  ]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const invokeFunction = useCallback(async (action: string, params: Record<string, any> = {}) => {
    if (!session?.access_token) throw new Error('Not authenticated');
    
    const { data, error } = await supabase.functions.invoke('google-drive', {
      body: { action, ...params },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  }, [session?.access_token]);

  const checkConnection = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      const data = await invokeFunction('check-connection');
      setIsConnected(data.connected);
      setConnectedEmail(data.email);
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, invokeFunction]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const connect = useCallback(async () => {
    try {
      const redirectUri = `${window.location.origin}/niranx/google-drive/callback`;
      const data = await invokeFunction('get-auth-url', { redirectUri });
      window.location.href = data.authUrl;
    } catch (error: any) {
      console.error('Error getting auth URL:', error);
      toast.error('Failed to start Google Drive connection');
    }
  }, [invokeFunction]);

  const handleCallback = useCallback(async (code: string) => {
    try {
      const redirectUri = `${window.location.origin}/niranx/google-drive/callback`;
      const data = await invokeFunction('exchange-code', { code, redirectUri });
      setIsConnected(true);
      setConnectedEmail(data.email);
      toast.success(`Connected to Google Drive as ${data.email}`);
      return true;
    } catch (error: any) {
      console.error('Error exchanging code:', error);
      toast.error(error.message || 'Failed to connect to Google Drive');
      return false;
    }
  }, [invokeFunction]);

  const disconnect = useCallback(async () => {
    try {
      await invokeFunction('disconnect');
      setIsConnected(false);
      setConnectedEmail(null);
      setFiles([]);
      setCurrentFolderId(null);
      setFolderPath([{ id: null, name: 'My Drive' }]);
      toast.success('Disconnected from Google Drive');
    } catch (error: any) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect from Google Drive');
    }
  }, [invokeFunction]);

  const listFiles = useCallback(async (folderId?: string | null, pageToken?: string) => {
    try {
      setIsLoading(true);
      const data: DriveListResponse = await invokeFunction('list-files', { 
        folderId: folderId ?? currentFolderId,
        pageToken 
      });
      
      if (pageToken) {
        setFiles(prev => [...prev, ...data.files]);
      } else {
        setFiles(data.files);
      }
      setNextPageToken(data.nextPageToken || null);
    } catch (error: any) {
      console.error('Error listing files:', error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, [invokeFunction, currentFolderId]);

  const openFolder = useCallback((folder: DriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
    setFiles([]);
    setNextPageToken(null);
  }, []);

  const navigateToFolder = useCallback((index: number) => {
    const targetFolder = folderPath[index];
    setCurrentFolderId(targetFolder.id);
    setFolderPath(prev => prev.slice(0, index + 1));
    setFiles([]);
    setNextPageToken(null);
  }, [folderPath]);

  const uploadFile = useCallback(async (file: File) => {
    try {
      const reader = new FileReader();
      const base64Content = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const data = await invokeFunction('upload-file', {
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        content: base64Content,
        folderId: currentFolderId,
      });

      toast.success(`Uploaded ${file.name}`);
      await listFiles(currentFolderId);
      return data.file;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload ${file.name}`);
      throw error;
    }
  }, [invokeFunction, currentFolderId, listFiles]);

  const downloadFile = useCallback(async (file: DriveFile) => {
    try {
      toast.info(`Downloading ${file.name}...`);
      const data = await invokeFunction('download-file', {
        fileId: file.id,
        mimeType: file.mimeType,
      });

      // Convert base64 to blob and trigger download
      const byteCharacters = atob(data.content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: data.contentType });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${file.name}`);
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.error(`Failed to download ${file.name}`);
    }
  }, [invokeFunction]);

  const deleteFile = useCallback(async (file: DriveFile) => {
    try {
      await invokeFunction('delete-file', { fileId: file.id });
      toast.success(`Deleted ${file.name}`);
      setFiles(prev => prev.filter(f => f.id !== file.id));
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error(`Failed to delete ${file.name}`);
    }
  }, [invokeFunction]);

  const createFolder = useCallback(async (folderName: string) => {
    try {
      const data = await invokeFunction('create-folder', {
        folderName,
        parentFolderId: currentFolderId,
      });
      toast.success(`Created folder: ${folderName}`);
      await listFiles(currentFolderId);
      return data.folder;
    } catch (error: any) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
      throw error;
    }
  }, [invokeFunction, currentFolderId, listFiles]);

  // Reload files when folder changes
  useEffect(() => {
    if (isConnected) {
      listFiles(currentFolderId);
    }
  }, [currentFolderId, isConnected]);

  return {
    isConnected,
    connectedEmail,
    isLoading,
    files,
    currentFolderId,
    folderPath,
    nextPageToken,
    connect,
    handleCallback,
    disconnect,
    listFiles,
    openFolder,
    navigateToFolder,
    uploadFile,
    downloadFile,
    deleteFile,
    createFolder,
    loadMore: () => listFiles(currentFolderId, nextPageToken || undefined),
  };
}
