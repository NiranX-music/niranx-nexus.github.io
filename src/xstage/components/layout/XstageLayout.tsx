import { Outlet } from 'react-router-dom';
import { XstageSidebar } from './XstageSidebar';
import { XstageProvider } from '../../contexts/XstageContext';

export const XstageLayout = () => {
  return (
    <XstageProvider>
      <div className="h-screen bg-background overflow-hidden">
        <XstageSidebar />
        <main className="md:ml-64 h-screen overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </XstageProvider>
  );
};
