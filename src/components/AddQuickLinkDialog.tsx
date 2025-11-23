import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, ExternalLink, Link2, Youtube, Music, Video, BookOpen, Globe, Target } from 'lucide-react';
import { getValidIconOrFallback } from '@/lib/iconValidator';

const iconOptions = [
  { name: 'ExternalLink', Icon: ExternalLink },
  { name: 'Link2', Icon: Link2 },
  { name: 'Youtube', Icon: Youtube },
  { name: 'Music', Icon: Music },
  { name: 'Video', Icon: Video },
  { name: 'BookOpen', Icon: BookOpen },
  { name: 'Globe', Icon: Globe },
  { name: 'Target', Icon: Target },
];

interface AddQuickLinkDialogProps {
  onAdd: (title: string, url: string, iconName: string) => Promise<void>;
}

export function AddQuickLinkDialog({ onAdd }: AddQuickLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [iconName, setIconName] = useState('ExternalLink');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !url.trim()) {
      return;
    }

    setLoading(true);
    try {
      const validIconName = getValidIconOrFallback(iconName);
      await onAdd(title.trim(), url.trim(), validIconName);
      
      // Reset form
      setTitle('');
      setUrl('');
      setIconName('ExternalLink');
      setOpen(false);
    } catch (error) {
      console.error('Error adding quick link:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-white hover:bg-white/10 gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Quick Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Quick Link</DialogTitle>
          <DialogDescription>
            Create a custom quick link to your favorite website or page.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., My Favorite Site"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="e.g., https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon</Label>
              <Select value={iconName} onValueChange={setIconName}>
                <SelectTrigger id="icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(({ name, Icon }) => (
                    <SelectItem key={name} value={name}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Link'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
