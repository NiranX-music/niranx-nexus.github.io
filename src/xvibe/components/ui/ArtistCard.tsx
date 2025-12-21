import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { XVibeArtist } from '../../types';
import { Button } from '@/components/ui/button';

interface ArtistCardProps {
  artist: XVibeArtist;
  className?: string;
}

export function ArtistCard({ artist, className }: ArtistCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/xvibe/artist/${artist.id}`);
  };

  const formatListeners = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col items-center rounded-lg p-4 transition-all duration-200',
        'bg-[#181818] hover:bg-[#282828] cursor-pointer w-40',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Avatar */}
      <div className="relative w-32 h-32 mb-4">
        <div className="w-full h-full rounded-full overflow-hidden shadow-2xl">
          {artist.avatar_url ? (
            <img
              src={artist.avatar_url}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#282828] flex items-center justify-center">
              <span className="text-5xl">👤</span>
            </div>
          )}
        </div>
        
        {/* Play Button Overlay */}
        <div
          className={cn(
            'absolute bottom-0 right-0 transition-all duration-200',
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          )}
        >
          <Button
            size="icon"
            className="w-12 h-12 rounded-full bg-[#1DB954] hover:bg-[#1ed760] shadow-xl"
          >
            <Play className="h-6 w-6 text-black fill-black ml-1" />
          </Button>
        </div>
      </div>

      {/* Artist Info */}
      <div className="text-center w-full">
        <div className="flex items-center justify-center gap-1">
          <h3 className="font-bold text-white truncate">
            {artist.name}
          </h3>
          {artist.is_verified && (
            <CheckCircle className="h-4 w-4 text-[#3D91F4] fill-[#3D91F4]" />
          )}
        </div>
        <p className="text-xs text-[#B3B3B3] mt-1">
          {artist.monthly_listeners > 0
            ? `${formatListeners(artist.monthly_listeners)} monthly listeners`
            : 'Artist'}
        </p>
      </div>
    </div>
  );
}
