import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chrome, Download, Settings, Puzzle, CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function ExtensionDownload() {
  const handleDownloadExtension = () => {
    toast.info('Extension package will be available for download. Follow the manual installation steps below.');
  };

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Puzzle className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold">NiranX Browser Extension</h1>
        <p className="text-xl text-muted-foreground">
          Transform every new tab into your personal study dashboard
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Chrome className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>Chrome Extension</CardTitle>
              <CardDescription>Available for Chrome, Edge, Brave & other Chromium browsers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Features</h3>
              <ul className="space-y-3">
                {[
                  'Replace new tab with study dashboard',
                  'Quick access to AI tools',
                  'Focus timer with notifications',
                  'Study streak tracking',
                  'Offline support',
                  'Sync across devices'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Installation Steps</h3>
              <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                <li>Download the extension package</li>
                <li>Open <code className="bg-muted px-1 py-0.5 rounded">chrome://extensions</code></li>
                <li>Enable "Developer mode" (top right)</li>
                <li>Click "Load unpacked"</li>
                <li>Select the downloaded folder</li>
                <li>Open a new tab to see NiranX!</li>
              </ol>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={handleDownloadExtension} size="lg" className="gap-2">
              <Download className="w-4 h-4" />
              Download Extension
            </Button>
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <a href="https://developer.chrome.com/docs/extensions/mv3/getstarted/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Extension Guide
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Settings className="w-8 h-8 text-primary mb-2" />
            <CardTitle className="text-lg">Customizable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure notifications, study goals, and appearance to match your workflow.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-8 h-8 text-primary mb-2 flex items-center justify-center text-2xl">⚡</div>
            <CardTitle className="text-lg">Lightning Fast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Instant access to study tools. No loading screens, no delays.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-8 h-8 text-primary mb-2 flex items-center justify-center text-2xl">🔒</div>
            <CardTitle className="text-lg">Privacy First</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your data stays on your device. No tracking, no analytics.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Build Your Own Extension</CardTitle>
          <CardDescription>For developers who want to customize the extension</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`# Clone the repository
git clone https://github.com/niranx/studyverse-extension

# Install dependencies
npm install

# Build for production
npm run build

# Load the 'dist' folder in chrome://extensions`}</pre>
          </div>
          <p className="text-sm text-muted-foreground">
            The extension is built with React, Vite, and Manifest V3. You can customize themes, 
            add new widgets, or integrate with your own APIs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
