import { useState, useCallback, useEffect, ReactNode } from "react";
import { DndContext, closestCenter, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetItem {
  key: string;
  component: React.ComponentType;
}

interface DraggableWidgetProps {
  id: string;
  children: ReactNode;
}

function DraggableWidget({ id, children }: DraggableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group card-hover-lift",
        isDragging && "opacity-50 z-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-muted/80 hover:bg-muted cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      {children}
    </div>
  );
}

interface DraggableWidgetGridProps {
  widgets: WidgetItem[];
  isWidgetEnabled: (key: string) => boolean;
  storageKey?: string;
}

export function DraggableWidgetGrid({ widgets, isWidgetEnabled, storageKey = "widget-order" }: DraggableWidgetGridProps) {
  const [order, setOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch { /* ignore */ }
    }
    return widgets.map((w) => w.key);
  });

  const [activeId, setActiveId] = useState<string | null>(null);

  // Keep order in sync when widgets change
  useEffect(() => {
    const allKeys = widgets.map((w) => w.key);
    setOrder((prev) => {
      const existing = prev.filter((k) => allKeys.includes(k));
      const newKeys = allKeys.filter((k) => !existing.includes(k));
      return [...existing, ...newKeys];
    });
  }, [widgets]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(order));
  }, [order, storageKey]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      setOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        const next = [...prev];
        next.splice(oldIndex, 1);
        next.splice(newIndex, 0, active.id as string);
        return next;
      });
    }
  }, []);

  const enabledWidgets = order
    .map((key) => widgets.find((w) => w.key === key))
    .filter((w): w is WidgetItem => !!w && isWidgetEnabled(w.key));

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <SortableContext items={enabledWidgets.map((w) => w.key)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-min">
          {enabledWidgets.map((widget, index) => (
            <DraggableWidget key={widget.key} id={widget.key}>
              <div
                className="animate-flip-in"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <widget.component />
              </div>
            </DraggableWidget>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
