import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { RightSidebar } from "./RightSidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";
import MacDock from "./MacDock";

interface AppLayoutProps {
  children: React.ReactNode;
}

const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [{ title: "Home", href: "/niranx/dashboard" }];
  
  let currentPath = "";
  segments.forEach((segment) => {
    if (segment === "niranx") return; // Skip the niranx prefix in breadcrumbs
    currentPath += `/${segment}`;
    const title = segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ title, href: `/niranx${currentPath}` });
  });
  
  return breadcrumbs;
};

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  const handleDockNavigation = (page: string) => {
    if (page === 'dashboard') {
      window.location.href = '/niranx/dashboard';
    } else {
      window.location.href = `/niranx/${page}`;
    }
  };

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/niranx/dashboard') return 'dashboard';
    const segments = path.split('/').filter(Boolean);
    if (segments[0] === 'niranx' && segments[1]) {
      return segments[1];
    }
    return 'dashboard';
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={breadcrumb.href} className="flex items-center gap-2">
                    <BreadcrumbItem className="hidden md:block">
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={breadcrumb.href}>
                          {breadcrumb.title}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pb-20">
            {children}
          </div>
        </SidebarInset>
        <RightSidebar />
        
        {/* MacDock */}
        <MacDock onNavigate={handleDockNavigation} currentPage={getCurrentPage()} />
      </div>
    </SidebarProvider>
  );
}