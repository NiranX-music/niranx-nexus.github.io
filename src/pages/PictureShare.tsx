import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Upload } from "lucide-react";
import { toast } from "sonner";

interface Picture {
  id: string;
  user_id: string;
  title: string;
  caption: string;
  image_url: string;
  likes: number;
  created_at: string;
  profiles?: { username: string; avatar_url: string };
}

export default function PictureShare() {
  const { user } = useAuth();
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPicture, setNewPicture] = useState({
    title: "",
    caption: "",
    image_url: "",
  });

  useEffect(() => {
    fetchPictures();
  }, []);

  const fetchPictures = async () => {
    try {
      const { data, error } = await supabase
        .from("pictures")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPictures(data || []);
    } catch (error) {
      console.error("Error fetching pictures:", error);
      toast.error("Failed to load pictures");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUploading(true);
    try {
      const { error } = await supabase.from("pictures").insert({
        user_id: user.id,
        ...newPicture,
      });

      if (error) throw error;

      toast.success("Picture uploaded successfully!");
      setUploadOpen(false);
      setNewPicture({ title: "", caption: "", image_url: "" });
      fetchPictures();
    } catch (error) {
      console.error("Error uploading picture:", error);
      toast.error("Failed to upload picture");
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (pictureId: string) => {
    if (!user) {
      toast.error("Please login to like pictures");
      return;
    }

    try {
      const { error } = await supabase.from("picture_likes").insert({
        user_id: user.id,
        picture_id: pictureId,
      });

      if (error) throw error;
      fetchPictures();
    } catch (error) {
      console.error("Error liking picture:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Picture Share</h1>
          <p className="text-muted-foreground">Share and discover amazing pictures</p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Picture
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Picture</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <Input
                placeholder="Picture Title"
                value={newPicture.title}
                onChange={(e) => setNewPicture({ ...newPicture, title: e.target.value })}
                required
              />
              <Input
                placeholder="Image URL"
                value={newPicture.image_url}
                onChange={(e) => setNewPicture({ ...newPicture, image_url: e.target.value })}
                required
              />
              <Textarea
                placeholder="Caption"
                value={newPicture.caption}
                onChange={(e) => setNewPicture({ ...newPicture, caption: e.target.value })}
              />
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading pictures...</div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {pictures.map((picture) => (
            <Card key={picture.id} className="break-inside-avoid">
              <img
                src={picture.image_url}
                alt={picture.title}
                className="w-full h-auto"
              />
              <div className="p-4">
                {picture.title && (
                  <h3 className="font-semibold mb-2">{picture.title}</h3>
                )}
                {picture.caption && (
                  <p className="text-sm text-muted-foreground mb-4">{picture.caption}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Heart className="w-4 h-4" />
                    {picture.likes}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(picture.id)}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
