import { Input } from '@/components/ui/input';
import { FunctionSquare } from 'lucide-react';

interface FormulaBarProps {
  cellRef: string;
  value: string;
  onChange: (value: string) => void;
  onCommit: () => void;
}

export default function FormulaBar({ cellRef, value, onChange, onCommit }: FormulaBarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/20">
      <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted text-xs font-mono font-bold min-w-[50px] justify-center text-foreground">
        {cellRef || 'A1'}
      </div>
      <FunctionSquare className="h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onCommit(); }}
        onBlur={onCommit}
        className="h-7 text-sm font-mono border-none bg-transparent focus-visible:ring-0"
        placeholder="Enter value or formula (e.g. =SUM(A1:A5))"
      />
    </div>
  );
}
