import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, ArrowRight, ArrowLeft, Heart, Rocket, Users, Coffee } from "lucide-react";
import { Link } from "react-router-dom";

const Careers = () => {
  const benefits = [
    { icon: Heart, title: "Health & Wellness", description: "Comprehensive health coverage for you and your family" },
    { icon: Rocket, title: "Growth", description: "Learning budget and career development opportunities" },
    { icon: Users, title: "Team Culture", description: "Collaborative, inclusive, and supportive environment" },
    { icon: Coffee, title: "Work-Life Balance", description: "Flexible hours, remote-first, unlimited PTO" },
  ];

  const openings = [
    {
      title: "Senior Full-Stack Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Help us build the next generation of learning tools using React, TypeScript, and Supabase."
    },
    {
      title: "AI/ML Engineer",
      department: "AI Research",
      location: "Remote",
      type: "Full-time",
      description: "Design and implement AI features that personalize the learning experience."
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Create beautiful, intuitive interfaces that delight our users."
    },
    {
      title: "Community Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      description: "Build and nurture our growing community of learners and creators."
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
            <Badge className="mb-4">We're Hiring!</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Join the <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">NiranX</span> Team
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Help us build the future of learning and creativity. We're looking for passionate people 
              who want to make education accessible to everyone.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Work With Us?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full text-center">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {openings.map((job, index) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <Badge variant="secondary">{job.department}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{job.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <Button className="gap-2">
                        Apply Now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-6">Don't See a Fit?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          We're always looking for talented people. Send us your resume and tell us how you'd like to contribute.
        </p>
        <Button size="lg" asChild>
          <a href="mailto:careers@niranx.com">Send Your Resume</a>
        </Button>
      </div>
    </div>
  );
};

export default Careers;
