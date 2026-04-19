import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { ChevronDown, ExternalLink, Star, Folder, FileText, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CustomSidebarGroup, CustomSidebarPage, SidebarCategory } from "@/hooks/useCustomSidebarGroups";
import { SidebarGroupEditor } from "./SidebarGroupEditor";

interface CustomSidebarGroupsProps {
  groups: CustomSidebarGroup[];
  getGroupPages: (groupId: string) => CustomSidebarPage[];
  isCollapsed: boolean;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  currentPath: string;
  onReload?: () => void;
  categories?: SidebarCategory[];
}

const groupVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      height: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
      staggerChildren: 0.03,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      height: { duration: 0.2 },
      opacity: { duration: 0.1 },
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.1, rotate: 5 },
  tap: { scale: 0.95 },
};

export function CustomSidebarGroups({
  groups,
  getGroupPages,
  isCollapsed,
  expandedSections,
  toggleSection,
  currentPath,
  onReload,
  categories = [],
}: CustomSidebarGroupsProps) {
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState<string>('');
  const isActive = (url: string) => {
    return currentPath === url || currentPath.startsWith(url + "/");
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return FileText;
    const Icon = (LucideIcons as any)[iconName];
    return Icon || FileText;
  };

  const isExternalUrl = (url: string) => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  const renderNavItem = (page: CustomSidebarPage, index: number) => {
    const Icon = getIcon(page.icon);
    const external = isExternalUrl(page.url);
    const active = isActive(page.url);

    const content = (
      <motion.div
        variants={itemVariants}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={active}
            className={cn(
              "group relative overflow-hidden rounded-xl transition-all duration-300 h-10",
              active
                ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent shadow-sm shadow-primary/20"
                : "hover:bg-muted/60"
            )}
          >
            {external ? (
              <a
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3"
              >
                <motion.div
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
                {!isCollapsed && (
                  <>
                    <span
                      className={cn(
                        "flex-1 font-medium text-sm transition-colors truncate",
                        active ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                      )}
                    >
                      {page.title}
                    </span>
                    <ExternalLink className="h-3 w-3 opacity-40 group-hover:opacity-70 transition-opacity" />
                  </>
                )}
              </a>
            ) : (
              <NavLink to={page.url} className="flex items-center gap-3 px-3">
                <motion.div
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
                {!isCollapsed && (
                  <span
                    className={cn(
                      "flex-1 font-medium text-sm transition-colors truncate",
                      active ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                    )}
                  >
                    {page.title}
                  </span>
                )}
              </NavLink>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </motion.div>
    );

    if (isCollapsed) {
      return (
        <Tooltip key={page.id} delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {page.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={page.id}>{content}</div>;
  };

  const openGroupEditor = (e: React.MouseEvent, group: CustomSidebarGroup) => {
    e.stopPropagation();
    setEditingGroupId(group.id);
    setEditingGroupName(group.name);
  };

  const handleEditorClose = () => {
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  const handleEditorUpdate = () => {
    onReload?.();
  };

  const renderCustomGroup = (group: CustomSidebarGroup) => {
    const GroupIcon = getIcon(group.icon);
    const isExpanded = expandedSections[`custom_${group.id}`];
    const groupPages = getGroupPages(group.id);

    if (groupPages.length === 0) return null;

    return (
      <SidebarGroup key={group.id} className="py-0.5">
        <Collapsible
          open={isExpanded}
          onOpenChange={() => toggleSection(`custom_${group.id}`)}
        >
          <CollapsibleTrigger className="w-full">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <SidebarGroupLabel
                className={cn(
                  "flex items-center justify-between cursor-pointer rounded-xl px-3 py-2.5 mx-1 transition-all duration-300",
                  "hover:bg-muted/60",
                  isExpanded && "bg-muted/40"
                )}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: isExpanded ? 5 : 0 }}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br shadow-sm",
                      "from-teal-500 to-cyan-500",
                      "text-white"
                    )}
                  >
                    <GroupIcon className="h-4 w-4" />
                  </motion.div>
                  {!isCollapsed && (
                    <span
                      className={cn(
                        "font-semibold text-sm transition-colors",
                        isExpanded ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {group.name}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                      onClick={(e) => openGroupEditor(e, group)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 bg-teal-500/10 text-teal-600 dark:text-teal-400"
                    >
                      {groupPages.length}
                    </Badge>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isExpanded ? "text-foreground" : "text-muted-foreground"
                        )}
                      />
                    </motion.div>
                  </div>
                )}
              </SidebarGroupLabel>
            </motion.div>
          </CollapsibleTrigger>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <CollapsibleContent forceMount>
                <motion.div
                  variants={groupVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden"
                >
                  <SidebarGroupContent className="pl-3 pr-1 py-1">
                    <SidebarMenu className="space-y-0.5">
                      {groupPages.map((page, index) => renderNavItem(page, index))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Collapsible>
      </SidebarGroup>
    );
  };

  if (groups.length === 0) return null;

  // If categories are provided, group everything by category (6-master-group view)
  const renderCategoryBucket = (cat: SidebarCategory) => {
    const CatIcon = getIcon(cat.icon);
    const sectionKey = `category_${cat.id}`;
    const isExpanded = expandedSections[sectionKey] ?? true;
    const catGroups = groups.filter((g) => g.category_id === cat.id);
    const visibleGroups = catGroups.filter((g) => getGroupPages(g.id).length > 0);
    if (visibleGroups.length === 0) return null;

    return (
      <SidebarGroup key={cat.id} className="py-0.5">
        <Collapsible open={isExpanded} onOpenChange={() => toggleSection(sectionKey)}>
          <CollapsibleTrigger className="w-full">
            <SidebarGroupLabel
              className={cn(
                "flex items-center justify-between cursor-pointer rounded-xl px-3 py-2.5 mx-1 transition-all",
                "hover:bg-muted/60",
                isExpanded && "bg-muted/40"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
                  <CatIcon className="h-4 w-4" />
                </div>
                {!isCollapsed && (
                  <span className="font-bold text-sm uppercase tracking-wider text-foreground">
                    {cat.name}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              )}
            </SidebarGroupLabel>
          </CollapsibleTrigger>
          <AnimatePresence initial={false}>
            {isExpanded && (
              <CollapsibleContent forceMount>
                <motion.div
                  variants={groupVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="overflow-hidden pl-2"
                >
                  {visibleGroups.map((g) => renderCustomGroup(g))}
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Collapsible>
      </SidebarGroup>
    );
  };

  const uncategorized = groups.filter((g) => !g.category_id);

  return (
    <>
      <div className="space-y-0.5">
        {categories.length > 0 ? (
          <>
            {categories.map((cat) => renderCategoryBucket(cat))}
            {uncategorized.map((group) => renderCustomGroup(group))}
          </>
        ) : (
          groups.map((group) => renderCustomGroup(group))
        )}
      </div>

      {/* Group Editor Dialog */}
      <SidebarGroupEditor
        groupId={editingGroupId || ''}
        groupName={editingGroupName}
        open={!!editingGroupId}
        onOpenChange={(open) => !open && handleEditorClose()}
        onUpdate={handleEditorUpdate}
      />
    </>
  );
}
