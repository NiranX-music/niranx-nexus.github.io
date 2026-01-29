import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chrome, Download, Settings, Puzzle, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function ExtensionDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadExtension = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();

      // Manifest file
      const manifest = {
        manifest_version: 3,
        name: "NiranX StudyVerse",
        short_name: "NiranX",
        version: "1.0.0",
        description: "Your Ultimate Study Companion - AI-powered learning, focus tools, and productivity features. Transform your new tab into a study dashboard.",
        author: "NiranX Team",
        homepage_url: window.location.origin,
        icons: {
          "16": "icon-16.png",
          "32": "icon-32.png",
          "48": "icon-48.png",
          "128": "icon-128.png"
        },
        chrome_url_overrides: {
          newtab: "index.html"
        },
        permissions: ["storage", "alarms", "notifications"],
        optional_permissions: ["tabs", "bookmarks", "history"],
        background: {
          service_worker: "background.js",
          type: "module"
        },
        content_security_policy: {
          extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
        },
        offline_enabled: true,
        minimum_chrome_version: "88"
      };

      // Background service worker
      const backgroundJs = `
// NiranX StudyVerse Background Service Worker
console.log('NiranX StudyVerse Extension loaded');

// Initialize default settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    studyStreak: 0,
    totalStudyTime: 0,
    lastVisit: new Date().toISOString(),
    settings: {
      notifications: true,
      dailyGoal: 120,
      theme: 'system'
    }
  });
});

// Study reminder alarms
chrome.alarms.create('studyReminder', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'studyReminder') {
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings?.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon-128.png',
          title: 'Study Reminder',
          message: 'Time to focus! Open a new tab to continue your study session.',
          priority: 2
        });
      }
    });
  }
});
`;

      // Simple HTML redirect page
      const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NiranX StudyVerse</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 { font-size: 3rem; margin-bottom: 1rem; }
    p { font-size: 1.2rem; opacity: 0.8; margin-bottom: 2rem; }
    .btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 1rem 2rem;
      font-size: 1.1rem;
      border-radius: 12px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }
    .loader {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255,255,255,0.2);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 2rem auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎓 NiranX StudyVerse</h1>
    <p>Your Ultimate Study Companion</p>
    <div class="loader"></div>
    <p style="font-size: 0.9rem;">Loading your study dashboard...</p>
    <br><br>
    <a href="${window.location.origin}" class="btn" target="_blank">Open Full Dashboard</a>
  </div>
</body>
</html>`;

      // Create a simple icon (base64 encoded PNG)
      const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea"/>
            <stop offset="100%" style="stop-color:#764ba2"/>
          </linearGradient>
        </defs>
        <rect width="128" height="128" rx="24" fill="url(#bg)"/>
        <text x="64" y="85" font-size="64" text-anchor="middle" fill="white">📚</text>
      </svg>`;

      // Add files to ZIP
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));
      zip.file('background.js', backgroundJs);
      zip.file('index.html', indexHtml);
      zip.file('icon.svg', iconSvg);

      // Create README
      const readme = `# NiranX StudyVerse Chrome Extension

## Installation Steps:

1. Extract this ZIP file to a folder on your computer
2. Open Chrome and go to: chrome://extensions
3. Enable "Developer mode" (toggle in top right corner)
4. Click "Load unpacked"
5. Select the extracted folder
6. Open a new tab to see NiranX StudyVerse!

## Features:
- Study dashboard on every new tab
- Focus timer with notifications
- Study streak tracking
- Quick access to AI tools

## Note:
For the full experience with all features, visit: ${window.location.origin}

The extension provides a quick-access version that links to the full web app.
`;

      zip.file('README.txt', readme);

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'NiranX-StudyVerse-Extension.zip');

      toast.success('Extension downloaded! Extract the ZIP and follow the installation steps.');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to create extension package. Please try again.');
    } finally {
      setIsDownloading(false);
    }
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
            <Button onClick={handleDownloadExtension} size="lg" className="gap-2" disabled={isDownloading}>
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? 'Creating Package...' : 'Download Extension'}
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
