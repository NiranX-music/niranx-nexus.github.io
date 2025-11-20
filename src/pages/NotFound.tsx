import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="text-center relative z-10 px-4">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-[150px] md:text-[200px] font-black text-primary/20 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent animate-pulse">
              Page Not Found
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground mb-2 max-w-md mx-auto">
          Oops! The page you're looking for seems to have wandered off into the study void.
        </p>
        <p className="text-sm text-muted-foreground/70 mb-8">
          Don't worry though, we'll help you get back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/niranx/dashboard"
            className="group relative px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
          >
            <span className="relative z-10">Go to Dashboard</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <a
            href="/"
            className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-all hover:scale-105"
          >
            Back to Home
          </a>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/niranx/focus-engine" className="text-sm text-primary hover:underline">Focus Engine</a>
            <span className="text-muted-foreground">•</span>
            <a href="/niranx/tasks" className="text-sm text-primary hover:underline">Tasks</a>
            <span className="text-muted-foreground">•</span>
            <a href="/niranx/study-groups" className="text-sm text-primary hover:underline">Study Groups</a>
            <span className="text-muted-foreground">•</span>
            <a href="/niranx/analytics" className="text-sm text-primary hover:underline">Analytics</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
