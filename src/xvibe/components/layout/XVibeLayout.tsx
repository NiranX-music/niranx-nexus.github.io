import { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

interface XVibeLayoutProps {
  children: ReactNode;
}

export function XVibeLayout({ children }: XVibeLayoutProps) {
  return (
    <AppLayout>
      <div className="relative min-h-[calc(100vh-4rem)]">
        {children}
      </div>
    </AppLayout>
  );
}
