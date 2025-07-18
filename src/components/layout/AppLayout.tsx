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
  const breadcrumbs = [{ title: "Home", href: "/" }];
  
  let currentPath = "";
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    const title = segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ title, href: currentPath });
  });
  
  return breadcrumbs;
};

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  const handleDockNavigation = (page: string) => {
    if (page === 'dashboard') {
      window.location.href = '/';
    } else {
      window.location.href = `/${page}`;
    }
  };

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    return path.slice(1).split('/')[0];
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