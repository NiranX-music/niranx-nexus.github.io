import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Image, Sparkles, TextCursor, HelpCircle, GitCompare, 
  FileText, Tags, PenTool, RefreshCw, Hash, Languages, Zap, Layers,
  ImageIcon, Grid3X3, ScanText, Slice, Search, Video, Shuffle, Film,
  Target, Headphones, Mic, Volume2, Speech, FileAudio, FileQuestion,
  ImagePlus, VideoIcon, MessageCircleQuestion
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModelSubcategory } from './XNexusModels';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const iconMap: Record<string, React.ElementType> = {
  MessageSquare,
  Image,
  Sparkles,
  TextCursor,
  HelpCircle,
  GitCompare,
  FileText,
  Tags,
  PenTool,
  RefreshCw,
  Hash,
  Languages,
  Zap,
  Layers,
  ImageIcon,
  Grid3X3,
  ScanText,
  Slice,
  Search,
  Video,
  Shuffle,
  Film,
  Target,
  Headphones,
  Mic,
  Volume2,
  Speech,
  FileAudio,
  FileQuestion,
  ImagePlus,
  VideoIcon,
  MessageCircleQuestion,
};

interface XNexusSubcategoryNavProps {
  subcategories: ModelSubcategory[];
  selectedSubcategory: string | null;
  onSelect: (id: string) => void;
  categoryColor: string;
}

export function XNexusSubcategoryNav({ 
  subcategories, 
  selectedSubcategory, 
  onSelect,
  categoryColor 
}: XNexusSubcategoryNavProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {subcategories.map((sub, index) => {
          const Icon = iconMap[sub.icon] || Sparkles;
          const isSelected = selectedSubcategory === sub.id;

          return (
            <motion.button
              key={sub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(sub.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 flex-shrink-0",
                isSelected
                  ? "bg-gradient-to-r " + categoryColor + " text-white shadow-md"
                  : "bg-muted/50 hover:bg-muted text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{sub.name}</span>
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-md",
                isSelected ? "bg-white/20" : "bg-background/50"
              )}>
                {sub.models.length}
              </span>
            </motion.button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
