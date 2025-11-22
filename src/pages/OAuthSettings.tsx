import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Link2, Unlink, CheckCircle, AlertCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Identity {
  id: string;
  user_id: string;
  identity_id: string;
  provider: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
}

const OAuthSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);

  useEffect(() => {
    fetchIdentities();
  }, [user]);

  const fetchIdentities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.auth.getUserIdentities();
      
      if (error) throw error;
      
      setIdentities(data?.identities || []);
    } catch (error: any) {
      console.error("Error fetching identities:", error);
      toast({
        title: "Error",
        description: "Failed to load connected accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkProvider = async (providerId: string, providerName: string) => {
    if (identities.length <= 1) {
      toast({
        title: "Cannot Unlink",
        description: "You must have at least one authentication method. Add another method before unlinking this one.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUnlinkingProvider(providerId);
      
      // Find the identity to unlink
      const identity = identities.find(i => i.id === providerId);
      if (!identity) {
        throw new Error("Identity not found");
      }

      const { error } = await supabase.auth.unlinkIdentity(identity);

      if (error) throw error;

      toast({
        title: "Account Unlinked",
        description: `Successfully unlinked your ${providerName} account`,
      });

      // Refresh identities
      fetchIdentities();
    } catch (error: any) {
      console.error("Error unlinking provider:", error);
      toast({
        title: "Unlink Failed",
        description: error.message || `Failed to unlink ${providerName} account`,
        variant: "destructive",
      });
    } finally {
      setUnlinkingProvider(null);
    }
  };

  const handleLinkProvider = async (provider: 'google' | 'spotify') => {
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${window.location.origin}/niranx/oauth-settings`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Error linking provider:", error);
      toast({
        title: "Link Failed",
        description: error.message || `Failed to link ${provider} account`,
        variant: "destructive",
      });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case 'spotify':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1DB954">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        );
      default:
        return <Link2 className="w-5 h-5" />;
    }
  };

  const getProviderName = (provider: string) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  const isProviderLinked = (provider: string) => {
    return identities.some(identity => identity.provider === provider);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">OAuth Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your connected social accounts and authentication methods
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            View and manage the accounts you've linked for authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {identities.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No connected accounts found</p>
            </div>
          ) : (
            identities.map((identity) => (
              <div key={identity.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getProviderIcon(identity.provider)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{getProviderName(identity.provider)}</h3>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Connected
                      </Badge>
                    </div>
                    {identity.email && (
                      <p className="text-sm text-muted-foreground">{identity.email}</p>
                    )}
                    {identity.last_sign_in_at && (
                      <p className="text-xs text-muted-foreground">
                        Last used: {new Date(identity.last_sign_in_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={identities.length <= 1 || unlinkingProvider === identity.id}
                    >
                      {unlinkingProvider === identity.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Unlink className="w-4 h-4" />
                      )}
                      <span className="ml-2">Unlink</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Unlink Account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to unlink your {getProviderName(identity.provider)} account? 
                        You'll need to re-authenticate if you want to use this provider again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleUnlinkProvider(identity.id, getProviderName(identity.provider))}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Unlink Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Link Additional Accounts</CardTitle>
          <CardDescription>
            Connect more authentication methods to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isProviderLinked('google') && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleLinkProvider('google')}
            >
              {getProviderIcon('google')}
              <span className="ml-2">Link Google Account</span>
            </Button>
          )}
          {!isProviderLinked('spotify') && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleLinkProvider('spotify')}
            >
              {getProviderIcon('spotify')}
              <span className="ml-2">Link Spotify Account</span>
            </Button>
          )}
          {isProviderLinked('google') && isProviderLinked('spotify') && (
            <p className="text-center text-sm text-muted-foreground py-4">
              All available providers are already linked
            </p>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
        <Button variant="outline" onClick={() => navigate('/niranx/settings')}>
          Go to Settings
        </Button>
      </div>
    </div>
  );
};

export default OAuthSettings;
