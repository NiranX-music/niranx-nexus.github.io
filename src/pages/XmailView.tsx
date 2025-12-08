import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Shield, Loader2, ArrowLeft, Calendar, User } from "lucide-react";
import { format } from "date-fns";

interface PublicEmail {
  id: string;
  from_address: string;
  to_addresses: string[];
  subject: string;
  body: string;
  is_encrypted: boolean;
  created_at: string;
  sent_at: string | null;
}

const XmailView = () => {
  const { slug } = useParams();
  const [email, setEmail] = useState<PublicEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmail();
  }, [slug]);

  const fetchEmail = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("niranx_emails")
        .select("*")
        .eq("slug", slug)
        .eq("is_public", true)
        .single();

      if (fetchError) throw fetchError;
      setEmail(data as any);
    } catch (err: any) {
      setError("Email not found or is private");
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

  if (error || !email) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <Shield className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Email Not Found</h1>
        <p className="text-muted-foreground">This email doesn't exist or is set to private.</p>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Button>
        </Link>
      </div>
    );
  }

  if (email.is_encrypted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <Lock className="w-16 h-16 text-primary" />
        <h1 className="text-2xl font-bold">Encrypted Email</h1>
        <p className="text-muted-foreground">This email is encrypted and cannot be viewed publicly.</p>
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

      {/* Email Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">
                    {email.subject || "(No Subject)"}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {email.from_address.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{email.from_address}</p>
                      <p className="text-sm text-muted-foreground">
                        To: {email.to_addresses?.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(email.sent_at || email.created_at), "PPpp")}
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    Public Email
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                {email.body}
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <Button variant="outline" asChild>
              <a href={`mailto:${email.from_address}`} className="gap-2">
                <Mail className="w-4 h-4" />
                Reply to Sender
              </a>
            </Button>
            <Link to="/auth">
              <Button className="gap-2">
                <User className="w-4 h-4" />
                Create Your Xmail
              </Button>
            </Link>
          </div>
          
          {/* Info Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">About Xmail</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                Xmail is a full-featured email service by NiranX. Create your own @niranx.com 
                email address to send secure emails, schedule messages, and use your address 
                to sign up for external services worldwide.
              </p>
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

export default XmailView;
