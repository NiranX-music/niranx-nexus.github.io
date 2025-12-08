import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, ExternalLink, Shield, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface MailboxProfile {
  id: string;
  email_address: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  is_public_profile: boolean;
}

const XmailProfile = () => {
  const { slug } = useParams();
  const [profile, setProfile] = useState<MailboxProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [slug]);

  const fetchProfile = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("niranx_mailboxes")
        .select("*")
        .eq("slug", slug)
        .eq("is_public_profile", true)
        .single();

      if (fetchError) throw fetchError;
      setProfile(data as any);
    } catch (err: any) {
      setError("Profile not found or is private");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <Shield className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground">This profile doesn't exist or is set to private.</p>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                X
              </div>
              <span className="font-bold text-xl">Xmail</span>
            </div>
            <Link to="/niranx/mailbox">
              <Button variant="outline" size="sm" className="gap-2">
                <Mail className="w-4 h-4" />
                Open Xmail
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
            
            {/* Avatar & Info */}
            <CardContent className="pt-0 -mt-16">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {profile.display_name?.charAt(0) || profile.email_address.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold mt-4">
                  {profile.display_name || profile.email_address.split("@")[0]}
                </h1>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="gap-1">
                    <Mail className="w-3 h-3" />
                    {profile.email_address}
                  </Badge>
                </div>
                
                {profile.bio && (
                  <p className="text-muted-foreground mt-4 max-w-md">
                    {profile.bio}
                  </p>
                )}
                
                <Separator className="my-6 w-full" />
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">Joined</span>
                    <p>{format(new Date(profile.created_at), "MMMM yyyy")}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Platform</span>
                    <p>Xmail by NiranX</p>
                  </div>
                </div>
                
                <Button className="mt-6 gap-2" asChild>
                  <a href={`mailto:${profile.email_address}`}>
                    <Mail className="w-4 h-4" />
                    Send Email
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">About Xmail</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Xmail is NiranX's full-featured email service with @niranx.com addresses.
              </p>
              <p>
                Users can send and receive emails, use encryption, schedule messages, 
                and use their Xmail address to sign up for external services.
              </p>
              <Link to="/auth" className="text-primary hover:underline flex items-center gap-1">
                Create your own @niranx.com email
                <ExternalLink className="w-3 h-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Xmail by NiranX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default XmailProfile;
