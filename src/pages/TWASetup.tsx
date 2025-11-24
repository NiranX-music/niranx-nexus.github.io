import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Smartphone, 
  FileCode, 
  Key, 
  Link, 
  CheckCircle, 
  Download,
  Terminal,
  FileJson,
  ShieldCheck,
  Globe,
  Info
} from 'lucide-react';

export default function TWASetup() {
  const appUrl = window.location.origin;
  
  return (
    <div className="container max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Android TWA Setup Guide</h1>
        <p className="text-xl text-muted-foreground">
          Deploy NiranX StudyVerse as a native Android app using Trusted Web Activity
        </p>
        <Badge variant="secondary" className="text-lg">
          <Smartphone className="w-4 h-4 mr-2" />
          Native Android Wrapper
        </Badge>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>What is TWA?</strong> Trusted Web Activity allows you to wrap your web app in a native Android app shell. 
          Your app will appear in Google Play Store and have full access to Android features while running your web content.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="prerequisites" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
          <TabsTrigger value="android-studio">Android Studio</TabsTrigger>
          <TabsTrigger value="asset-links">Asset Links</TabsTrigger>
          <TabsTrigger value="signing">App Signing</TabsTrigger>
          <TabsTrigger value="publish">Publish</TabsTrigger>
        </TabsList>

        <TabsContent value="prerequisites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Before You Start
              </CardTitle>
              <CardDescription>Required tools and setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Download className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-semibold">1. Install Android Studio</p>
                    <p className="text-sm text-muted-foreground">
                      Download from <a href="https://developer.android.com/studio" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developer.android.com/studio</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Globe className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-semibold">2. Domain Setup</p>
                    <p className="text-sm text-muted-foreground">
                      Your app must be hosted on a custom domain with HTTPS. Current URL: <code className="bg-background px-2 py-1 rounded">{appUrl}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <ShieldCheck className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <p className="font-semibold">3. Google Play Console Account</p>
                    <p className="text-sm text-muted-foreground">
                      Create a developer account at <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">play.google.com/console</a> (one-time $25 fee)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PWA Requirements ✓</CardTitle>
              <CardDescription>Your app already meets these requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Web App Manifest configured
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Service Worker for offline support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  HTTPS enabled (required for TWA)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  App icons (192x192 and 512x512)
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="android-studio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                Create Android Project
              </CardTitle>
              <CardDescription>Using Bubblewrap CLI (Recommended)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertDescription>
                  Bubblewrap is Google's official tool for generating TWA projects. It automates most of the setup process.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div>
                  <p className="font-semibold mb-2">Step 1: Install Bubblewrap CLI</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>npm install -g @bubblewrap/cli</code>
                  </pre>
                </div>

                <div>
                  <p className="font-semibold mb-2">Step 2: Initialize TWA Project</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>bubblewrap init --manifest={appUrl}/manifest.webmanifest</code>
                  </pre>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will ask you questions about your app. Use these values:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Domain: <code className="bg-background px-1 rounded">{appUrl.replace('https://', '')}</code></li>
                    <li>• Package Name: <code className="bg-background px-1 rounded">com.niranx.studyverse</code></li>
                    <li>• App Name: NiranX StudyVerse</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Step 3: Build the APK</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>bubblewrap build</code>
                  </pre>
                  <p className="text-sm text-muted-foreground mt-2">
                    This generates a signed APK you can test on your device.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual Android Studio Setup (Alternative)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="space-y-3 text-sm list-decimal list-inside">
                <li>Open Android Studio → New Project → "Empty Activity"</li>
                <li>Set package name: <code className="bg-muted px-2 py-1 rounded">com.niranx.studyverse</code></li>
                <li>Add TWA library in <code className="bg-muted px-2 py-1 rounded">build.gradle</code>:
                  <pre className="bg-muted p-3 rounded-lg mt-2 overflow-x-auto">
                    <code>implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'</code>
                  </pre>
                </li>
                <li>Configure AndroidManifest.xml (see Asset Links tab for details)</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="asset-links" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Digital Asset Links
              </CardTitle>
              <CardDescription>Connect your website to your Android app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Digital Asset Links verify that you own both the website and the Android app, enabling TWA to work seamlessly.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <div>
                  <p className="font-semibold mb-2">Step 1: Generate SHA-256 Fingerprint</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Run this command in your Android project directory:
                  </p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android</code>
                  </pre>
                  <p className="text-sm text-muted-foreground mt-2">
                    Copy the SHA-256 fingerprint from the output.
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-2">Step 2: Create assetlinks.json</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Place this file at: <code className="bg-background px-2 py-1 rounded">/.well-known/assetlinks.json</code>
                  </p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.niranx.studyverse",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT_HERE"
    ]
  }
}]`}
                  </pre>
                </div>

                <div>
                  <p className="font-semibold mb-2">Step 3: Verify Asset Links</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Test your setup:
                  </p>
                  <a 
                    href={`https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=${appUrl}&relation=delegate_permission/common.handle_all_urls`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    → Test Asset Links for {appUrl}
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="w-5 h-5" />
                AndroidManifest.xml Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`<activity
    android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
    android:exported="true">
    
    <meta-data
        android:name="android.support.customtabs.trusted.DEFAULT_URL"
        android:value="${appUrl}" />
    
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>
    
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https"
              android:host="${appUrl.replace('https://', '')}" />
    </intent-filter>
</activity>`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                App Signing for Release
              </CardTitle>
              <CardDescription>Required for Google Play Store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold mb-2">Step 1: Generate Release Keystore</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>keytool -genkey -v -keystore niranx-release-key.keystore -alias niranx -keyalg RSA -keysize 2048 -validity 10000</code>
                  </pre>
                  <Alert className="mt-3">
                    <ShieldCheck className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>CRITICAL:</strong> Store this keystore file and password securely! If lost, you cannot update your app on Play Store.
                    </AlertDescription>
                  </Alert>
                </div>

                <div>
                  <p className="font-semibold mb-2">Step 2: Configure signing in build.gradle</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
{`android {
    signingConfigs {
        release {
            storeFile file('niranx-release-key.keystore')
            storePassword 'YOUR_PASSWORD'
            keyAlias 'niranx'
            keyPassword 'YOUR_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}`}
                  </pre>
                </div>

                <div>
                  <p className="font-semibold mb-2">Step 3: Build Release APK/AAB</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>./gradlew bundleRelease</code>
                  </pre>
                  <p className="text-sm text-muted-foreground mt-2">
                    This creates an Android App Bundle (.aab) in <code className="bg-background px-2 py-1 rounded">app/build/outputs/bundle/release/</code>
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-2">Step 4: Update Asset Links with Release SHA-256</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                    <code>keytool -list -v -keystore niranx-release-key.keystore</code>
                  </pre>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add this new SHA-256 to your assetlinks.json file alongside the debug fingerprint.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publish" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Publish to Google Play Store
              </CardTitle>
              <CardDescription>Final steps to go live</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <span className="font-bold text-primary">1</span>
                  <div>
                    <p className="font-semibold">Create App in Play Console</p>
                    <p className="text-sm text-muted-foreground">
                      Go to <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Play Console</a> → Create app
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <span className="font-bold text-primary">2</span>
                  <div>
                    <p className="font-semibold">Upload AAB File</p>
                    <p className="text-sm text-muted-foreground">
                      Production → Create new release → Upload your .aab file
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <span className="font-bold text-primary">3</span>
                  <div>
                    <p className="font-semibold">Complete Store Listing</p>
                    <p className="text-sm text-muted-foreground">
                      Add app description, screenshots, icon, and other required information
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <span className="font-bold text-primary">4</span>
                  <div>
                    <p className="font-semibold">Content Rating & Privacy Policy</p>
                    <p className="text-sm text-muted-foreground">
                      Fill out the content rating questionnaire and provide your privacy policy URL
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <span className="font-bold text-primary">5</span>
                  <div>
                    <p className="font-semibold">Submit for Review</p>
                    <p className="text-sm text-muted-foreground">
                      Review takes 1-7 days. You'll receive updates via email.
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Post-Launch:</strong> Updates are automatic! When you update your website, users will see changes instantly without needing to update the app from Play Store.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Helpful Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://developer.chrome.com/docs/android/trusted-web-activity/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    → Official TWA Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com/GoogleChromeLabs/bubblewrap" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    → Bubblewrap GitHub Repository
                  </a>
                </li>
                <li>
                  <a href="https://developers.google.com/digital-asset-links/v1/getting-started" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    → Digital Asset Links Guide
                  </a>
                </li>
                <li>
                  <a href="https://support.google.com/googleplay/android-developer/answer/9859152" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    → Play Store Submission Guide
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}