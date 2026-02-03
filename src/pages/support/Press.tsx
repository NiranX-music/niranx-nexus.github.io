import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Mail, ArrowLeft, Newspaper, Calendar, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Press = () => {
  const pressReleases = [
    {
      date: "February 2025",
      title: "NiranX Launches XNexus AI Hub with 60+ Open Source Models",
      excerpt: "Revolutionary AI platform brings open-source models to students and creators worldwide."
    },
    {
      date: "January 2025",
      title: "NiranX Reaches 100,000 Active Users Milestone",
      excerpt: "The all-in-one learning platform celebrates rapid growth across 50+ countries."
    },
    {
      date: "December 2024",
      title: "XVibe Music: Free Music Streaming Integrated into Learning Platform",
      excerpt: "NiranX introduces distraction-free music streaming designed for focused study sessions."
    },
  ];

  const mediaKit = [
    { name: "Brand Guidelines", format: "PDF" },
    { name: "Logo Pack", format: "ZIP" },
    { name: "Product Screenshots", format: "ZIP" },
    { name: "Executive Headshots", format: "ZIP" },
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
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Press & <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Media</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find the latest news, press releases, and media resources about NiranX.
            </p>
            <Button asChild>
              <a href="mailto:press@niranx.com" className="gap-2">
                <Mail className="h-4 w-4" />
                Contact Press Team
              </a>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Press Releases */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Latest News</h2>
        <div className="space-y-6">
          {pressReleases.map((release, index) => (
            <motion.div
              key={release.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Newspaper className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{release.date}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {release.title}
                      </h3>
                      <p className="text-muted-foreground">{release.excerpt}</p>
                    </div>
                    <ExternalLink className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Media Kit */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Media Kit</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {mediaKit.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <Download className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold mb-1">{item.name}</h3>
                    <Badge variant="secondary">{item.format}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Media Inquiries</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          For interviews, partnerships, or media inquiries, please reach out to our press team.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" asChild>
            <a href="mailto:press@niranx.com">press@niranx.com</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Press;
