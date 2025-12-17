import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { XFlowProfile, useXFlowPosts } from "@/hooks/useXFlow";
import { supabase } from "@/integrations/supabase/client";
import { Image, Film, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface XFlowCreatePostProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: XFlowProfile;
  onPostCreated: () => void;
}

export default function XFlowCreatePost({ open, onOpenChange, currentProfile, onPostCreated }: XFlowCreatePostProps) {
  const { createPost } = useXFlowPosts();
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const file = files[0];
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    setMediaFiles([file]);
    setMediaPreviews([URL.createObjectURL(file)]);
  };

  const removeMedia = () => {
    mediaPreviews.forEach(url => URL.revokeObjectURL(url));
    setMediaFiles([]);
    setMediaPreviews([]);
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      toast.error('Add some content or media');
      return;
    }

    setIsUploading(true);

    try {
      let mediaUrls: string[] = [];

      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const fileName = `${currentProfile.id}/${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('xflow-media')
            .upload(fileName, file);

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from('xflow-media')
            .getPublicUrl(fileName);

          mediaUrls.push(urlData.publicUrl);
        }
      }

      await createPost(currentProfile.id, content.trim(), mediaUrls, mediaType);
      
      setContent("");
      removeMedia();
      onOpenChange(false);
      onPostCreated();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to create post');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">Create new post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={currentProfile.avatar_url || ''} />
              <AvatarFallback>{currentProfile.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">{currentProfile.username}</p>
              <Textarea
                placeholder="Write a caption..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-2 bg-transparent border-0 resize-none focus-visible:ring-0 p-0 min-h-[100px]"
                maxLength={2200}
              />
            </div>
          </div>

          {mediaPreviews.length > 0 && (
            <div className="relative aspect-square rounded-lg overflow-hidden">
              {mediaType === 'video' ? (
                <video src={mediaPreviews[0]} className="w-full h-full object-cover" controls />
              ) : (
                <img src={mediaPreviews[0]} alt="" className="w-full h-full object-cover" />
              )}
              <button
                onClick={removeMedia}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex gap-2">
              <label className="cursor-pointer p-2 hover:bg-white/10 rounded-lg">
                <Image className="h-6 w-6" />
                <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>
              <label className="cursor-pointer p-2 hover:bg-white/10 rounded-lg">
                <Film className="h-6 w-6" />
                <input type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
              </label>
            </div>

            <Button onClick={handleSubmit} disabled={isUploading}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
