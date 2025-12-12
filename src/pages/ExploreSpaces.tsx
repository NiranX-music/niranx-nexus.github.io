import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSpaces, Space } from "@/hooks/useSpaces";
import { supabase } from "@/integrations/supabase/client";
import { Globe, Search, Users, Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";

export default function ExploreSpaces() {
  const { fetchPublicSpaces } = useSpaces();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [spaceData, setSpaceData] = useState<Record<string, any>>({});

  useEffect(() => {
    loadPublicSpaces();
  }, []);

  const loadPublicSpaces = async () => {
    setIsLoading(true);
    const publicSpaces = await fetchPublicSpaces();
    setSpaces(publicSpaces);
    
    // Fetch space data for each public space
    for (const space of publicSpaces) {
      const { data } = await supabase
        .from("space_data")
        .select("*")
        .eq("space_id", space.id);
      
      if (data) {
        setSpaceData(prev => ({ ...prev, [space.id]: data }));
      }
    }
    
    setIsLoading(false);
  };

  const filteredSpaces = spaces.filter(space =>
    space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    space.owner_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Globe className="h-7 w-7 text-primary" />
            Explore Public Spaces
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and explore public spaces created by the community
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search spaces..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredSpaces.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Public Spaces Found</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery 
                ? "Try a different search term" 
                : "Be the first to create a public space!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSpaces.map((space) => (
            <Card key={space.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={space.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {space.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{space.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {space.owner_name}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <Globe className="h-3 w-3" />
                    Public
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {space.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {space.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(space.created_at), "MMM d, yyyy")}
                  </span>
                  <span>
                    /space/{space.space_url}
                  </span>
                </div>

                {spaceData[space.id]?.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      {spaceData[space.id].length} data entries
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {[...new Set(spaceData[space.id].map((d: any) => d.data_type))].slice(0, 3).map((type: string) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full gap-2" size="sm">
                  <ExternalLink className="h-4 w-4" />
                  View Space
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
