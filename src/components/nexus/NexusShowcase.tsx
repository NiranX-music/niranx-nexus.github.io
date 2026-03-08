import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { ReactNode } from "react";

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface NexusShowcaseProps {
  title: string;
  subtitle: string;
  description: string;
  icon: ReactNode;
  gradient: string;
  features: Feature[];
  appLink?: string;
  highlights?: string[];
}

export function NexusShowcase({ title, subtitle, description, icon, gradient, features, appLink, highlights }: NexusShowcaseProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <Link to="/nexus" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Nexus
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center text-3xl">
                {icon}
              </div>
              <div>
                <Badge variant="secondary" className="mb-1">{subtitle}</Badge>
                <h1 className="text-4xl md:text-5xl font-bold">{title}</h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">{description}</p>
            {appLink && (
              <Button size="lg" asChild>
                <Link to={appLink}>
                  Open {title} <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {highlights.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="text-center">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium">{h}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="h-full hover:border-primary/50 transition-all">
                <CardContent className="p-5">
                  {f.icon && <span className="text-2xl mb-3 block">{f.icon}</span>}
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">Explore {title} and unlock its full potential.</p>
          <div className="flex gap-4 justify-center">
            {appLink && (
              <Button size="lg" asChild>
                <Link to={appLink}>Launch {title}</Link>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link to="/docs/welcome">Read the Docs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
