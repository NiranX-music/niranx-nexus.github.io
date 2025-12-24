import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Eye, Lock, AlertCircle, FileText, Video, Music } from "lucide-react";
import { toast } from "sonner";
import { verifyPassword } from "@/lib/passwordHashing";

interface SharedResource {
  id: string;
  title: string;
  type: string;
  file_path: string;
  permission_level: string;
  password_hash: string | null;
  is_shared: boolean;
  shared_until: string | null;
  view_count: number;
  download_count: number;
  last_accessed_at: string | null;
}

const SharedResource = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<SharedResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>("");

  useEffect(() => {
    fetchSharedResource();
  }, [token]);

  const fetchSharedResource = async () => {
    try {
      const { data, error } = await supabase
        .from("exam_resources")
        .select("*")
        .eq("share_token", token)
        .eq("is_shared", true)
        .single();

      if (error || !data) {
        toast.error("Resource not found or link has expired");
        navigate("/");
        return;
      }

      // Check if resource has expired
      if (data.shared_until && new Date(data.shared_until) < new Date()) {
        toast.error("This share link has expired");
        navigate("/");
        return;
      }

      setResource(data);
      setIsPasswordProtected(!!data.password_hash);

      // If no password protection, authenticate immediately
      if (!data.password_hash) {
        await authenticateAndTrack(data.id);
      }
    } catch (error) {
      console.error("Error fetching shared resource:", error);
      toast.error("Failed to load resource");
    } finally {
      setLoading(false);
    }
  };

  const authenticateAndTrack = async (resourceId: string) => {
    try {
      // Increment view count and update last accessed
      await supabase
        .from("exam_resources")
        .update({
          view_count: resource ? resource.view_count + 1 : 1,
          last_accessed_at: new Date().toISOString(),
        })
        .eq("id", resourceId);

      setIsAuthenticated(true);

      // Get file URL from storage
      if (resource?.file_path) {
        const { data } = supabase.storage
          .from("exam-resources")
          .getPublicUrl(resource.file_path);
        
        setFileUrl(data.publicUrl);
      }

      toast.success("Resource loaded successfully");
    } catch (error) {
      console.error("Error tracking access:", error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!resource) return;

    // Verify password using secure server-side verification
    const isValid = await verifyPassword(password, resource.password_hash || '');
    if (isValid) {
      await authenticateAndTrack(resource.id);
    } else {
      toast.error("Incorrect password");
    }
  };

  const handleDownload = async () => {
    if (!resource || resource.permission_level !== "download-allowed") {
      toast.error("Downloads are not allowed for this resource");
      return;
    }

    try {
      // Increment download count
      await supabase
        .from("exam_resources")
        .update({
          download_count: resource.download_count + 1,
        })
        .eq("id", resource.id);

      // Trigger download
      const { data, error } = await supabase.storage
        .from("exam-resources")
        .download(resource.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.title;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Download started");
    } catch (error) {
      console.error("Error downloading:", error);
      toast.error("Failed to download resource");
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("video")) return <Video className="h-12 w-12" />;
    if (type.includes("audio")) return <Music className="h-12 w-12" />;
    return <FileText className="h-12 w-12" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading resource...</div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Resource Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This resource doesn't exist or the share link has expired.
            </p>
            <Button onClick={() => navigate("/")} className="mt-4 w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isPasswordProtected && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Protected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This resource is password protected. Enter the password to view.
            </p>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
              />
            </div>
            <Button onClick={handlePasswordSubmit} className="w-full">
              Unlock Resource
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                {getFileIcon(resource.type)}
                {resource.title}
              </CardTitle>
              {resource.permission_level === "download-allowed" && (
                <Button onClick={handleDownload} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>View Only</span>
            </div>

            {resource.shared_until && (
              <div className="text-sm text-muted-foreground">
                Expires: {new Date(resource.shared_until).toLocaleDateString()}
              </div>
            )}

            {/* Resource Preview */}
            <div className="border rounded-lg p-4 bg-muted/50">
              {resource.type.includes("video") && fileUrl && (
                <video controls className="w-full rounded-lg">
                  <source src={fileUrl} type={resource.type} />
                  Your browser does not support the video tag.
                </video>
              )}
              {resource.type.includes("audio") && fileUrl && (
                <audio controls className="w-full">
                  <source src={fileUrl} type={resource.type} />
                  Your browser does not support the audio tag.
                </audio>
              )}
              {resource.type.includes("pdf") && fileUrl && (
                <iframe
                  src={fileUrl}
                  className="w-full h-[600px] rounded-lg"
                  title={resource.title}
                />
              )}
              {!resource.type.includes("video") &&
                !resource.type.includes("audio") &&
                !resource.type.includes("pdf") && (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Preview not available for this file type
                    </p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedResource;
