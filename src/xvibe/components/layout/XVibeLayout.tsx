import { ReactNode, useState } from 'react';
import { XVibeSidebar } from './XVibeSidebar';
import { BottomPlayer } from '../player/BottomPlayer';
import { FullscreenPlayer } from '../player/FullscreenPlayer';
import { QueuePanel } from '../player/QueuePanel';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface XVibeLayoutProps {
  children: ReactNode;
}

export function XVibeLayout({ children }: XVibeLayoutProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex h-screen bg-[#121212] overflow-hidden">
      {/* Main App Sidebar Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-[70] h-10 w-10 bg-[#282828] hover:bg-[#333] text-white rounded-full shadow-lg"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* XVibe Sidebar */}
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
