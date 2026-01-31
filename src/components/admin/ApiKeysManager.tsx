import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Key, CheckCircle, XCircle, RefreshCw, Search, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ApiKeyEntry {
  id: string;
  key_name: string;
  display_name: string;
  description: string | null;
  is_configured: boolean;
  last_updated: string | null;
}

export function ApiKeysManager() {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState<ApiKeyEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_api_keys_registry')
        .select('*')
        .order('display_name');

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      console.error('Error loading API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys registry',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredKeys = apiKeys.filter(key =>
    key.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.key_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (key.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const configuredCount = apiKeys.filter(k => k.is_configured).length;
  const notConfiguredCount = apiKeys.filter(k => !k.is_configured).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys Registry
            </CardTitle>
            <CardDescription>
              View and manage API keys configured in the application
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              {configuredCount} Configured
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <XCircle className="h-3 w-3" />
              {notConfiguredCount} Missing
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search API keys..."
              className="pl-10"
            />
          </div>
          <Button onClick={loadApiKeys} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredKeys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No API keys found
                  </TableCell>
                </TableRow>
              ) : (
                filteredKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{key.display_name}</p>
                        <code className="text-xs text-muted-foreground">{key.key_name}</code>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {key.description || 'No description'}
                    </TableCell>
                    <TableCell>
                      {key.is_configured ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Configured
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Not Set
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedKey(key);
                          setIsDialogOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-1">Security Note</p>
              <p>
                API keys are stored securely in Lovable Cloud secrets and cannot be viewed directly. 
                To update a key, contact the platform administrator or update it through the Lovable Cloud dashboard.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedKey?.display_name}</DialogTitle>
            <DialogDescription>
              API key details and configuration status
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Environment Variable</Label>
              <code className="block bg-muted p-2 rounded mt-1 text-sm">
                {selectedKey?.key_name}
              </code>
            </div>
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="mt-1 text-sm">
                {selectedKey?.description || 'No description provided'}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                {selectedKey?.is_configured ? (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Configured and Active
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Not Configured
                  </Badge>
                )}
              </div>
            </div>
            {selectedKey?.last_updated && (
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p className="mt-1 text-sm">
                  {new Date(selectedKey.last_updated).toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
