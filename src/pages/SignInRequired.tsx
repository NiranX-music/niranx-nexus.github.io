import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Home, Focus } from "lucide-react";

export default function SignInRequired() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "this page";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.1),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-primary/20 shadow-2xl backdrop-blur-xl bg-background/70">
          <CardContent className="pt-10 pb-8 px-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30"
            >
              <Lock className="w-10 h-10 text-primary" />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold font-[Orbitron] bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Sign in required
              </h1>
              <p className="text-sm text-muted-foreground">
                You'll need to sign in or log in before accessing{" "}
                <span className="text-foreground font-medium break-all">{from}</span>.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate("/auth", { state: { redirectTo: from } })}
                className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl"
              >
                <ArrowRight className="w-4 h-4" />
                Sign in / Create account
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate("/focus-engine")}
                  className="gap-2 rounded-xl"
                >
                  <Focus className="w-4 h-4" />
                  Try Focus
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/")}
                  className="gap-2 rounded-xl"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              Only the Focus Session is available without an account.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
