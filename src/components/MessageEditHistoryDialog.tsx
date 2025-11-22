import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { format } from "date-fns";

interface EditHistoryEntry {
  id: string;
  previous_content: string;
  edited_by: string;
  edited_at: string;
}

interface MessageEditHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: EditHistoryEntry[];
  currentContent: string;
}

export function MessageEditHistoryDialog({ 
  open, 
  onOpenChange, 
  history,
  currentContent 
}: MessageEditHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Edit History
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[500px]">
          <div className="space-y-4">
            {/* Current Version */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="default">Current</Badge>
                <span className="text-xs text-muted-foreground">Now</span>
              </div>
              <p className="text-sm">{currentContent}</p>
            </div>

            {/* Previous Versions */}
            {history.length > 0 ? (
              history.map((entry, index) => (
                <div key={entry.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Version {history.length - index}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.edited_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{entry.previous_content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No edit history</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
