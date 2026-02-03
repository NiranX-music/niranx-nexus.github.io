import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Download, Trash2, Edit, Lock, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const GDPR = () => {
  const rights = [
    {
      icon: Eye,
      title: "Right to Access",
      description: "You can request a copy of all personal data we hold about you."
    },
    {
      icon: Edit,
      title: "Right to Rectification",
      description: "You can request correction of any inaccurate personal data."
    },
    {
      icon: Trash2,
      title: "Right to Erasure",
      description: "You can request deletion of your personal data in certain circumstances."
    },
    {
      icon: Download,
      title: "Right to Data Portability",
      description: "You can request your data in a machine-readable format."
    },
    {
      icon: Lock,
      title: "Right to Restrict Processing",
      description: "You can request limitation of how we use your data."
    },
    {
      icon: Globe,
      title: "Right to Object",
      description: "You can object to processing of your personal data."
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
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">GDPR Compliance</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              We are committed to protecting your privacy and complying with the General Data 
              Protection Regulation (GDPR).
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
          <h2>Our Commitment to GDPR</h2>
          <p>
            NiranX takes data protection seriously. We have implemented comprehensive measures to 
            ensure compliance with the General Data Protection Regulation (GDPR) and to protect 
            the rights of our users in the European Union and worldwide.
          </p>

          <h2>Legal Basis for Processing</h2>
          <p>We process personal data under the following legal bases:</p>
          <ul>
            <li><strong>Contract:</strong> To provide our services as agreed in our Terms of Service</li>
            <li><strong>Consent:</strong> When you opt-in to receive marketing communications</li>
            <li><strong>Legitimate Interest:</strong> To improve our services and prevent fraud</li>
            <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
          </ul>
        </div>
      </div>

      {/* Your Rights */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Your Rights Under GDPR</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {rights.map((right, index) => (
              <motion.div
                key={right.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <right.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{right.title}</h3>
                    <p className="text-sm text-muted-foreground">{right.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Processing */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-lg dark:prose-invert">
          <h2>How to Exercise Your Rights</h2>
          <p>
            You can exercise any of your GDPR rights by contacting our Data Protection Officer 
            at <a href="mailto:dpo@niranx.com">dpo@niranx.com</a>. We will respond to your request 
            within 30 days.
          </p>

          <h2>Data Transfers</h2>
          <p>
            When we transfer personal data outside the European Economic Area (EEA), we ensure 
            appropriate safeguards are in place, such as Standard Contractual Clauses approved 
            by the European Commission.
          </p>

          <h2>Data Retention</h2>
          <p>
            We retain personal data only for as long as necessary to fulfill the purposes for 
            which it was collected, or as required by law. Account data is retained while your 
            account is active and for a reasonable period thereafter.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Manage Your Data</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            You can manage your privacy settings and data preferences directly from your account, 
            or contact our team for assistance.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild>
              <Link to="/profile">Privacy Settings</Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:dpo@niranx.com">Contact DPO</a>
            </Button>
            <Button variant="outline">Download My Data</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPR;
