import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import niranxLogo from '@/assets/niranx-logo.jpg';

const PrivacyPolicy = () => {
  const effectiveDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img src={niranxLogo} alt="NiranX Logo" className="w-10 h-10 rounded-xl" />
              <span className="text-2xl font-bold">NiranX</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Link to="/support/contact">
                <Button variant="ghost">Contact</Button>
              </Link>
              <Link to="/niranx/auth">
                <Button>Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Effective Date: {effectiveDate}</p>
        </div>

        <Card className="mb-8">
          <CardContent className="prose prose-sm max-w-none py-8">
            <div className="bg-primary/5 p-4 rounded-lg mb-6">
              <p className="text-sm font-medium">
                <strong>Platform Name:</strong> NiranX<br />
                <strong>Website/App:</strong> niranx.com / StudyVerse
              </p>
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to NiranX ("NiranX", "we", "us", "our"). NiranX is an all-in-one digital platform 
              offering music streaming, artist profiles, blogs, content publishing, discovery tools, and creator services.
            </p>
            <p className="text-muted-foreground mt-4">
              This Privacy Policy explains what information we collect, how and why we use it, how we protect it, 
              and your rights and choices.
            </p>
            <p className="text-muted-foreground mt-4 font-semibold">
              By using NiranX, you agree to this Privacy Policy.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold mt-6 mb-3">2.1 Personal Information You Provide</h3>
            <p className="text-muted-foreground">When you register or use NiranX, you may provide:</p>
            
            <h4 className="font-semibold mt-4 mb-2">Account Information</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Full name or display name</li>
              <li>Username</li>
              <li>Email address</li>
              <li>Password (securely encrypted)</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">Creator / Artist Information</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Artist name and biography</li>
              <li>Profile photos and cover images</li>
              <li>Social media links</li>
              <li>Uploaded songs, albums, lyrics, blogs, and metadata</li>
              <li>Copyright ownership details and credits</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">Communication Data</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Comments</li>
              <li>Messages</li>
              <li>Feedback and support requests</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">Payment & Monetization Data (if applicable)</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Subscription status</li>
              <li>Transaction records</li>
              <li>Payout details for artists (processed via secure third-party providers)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">2.2 Automatically Collected Information</h3>
            <p className="text-muted-foreground">We automatically collect certain data when you use the platform:</p>
            
            <h4 className="font-semibold mt-4 mb-2">Device & Technical Data</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device type and operating system</li>
              <li>App version</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">Usage & Interaction Data</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Songs played, skipped, replayed</li>
              <li>Likes, follows, playlist additions</li>
              <li>Search history within the app</li>
              <li>Listening duration and behavior patterns</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">Log & Security Data</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Login timestamps</li>
              <li>Session identifiers</li>
              <li>Error logs and crash data</li>
            </ul>

            <h3 className="text-lg font-semibold mt-6 mb-3">2.3 Cookies & Tracking Technologies</h3>
            <p className="text-muted-foreground">NiranX uses cookies, local storage, and similar tracking technologies to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Keep you logged in</li>
              <li>Remember preferences</li>
              <li>Improve recommendations</li>
              <li>Analyze performance and usage trends</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              You may disable cookies via browser settings, but some features may not function properly.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">2.4 Third-Party Sources</h3>
            <p className="text-muted-foreground">We may receive information from:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>OAuth providers (Google, Apple, etc.)</li>
              <li>Payment processors</li>
              <li>Analytics services</li>
              <li>Content moderation partners</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Only data permitted by your settings and applicable laws is collected.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use collected information to:</p>
            
            <h4 className="font-semibold mt-4 mb-2">Core Platform Functions</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Create and manage accounts</li>
              <li>Stream audio content</li>
              <li>Display artist profiles and blogs</li>
              <li>Enable playlists and social features</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">Personalization & Recommendations</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Recommend music, artists, and playlists</li>
              <li>Improve discovery and relevance</li>
              <li>Customize user experience</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">Creator & Artist Services</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Process music uploads</li>
              <li>Display public statistics</li>
              <li>Provide analytics dashboards</li>
              <li>Enable monetization and payouts</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">Security & Integrity</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Prevent fraud and abuse</li>
              <li>Detect fake streams and bots</li>
              <li>Enforce platform rules</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">Communication</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Send updates, alerts, and service notifications</li>
              <li>Respond to support requests</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">Legal & Compliance</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Meet regulatory requirements</li>
              <li>Enforce our Terms of Service</li>
              <li>Resolve disputes</li>
            </ul>

            <h2 className="text-xl font-bold mt-8 mb-4">4. Legal Basis for Processing (GDPR-Aligned)</h2>
            <p className="text-muted-foreground">We process data based on:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Your consent</li>
              <li>Performance of a contract</li>
              <li>Legitimate interests</li>
              <li>Legal obligations</li>
            </ul>

            <h2 className="text-xl font-bold mt-8 mb-4">5. Public vs Private Information</h2>
            
            <h4 className="font-semibold mt-4 mb-2">Public Information</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Artist profiles</li>
              <li>Uploaded music and blogs</li>
              <li>Display name and profile photo</li>
              <li>Public playlists and comments</li>
            </ul>

            <h4 className="font-semibold mt-4 mb-2">Private Information</h4>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Email address</li>
              <li>Password</li>
              <li>Payment details</li>
              <li>Private listening history (used internally only)</li>
            </ul>
            <p className="text-muted-foreground mt-2">You control what you choose to make public.</p>

            <h2 className="text-xl font-bold mt-8 mb-4">6. Content Ownership & Rights</h2>
            <p className="text-muted-foreground">
              You retain ownership of your content. By uploading content, you grant NiranX a non-exclusive, 
              worldwide license to host, stream, distribute, and display your content on the platform.
            </p>
            <p className="text-muted-foreground mt-2">
              This license ends when your content is deleted, except where required for legal or operational reasons.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">7. Sharing of Information</h2>
            <p className="text-muted-foreground font-semibold">We do not sell personal data.</p>
            <p className="text-muted-foreground mt-2">We may share data only with:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Cloud hosting & CDN providers</li>
              <li>Analytics and performance tools</li>
              <li>Payment and payout processors</li>
              <li>Legal authorities (only when required)</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              All partners are contractually obligated to protect your data.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">8. Data Security</h2>
            <p className="text-muted-foreground">We implement industry-standard measures including:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>HTTPS encryption</li>
              <li>Secure authentication</li>
              <li>Role-based access control</li>
              <li>Regular system monitoring</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Despite best efforts, no system is completely secure. Use the platform responsibly.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">9. Data Retention</h2>
            <p className="text-muted-foreground">We retain data:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>While your account remains active</li>
              <li>As needed for legal, accounting, or security purposes</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Upon account deletion, personal data is deleted or anonymized. Public content may be removed 
              unless legally required to retain.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">10. Your Rights</h2>
            <p className="text-muted-foreground">You have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account</li>
              <li>Withdraw consent</li>
              <li>Request data portability</li>
              <li>Object to certain processing activities</li>
            </ul>
            <p className="text-muted-foreground mt-2">Requests can be made via our support email.</p>

            <h2 className="text-xl font-bold mt-8 mb-4">11. Children's Privacy</h2>
            <p className="text-muted-foreground">
              NiranX is not intended for users under 13 years of age. We do not knowingly collect data from minors.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">12. International Data Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be stored or processed outside your country. By using NiranX, 
              you consent to such transfers in accordance with applicable laws.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">13. AI & Automated Systems (Future-Ready)</h2>
            <p className="text-muted-foreground">NiranX may use AI systems for:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Music recommendations</li>
              <li>Content moderation</li>
              <li>Analytics insights</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              AI systems do not make legal or financial decisions without human oversight.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">14. Policy Updates</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. Material changes will be communicated clearly. 
              Continued use of NiranX means acceptance of updates.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">15. Contact Information</h2>
            <p className="text-muted-foreground">For questions, data requests, or concerns:</p>
            <ul className="list-none text-muted-foreground space-y-1 mt-2">
              <li>📧 barhateniranjan725@gmail.com</li>
              <li>🌐 https://niranx.com</li>
            </ul>

            <div className="bg-primary/5 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-bold mb-3">🔹 Plain-English Summary</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Your data stays yours</li>
                <li>We don't sell personal info</li>
                <li>Artists keep ownership</li>
                <li>Transparency &gt; shady tactics</li>
                <li>Built for scale, trust, and creators</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Link to="/support/terms">
            <Button variant="outline">View Terms & Conditions</Button>
          </Link>
          <Link to="/support/contact">
            <Button>Contact Us</Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} NiranX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
