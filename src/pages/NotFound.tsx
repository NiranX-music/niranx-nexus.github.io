import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Compass, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-[8rem] font-black leading-none gradient-text mb-2 select-none"
        >
          404
        </motion.div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Oops..!! You came to the wrong place
        </h1>
        <p className="text-muted-foreground mb-2">
          The page <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">{location.pathname}</code> doesn't exist in the NiranX Universe.
        </p>
        <p className="text-muted-foreground mb-8 text-sm">
          It might have been moved, deleted, or you may have mistyped the URL.
        </p>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button asChild variant="default" className="gap-2">
            <Link to="/dashboard">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/nexus">
              <Compass className="h-4 w-4" />
              Nexus Portal
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/search">
              <Search className="h-4 w-4" />
              Search
            </Link>
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        {/* Help */}
        <div className="text-sm text-muted-foreground border-t border-border pt-4">
          <p>
            Need help?{" "}
            <Link to="/support/help" className="text-primary hover:underline">
              Visit Help Centre
            </Link>{" "}
            or{" "}
            <Link to="/support/contact" className="text-primary hover:underline inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              Contact Us
            </Link>
          </p>
        </div>

        {/* Branding */}
        <p className="text-xs text-muted-foreground mt-6 opacity-60">
          NiranX Universe • All rights reserved
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;
