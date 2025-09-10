import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  HelpCircle,
  Moon,
  Sun,
  Sidebar,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Types
interface TaskCategory {
  id: string;
  title: string;
  children: TaskCategory[];
  isExpanded: boolean;
  created: number;
  level: number;
}

interface AppState {
  categories: TaskCategory[];
  isPlaying: boolean;
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  userInfo: {
    name: string;
    class: string;
    roll: string;
  };
}

// Utilities
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => Date.now();

// Storage key
const STORAGE_KEY = "infinite-task-chain-v2";

// Default state
const getDefaultState = (): AppState => ({
  categories: [
    {
      id: uid(),
      title: "New Category",
      children: [],
      isExpanded: false,
      created: now(),
      level: 0
    }
  ],
  isPlaying: false,
  theme: 'dark',
  sidebarOpen: true,
  userInfo: {
    name: "---",
    class: "---", 
    roll: "---"
  }
});

// Custom hook for state management with localStorage
const useAppState = () => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...getDefaultState(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
    return getDefaultState();
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }, [state]);

  return [state, setState] as const;
};

export default function InfiniteChainManager() {
  const [state, setState] = useAppState();
  const { toast } = useToast();

  // Count total items recursively
  const countTotalItems = useCallback((categories: TaskCategory[]): number => {
    return categories.reduce((total, category) => {
      return total + 1 + countTotalItems(category.children);
    }, 0);
  }, []);

  const totalItems = countTotalItems(state.categories);

  // Add new root category
  const addRoot = () => {
    setState(prev => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          id: uid(),
          title: "New Category",
          children: [],
          isExpanded: false,
          created: now(),
          level: 0
        }
      ]
    }));
    toast({
      title: "Root Added",
      description: "New root category created"
    });
  };

  // Add subcategory to a category
  const addSubcategory = (parentId: string, categories: TaskCategory[] = state.categories): TaskCategory[] => {
    return categories.map(category => {
      if (category.id === parentId) {
        return {
          ...category,
          children: [
            ...category.children,
            {
              id: uid(),
              title: "New Category",
              children: [],
              isExpanded: false,
              created: now(),
              level: category.level + 1
            }
          ]
        };
      }
      return {
        ...category,
        children: addSubcategory(parentId, category.children)
      };
    });
  };

  // Toggle category expansion
  const toggleExpansion = (categoryId: string, categories: TaskCategory[] = state.categories): TaskCategory[] => {
    return categories.map(category => {
      if (category.id === categoryId) {
        return { ...category, isExpanded: !category.isExpanded };
      }
      return {
        ...category,
        children: toggleExpansion(categoryId, category.children)
      };
    });
  };

  // Delete category
  const deleteCategory = (categoryId: string, categories: TaskCategory[] = state.categories): TaskCategory[] => {
    return categories
      .filter(category => category.id !== categoryId)
      .map(category => ({
        ...category,
        children: deleteCategory(categoryId, category.children)
      }));
  };

  // Expand all categories
  const expandAll = (categories: TaskCategory[] = state.categories): TaskCategory[] => {
    return categories.map(category => ({
      ...category,
      isExpanded: true,
      children: expandAll(category.children)
    }));
  };

  // Collapse all categories
  const collapseAll = (categories: TaskCategory[] = state.categories): TaskCategory[] => {
    return categories.map(category => ({
      ...category,
      isExpanded: false,
      children: collapseAll(category.children)
    }));
  };

  // Clear all categories
  const clearAll = () => {
    setState(prev => ({ ...prev, categories: [] }));
    toast({
      title: "Cleared",
      description: "All categories cleared"
    });
  };

  // Handle actions
  const handleAddSub = (categoryId: string) => {
    setState(prev => ({
      ...prev,
      categories: addSubcategory(categoryId, prev.categories)
    }));
  };

  const handleToggleExpansion = (categoryId: string) => {
    setState(prev => ({
      ...prev,
      categories: toggleExpansion(categoryId, prev.categories)
    }));
  };

  const handleDelete = (categoryId: string) => {
    setState(prev => ({
      ...prev,
      categories: deleteCategory(categoryId, prev.categories)
    }));
  };

  const handleExpandAll = () => {
    setState(prev => ({
      ...prev,
      categories: expandAll(prev.categories)
    }));
  };

  const handleCollapseAll = () => {
    setState(prev => ({
      ...prev,
      categories: collapseAll(prev.categories)
    }));
  };

  // Toggle theme
  const toggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setState(prev => ({
      ...prev,
      sidebarOpen: !prev.sidebarOpen
    }));
  };

  // Toggle playing state
  const togglePlay = () => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };

  // Render category item
  const renderCategory = (category: TaskCategory) => {
    const hasChildren = category.children.length > 0;
    const indent = category.level * 24;

    return (
      <div key={category.id}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-between py-2 px-4 hover:bg-muted/30 rounded-lg group transition-colors"
          style={{ marginLeft: `${indent}px` }}
        >
          <div className="flex items-center gap-2">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleExpansion(category.id)}
                className="w-6 h-6 p-0"
              >
                {category.isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            )}
            {!hasChildren && <div className="w-6" />}
            
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <span className="text-sm font-medium">{category.title}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAddSub(category.id)}
              className="text-xs px-2 h-7"
            >
              + Sub
            </Button>
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleExpansion(category.id)}
                className="text-xs px-2 h-7"
              >
                {category.isExpanded ? 'Collapse' : 'Expand'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(category.id)}
              className="text-xs px-2 h-7 text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          </div>
        </motion.div>

        {/* Render children */}
        <AnimatePresence>
          {category.isExpanded && category.children.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {category.children.map(renderCategory)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${state.theme === 'dark' ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">🔗 Infinite Task Chain</h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" 
              size="sm"
              onClick={togglePlay}
              className="w-8 h-8 p-0"
            >
              {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs">
            <HelpCircle className="w-4 h-4 mr-1" />
            Help
          </Button>
          
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="text-xs">
            {state.theme === 'dark' ? <Sun className="w-4 h-4 mr-1" /> : <Moon className="w-4 h-4 mr-1" />}
            {state.theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={toggleSidebar} className="text-xs">
            <Sidebar className="w-4 h-4 mr-1" />
            Sidebar
          </Button>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>12:30</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Student Panel */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Student Panel</h2>
              <ChevronRight className="w-5 h-5" />
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Simple local demo — no server. Data stays in your browser.
            </p>
            
            <p className="text-sm mb-6">
              Logged in as <span className="font-mono">{state.userInfo.name}</span> • Class <span className="font-mono">{state.userInfo.class}</span> • Roll <span className="font-mono">{state.userInfo.roll}</span>
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button onClick={addRoot} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Root
                </Button>
                
                <Button onClick={handleExpandAll} variant="ghost" size="sm">
                  Expand All
                </Button>
                
                <Button onClick={handleCollapseAll} variant="ghost" size="sm">
                  Collapse All
                </Button>
                
                <Button onClick={clearAll} variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  Clear
                </Button>
              </div>

              <Badge variant="secondary" className="text-xs">
                {totalItems} items
              </Badge>
            </div>
          </div>
        </Card>

        {/* Categories List */}
        <Card>
          <div className="p-6">
            <div className="space-y-1">
              <AnimatePresence>
                {state.categories.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <p>No categories yet. Click "Add Root" to get started.</p>
                  </motion.div>
                ) : (
                  state.categories.map(renderCategory)
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}