import { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { BottomPlayer } from '../player/BottomPlayer';
import { FullscreenPlayer } from '../player/FullscreenPlayer';
import { QueuePanel } from '../player/QueuePanel';

interface XVibeLayoutProps {
  children: ReactNode;
}

export function XVibeLayout({ children }: XVibeLayoutProps) {
  return (
    <AppLayout>
      <div className="relative min-h-[calc(100vh-4rem)] pb-[90px]">
        {children}
      </div>
      
      {/* XVibe Music Player Components */}
      <BottomPlayer />
      <FullscreenPlayer />
      <QueuePanel />
    </AppLayout>
  );
}