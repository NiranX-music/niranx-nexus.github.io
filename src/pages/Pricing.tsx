import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const premiumFeatures = [
  { category: "AI & Intelligence", features: [
    "Unlimited AI Chat messages (currently limited)",
    "XGenesis AI — advanced code & project generation",
    "AI Voice Tutor — unlimited sessions",
    "AI Writing Assistant — long-form mode",
    "AI Image Generator — HD & batch generation",
    "AI Solver — step-by-step solutions without limits",
    "Smart PDF Chat — large document support",
    "AI Meeting Minutes — extended recordings",
    "AI Course Generator — unlimited courses",
    "AI Study Path — personalized adaptive paths",
  ]},
  { category: "Study & Productivity", features: [
    "Focus Engine — advanced analytics & custom presets",
    "Flashcard Generator — spaced repetition AI tuning",
    "Exam Hub — full mock exam library",
    "Virtual Labs — all lab types unlocked",
    "Auto Study Planner — calendar sync & AI scheduling",
    "Cornell Notes — AI-powered summaries",
    "Pomodoro — custom session lengths & ambient packs",
  ]},
  { category: "Creative & Media", features: [
    "XVibe Music — offline mode & high-quality streaming",
    "XStage Studio — advanced editing tools",
    "StreamSphere — HD streaming & screen share",
    "AI Website Generator — custom domains & export",
    "XClip — extended video length & effects",
    "Picture Share — unlimited storage",
  ]},
  { category: "Community & Social", features: [
    "XFlow Social — verified badge & analytics",
    "Debate Arena — tournament hosting",
    "Study Groups — unlimited members",
    "Community Forums — priority posting",
    "Guilds — custom guild creation",
  ]},
  { category: "Dev & Platform", features: [
    "API Console — higher rate limits",
    "Code Playground — private projects & collaboration",
    "XAPI Explorer — premium API access",
    "Webhook Manager — unlimited webhooks",
    "Custom Themes — marketplace publishing",
    "Custom Pages — advanced builder features",
  ]},
  { category: "Storage & Infrastructure", features: [
    "Cloud Storage — 50GB (vs 5GB free)",
    "File Manager — bulk upload & organization",
    "Backblaze integration — unlimited backup",
    "Export & backup — automated daily backups",
  ]},
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to get started",
    icon: Zap,
    color: "from-muted to-muted",
    features: [
      "Basic AI Chat (50 messages/day)",
      "5 AI-generated quizzes/month",
      "Basic Focus Engine",
      "Community access",
      "5GB cloud storage",
      "Standard XVibe streaming",
      "Basic analytics",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    name: "Pro",
    price: "$4.99",
    period: "/month",
    description: "For serious learners & creators",
    icon: Sparkles,
    color: "from-primary to-accent",
    badge: "Most Popular",
    features: [
      "Unlimited AI Chat",
      "Unlimited quiz & course generation",
      "Advanced Focus Engine + analytics",
      "XVibe HD streaming + offline",
      "25GB cloud storage",
      "Priority community features",
      "Advanced study tools",
      "Custom themes",
    ],
    cta: "Coming Soon",
    disabled: true,
  },
  {
    name: "Ultra",
    price: "$9.99",
    period: "/month",
    description: "The complete NiranX experience",
    icon: Crown,
    color: "from-accent to-accent-glow",
    badge: "Best Value",
    features: [
      "Everything in Pro",
      "XGenesis AI full access",
      "50GB cloud storage",
      "API higher rate limits",
      "Custom domain support",
      "Verified badge",
      "Priority support",
      "Early access to new features",
      "Automated backups",
    ],
    cta: "Coming Soon",
    disabled: true,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-16 px-4"
      >
        <Badge variant="outline" className="mb-4 px-4 py-1.5 text-xs border-primary/30 bg-primary/5">
          <Rocket className="h-3.5 w-3.5 mr-1.5" />
          Pricing Update
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          We're Adding <span className="text-primary">Minor Pricing</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          NiranX has always been free, and most features will stay free forever. 
          We're introducing small, affordable plans to help fund ongoing development, 
          server costs, and new features. Your support keeps NiranX alive and growing.
        </p>
      </motion.section>

      {/* Why Pricing */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto px-4 mb-16"
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Why are we adding pricing?
            </h2>
            <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
              <p>NiranX started as a passion project to make learning accessible. As we've grown to support thousands of users with AI models, cloud storage, streaming, and real-time features, the infrastructure costs have grown too.</p>
              <p>Instead of showing ads or selling your data, we chose a transparent approach: <strong className="text-foreground">affordable plans</strong> that unlock premium capabilities while keeping the core experience completely free.</p>
              <p>Every dollar goes directly to servers, AI API costs, storage, and building new features you've been requesting.</p>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Plans Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto px-4 mb-20"
      >
        <h2 className="text-2xl font-bold text-center mb-8">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            return (
              <motion.div key={plan.name} variants={itemVariants}>
                <Card className={`relative h-full border-border/50 hover:border-primary/40 transition-all duration-300 ${plan.badge ? "ring-1 ring-primary/30" : ""}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground shadow-lg text-xs">{plan.badge}</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className={`mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-3`}>
                      <PlanIcon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <div className="mt-3">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Separator className="mb-4" />
                    <ul className="space-y-2.5 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={plan.disabled ? "outline" : "default"} disabled={plan.disabled}>
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Premium Features Breakdown */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-5xl mx-auto px-4"
      >
        <h2 className="text-2xl font-bold text-center mb-3">Features Going Premium</h2>
        <p className="text-center text-muted-foreground mb-10 max-w-xl mx-auto text-sm">
          These features will require a Pro or Ultra plan. Free users will still have access to basic versions.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {premiumFeatures.map((cat) => (
            <motion.div key={cat.category} variants={itemVariants}>
              <Card className="h-full border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Crown className="h-4 w-4 text-primary" />
                    {cat.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1.5">
                    {cat.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* FAQ / Reassurance */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto px-4 mt-16 text-center"
      >
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold mb-2">Will NiranX always have a free tier?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Absolutely. The core NiranX experience — dashboard, basic AI chat, study tools, community, 
              and XVibe — will remain free. Premium plans simply unlock higher limits, advanced AI models, 
              and extra storage. We believe learning should be accessible to everyone.
            </p>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
