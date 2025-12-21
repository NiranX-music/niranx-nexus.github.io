import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { allPages, pageCategories, accessLevelColors, PageInfo } from "@/data/allPages";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { 
  Search, 
  ExternalLink, 
  Lock, 
  Filter,
  LayoutGrid,
  List,
  Shield
} from "lucide-react";
import * as LucideIcons from "lucide-react";

export default function Guide() {
  const { isAdmin, isModerator, isLoading } = useAdminCheck();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filter pages based on search and category
  const filteredPages = useMemo(() => {
    return allPages.filter(page => {
      const matchesSearch = 
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || page.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Group pages by category
  const pagesByCategory = useMemo(() => {
    const grouped: Record<string, PageInfo[]> = {};
    filteredPages.forEach(page => {
      if (!grouped[page.category]) {
        grouped[page.category] = [];
      }
      grouped[page.category].push(page);
    });
    return grouped;
  }, [filteredPages]);

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : <LucideIcons.FileText className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Access check - only admins and moderators can view
  if (!isAdmin && !isModerator) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              This page is only accessible to administrators and moderators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Website Guide</h1>
          <p className="text-muted-foreground">
            Complete directory of all {allPages.length} pages • Admin/Moderator Access Only
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          <Lock className="h-3 w-3 mr-1" />
          Restricted Access
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages by name, route, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background min-w-[150px]"
              >
                <option value="all">All Categories</option>
                {pageCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        Showing {filteredPages.length} of {allPages.length} pages
      </div>

      {/* Content */}
      {viewMode === "table" ? (
        <Card>
          <Table>
            <TableCaption>Complete directory of all pages in the application</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Icon</TableHead>
                <TableHead className="w-[200px]">Page Name</TableHead>
                <TableHead className="w-[250px]">Route</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="w-[130px]">Access</TableHead>
                <TableHead className="w-[80px]">Go</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.route}>
                  <TableCell>
                    <div className="p-2 rounded-md bg-primary/10">
                      {getIcon(page.icon)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{page.name}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {page.route}
                  </TableCell>
                  <TableCell className="text-sm">{page.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{page.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={accessLevelColors[page.accessLevel]}>
                      {page.accessLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!page.route.includes(":") && (
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={page.route}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(pagesByCategory).map(([category, pages]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge variant="outline">{category}</Badge>
                <span className="text-muted-foreground text-sm">({pages.length} pages)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.map((page) => (
                  <Card key={page.route} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            {getIcon(page.icon)}
                          </div>
                          <div>
                            <h4 className="font-medium">{page.name}</h4>
                            <p className="text-xs text-muted-foreground font-mono">
                              {page.route}
                            </p>
                          </div>
                        </div>
                        {!page.route.includes(":") && (
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={page.route}>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-3">
                        {page.description}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <Badge className={accessLevelColors[page.accessLevel]} variant="secondary">
                          {page.accessLevel}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Access Level Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Access Level Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {Object.entries(accessLevelColors).map(([level, color]) => (
              <div key={level} className="flex items-center gap-2">
                <Badge className={color}>{level}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
