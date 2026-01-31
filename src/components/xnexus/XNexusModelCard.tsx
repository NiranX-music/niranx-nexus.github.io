import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AIModel } from './XNexusModels';

interface XNexusModelCardProps {
  model: AIModel;
  onSelect: (model: AIModel) => void;
  isActive: boolean;
}

export function XNexusModelCard({ model, onSelect, isActive }: XNexusModelCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "group relative bg-card border rounded-xl p-4 transition-all duration-300 cursor-pointer",
        isActive
          ? "border-primary shadow-lg shadow-primary/10"
          : "border-border hover:border-primary/50 hover:shadow-md"
      )}
      onClick={() => onSelect(model)}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeModel"
          className="absolute -inset-px rounded-xl border-2 border-primary"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm leading-tight">{model.name}</h4>
              <p className="text-xs text-muted-foreground">{model.provider}</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Info className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-[200px]">
                <p className="text-xs">{model.description}</p>
                <p className="text-xs text-muted-foreground mt-1">ID: {model.id}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {model.description}
        </p>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {model.capabilities.slice(0, 3).map((cap) => (
            <Badge
              key={cap}
              variant="secondary"
              className="text-[10px] px-2 py-0.5 bg-muted/50"
            >
              {cap}
            </Badge>
          ))}
          {model.capabilities.length > 3 && (
            <Badge
              variant="secondary"
              className="text-[10px] px-2 py-0.5 bg-muted/50"
            >
              +{model.capabilities.length - 3}
            </Badge>
          )}
        </div>

        {/* Input/Output types */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {model.inputTypes.join(', ')}
          </span>
          <span>→</span>
          <span>{model.outputTypes.join(', ')}</span>
        </div>

        {/* Action */}
        <Button
          size="sm"
          className={cn(
            "w-full transition-all",
            isActive
              ? "bg-primary hover:bg-primary/90"
              : "bg-gradient-to-r from-primary/80 to-purple-500/80 hover:from-primary hover:to-purple-500"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(model);
          }}
        >
          <Play className="h-3.5 w-3.5 mr-1.5" />
          {isActive ? 'Continue Chat' : 'Start Chat'}
        </Button>
      </div>
    </motion.div>
  );
}
