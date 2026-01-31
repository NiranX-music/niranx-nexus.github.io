import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Search, Sparkles, Filter, Grid3X3, List, 
  ChevronLeft, Zap, Star, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MODEL_CATEGORIES, getModelsByCategory, getAllModels, AIModel, ModelCategory } from '@/components/xnexus/XNexusModels';
import { XNexusCategoryCard } from '@/components/xnexus/XNexusCategoryCard';
import { XNexusModelCard } from '@/components/xnexus/XNexusModelCard';
import { XNexusSubcategoryNav } from '@/components/xnexus/XNexusSubcategoryNav';
import { XNexusChat } from '@/components/xnexus/XNexusChat';

export default function XNexusAI() {
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeModel, setActiveModel] = useState<AIModel | null>(null);
  const [chatPosition, setChatPosition] = useState({ x: window.innerWidth - 460, y: 80 });

  // Get filtered models
  const getDisplayModels = (): AIModel[] => {
    let models: AIModel[] = [];

    if (selectedCategory) {
      if (selectedSubcategory) {
        const sub = selectedCategory.subcategories.find(s => s.id === selectedSubcategory);
        models = sub?.models || [];
      } else {
        models = getModelsByCategory(selectedCategory.id);
      }
    } else {
      models = getAllModels();
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      models = models.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.provider.toLowerCase().includes(query) ||
        m.capabilities.some(c => c.toLowerCase().includes(query))
      );
    }

    return models;
  };

  const displayModels = getDisplayModels();

  const handleCategorySelect = (category: ModelCategory) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
    }
  };

  const handleModelSelect = (model: AIModel) => {
    setActiveModel(model);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                  }}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    XNexus AI
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedCategory ? selectedCategory.name : 'Open Source AI Models Hub'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>{getAllModels().length} Models</span>
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                <span>BYTEZ Powered</span>
              </Badge>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models by name, provider, or capability..."
                className="pl-10"
              />
            </div>

            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
              <TabsList>
                <TabsTrigger value="grid" className="gap-1.5">
                  <Grid3X3 className="h-4 w-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-1.5">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            /* Category Selection View */
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border rounded-xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{MODEL_CATEGORIES.length}</p>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </div>
                </div>
                <div className="bg-card border rounded-xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{getAllModels().length}</p>
                    <p className="text-sm text-muted-foreground">Total Models</p>
                  </div>
                </div>
                <div className="bg-card border rounded-xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {MODEL_CATEGORIES.reduce((acc, cat) => acc + cat.subcategories.length, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">Task Types</p>
                  </div>
                </div>
                <div className="bg-card border rounded-xl p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-sm text-muted-foreground">Open Source</p>
                  </div>
                </div>
              </div>

              {/* Categories Grid */}
              <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                {MODEL_CATEGORIES.map((category) => (
                  <XNexusCategoryCard
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory?.id === category.id}
                    onClick={() => handleCategorySelect(category)}
                    modelCount={getModelsByCategory(category.id).length}
                  />
                ))}
              </div>

              {/* All Models (when searching) */}
              {searchQuery && (
                <>
                  <h2 className="text-xl font-semibold mb-4">
                    Search Results ({displayModels.length})
                  </h2>
                  <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-3"
                  }>
                    {displayModels.map((model) => (
                      <XNexusModelCard
                        key={model.id}
                        model={model}
                        onSelect={handleModelSelect}
                        isActive={activeModel?.id === model.id}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            /* Category Detail View */
            <motion.div
              key="category-detail"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Subcategory Navigation */}
              <div className="mb-6">
                <XNexusSubcategoryNav
                  subcategories={selectedCategory.subcategories}
                  selectedSubcategory={selectedSubcategory}
                  onSelect={(id) => setSelectedSubcategory(id === selectedSubcategory ? null : id)}
                  categoryColor={selectedCategory.color}
                />
              </div>

              {/* Models Count */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedSubcategory 
                    ? selectedCategory.subcategories.find(s => s.id === selectedSubcategory)?.name 
                    : 'All'} Models
                </h2>
                <Badge variant="secondary">
                  {displayModels.length} models
                </Badge>
              </div>

              {/* Models Grid */}
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-3"
              }>
                {displayModels.map((model, index) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <XNexusModelCard
                      model={model}
                      onSelect={handleModelSelect}
                      isActive={activeModel?.id === model.id}
                    />
                  </motion.div>
                ))}
              </div>

              {displayModels.length === 0 && (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No models found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {activeModel && (
          <XNexusChat
            selectedModel={activeModel}
            onClose={() => setActiveModel(null)}
            position={chatPosition}
            onPositionChange={setChatPosition}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
