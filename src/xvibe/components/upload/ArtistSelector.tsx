import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  X, 
  Search, 
  User, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface Artist {
  id: string;
  name: string;
  avatar_url?: string;
  is_verified?: boolean;
}

interface ArtistSelectorProps {
  selectedArtists: Artist[];
  onArtistsChange: (artists: Artist[]) => void;
  primaryArtistId?: string;
}

export function ArtistSelector({ selectedArtists, onArtistsChange, primaryArtistId }: ArtistSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchArtists();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchArtists = async () => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('xvibe_artists')
        .select('id, name, avatar_url, is_verified')
        .ilike('name', `%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching artists:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addArtist = (artist: Artist) => {
    if (!selectedArtists.find(a => a.id === artist.id)) {
      onArtistsChange([...selectedArtists, artist]);
    }
    setSearchQuery('');
    setIsOpen(false);
  };

  const removeArtist = (artistId: string) => {
    // Don't allow removing primary artist
    if (artistId === primaryArtistId) {
      toast.error("Can't remove primary artist");
      return;
    }
    onArtistsChange(selectedArtists.filter(a => a.id !== artistId));
  };

  const createNewArtist = async () => {
    if (!newArtistName.trim()) {
      toast.error('Please enter an artist name');
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('xvibe_artists')
        .insert({
          name: newArtistName.trim(),
          user_id: user.id,
          is_verified: false
        })
        .select('id, name, avatar_url, is_verified')
        .single();

      if (error) throw error;

      toast.success(`Artist "${newArtistName}" created!`);
      addArtist(data);
      setNewArtistName('');
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Error creating artist:', error);
      toast.error(error.message || 'Failed to create artist');
    } finally {
      setIsCreating(false);
    }
  };

  const noResultsFound = searchQuery.length >= 2 && !isSearching && searchResults.length === 0;

  return (
    <div className="space-y-3">
      <Label className="text-[#B3B3B3]">Featured Artists</Label>
      
      {/* Selected Artists */}
      <div className="flex flex-wrap gap-2">
        {selectedArtists.map((artist) => (
          <Badge 
            key={artist.id} 
            variant="secondary" 
            className="bg-[#282828] text-white px-3 py-1.5 flex items-center gap-2"
          >
            {artist.avatar_url ? (
              <img src={artist.avatar_url} alt={artist.name} className="w-5 h-5 rounded-full" />
            ) : (
              <User className="w-4 h-4" />
            )}
            <span>{artist.name}</span>
            {artist.is_verified && <CheckCircle className="w-3 h-3 text-[#1DB954]" />}
            {artist.id === primaryArtistId && (
              <span className="text-xs text-[#1DB954]">(You)</span>
            )}
            {artist.id !== primaryArtistId && (
              <button 
                onClick={() => removeArtist(artist.id)}
                className="hover:text-red-400 transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </Badge>
        ))}
        
        {/* Add Artist Button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-dashed border-white/30 text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Artist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#181818] border-[#333] text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Add Featured Artist</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B3B3B3]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search artists..."
                  className="bg-[#282828] border-none text-white pl-10"
                />
              </div>

              {/* Search Results */}
              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-[#1DB954]" />
                </div>
              )}

              {searchResults.length > 0 && (
                <ScrollArea className="max-h-48">
                  <div className="space-y-1">
                    {searchResults.map((artist) => (
                      <button
                        key={artist.id}
                        onClick={() => addArtist(artist)}
                        disabled={selectedArtists.some(a => a.id === artist.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] transition-colors disabled:opacity-50"
                      >
                        {artist.avatar_url ? (
                          <img src={artist.avatar_url} alt={artist.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <p className="font-medium flex items-center gap-2">
                            {artist.name}
                            {artist.is_verified && <CheckCircle className="w-4 h-4 text-[#1DB954]" />}
                          </p>
                        </div>
                        {selectedArtists.some(a => a.id === artist.id) && (
                          <CheckCircle className="w-5 h-5 text-[#1DB954]" />
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* No Results - Show Create Option */}
              {noResultsFound && !showCreateForm && (
                <div className="text-center py-4">
                  <p className="text-[#B3B3B3] mb-3">No artists found for "{searchQuery}"</p>
                  <Button
                    onClick={() => {
                      setShowCreateForm(true);
                      setNewArtistName(searchQuery);
                    }}
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Artist
                  </Button>
                </div>
              )}

              {/* Create New Artist Form */}
              {showCreateForm && (
                <div className="p-4 bg-[#282828] rounded-lg space-y-3">
                  <p className="text-sm text-[#B3B3B3]">Create a new artist</p>
                  <Input
                    value={newArtistName}
                    onChange={(e) => setNewArtistName(e.target.value)}
                    placeholder="Artist name"
                    className="bg-[#1a1a1a] border-none text-white"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={createNewArtist}
                      disabled={isCreating || !newArtistName.trim()}
                      className="flex-1 bg-[#1DB954] hover:bg-[#1ed760] text-black"
                    >
                      {isCreating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Create
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowCreateForm(false)}
                      variant="ghost"
                      className="text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Direct Create Option */}
              {searchQuery.length < 2 && !showCreateForm && (
                <div className="border-t border-[#333] pt-4">
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    variant="outline"
                    className="w-full border-[#333] text-white hover:bg-[#282828]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Artist
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <p className="text-xs text-[#666]">
        Add featured or collaborating artists for this track
      </p>
    </div>
  );
}
