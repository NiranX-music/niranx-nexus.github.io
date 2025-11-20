import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Favorite } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: any;
}

interface SortableFavoriteItemProps {
  favorite: Favorite;
  navItem?: NavItem;
  onRemove: (id: string) => void;
  isActive: boolean;
  index: number;
}

function SortableFavoriteItem({ favorite, navItem, onRemove, isActive, index }: SortableFavoriteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: favorite.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Use navItem icon if available, otherwise try to get from lucide
  const IconComponent = navItem
    ? navItem.icon
    : favorite.icon_name
    ? (LucideIcons as any)[favorite.icon_name]
    : LucideIcons.Star;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-lg",
        isDragging && "opacity-50 z-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded touch-none"
      >
        <GripVertical className="h-4 w-4 text-white/50" />
      </button>

      <NavLink
        to={favorite.page_url}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all flex-1",
          isActive
            ? "bg-primary text-primary-foreground font-semibold"
            : "text-white hover:bg-white/10"
        )}
      >
        <IconComponent className="h-4 w-4" />
        <span>{favorite.page_title}</span>
        <div className="ml-auto flex items-center gap-1">
          {index < 9 && (
            <Badge variant="secondary" className="text-xs">
              ⌘{index + 1}
            </Badge>
          )}
        </div>
      </NavLink>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white hover:bg-red-500/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(favorite.id);
        }}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

interface DraggableFavoritesProps {
  favorites: Favorite[];
  navItems: NavItem[];
  onReorder: (favorites: Favorite[]) => void;
  onRemove: (id: string) => void;
  currentPath: string;
}

export function DraggableFavorites({
  favorites,
  navItems,
  onReorder,
  onRemove,
  currentPath,
}: DraggableFavoritesProps) {
  const [items, setItems] = useState(favorites);

  useEffect(() => {
    setItems(favorites);
  }, [favorites]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(items, oldIndex, newIndex);
      setItems(newOrder);
      onReorder(newOrder);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {items.map((favorite, index) => {
            const navItem = navItems.find(item => item.url === favorite.page_url);
            return (
              <SortableFavoriteItem
                key={favorite.id}
                favorite={favorite}
                navItem={navItem}
                onRemove={onRemove}
                isActive={currentPath === favorite.page_url}
                index={index}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
