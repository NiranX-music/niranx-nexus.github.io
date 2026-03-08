import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowRight, Shield, Zap, Users } from "lucide-react";

export default function Trial() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_70%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="border-primary/10 shadow-2xl backdrop-blur-sm">
          <CardContent className="pt-10 pb-8 px-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold font-[Orbitron] mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                NiranX Universe
              </h1>
              <p className="text-muted-foreground">
                Sign up to access the full NiranX platform — AI tools, study features, music, social, and more.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 py-4">
              {[
                { icon: Sparkles, label: "AI Tools" },
                { icon: Zap, label: "Study Hub" },
                { icon: Users, label: "Community" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl"
              >
                <ArrowRight className="w-5 h-5" />
                Sign Up / Log In
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="w-full text-muted-foreground"
              >
                Back to Home
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
              <Shield className="w-3.5 h-3.5" />
              Free to use — no credit card required
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
