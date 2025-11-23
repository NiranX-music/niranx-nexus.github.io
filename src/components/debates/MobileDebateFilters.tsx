import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface MobileDebateFiltersProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  categories: any[];
  selectedCategory: string | null;
  setSelectedCategory: (value: string | null) => void;
}

export function MobileDebateFilters({
  sortBy,
  setSortBy,
  categories,
  selectedCategory,
  setSelectedCategory
}: MobileDebateFiltersProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[400px]">
        <SheetHeader>
          <SheetTitle>Filter Debates</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Sort By</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hot">🔥 Hot</SelectItem>
                <SelectItem value="new">🆕 New</SelectItem>
                <SelectItem value="top">📈 Top</SelectItem>
                <SelectItem value="controversial">⚡ Controversial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select 
              value={selectedCategory || "all"} 
              onValueChange={(v) => setSelectedCategory(v === "all" ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
