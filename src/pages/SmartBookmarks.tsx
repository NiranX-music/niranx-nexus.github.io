import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBookmarks, SmartBookmark } from '@/hooks/useBookmarks';
import { Plus, Bookmark, FolderPlus, Search, ExternalLink, Trash2, Tag, Globe, Sparkles, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const SmartBookmarks = () => {
  const { bookmarks, collections, loading, createBookmark, deleteBookmark, createCollection } = useBookmarks();
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newBookmark, setNewBookmark] = useState({
    url: '',
    title: '',
    description: '',
    category: '',
    tags: '',
    collection_id: '',
  });
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    color: '#6366f1',
  });

  const handleAddBookmark = async () => {
    if (!newBookmark.url.trim() || !newBookmark.title.trim()) return;
    
    await createBookmark({
      url: newBookmark.url,
      title: newBookmark.title,
      description: newBookmark.description || null,
      category: newBookmark.category || null,
      tags: newBookmark.tags.split(',').map(t => t.trim()).filter(Boolean),
      collection_id: newBookmark.collection_id || null,
    });
    
    setNewBookmark({
      url: '',
      title: '',
      description: '',
      category: '',
      tags: '',
      collection_id: '',
    });
    setIsAddingBookmark(false);
  };

  const handleAddCollection = async () => {
    if (!newCollection.name.trim()) return;
    
    await createCollection(newCollection);
    setNewCollection({ name: '', description: '', color: '#6366f1' });
    setIsAddingCollection(false);
  };

  const categories = [...new Set(bookmarks.map(b => b.category).filter(Boolean))] as string[];
  
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookmark.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || bookmark.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Smart Bookmarks</h1>
          <p className="text-muted-foreground">Organize and discover your learning resources</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddingCollection} onOpenChange={setIsAddingCollection}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Collection Name</Label>
                  <Input
                    value={newCollection.name}
                    onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                    placeholder="e.g., Machine Learning Resources"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newCollection.description}
                    onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                    placeholder="What is this collection about?"
                  />
                </div>
                <Button onClick={handleAddCollection} className="w-full">
                  Create Collection
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddingBookmark} onOpenChange={setIsAddingBookmark}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Bookmark
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Bookmark</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>URL *</Label>
                  <Input
                    value={newBookmark.url}
                    onChange={(e) => setNewBookmark({ ...newBookmark, url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={newBookmark.title}
                    onChange={(e) => setNewBookmark({ ...newBookmark, title: e.target.value })}
                    placeholder="Resource title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newBookmark.description}
                    onChange={(e) => setNewBookmark({ ...newBookmark, description: e.target.value })}
                    placeholder="What is this resource about?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={newBookmark.category}
                      onChange={(e) => setNewBookmark({ ...newBookmark, category: e.target.value })}
                      placeholder="e.g., Tutorial"
                    />
                  </div>
                  <div>
                    <Label>Collection</Label>
                    <Select 
                      value={newBookmark.collection_id} 
                      onValueChange={(v) => setNewBookmark({ ...newBookmark, collection_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {collections.map((col) => (
                          <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={newBookmark.tags}
                    onChange={(e) => setNewBookmark({ ...newBookmark, tags: e.target.value })}
                    placeholder="react, javascript, tutorial"
                  />
                </div>
                <Button onClick={handleAddBookmark} className="w-full">
                  Add Bookmark
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookmarks..."
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Bookmark className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{bookmarks.length}</p>
                <p className="text-sm text-muted-foreground">Total Bookmarks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FolderPlus className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{collections.length}</p>
                <p className="text-sm text-muted-foreground">Collections</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Tag className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-sm text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{bookmarks.filter(b => b.ai_summary).length}</p>
                <p className="text-sm text-muted-foreground">AI Summarized</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookmarks Grid */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Bookmarks</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {filteredBookmarks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No bookmarks yet</h3>
                <p className="text-muted-foreground">Add your first bookmark to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard key={bookmark.id} bookmark={bookmark} onDelete={deleteBookmark} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="collections" className="mt-6">
          {collections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No collections yet</h3>
                <p className="text-muted-foreground">Create a collection to organize your bookmarks</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((collection) => {
                const collectionBookmarks = bookmarks.filter(b => b.collection_id === collection.id);
                return (
                  <Card key={collection.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: collection.color }}
                        />
                        {collection.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {collection.description || 'No description'}
                      </p>
                      <Badge variant="secondary">{collectionBookmarks.length} bookmarks</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BookmarkCard = ({ bookmark, onDelete }: { bookmark: SmartBookmark; onDelete: (id: string) => void }) => {
  const domain = new URL(bookmark.url).hostname;
  
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {bookmark.favicon ? (
              <img src={bookmark.favicon} alt="" className="w-5 h-5 rounded" />
            ) : (
              <Globe className="w-5 h-5 text-muted-foreground" />
            )}
            <span className="text-sm text-muted-foreground truncate">{domain}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(bookmark.url, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(bookmark.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <a 
          href={bookmark.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block hover:underline"
        >
          <h3 className="font-semibold mb-2 line-clamp-2">{bookmark.title}</h3>
        </a>
        
        {bookmark.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{bookmark.description}</p>
        )}
        
        {bookmark.ai_summary && (
          <div className="bg-primary/5 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-1 text-xs text-primary mb-1">
              <Sparkles className="h-3 w-3" />
              AI Summary
            </div>
            <p className="text-sm line-clamp-2">{bookmark.ai_summary}</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1">
          {bookmark.category && (
            <Badge variant="outline">{bookmark.category}</Badge>
          )}
          {bookmark.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
          {bookmark.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">+{bookmark.tags.length - 3}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartBookmarks;
