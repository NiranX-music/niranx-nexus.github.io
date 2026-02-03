import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Cookie, Settings, Shield, Info } from "lucide-react";
import { Link } from "react-router-dom";

const CookiePolicy = () => {
  const cookieTypes = [
    {
      title: "Essential Cookies",
      description: "Required for the website to function properly. These cannot be disabled.",
      examples: ["Session management", "Security tokens", "Load balancing"]
    },
    {
      title: "Functional Cookies",
      description: "Remember your preferences and settings for a better experience.",
      examples: ["Theme preferences", "Language settings", "User preferences"]
    },
    {
      title: "Analytics Cookies",
      description: "Help us understand how visitors interact with our website.",
      examples: ["Page views", "Session duration", "User flow analysis"]
    },
    {
      title: "Marketing Cookies",
      description: "Used to track visitors across websites for advertising purposes.",
      examples: ["Ad targeting", "Conversion tracking", "Retargeting"]
    },
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
            <div className="flex items-center gap-3 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Cookie className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">Cookie Policy</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              This policy explains how NiranX uses cookies and similar technologies.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: February 2025
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your device when you visit a website. 
            They are widely used to make websites work more efficiently and provide information to 
            the owners of the site.
          </p>

          <h2>How We Use Cookies</h2>
          <p>
            NiranX uses cookies to enhance your experience, remember your preferences, and analyze 
            how our platform is used. This helps us improve our services and provide you with 
            relevant content.
          </p>
        </div>
      </div>

      {/* Cookie Types */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Types of Cookies We Use</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {cookieTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{type.description}</p>
                    <ul className="text-sm space-y-1">
                      {type.examples.map((example) => (
                        <li key={example} className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Managing Cookies */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Managing Your Cookie Preferences</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            You can control and manage cookies in various ways. Please note that removing or 
            blocking cookies may impact your user experience and parts of our website may no 
            longer be fully accessible.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Button>Manage Cookie Settings</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <Info className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Questions About Our Cookie Policy?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            If you have any questions about how we use cookies, please contact our privacy team.
          </p>
          <Button asChild>
            <a href="mailto:privacy@niranx.com">Contact Privacy Team</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
