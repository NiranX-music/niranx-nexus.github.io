import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, Link, Image, Table, Undo, Redo, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DocumentToolbarProps {
  onCommand: (command: string, value?: string) => void;
}

const ToolBtn = ({ icon: Icon, label, cmd, value, onCommand }: { icon: any; label: string; cmd: string; value?: string; onCommand: (c: string, v?: string) => void }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCommand(cmd, value)}>
        <Icon className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom"><p className="text-xs">{label}</p></TooltipContent>
  </Tooltip>
);

export default function DocumentToolbar({ onCommand }: DocumentToolbarProps) {
  return (
    <div className="flex items-center gap-0.5 p-2 border-b border-border bg-muted/30 flex-wrap">
      <ToolBtn icon={Undo} label="Undo" cmd="undo" onCommand={onCommand} />
      <ToolBtn icon={Redo} label="Redo" cmd="redo" onCommand={onCommand} />
      <Separator orientation="vertical" className="h-6 mx-1" />
      <ToolBtn icon={Heading1} label="Heading 1" cmd="formatBlock" value="h1" onCommand={onCommand} />
      <ToolBtn icon={Heading2} label="Heading 2" cmd="formatBlock" value="h2" onCommand={onCommand} />
      <ToolBtn icon={Heading3} label="Heading 3" cmd="formatBlock" value="h3" onCommand={onCommand} />
      <ToolBtn icon={Type} label="Paragraph" cmd="formatBlock" value="p" onCommand={onCommand} />
      <Separator orientation="vertical" className="h-6 mx-1" />
      <ToolBtn icon={Bold} label="Bold" cmd="bold" onCommand={onCommand} />
      <ToolBtn icon={Italic} label="Italic" cmd="italic" onCommand={onCommand} />
      <ToolBtn icon={Underline} label="Underline" cmd="underline" onCommand={onCommand} />
      <ToolBtn icon={Strikethrough} label="Strikethrough" cmd="strikeThrough" onCommand={onCommand} />
      <Separator orientation="vertical" className="h-6 mx-1" />
      <ToolBtn icon={AlignLeft} label="Align Left" cmd="justifyLeft" onCommand={onCommand} />
      <ToolBtn icon={AlignCenter} label="Center" cmd="justifyCenter" onCommand={onCommand} />
      <ToolBtn icon={AlignRight} label="Align Right" cmd="justifyRight" onCommand={onCommand} />
      <Separator orientation="vertical" className="h-6 mx-1" />
      <ToolBtn icon={List} label="Bullet List" cmd="insertUnorderedList" onCommand={onCommand} />
      <ToolBtn icon={ListOrdered} label="Numbered List" cmd="insertOrderedList" onCommand={onCommand} />
      <Separator orientation="vertical" className="h-6 mx-1" />
      <ToolBtn icon={Link} label="Insert Link" cmd="createLink" onCommand={onCommand} />
      <ToolBtn icon={Image} label="Insert Image" cmd="insertImage" onCommand={onCommand} />
      <ToolBtn icon={Table} label="Insert Table" cmd="insertTable" onCommand={onCommand} />
    </div>
  );
}
