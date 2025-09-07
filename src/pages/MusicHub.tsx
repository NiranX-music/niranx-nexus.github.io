import MusicPlayer from "@/components/widgets/MusicPlayer";

export default function MusicHub() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Music Hub</h1>
        <p className="text-muted-foreground">
          Upload, organize, and share your music files with the community.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <MusicPlayer />
      </div>
    </div>
  );
}