import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { XVibeAlbum } from '../../types';
import { Button } from '@/components/ui/button';

interface AlbumCardProps {
  album: XVibeAlbum;
  className?: string;
}

export function AlbumCard({ album, className }: AlbumCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/xvibe/album/${album.id}`);
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-lg p-3 transition-all duration-200',
        'bg-[#181818] hover:bg-[#282828] cursor-pointer w-40',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Cover Art */}
      <div className="relative aspect-square w-full mb-3 rounded-md overflow-hidden shadow-lg">
        {album.cover_url ? (
          <img
            src={album.cover_url}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#282828] flex items-center justify-center">
            <span className="text-4xl">💿</span>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div
          className={cn(
            'absolute bottom-2 right-2 transition-all duration-200',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}
        >
          <Button
            size="icon"
            className="w-12 h-12 rounded-full bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 shadow-xl"
          >
            <Play className="h-6 w-6 text-black fill-black ml-1" />
          </Button>
        </div>
      </div>

      {/* Album Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate text-sm">
          {album.title}
        </h3>
        <p className="text-xs text-[#B3B3B3] truncate mt-1">
          {album.release_date ? new Date(album.release_date).getFullYear() : ''} • {album.artist?.name || 'Unknown Artist'}
        </p>
      </div>
    </div>
  );
}
