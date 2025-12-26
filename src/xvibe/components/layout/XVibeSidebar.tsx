import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, Plus, Heart, Music, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useXVibePlaylists } from '../../hooks/useXVibeLibrary';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const navItems = [
  { icon: Home, label: 'Home', path: '/niranx/xvibe' },
  { icon: Search, label: 'Search', path: '/niranx/xvibe/search' },
  { icon: Library, label: 'Your Library', path: '/niranx/xvibe/library' },
];

export function XVibeSidebar() {
  const location = useLocation();
  const { playlists, createPlaylist } = useXVibePlaylists();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }
    await createPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setDialogOpen(false);
  };

  return (
    <div className="w-[240px] bg-black flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <Link to="/niranx/xvibe" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1DB954] to-[#1ed760] flex items-center justify-center">
            <Music className="h-6 w-6 text-black" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">XVibe</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/xvibe' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-4 px-3 py-3 rounded-md transition-all font-semibold',
                isActive
                  ? 'text-white bg-[#282828]'
                  : 'text-[#B3B3B3] hover:text-white'
              )}
            >
              <item.icon className={cn('h-6 w-6', isActive && 'text-white')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-6 my-4 border-t border-[#282828]" />

      {/* Library Section */}
      <div className="flex-1 flex flex-col min-h-0 px-3">
        <div className="flex items-center justify-between mb-4 px-3">
          <span className="text-sm font-semibold text-[#B3B3B3] uppercase tracking-wider">
            Playlists
          </span>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#B3B3B3] hover:text-white"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#282828] border-[#3e3e3e]">
              <DialogHeader>
                <DialogTitle className="text-white">Create Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="bg-[#3e3e3e] border-none text-white"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                />
                <Button
                  onClick={handleCreatePlaylist}
                  className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black"
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {/* Liked Songs */}
            <Link
              to="/niranx/xvibe/library?tab=liked"
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                'text-[#B3B3B3] hover:text-white hover:bg-[#282828]'
              )}
            >
              <div className="w-10 h-10 rounded bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center">
                <Heart className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="text-sm font-medium">Liked Songs</span>
            </Link>

            {/* User Playlists */}
            {playlists.map((playlist) => (
              <Link
                key={playlist.id}
                to={`/niranx/xvibe/playlist/${playlist.id}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  location.pathname === `/niranx/xvibe/playlist/${playlist.id}`
                    ? 'bg-[#282828] text-white'
                    : 'text-[#B3B3B3] hover:text-white hover:bg-[#282828]'
                )}
              >
                <div className="w-10 h-10 rounded bg-[#282828] flex items-center justify-center overflow-hidden">
                  {playlist.cover_url ? (
                    <img src={playlist.cover_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music className="h-4 w-4 text-[#B3B3B3]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{playlist.name}</p>
                  <p className="text-xs text-[#B3B3B3]">{playlist.track_count} songs</p>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Bottom padding for player */}
      <div className="h-[90px]" />
    </div>
  );
}
