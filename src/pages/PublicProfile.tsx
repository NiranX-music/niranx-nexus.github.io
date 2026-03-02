import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, LinkIcon, Calendar, Shield, ArrowLeft, Code, Eye } from "lucide-react";
import { format } from "date-fns";

interface PublicProfileData {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  ambition: string | null;
  is_verified: boolean | null;
  created_at: string | null;
  xp: number | null;
  level: number | null;
}

interface PersonalApp {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  html_content: string;
  css_content: string | null;
  js_content: string | null;
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [apps, setApps] = useState<PersonalApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const cleanUsername = username?.replace(/^@/, "") || "";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!cleanUsername) { setNotFound(true); setLoading(false); return; }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, username, display_name, avatar_url, bio, location, website, ambition, is_verified, created_at, xp, level")
        .eq("username", cleanUsername)
        .maybeSingle();

      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setProfile(data);

      // Fetch public apps
      const { data: appsData } = await supabase
        .from("personal_apps")
        .select("id, title, slug, description, is_public, created_at, html_content, css_content, js_content")
        .eq("user_id", data.user_id)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(6);

      if (appsData) setApps(appsData);
      setLoading(false);
    };
    fetchProfile();
  }, [cleanUsername]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading profile...</div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-8">
        <h2 className="text-2xl font-bold mb-2">User not found</h2>
        <p className="text-muted-foreground mb-4">No user with username @{cleanUsername}</p>
        <Link to="/"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Go Home</Button></Link>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Hero Banner */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10" />
      
      <div className="max-w-3xl mx-auto px-4 -mt-16 pb-12">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="pt-0">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12 md:-mt-16">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {profile?.display_name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left pb-4">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h1 className="text-2xl md:text-3xl font-bold">{profile?.display_name || cleanUsername}</h1>
                  {profile?.is_verified && (
                    <Shield className="w-5 h-5 text-primary fill-primary/20" />
                  )}
                </div>
                <p className="text-muted-foreground">@{profile?.username}</p>
                {profile?.bio && <p className="mt-2 text-sm max-w-lg">{profile.bio}</p>}
                <div className="flex flex-wrap gap-3 mt-3 justify-center md:justify-start text-sm text-muted-foreground">
                  {profile?.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location}</span>
                  )}
                  {profile?.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <LinkIcon className="w-3 h-3" />Website
                    </a>
                  )}
                  {profile?.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />Joined {format(new Date(profile.created_at), "MMM yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Stats */}
            <div className="flex gap-6 mt-4 pt-4 border-t justify-center md:justify-start">
              <div className="text-center">
                <p className="text-xl font-bold text-primary">{profile?.xp || 0}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-accent">L{profile?.level || 1}</p>
                <p className="text-xs text-muted-foreground">Level</p>
              </div>
              {profile?.ambition && (
                <div className="text-center">
                  <p className="text-sm font-semibold">{profile.ambition}</p>
                  <p className="text-xs text-muted-foreground">Goal</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Public Apps */}
        {apps.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" /> Public Apps
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.map(app => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{app.title}</CardTitle>
                    {app.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {format(new Date(app.created_at), "MMM d, yyyy")}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(
                          `data:text/html;charset=utf-8,${encodeURIComponent(
                            `<!DOCTYPE html><html><head><style>${app.css_content || ""}</style></head><body>${app.html_content}<script>${app.js_content || ""}</script></body></html>`
                          )}`,
                          "_blank"
                        )}
                      >
                        <Eye className="w-3 h-3 mr-1" /> Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
