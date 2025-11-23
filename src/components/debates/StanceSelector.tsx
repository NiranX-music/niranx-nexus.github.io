import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StanceSelectorProps {
  value: 'for' | 'against' | 'neutral';
  onChange: (value: 'for' | 'against' | 'neutral') => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function StanceSelector({ value, onChange, disabled, size = 'default' }: StanceSelectorProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant={value === 'for' ? 'default' : 'outline'}
        onClick={() => onChange('for')}
        disabled={disabled}
        size={size}
        className={cn(
          "flex-1",
          value === 'for' && "bg-green-500 hover:bg-green-600"
        )}
      >
        👍 For
      </Button>
      <Button
        variant={value === 'against' ? 'default' : 'outline'}
        onClick={() => onChange('against')}
        disabled={disabled}
        size={size}
        className={cn(
          "flex-1",
          value === 'against' && "bg-red-500 hover:bg-red-600"
        )}
      >
        👎 Against
      </Button>
      <Button
        variant={value === 'neutral' ? 'default' : 'outline'}
        onClick={() => onChange('neutral')}
        disabled={disabled}
        size={size}
        className={cn(
          "flex-1",
          value === 'neutral' && "bg-gray-500 hover:bg-gray-600"
        )}
      >
        😐 Neutral
      </Button>
    </div>
  );
}
