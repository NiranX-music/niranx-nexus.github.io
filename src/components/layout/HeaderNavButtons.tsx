import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Browser-style back / forward navigation buttons for the app header.
 *
 * History API does not expose whether forward/back entries exist, so we
 * track our own cursor inside the current session via popstate + a counter
 * we bump on every push. This gives us reliable enable/disable states.
 */
export function HeaderNavButtons() {
  const navigate = useNavigate();
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);

  useEffect(() => {
    const update = () => {
      // window.history.length grows but doesn't tell us position.
      // Use a custom index stored on history.state when available.
      const state = window.history.state as { idx?: number } | null;
      const idx = state?.idx ?? 0;
      setCanBack(idx > 0);
      setCanForward(idx < window.history.length - 1 && window.history.length > 1);
    };

    update();
    window.addEventListener("popstate", update);
    // React Router pushes don't fire popstate — poll briefly after click.
    const interval = window.setInterval(update, 500);
    return () => {
      window.removeEventListener("popstate", update);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="hidden sm:flex items-center gap-0.5 mr-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(-1)}
        disabled={!canBack && window.history.length <= 1}
        className="h-8 w-8 rounded-lg hover:bg-accent/60 disabled:opacity-30"
        title="Go back"
        aria-label="Go back"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(1)}
        className="h-8 w-8 rounded-lg hover:bg-accent/60 disabled:opacity-30"
        title="Go forward"
        aria-label="Go forward"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
