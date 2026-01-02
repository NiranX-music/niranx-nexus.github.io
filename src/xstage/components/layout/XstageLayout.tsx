import { Outlet } from 'react-router-dom';
import { XstageSidebar } from './XstageSidebar';
import { XstageProvider } from '../../contexts/XstageContext';

export const XstageLayout = () => {
  return (
    <XstageProvider>
      <div className="min-h-screen bg-background">
        <XstageSidebar />
        <main className="md:ml-64 min-h-screen">
          <Outlet />
        </main>
      </div>
    </XstageProvider>
  );
};
