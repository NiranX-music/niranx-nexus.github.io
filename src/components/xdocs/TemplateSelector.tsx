import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, BookOpen, Users, LayoutTemplate } from 'lucide-react';

const TEMPLATES = [
  { id: 'blank', name: 'Blank Document', icon: FileText, content: '', desc: 'Start fresh' },
  { id: 'essay', name: 'Essay', icon: BookOpen, content: '<h1>Essay Title</h1><h2>Introduction</h2><p>Write your thesis statement here...</p><h2>Body</h2><p>Support your argument...</p><h2>Conclusion</h2><p>Summarize your points...</p>', desc: 'Academic essay structure' },
  { id: 'report', name: 'Report', icon: LayoutTemplate, content: '<h1>Report Title</h1><p><strong>Date:</strong> </p><p><strong>Author:</strong> </p><h2>Executive Summary</h2><p></p><h2>Findings</h2><p></p><h2>Recommendations</h2><p></p>', desc: 'Professional report' },
  { id: 'meeting', name: 'Meeting Notes', icon: Users, content: '<h1>Meeting Notes</h1><p><strong>Date:</strong> </p><p><strong>Attendees:</strong> </p><h2>Agenda</h2><ul><li></li></ul><h2>Discussion</h2><p></p><h2>Action Items</h2><ul><li></li></ul>', desc: 'Meeting minutes template' },
];

interface TemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: string, content: string) => void;
}

export default function TemplateSelector({ open, onClose, onSelect }: TemplateSelectorProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Choose a Template</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => { onSelect(t.id, t.content); onClose(); }}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:bg-primary/10 hover:border-primary/30 transition-colors text-center"
            >
              <t.icon className="h-8 w-8 text-primary" />
              <span className="font-medium text-sm text-foreground">{t.name}</span>
              <span className="text-xs text-muted-foreground">{t.desc}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
