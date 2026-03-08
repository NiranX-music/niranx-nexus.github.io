import { Inbox, Search, FileText, CheckSquare, FolderOpen } from "lucide-react";

interface EmptyStateProps {
  type?: "default" | "search" | "tasks" | "notes" | "files";
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const configs = {
  default: { icon: Inbox, title: "Nothing here yet", description: "Get started by adding your first item." },
  search: { icon: Search, title: "No results found", description: "Try a different search term." },
  tasks: { icon: CheckSquare, title: "No tasks yet", description: "Create your first task to get started." },
  notes: { icon: FileText, title: "No notes yet", description: "Start writing your first note." },
  files: { icon: FolderOpen, title: "No files yet", description: "Upload or create your first file." },
};

export function EmptyState({ type = "default", title, description, action }: EmptyStateProps) {
  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {title || config.title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">
        {description || config.description}
      </p>
      {action}
    </div>
  );
}
