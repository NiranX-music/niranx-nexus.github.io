import { ReactNode } from 'react';
import { XVibeSidebar } from './XVibeSidebar';
import { BottomPlayer } from '../player/BottomPlayer';
import { FullscreenPlayer } from '../player/FullscreenPlayer';
import { QueuePanel } from '../player/QueuePanel';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';

interface XVibeLayoutProps {
  children: ReactNode;
}

function XVibeLayoutInner({ children }: XVibeLayoutProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div className="flex h-screen w-full bg-[#121212] overflow-hidden">
      {/* Main App Sidebar */}
      <AppSidebar />

      <div className="flex flex-1 overflow-hidden">
        {/* XVibe Sidebar */}
        <XVibeSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-[90px] relative">
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
