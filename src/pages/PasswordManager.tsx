import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  Folder, Heart, CreditCard, Wifi, Mail, Server
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

// Simple encryption/decryption using user's ID as key
const encryptPassword = async (password: string, userId: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const keyData = encoder.encode(userId.slice(0, 32).padEnd(32, '0'));
  
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

const decryptPassword = async (encryptedPassword: string, userId: string): Promise<string> => {
  try {
    const combined = Uint8Array.from(atob(encryptedPassword), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(userId.slice(0, 32).padEnd(32, '0'));
    
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
  
  // Form state
  const [formData, setFormData] = useState({
    site_name: '',
    site_url: '',
    username: '',
    password: '',
    notes: '',
    category: 'general',
  });

  useEffect(() => {
    if (user) {
      fetchPasswords();
    }
  }, [user]);

  const fetchPasswords = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('password_vault')
      .select('*')
      .order('is_favorite', { ascending: false })
      .order('site_name', { ascending: true });

    if (error) {
      toast({ title: 'Error fetching passwords', variant: 'destructive' });
    } else {
      setPasswords(data || []);
    }
    setLoading(false);
  };

  const handleShowPassword = async (id: string, encryptedPassword: string) => {
    if (visiblePasswords.has(id)) {
      setVisiblePasswords(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      if (!decryptedPasswords[id] && user) {
        const decrypted = await decryptPassword(encryptedPassword, user.id);
        setDecryptedPasswords(prev => ({ ...prev, [id]: decrypted }));
      }
      setVisiblePasswords(prev => new Set(prev).add(id));
    }
  };

  const handleCopyPassword = async (id: string, encryptedPassword: string) => {
    if (!user) return;
    
    let password = decryptedPasswords[id];
    if (!password) {
      password = await decryptPassword(encryptedPassword, user.id);
    }
    
    await navigator.clipboard.writeText(password);
    toast({ title: 'Password copied to clipboard' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const encryptedPassword = await encryptPassword(formData.password, user.id);

    if (editingPassword) {
      const { error } = await supabase
        .from('password_vault')
        .update({
          site_name: formData.site_name,
          site_url: formData.site_url || null,
          username: formData.username,
          encrypted_password: encryptedPassword,
          notes: formData.notes || null,
          category: formData.category,
        })
        .eq('id', editingPassword.id);

      if (error) {
        toast({ title: 'Error updating password', variant: 'destructive' });
      } else {
        toast({ title: 'Password updated successfully' });
        setEditingPassword(null);
      }
    } else {
      const { error } = await supabase
        .from('password_vault')
        .insert({
          user_id: user.id,
          site_name: formData.site_name,
          site_url: formData.site_url || null,
          username: formData.username,
          encrypted_password: encryptedPassword,
          notes: formData.notes || null,
          category: formData.category,
        });

      if (error) {
        toast({ title: 'Error saving password', variant: 'destructive' });
      } else {
        toast({ title: 'Password saved successfully' });
      }
    }

    setFormData({ site_name: '', site_url: '', username: '', password: '', notes: '', category: 'general' });
    setShowAddDialog(false);
    fetchPasswords();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('password_vault')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting password', variant: 'destructive' });
    } else {
      toast({ title: 'Password deleted' });
      fetchPasswords();
    }
  };

  const handleToggleFavorite = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('password_vault')
      .update({ is_favorite: !currentValue })
      .eq('id', id);

    if (!error) {
      fetchPasswords();
    }
  };

  const handleEdit = async (password: PasswordEntry) => {
    if (!user) return;
    
    const decrypted = await decryptPassword(password.encrypted_password, user.id);
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
    if (!user || passwords.length === 0) return;

    const csvRows = ['Site Name,URL,Username,Password,Category,Notes'];
    
    for (const pwd of passwords) {
      const decrypted = await decryptPassword(pwd.encrypted_password, user.id);
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
    if (!user || !e.target.files?.[0]) return;

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

        const encryptedPassword = await encryptPassword(password, user.id);

        const { error } = await supabase
          .from('password_vault')
          .insert({
            user_id: user.id,
            site_name,
            site_url: site_url || null,
            username,
            encrypted_password: encryptedPassword,
            notes: notes || null,
            category: CATEGORIES.find(c => c.value === category)?.value || 'general',
          });

        if (error) {
          failed++;
        } else {
          imported++;
        }
      } catch {
        failed++;
      }
    }

    toast({ 
      title: `Import complete: ${imported} imported, ${failed} failed`,
      variant: failed > 0 ? 'destructive' : 'default'
    });
    
    fetchPasswords();
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in Required</h2>
          <p className="text-muted-foreground">Please sign in to access your password vault.</p>
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
          <p className="text-muted-foreground mt-1">Securely store and manage your passwords</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
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
                  Your password will be encrypted before storage.
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
                    placeholder="Optional notes..."
                    rows={2}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingPassword ? 'Update' : 'Save'} Password
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{passwords.length}</p>
              <p className="text-xs text-muted-foreground">Total Passwords</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{passwords.filter(p => p.is_favorite).length}</p>
              <p className="text-xs text-muted-foreground">Favorites</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Folder className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{new Set(passwords.map(p => p.category)).size}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Shield className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">AES-256</p>
              <p className="text-xs text-muted-foreground">Encryption</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
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
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Categories" />
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
      </div>

      {/* Password List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPasswords.length === 0 ? (
        <Card className="p-8 text-center">
          <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No passwords found</h3>
          <p className="text-muted-foreground mb-4">
            {passwords.length === 0 
              ? "Add your first password to get started"
              : "No passwords match your search criteria"}
          </p>
          {passwords.length === 0 && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Password
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPasswords.map((pwd) => {
            const CategoryIcon = getCategoryIcon(pwd.category);
            const isVisible = visiblePasswords.has(pwd.id);
            
            return (
              <Card key={pwd.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {pwd.site_name}
                          {pwd.is_favorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                        </h3>
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
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORIES.find(c => c.value === pwd.category)?.label || 'General'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{pwd.username}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">
                        {isVisible ? decryptedPasswords[pwd.id] || '••••••••' : '••••••••'}
                      </span>
                    </div>
                    {pwd.notes && (
                      <div className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground line-clamp-2">{pwd.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShowPassword(pwd.id, pwd.encrypted_password)}
                    >
                      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyPassword(pwd.id, pwd.encrypted_password)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(pwd.id, pwd.is_favorite)}
                    >
                      <Star className={`h-4 w-4 ${pwd.is_favorite ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(pwd)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
