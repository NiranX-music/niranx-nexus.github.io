import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Search, Book, Code, Zap, Users, Settings, 
  FileText, Video, MessageCircle, ExternalLink, ChevronRight 
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Quick start guides and tutorials for new users",
      articles: ["Create Your Account", "Complete Your Profile", "First Steps with Dashboard"],
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "AI Features",
      description: "Learn how to use our AI-powered tools",
      articles: ["XNexus AI Hub", "AI Study Buddy", "Smart PDF Chat"],
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "Work together with study groups and communities",
      articles: ["Study Rooms", "Community Features", "Sharing Resources"],
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Settings,
      title: "Account & Settings",
      description: "Manage your account and preferences",
      articles: ["Profile Settings", "Theme Customization", "Notifications"],
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Technical documentation for developers",
      articles: ["Authentication", "REST API", "Webhooks"],
      color: "from-indigo-500 to-violet-500"
    },
    {
      icon: Video,
      title: "Media & Content",
      description: "XVibe Music, video players, and content creation",
      articles: ["XVibe Music Guide", "Video Library", "Content Upload"],
      color: "from-rose-500 to-red-500"
    },
  ];

  const popularArticles = [
    "How to use the Focus Engine effectively",
    "Setting up flashcard decks for spaced repetition",
    "Integrating with Google Calendar",
    "Using AI to generate study materials",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Documentation</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to know about using NiranX
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Popular Articles */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Popular Articles</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularArticles.map((article) => (
            <Badge 
              key={article} 
              variant="secondary" 
              className="cursor-pointer hover:bg-primary/20 transition-colors py-2 px-4"
            >
              {article}
            </Badge>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {category.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article) => (
                      <li key={article} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                        <ChevronRight className="h-4 w-4" />
                        {article}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our support team is here to help. Reach out and we'll get back to you as soon as possible.
          </p>
          <Button size="lg" asChild>
            <Link to="/support/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
