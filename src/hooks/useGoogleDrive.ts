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

export interface DriveAccount {
  id: string;
  google_email: string;
  account_name?: string;
  is_primary: boolean;
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
  const [accounts, setAccounts] = useState<DriveAccount[]>([]);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);

  const invokeFunction = useCallback(async (action: string, params: Record<string, any> = {}) => {
    if (!session?.access_token) {
      console.error('No session access token available');
      throw new Error('Please sign in to connect Google Drive');
    }
    
    console.log(`Invoking google-drive function with action: ${action}`);
    
    const { data, error } = await supabase.functions.invoke('google-drive', {
      body: { action, accountId: currentAccountId, ...params },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    console.log('Response:', { data, error });

    if (error) {
      console.error('Function error:', error);
      throw error;
    }
    if (data?.error) {
      console.error('Data error:', data.error);
      throw new Error(data.error);
    }
    return data;
  }, [session?.access_token, currentAccountId]);

  const loadAccounts = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await invokeFunction('list-accounts');
      setAccounts(data.accounts || []);
      
      if (data.accounts?.length > 0) {
        const primaryAccount = data.accounts.find((a: DriveAccount) => a.is_primary) || data.accounts[0];
        setCurrentAccountId(primaryAccount.id);
        setConnectedEmail(primaryAccount.google_email);
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  }, [user, invokeFunction]);

  const checkConnection = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      await loadAccounts();
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, loadAccounts]);

  useEffect(() => {
    if (session?.access_token) {
      checkConnection();
    } else {
      setIsLoading(false);
    }
  }, [checkConnection, session?.access_token]);

  const connect = useCallback(async () => {
    try {
      if (!session?.access_token) {
        toast.error('Please sign in first to connect Google Drive');
        return;
      }
      const redirectUri = `${window.location.origin}/niranx/google-drive/callback`;
      console.log('Getting auth URL with redirect:', redirectUri);
      const data = await invokeFunction('get-auth-url', { redirectUri });
      console.log('Received auth URL:', data.authUrl);
      window.location.href = data.authUrl;
    } catch (error: any) {
      console.error('Error getting auth URL:', error);
      toast.error(error.message || 'Failed to start Google Drive connection');
    }
  }, [invokeFunction, session?.access_token]);

  const handleCallback = useCallback(async (code: string): Promise<{ success: boolean; accountId?: string }> => {
    try {
      const redirectUri = `${window.location.origin}/niranx/google-drive/callback`;
      const data = await invokeFunction('exchange-code', { code, redirectUri });
      await loadAccounts();
      toast.success(`Connected to Google Drive as ${data.email}`);
      return { success: true, accountId: data.accountId };
    } catch (error: any) {
      console.error('Error exchanging code:', error);
      toast.error(error.message || 'Failed to connect to Google Drive');
      return { success: false };
    }
  }, [invokeFunction, loadAccounts]);

  const disconnect = useCallback(async () => {
    try {
      await invokeFunction('disconnect-all');
      setIsConnected(false);
      setConnectedEmail(null);
      setFiles([]);
      setCurrentFolderId(null);
      setFolderPath([{ id: null, name: 'My Drive' }]);
      setAccounts([]);
      setCurrentAccountId(null);
      toast.success('Disconnected from Google Drive');
    } catch (error: any) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect from Google Drive');
    }
  }, [invokeFunction]);

  const disconnectAccount = useCallback(async (accountId: string) => {
    try {
      await invokeFunction('disconnect', { accountId });
      await loadAccounts();
      toast.success('Disconnected account');
    } catch (error: any) {
      console.error('Error disconnecting account:', error);
      toast.error('Failed to disconnect account');
    }
  }, [invokeFunction, loadAccounts]);

  const switchAccount = useCallback((accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setCurrentAccountId(accountId);
      setConnectedEmail(account.google_email);
      setFiles([]);
      setCurrentFolderId(null);
      setFolderPath([{ id: null, name: 'My Drive' }]);
      setNextPageToken(null);
    }
  }, [accounts]);

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
          resolve(result.split(',')[1]);
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

  useEffect(() => {
    if (isConnected && currentAccountId) {
      listFiles(currentFolderId);
    }
  }, [currentFolderId, isConnected, currentAccountId]);

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
    accounts,
    currentAccountId,
    switchAccount,
    disconnectAccount,
    loadAccounts,
  };
}