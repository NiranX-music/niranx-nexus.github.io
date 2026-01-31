import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Star, Type, Eye, Music, Combine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModelCategory } from './XNexusModels';

const iconMap: Record<string, React.ElementType> = {
  Star,
  Type,
  Eye,
  Music,
  Combine,
};

interface XNexusCategoryCardProps {
  category: ModelCategory;
  isSelected: boolean;
  onClick: () => void;
  modelCount: number;
}

export function XNexusCategoryCard({ category, isSelected, onClick, modelCount }: XNexusCategoryCardProps) {
  const Icon = iconMap[category.icon] || Star;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative cursor-pointer rounded-2xl p-4 transition-all duration-300 overflow-hidden group",
        isSelected
          ? "bg-gradient-to-br " + category.color + " text-white shadow-lg"
          : "bg-card hover:bg-accent/50 border border-border"
      )}
    >
      {/* Background glow effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-300",
        !isSelected && "group-hover:opacity-100"
      )}>
        <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", category.color)} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center",
            isSelected ? "bg-white/20" : "bg-gradient-to-br " + category.color
          )}>
            <Icon className={cn("h-6 w-6", isSelected ? "text-white" : "text-white")} />
          </div>
          <ChevronRight className={cn(
            "h-5 w-5 transition-transform duration-300",
            isSelected ? "text-white/70 rotate-90" : "text-muted-foreground group-hover:translate-x-1"
          )} />
        </div>

        <h3 className={cn(
          "font-bold text-lg mb-1",
          isSelected ? "text-white" : "text-foreground"
        )}>
          {category.name}
        </h3>
        
        <p className={cn(
          "text-sm mb-3",
          isSelected ? "text-white/80" : "text-muted-foreground"
        )}>
          {category.description}
        </p>

        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
          isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
        )}>
          <span>{modelCount} models</span>
          <span className="text-xs">•</span>
          <span>{category.subcategories.length} tasks</span>
        </div>
      </div>
    </motion.div>
  );
}
