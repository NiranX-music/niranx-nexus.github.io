import { ReactNode, useState } from 'react';
import { XVibeSidebar } from './XVibeSidebar';
import { BottomPlayer } from '../player/BottomPlayer';
import { FullscreenPlayer } from '../player/FullscreenPlayer';
import { QueuePanel } from '../player/QueuePanel';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Menu, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface XVibeLayoutProps {
  children: ReactNode;
}

function XVibeLayoutInner({ children }: XVibeLayoutProps) {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div className="flex h-screen bg-[#121212] overflow-hidden">
      {/* Main App Sidebar */}
      <AppSidebar />

      <div className="flex flex-1 overflow-hidden">
        {/* XVibe Sidebar */}
        <XVibeSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-[90px] relative">
          {/* Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-[70] h-10 w-10 bg-[#282828] hover:bg-[#333] text-white rounded-full shadow-lg"
            onClick={toggleSidebar}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
          {children}
        </main>
      </div>

      {/* Bottom Player */}
      <BottomPlayer />

      {/* Fullscreen Player */}
      <FullscreenPlayer />

      {/* Queue Panel */}
      <QueuePanel />
    </div>
  );
}

export function XVibeLayout({ children }: XVibeLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <XVibeLayoutInner>{children}</XVibeLayoutInner>
    </SidebarProvider>
  );
}
