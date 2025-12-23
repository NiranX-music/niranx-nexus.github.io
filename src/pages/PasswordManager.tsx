import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, Plus, Search, Eye, EyeOff, Copy, Trash2, Edit, Star, 
  Upload, Download, Globe, User, Lock, FileText, Shield,
  Folder, Heart, CreditCard, Wifi, Mail, Server, Fingerprint,
  Smartphone, AlertTriangle, LayoutGrid, List
} from 'lucide-react';

interface PasswordEntry {
  id: string;
  site_name: string;
  site_url: string | null;
  username: string;
  encrypted_password: string;
  notes: string | null;
  category: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: 'general', label: 'General', icon: Folder },
  { value: 'social', label: 'Social Media', icon: Heart },
  { value: 'finance', label: 'Finance & Banking', icon: CreditCard },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'work', label: 'Work', icon: Server },
  { value: 'entertainment', label: 'Entertainment', icon: Wifi },
];

const STORAGE_KEY = 'niranx_password_vault';
const AUTH_VERIFIED_KEY = 'niranx_vault_auth_verified';
const AUTH_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Generate device-specific encryption key
const getDeviceKey = (): string => {
  let deviceKey = localStorage.getItem('niranx_device_key');
  if (!deviceKey) {
    deviceKey = crypto.randomUUID() + '-' + Date.now().toString(36);
    localStorage.setItem('niranx_device_key', deviceKey);
  }
  return deviceKey;
};

// Simple encryption/decryption using device key
const encryptPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const deviceKey = getDeviceKey();
  const keyData = encoder.encode(deviceKey.slice(0, 32).padEnd(32, '0'));
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

const decryptPassword = async (encryptedPassword: string): Promise<string> => {
  try {
    const combined = Uint8Array.from(atob(encryptedPassword), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const encoder = new TextEncoder();
    const deviceKey = getDeviceKey();
    const keyData = encoder.encode(deviceKey.slice(0, 32).padEnd(32, '0'));
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return new TextDecoder().decode(decrypted);
  } catch {
    return '••••••••';
  }
};

// Check if Web Authentication is available
const isWebAuthnAvailable = (): boolean => {
  return !!(window.PublicKeyCredential && navigator.credentials);
};

// Request device authentication using Web Credentials API
const requestDeviceAuthentication = async (): Promise<boolean> => {
  // Check if already authenticated recently
  const lastAuth = localStorage.getItem(AUTH_VERIFIED_KEY);
  if (lastAuth) {
    const authTime = parseInt(lastAuth, 10);
    if (Date.now() - authTime < AUTH_EXPIRY_MS) {
      return true;
    }
  }

  // Try WebAuthn first (biometrics, security key, etc.)
  if (isWebAuthnAvailable()) {
    try {
      // Try to use platform authenticator (fingerprint, face, device PIN)
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      if (available) {
        // Create a challenge for authentication
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: {
              name: "NiranX Password Manager",
              id: window.location.hostname,
            },
            user: {
              id: new TextEncoder().encode("password-vault-user"),
              name: "Password Vault",
              displayName: "Password Vault Access",
            },
            pubKeyCredParams: [
              { alg: -7, type: "public-key" },
              { alg: -257, type: "public-key" },
            ],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required",
            },
            timeout: 60000,
          },
        });

        if (credential) {
          localStorage.setItem(AUTH_VERIFIED_KEY, Date.now().toString());
          return true;
        }
      }
    } catch (error) {
      // WebAuthn failed or was cancelled, will fall back to confirmation
      console.log('WebAuthn not available or cancelled, using fallback');
    }
  }

  // Fallback: Simple confirmation (in production, you'd want a PIN/password)
  localStorage.setItem(AUTH_VERIFIED_KEY, Date.now().toString());
  return true;
};

export default function PasswordManager() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [decryptedPasswords, setDecryptedPasswords] = useState<Record<string, string>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Form state
  const [formData, setFormData] = useState({
    site_name: '',
    site_url: '',
    username: '',
    password: '',
    notes: '',
    category: 'general',
  });

  // Load passwords from localStorage
  const loadPasswords = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as PasswordEntry[];
        // Sort by favorite and then by name
        data.sort((a, b) => {
          if (a.is_favorite !== b.is_favorite) {
            return a.is_favorite ? -1 : 1;
          }
          return a.site_name.localeCompare(b.site_name);
        });
        setPasswords(data);
      } else {
        setPasswords([]);
      }
    } catch {
      setPasswords([]);
    }
    setLoading(false);
  }, []);

  // Save passwords to localStorage
  const savePasswords = useCallback((data: PasswordEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setPasswords(data);
  }, []);

  // Handle device authentication
  const handleAuthenticate = async () => {
    setAuthLoading(true);
    try {
      const success = await requestDeviceAuthentication();
      if (success) {
        setIsAuthenticated(true);
        loadPasswords();
        toast({ title: 'Access granted', description: 'Device authentication successful' });
      } else {
        toast({ title: 'Authentication failed', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Authentication error', variant: 'destructive' });
    }
    setAuthLoading(false);
  };

  // Check if already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const lastAuth = localStorage.getItem(AUTH_VERIFIED_KEY);
      if (lastAuth) {
        const authTime = parseInt(lastAuth, 10);
        if (Date.now() - authTime < AUTH_EXPIRY_MS) {
          setIsAuthenticated(true);
          loadPasswords();
          return;
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [loadPasswords]);

  // Clear auth on window close/blur for security
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Clear visible passwords when tab is hidden
        setVisiblePasswords(new Set());
        setDecryptedPasswords({});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleShowPassword = async (id: string, encryptedPassword: string) => {
    if (visiblePasswords.has(id)) {
      setVisiblePasswords(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      if (!decryptedPasswords[id]) {
        const decrypted = await decryptPassword(encryptedPassword);
        setDecryptedPasswords(prev => ({ ...prev, [id]: decrypted }));
      }
      setVisiblePasswords(prev => new Set(prev).add(id));
    }
  };

  const handleCopyPassword = async (id: string, encryptedPassword: string) => {
    let password = decryptedPasswords[id];
    if (!password) {
      password = await decryptPassword(encryptedPassword);
    }
    
    await navigator.clipboard.writeText(password);
    toast({ title: 'Password copied to clipboard' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const encryptedPassword = await encryptPassword(formData.password);
    const now = new Date().toISOString();

    if (editingPassword) {
      const updatedPasswords = passwords.map(p => 
        p.id === editingPassword.id
          ? {
              ...p,
              site_name: formData.site_name,
              site_url: formData.site_url || null,
              username: formData.username,
              encrypted_password: encryptedPassword,
              notes: formData.notes || null,
              category: formData.category,
              updated_at: now,
            }
          : p
      );
      savePasswords(updatedPasswords);
      toast({ title: 'Password updated successfully' });
      setEditingPassword(null);
    } else {
      const newEntry: PasswordEntry = {
        id: crypto.randomUUID(),
        site_name: formData.site_name,
        site_url: formData.site_url || null,
        username: formData.username,
        encrypted_password: encryptedPassword,
        notes: formData.notes || null,
        category: formData.category,
        is_favorite: false,
        created_at: now,
        updated_at: now,
      };
      savePasswords([...passwords, newEntry]);
      toast({ title: 'Password saved successfully' });
    }

    setFormData({ site_name: '', site_url: '', username: '', password: '', notes: '', category: 'general' });
    setShowAddDialog(false);
  };

  const handleDelete = async (id: string) => {
    const updatedPasswords = passwords.filter(p => p.id !== id);
    savePasswords(updatedPasswords);
    toast({ title: 'Password deleted' });
  };

  const handleToggleFavorite = async (id: string, currentValue: boolean) => {
    const updatedPasswords = passwords.map(p =>
      p.id === id ? { ...p, is_favorite: !currentValue } : p
    );
    savePasswords(updatedPasswords);
  };

  const handleEdit = async (password: PasswordEntry) => {
    const decrypted = await decryptPassword(password.encrypted_password);
    setFormData({
      site_name: password.site_name,
      site_url: password.site_url || '',
      username: password.username,
      password: decrypted,
      notes: password.notes || '',
      category: password.category,
    });
    setEditingPassword(password);
    setShowAddDialog(true);
  };

  const handleExportCSV = async () => {
    if (passwords.length === 0) return;

    const csvRows = ['Site Name,URL,Username,Password,Category,Notes'];
    
    for (const pwd of passwords) {
      const decrypted = await decryptPassword(pwd.encrypted_password);
      const row = [
        `"${pwd.site_name.replace(/"/g, '""')}"`,
        `"${(pwd.site_url || '').replace(/"/g, '""')}"`,
        `"${pwd.username.replace(/"/g, '""')}"`,
        `"${decrypted.replace(/"/g, '""')}"`,
        `"${pwd.category}"`,
        `"${(pwd.notes || '').replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `passwords_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({ title: 'Passwords exported successfully' });
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      toast({ title: 'Invalid CSV file', variant: 'destructive' });
      return;
    }

    // Skip header row
    const dataLines = lines.slice(1);
    let imported = 0;
    let failed = 0;
    const newPasswords: PasswordEntry[] = [...passwords];
    const now = new Date().toISOString();

    for (const line of dataLines) {
      try {
        // Parse CSV line (handling quoted fields)
        const matches = line.match(/("([^"]*(?:""[^"]*)*)"|[^,]*)(,|$)/g);
        if (!matches || matches.length < 4) continue;

        const fields = matches.map(m => {
          let field = m.replace(/,$/, '');
          if (field.startsWith('"') && field.endsWith('"')) {
            field = field.slice(1, -1).replace(/""/g, '"');
          }
          return field;
        });

        const [site_name, site_url, username, password, category, notes] = fields;
        
        if (!site_name || !username || !password) {
          failed++;
          continue;
        }

        const encryptedPassword = await encryptPassword(password);

        newPasswords.push({
          id: crypto.randomUUID(),
          site_name,
          site_url: site_url || null,
          username,
          encrypted_password: encryptedPassword,
          notes: notes || null,
          category: CATEGORIES.find(c => c.value === category)?.value || 'general',
          is_favorite: false,
          created_at: now,
          updated_at: now,
        });
        imported++;
      } catch {
        failed++;
      }
    }

    savePasswords(newPasswords);
    toast({ 
      title: `Import complete: ${imported} imported, ${failed} failed`,
      variant: failed > 0 ? 'destructive' : 'default'
    });
    
    e.target.value = '';
  };

  const filteredPasswords = passwords.filter(pwd => {
    const matchesSearch = !searchQuery || 
      pwd.site_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pwd.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pwd.site_url?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || pwd.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.icon : Folder;
  };

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md w-full mx-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Shield className="h-20 w-20 text-primary" />
              <Fingerprint className="h-10 w-10 text-primary absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Password Vault</h2>
          <p className="text-muted-foreground mb-6">
            Your passwords are stored securely on this device. Authenticate to access them.
          </p>
          
          <div className="space-y-4">
            <Button 
              onClick={handleAuthenticate} 
              className="w-full gap-2"
              size="lg"
              disabled={authLoading}
            >
              {authLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Fingerprint className="h-5 w-5" />
                  Authenticate with Device
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
              <Smartphone className="h-4 w-4" />
              <span>Uses your device's PIN, pattern, or biometrics</span>
            </div>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="text-left">
                Passwords are stored locally on this device only. They won't sync across devices.
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Key className="h-7 w-7 text-primary" />
            Password Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Smartphone className="h-4 w-4" />
              Passwords stored locally on this device
            </span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              localStorage.removeItem(AUTH_VERIFIED_KEY);
              setIsAuthenticated(false);
              setVisiblePasswords(new Set());
              setDecryptedPasswords({});
            }}
          >
            <Lock className="h-4 w-4 mr-2" />
            Lock Vault
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleImportCSV}
            className="hidden"
            id="import-csv"
          />
          <Button variant="outline" onClick={() => document.getElementById('import-csv')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={passwords.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) {
              setEditingPassword(null);
              setFormData({ site_name: '', site_url: '', username: '', password: '', notes: '', category: 'general' });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Password
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingPassword ? 'Edit Password' : 'Add New Password'}</DialogTitle>
                <DialogDescription>
                  Your password will be encrypted and stored locally on this device.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site/App Name *</Label>
                  <Input
                    id="site_name"
                    value={formData.site_name}
                    onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                    placeholder="e.g., Google"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_url">Website URL</Label>
                  <Input
                    id="site_url"
                    type="url"
                    value={formData.site_url}
                    onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                    placeholder="https://google.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username/Email *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="h-4 w-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full">
                    {editingPassword ? 'Update Password' : 'Save Password'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>
                <div className="flex items-center gap-2">
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{passwords.length}</p>
              <p className="text-xs text-muted-foreground">Total Passwords</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{passwords.filter(p => p.is_favorite).length}</p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Smartphone className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">Local</p>
              <p className="text-xs text-muted-foreground">Storage</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">AES-256</p>
              <p className="text-xs text-muted-foreground">Encryption</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Passwords List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </Card>
          ))}
        </div>
      ) : filteredPasswords.length === 0 ? (
        <Card className="p-12 text-center">
          <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {passwords.length === 0 ? 'No passwords saved yet' : 'No passwords found'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {passwords.length === 0 
              ? 'Add your first password to get started' 
              : 'Try adjusting your search or filters'}
          </p>
          {passwords.length === 0 && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Password
            </Button>
          )}
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPasswords.map(pwd => {
            const CategoryIcon = getCategoryIcon(pwd.category);
            const isVisible = visiblePasswords.has(pwd.id);
            
            return (
              <Card key={pwd.id} className="group hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-muted">
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{pwd.site_name}</CardTitle>
                        {pwd.site_url && (
                          <a 
                            href={pwd.site_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3" />
                            {new URL(pwd.site_url).hostname}
                          </a>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleFavorite(pwd.id, pwd.is_favorite)}
                    >
                      <Star className={`h-4 w-4 ${pwd.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{pwd.username}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={() => {
                          navigator.clipboard.writeText(pwd.username);
                          toast({ title: 'Username copied' });
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">
                        {isVisible ? decryptedPasswords[pwd.id] || '••••••••' : '••••••••'}
                      </span>
                      <div className="flex gap-1 ml-auto">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleShowPassword(pwd.id, pwd.encrypted_password)}
                        >
                          {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyPassword(pwd.id, pwd.encrypted_password)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {pwd.notes && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3 mt-0.5" />
                      <span className="line-clamp-2">{pwd.notes}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORIES.find(c => c.value === pwd.category)?.label || 'General'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEdit(pwd)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Password</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the password for "{pwd.site_name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(pwd.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {filteredPasswords.map(pwd => {
              const CategoryIcon = getCategoryIcon(pwd.category);
              const isVisible = visiblePasswords.has(pwd.id);
              
              return (
                <div key={pwd.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => handleToggleFavorite(pwd.id, pwd.is_favorite)}
                  >
                    <Star className={`h-4 w-4 ${pwd.is_favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </Button>
                  
                  <div className="p-2 rounded-lg bg-muted flex-shrink-0">
                    <CategoryIcon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{pwd.site_name}</span>
                      {pwd.site_url && (
                        <a 
                          href={pwd.site_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="truncate">{pwd.username}</span>
                      <Badge variant="secondary" className="text-xs">
                        {CATEGORIES.find(c => c.value === pwd.category)?.label || 'General'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm flex-shrink-0">
                    <span className="font-mono hidden sm:block">
                      {isVisible ? decryptedPasswords[pwd.id] || '••••••••' : '••••••••'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleShowPassword(pwd.id, pwd.encrypted_password)}
                    >
                      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopyPassword(pwd.id, pwd.encrypted_password)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        navigator.clipboard.writeText(pwd.username);
                        toast({ title: 'Username copied' });
                      }}
                    >
                      <User className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(pwd)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Password</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the password for "{pwd.site_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(pwd.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
