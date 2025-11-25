import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { NowPlaying } from "./NowPlaying";
import { MobileBottomNav } from "./MobileBottomNav";
import { NotificationCenter } from "@/components/NotificationCenter";
import { CommandPalette } from "@/components/CommandPalette";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import { NewLaunchesPopover } from "@/components/NewLaunchesPopover";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useFavorites } from "@/hooks/useFavorites";
import { useNavigate } from "react-router-dom";
import { Keyboard } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cleanupInvalidFavoriteIcons } from "@/utils/cleanupFavorites";
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
  const navigate = useNavigate();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const { favorites } = useFavorites();
  const { user } = useAuth();

  // Run cleanup on mount to fix any invalid favorite icons
  useEffect(() => {
    if (user) {
      cleanupInvalidFavoriteIcons(user.id);
    }
  }, [user]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "k",
      metaKey: true,
      callback: () => setCommandPaletteOpen(true),
      description: "Open command palette",
    },
    {
      key: "k",
      ctrlKey: true,
      callback: () => setCommandPaletteOpen(true),
      description: "Open command palette",
    },
    {
      key: "1",
      metaKey: true,
      callback: () => navigate("/niranx/dashboard"),
      description: "Go to Dashboard",
    },
    {
      key: "2",
      metaKey: true,
      callback: () => navigate("/niranx/tasks"),
      description: "Go to Tasks",
    },
    {
      key: "3",
      metaKey: true,
      callback: () => navigate("/niranx/focus-engine"),
      description: "Go to Focus Engine",
    },
    {
      key: "4",
      metaKey: true,
      callback: () => navigate("/niranx/profile"),
      description: "Go to Profile",
    },
    {
      key: "?",
      shiftKey: true,
      callback: () => setShortcutsHelpOpen(true),
      description: "Show keyboard shortcuts",
    },
    // Favorites shortcuts (⌘1-9)
    ...favorites.slice(0, 9).map((fav, index) => ({
      key: String(index + 1),
      metaKey: true,
      callback: () => navigate(fav.page_url),
      description: `Go to ${fav.page_title}`,
    })),
  ]);


  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-svh w-full overflow-hidden perspective-3d">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b backdrop-blur-xl bg-background/80 px-4 transition-all duration-300 hover:bg-background/90 animate-fade-in sticky top-0 z-30">
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
            <div className="ml-auto flex items-center gap-2">
              <NewLaunchesPopover />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShortcutsHelpOpen(true)}
                className="hover:bg-accent"
                title="Keyboard shortcuts (Shift + ?)"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
              <NotificationCenter />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 pb-20 md:pb-4 animate-fade-in">
              {children}
            </div>
          </main>

          <NowPlaying />
          <MobileBottomNav />
          <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />
          <KeyboardShortcutsHelp open={shortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen} />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}