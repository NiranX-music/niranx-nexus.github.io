import FolderFileManager from "@/components/widgets/FolderFileManager";

export default function FileHub() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">File Hub</h1>
        <p className="text-muted-foreground">
          Upload, organize, and share your study materials with folders and subfolders.
        </p>
      </div>
      
      <div className="max-w-6xl mx-auto">
        <FolderFileManager />
      </div>
    </div>
  );
}