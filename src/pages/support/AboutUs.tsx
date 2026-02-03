import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, Zap, Globe, Award, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "We believe education should be accessible, engaging, and personalized for everyone."
    },
    {
      icon: Heart,
      title: "User-First",
      description: "Every feature we build starts with understanding our users' needs and challenges."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We leverage AI and cutting-edge technology to revolutionize how people learn."
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Building tools that empower learners and creators worldwide."
    }
  ];

  const stats = [
    { value: "100K+", label: "Active Users" },
    { value: "50+", label: "Countries" },
    { value: "1M+", label: "Study Hours" },
    { value: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
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
              About <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">NiranX</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              We're building the future of learning and creativity. Our platform combines AI-powered tools, 
              music streaming, and collaborative features to create an all-in-one universe for learners and creators.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Award className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-lg text-muted-foreground mb-6">
              NiranX started with a simple idea: what if we could combine all the tools students and creators 
              need into one seamless platform? From AI-powered study assistants to music production tools, 
              we've built an ecosystem that grows with you.
            </p>
            <p className="text-lg text-muted-foreground">
              Today, we're proud to serve users from over 50 countries, helping them learn, create, 
              and achieve their goals every single day.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Join Our Journey</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Whether you're a student, creator, or lifelong learner, there's a place for you in the NiranX universe.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg">
            <Link to="/auth">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/careers">Join Our Team</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
