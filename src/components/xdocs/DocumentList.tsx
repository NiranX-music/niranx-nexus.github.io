import { FileText, Plus, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface Doc {
  id: string;
  title: string;
  template: string;
  updated_at: string;
}

interface DocumentListProps {
  documents: Doc[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export default function DocumentList({ documents, selectedId, onSelect, onCreate, onDelete }: DocumentListProps) {
  return (
    <div className="flex flex-col h-full border-r border-border bg-muted/20">
      <div className="p-3 border-b border-border">
        <Button onClick={onCreate} className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Document
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {documents.map(doc => (
            <button
              key={doc.id}
              onClick={() => onSelect(doc.id)}
              className={`w-full text-left p-2.5 rounded-lg transition-colors group ${
                selectedId === doc.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/60 border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-medium truncate text-foreground">{doc.title || 'Untitled'}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
              <div className="flex items-center gap-1 mt-1 ml-6 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(new Date(doc.updated_at), 'MMM d, h:mm a')}
              </div>
            </button>
          ))}
          {documents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No documents yet</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
