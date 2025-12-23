import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import niranxLogo from '@/assets/niranx-logo.jpg';

const TermsConditions = () => {
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
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms and Conditions</h1>
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

            <h2 className="text-xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              Welcome to NiranX ("NiranX", "we", "us", "our"). By accessing or using the NiranX website, 
              mobile app, or any related services (collectively, the "Platform"), you agree to be bound 
              by these Terms and Conditions, our Privacy Policy, and any additional policies we publish.
            </p>
            <p className="text-muted-foreground mt-2 font-semibold">
              If you do not agree, do not use the Platform.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">2. Eligibility</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>You must be at least 13 years old to use NiranX.</li>
              <li>If you are under 18, you confirm that a parent or legal guardian has reviewed and approved your use.</li>
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate eligibility rules.</li>
            </ul>

            <h2 className="text-xl font-bold mt-8 mb-4">3. Account Registration & Security</h2>
            
            <h3 className="text-lg font-semibold mt-6 mb-3">3.1 User Accounts</h3>
            <p className="text-muted-foreground">To access certain features, you must create an account. You are responsible for:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activity occurring under your account</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              NiranX is not liable for unauthorized access caused by your failure to secure your account.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">3.2 Account Suspension or Termination</h3>
            <p className="text-muted-foreground">We may suspend or terminate your account if you:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Violate these Terms</li>
              <li>Upload illegal or infringing content</li>
              <li>Engage in fraud, abuse, or manipulation (including fake streams)</li>
              <li>Harm the platform or other users</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Termination may result in loss of access to content and data.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">4. Platform Services</h2>
            <p className="text-muted-foreground">NiranX provides:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Music streaming</li>
              <li>Artist and creator profiles</li>
              <li>Song, album, and playlist hosting</li>
              <li>Artist blogs and written content</li>
              <li>Discovery, recommendations, and analytics</li>
              <li>Community and interaction features</li>
              <li>Optional monetization tools</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              We may modify, add, or remove features at any time.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">5. Content & User Responsibilities</h2>
            
            <h3 className="text-lg font-semibold mt-6 mb-3">5.1 User Content</h3>
            <p className="text-muted-foreground">"User Content" includes:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Music, audio files</li>
              <li>Lyrics</li>
              <li>Blogs and written posts</li>
              <li>Images, artwork, metadata</li>
              <li>Comments and messages</li>
            </ul>
            <p className="text-muted-foreground mt-2 font-semibold">
              You are solely responsible for the content you upload or publish.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">5.2 Content Ownership</h3>
            <p className="text-muted-foreground">
              You retain ownership of your content. By uploading content, you grant NiranX a non-exclusive, 
              worldwide, royalty-free license to host, store, stream, display, distribute, and promote 
              your content on the Platform.
            </p>
            <p className="text-muted-foreground mt-2">
              This license is necessary to operate NiranX and ends when content is removed, except where legally required.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-3">5.3 Prohibited Content</h3>
            <p className="text-muted-foreground">You may NOT upload or share content that:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Infringes copyright or intellectual property</li>
              <li>Is illegal, abusive, hateful, or defamatory</li>
              <li>Contains malware or harmful code</li>
              <li>Promotes violence, terrorism, or exploitation</li>
              <li>Is misleading, fraudulent, or impersonates others</li>
            </ul>
            <p className="text-muted-foreground mt-2 font-semibold">
              Violation may result in immediate removal or account termination.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">6. Music Uploads & Copyright</h2>
            <p className="text-muted-foreground">If you upload music, you confirm that:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>You own the rights, or</li>
              <li>You have legal permission from the rights holder</li>
            </ul>
            <p className="text-muted-foreground mt-2">NiranX may:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Perform copyright checks</li>
              <li>Remove infringing content</li>
              <li>Respond to takedown requests</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Repeat infringement may lead to permanent account removal.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">7. Streaming, Plays & Analytics</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Stream counts, likes, and analytics are calculated using NiranX systems.</li>
              <li>Artificial manipulation of streams (bots, loops, paid traffic) is strictly prohibited.</li>
              <li>NiranX reserves the right to adjust, freeze, or remove fraudulent metrics.</li>
              <li>Analytics are provided "as is" and may be updated or corrected over time.</li>
            </ul>

            <h2 className="text-xl font-bold mt-8 mb-4">8. Monetization & Payments (If Applicable)</h2>
            <p className="text-muted-foreground">If NiranX offers paid subscriptions, ads, or creator payouts:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Payments are processed via third-party providers</li>
              <li>You agree to their terms as well</li>
              <li>NiranX does not guarantee earnings or revenue levels</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Refunds, payouts, and pricing are governed by separate policies where applicable.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">9. AI & Automated Features</h2>
            <p className="text-muted-foreground">NiranX may use AI systems for:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Music and content recommendations</li>
              <li>Content moderation</li>
              <li>Analytics insights</li>
              <li>Creator assistance tools</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              AI outputs are informational, not legal or financial advice. Human oversight is applied where required.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">10. Community Guidelines & Moderation</h2>
            <p className="text-muted-foreground">We aim to keep NiranX safe and respectful. We reserve the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Moderate content</li>
              <li>Remove posts or comments</li>
              <li>Restrict or ban users</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Moderation decisions are final, but appeals may be reviewed.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">11. Third-Party Links & Services</h2>
            <p className="text-muted-foreground">
              NiranX may contain links to third-party websites or services. We are not responsible for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Third-party content</li>
              <li>Their privacy practices</li>
              <li>External services you choose to use</li>
            </ul>
            <p className="text-muted-foreground mt-2">Use them at your own risk.</p>

            <h2 className="text-xl font-bold mt-8 mb-4">12. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All platform elements (excluding user content), including logos, branding, design, software, 
              and trademarks are the property of NiranX and may not be copied or reused without permission.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">13. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">NiranX is provided "as is" and "as available." We do not guarantee:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Uninterrupted access</li>
              <li>Error-free operation</li>
              <li>Specific results or popularity</li>
            </ul>
            <p className="text-muted-foreground mt-2 font-semibold">Use the platform at your own risk.</p>

            <h2 className="text-xl font-bold mt-8 mb-4">14. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, NiranX shall not be liable for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Loss of data</li>
              <li>Lost revenue or opportunities</li>
              <li>Content removal</li>
              <li>Indirect or consequential damages</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Our total liability shall not exceed the amount you paid us (if any) in the past 12 months.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">15. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless NiranX from claims arising out of:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Your content</li>
              <li>Your misuse of the platform</li>
              <li>Your violation of these Terms</li>
            </ul>

            <h2 className="text-xl font-bold mt-8 mb-4">16. Termination</h2>
            <p className="text-muted-foreground">
              You may stop using NiranX at any time. We may terminate or suspend access for Terms violations, 
              legal or security reasons, or at our discretion with or without notice.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">17. Changes to These Terms</h2>
            <p className="text-muted-foreground">
              We may update these Terms from time to time. Updates will be posted on the Platform. 
              Continued use means acceptance of changes.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">18. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of India (unless you choose another jurisdiction). 
              Any disputes shall be subject to the courts of the applicable jurisdiction.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">19. Contact Information</h2>
            <p className="text-muted-foreground">For questions or legal concerns:</p>
            <ul className="list-none text-muted-foreground space-y-1 mt-2">
              <li>📧 barhateniranjan725@gmail.com</li>
              <li>🌐 https://niranx.com</li>
            </ul>

            <div className="bg-primary/5 p-6 rounded-lg mt-8">
              <h3 className="text-lg font-bold mb-3">🔹 Plain-English Summary</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>You own your content</li>
                <li>Don't upload illegal or stolen stuff</li>
                <li>No fake streams</li>
                <li>Respect the community</li>
                <li>NiranX isn't responsible for everything, but we play fair</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Link to="/support/privacy">
            <Button variant="outline">View Privacy Policy</Button>
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

export default TermsConditions;
