import React, { useState, useEffect, useRef } from 'react';
import { useAdminEdit } from '@/contexts/AdminEditContext';
import { Pencil, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  contentKey: string;
  defaultValue: string;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
  multiline?: boolean;
  className?: string;
}

export function EditableText({
  contentKey,
  defaultValue,
  as: Component = 'span',
  multiline = false,
  className,
}: EditableTextProps) {
  const { isEditMode, isAdmin, getContent, updateContent, isSaving } = useAdminEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const currentValue = getContent(contentKey, defaultValue);

  useEffect(() => {
    setValue(currentValue);
  }, [currentValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    await updateContent(contentKey, value);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(currentValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditMode || !isAdmin) {
    return <Component className={className}>{currentValue}</Component>;
  }

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg border border-primary/50 shadow-lg">
        {multiline ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-w-[200px] min-h-[100px] text-foreground"
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-w-[200px] text-foreground"
          />
        )}
        <div className="flex flex-col gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer group relative',
        'hover:bg-primary/10 rounded px-1 -mx-1 transition-colors',
        className
      )}
      onClick={() => setIsEditing(true)}
    >
      <Component className={className}>{currentValue}</Component>
      <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary absolute -right-5" />
    </span>
  );
}
