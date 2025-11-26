import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, ArrowRight, ArrowLeft, Home, Sparkles, Calendar, User, Menu, Search, Bell, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface GuideStep {
  title: string;
  description: string;
  icon: React.ElementType;
  target?: string;
  position?: "top" | "bottom" | "left" | "right";
}

const guideSteps: GuideStep[] = [
  {
    title: "Welcome to NiranX Study Verse! 🎉",
    description: "Let's take a quick tour to help you discover all the amazing features. This will only take a minute!",
    icon: Home,
  },
  {
    title: "Sidebar Navigation",
    description: "Find all features organized here: Core tools, AI Corner, Study resources, and more. Click the menu icon (☰) to expand/collapse.",
    icon: Menu,
    target: "sidebar",
    position: "right",
  },
  {
    title: "AI Corner",
    description: "Access powerful AI tools like chat, image generation, song creation, presentations, and more. Look for the AI Corner section in the sidebar.",
    icon: Sparkles,
    target: "ai-section",
    position: "right",
  },
  {
    title: "Dashboard & Widgets",
    description: "Customize your dashboard with widgets for tasks, pomodoro timer, music, notes, and more. Enable/disable them in Widget Settings.",
    icon: Home,
    target: "main-content",
    position: "top",
  },
  {
    title: "Quick Access Dock",
    description: "Floating dock for instant access to key features. Find it on the bottom-right of your screen.",
    icon: Zap,
    target: "dock",
    position: "left",
  },
  {
    title: "Command Palette",
    description: "Press Ctrl/Cmd + K to quickly search and navigate anywhere in the app. It's your fastest way to find features!",
    icon: Search,
    target: "command",
    position: "bottom",
  },
  {
    title: "Notifications",
    description: "Stay updated on tasks, XP rewards, and streaks. Check the bell icon in the top-right corner.",
    icon: Bell,
    target: "notifications",
    position: "bottom",
  },
  {
    title: "Profile & Settings",
    description: "Manage your account, XP progress, themes, and preferences. Find your profile in the sidebar or top navigation.",
    icon: User,
    target: "profile",
    position: "left",
  },
  {
    title: "Mobile Navigation",
    description: "On mobile, use the bottom navigation bar to quickly access Dashboard, Tasks, Focus, and Profile.",
    icon: Menu,
    target: "mobile-nav",
    position: "top",
  },
  {
    title: "You're All Set! 🚀",
    description: "Start exploring and make the most of your study journey. You can replay this guide anytime from the sidebar under 'Guide'.",
    icon: Sparkles,
  },
];

export function FirstTimeGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("niranx-guide-seen");
    if (!seen) {
      // Show guide after a short delay for better UX
      setTimeout(() => setIsOpen(true), 1000);
    } else {
      setHasSeenGuide(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("niranx-guide-seen", "true");
    setHasSeenGuide(true);
  };

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  // Public method to restart guide
  useEffect(() => {
    const handleRestartGuide = () => {
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener("restart-guide", handleRestartGuide);
    return () => window.removeEventListener("restart-guide", handleRestartGuide);
  }, []);

  if (!isOpen) return null;

  const currentStepData = guideSteps[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / guideSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" />

      {/* Guide Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-lg bg-card border-2 border-primary/20 shadow-2xl pointer-events-auto animate-scale-in">
          {/* Progress Bar */}
          <div className="h-1 bg-muted rounded-t-lg overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {currentStepData.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {guideSteps.length}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Description */}
            <p className="text-base text-muted-foreground leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-1.5">
                {guideSteps.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentStep
                        ? "bg-primary w-6"
                        : index < currentStep
                        ? "bg-primary/50"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>

              <Button onClick={handleNext} className="gap-2">
                {currentStep === guideSteps.length - 1 ? "Finish" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Skip Button */}
            {currentStep < guideSteps.length - 1 && (
              <div className="text-center pt-2">
                <button
                  onClick={handleSkip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip tour
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

// Helper function to restart guide from anywhere
export const restartGuide = () => {
  window.dispatchEvent(new Event("restart-guide"));
};
