import { ReactNode } from 'react';
import { XVibeSidebar } from './XVibeSidebar';
import { BottomPlayer } from '../player/BottomPlayer';
import { FullscreenPlayer } from '../player/FullscreenPlayer';
import { QueuePanel } from '../player/QueuePanel';

interface XVibeLayoutProps {
  children: ReactNode;
}

export function XVibeLayout({ children }: XVibeLayoutProps) {
  return (
    <div className="flex h-screen bg-[#121212] overflow-hidden">
      {/* Sidebar */}
      <XVibeSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-[90px]">
        {children}
      </main>

      {/* Bottom Player */}
      <BottomPlayer />

      {/* Fullscreen Player */}
      <FullscreenPlayer />

      {/* Queue Panel */}
      <QueuePanel />
    </div>
  );
}
