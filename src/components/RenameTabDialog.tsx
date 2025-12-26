import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileEdit, RotateCcw } from 'lucide-react';
import { useTabTitle } from '@/hooks/useTabTitle';
import { toast } from 'sonner';

export function RenameTabDialog() {
  const { currentTitle, customTitle, defaultTitle, setTabTitle, resetTabTitle, hasCustomTitle } = useTabTitle();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(customTitle || '');
    }
  }, [open, customTitle]);

  const handleSave = () => {
    setTabTitle(title);
    setOpen(false);
    toast.success(title.trim() ? 'Tab title updated' : 'Tab title reset to default');
  };

  const handleReset = () => {
    resetTabTitle();
    setTitle('');
    setOpen(false);
    toast.success('Tab title reset to default');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent h-9 w-9"
          title="Rename Tab"
          aria-label="Rename browser tab"
        >
          <FileEdit className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Tab</DialogTitle>
          <DialogDescription>
            Set a custom title for this page's browser tab. Leave empty to use the default title.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tab-title">Tab Title</Label>
            <Input
              id="tab-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={defaultTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Current:</span> {currentTitle}
          </div>
          {hasCustomTitle && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Default:</span> {defaultTitle}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          {hasCustomTitle && (
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
          )}
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
