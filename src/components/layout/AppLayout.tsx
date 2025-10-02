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


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full perspective-3d">
        <AppSidebar />
        <SidebarInset className="flex-1 w-full">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b backdrop-blur-xl bg-background/80 px-4 transition-all duration-300 hover:bg-background/90 animate-fade-in">
            <SidebarTrigger className="-ml-1 hover:scale-110 transition-transform duration-200" />
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
          <div className="flex flex-1 flex-col gap-4 p-4 animate-fade-in">
            {children}
          </div>
        </SidebarInset>
        <RightSidebar />
      </div>
    </SidebarProvider>
  );
}