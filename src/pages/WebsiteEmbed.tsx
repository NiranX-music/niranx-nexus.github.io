import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Globe, ExternalLink, AlertTriangle, GraduationCap, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const WebsiteEmbed = () => {
  const [url, setUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleEmbedWebsite = () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      const validUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
      setLoading(true);
      
      // Set the embed URL
      setEmbedUrl(validUrl.toString());
      
      toast({
        title: "Website Loaded",
        description: "The website has been embedded successfully",
      });
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearEmbed = () => {
    setEmbedUrl('');
    setUrl('');
  };

  const handleOpenInNewTab = () => {
    if (embedUrl) {
      window.open(embedUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Globe className="w-8 h-8" />
            Open Any Website
          </h1>
          <p className="text-muted-foreground">
            Enter any website URL to view it embedded in this page
          </p>
        </div>

        {/* URL Input Card */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Website URL
            </CardTitle>
            <CardDescription>
              Enter the URL of the website you want to embed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleEmbedWebsite()}
                />
                <Button 
                  onClick={handleEmbedWebsite}
                  disabled={loading}
                  className="px-6"
                >
                  {loading ? 'Loading...' : 'Embed'}
                </Button>
              </div>
            </div>

            {embedUrl && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleOpenInNewTab}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClearEmbed}
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Warning */}
        {embedUrl && (
          <Card className="max-w-2xl mx-auto border-orange-200 bg-orange-50 dark:bg-orange-900/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Security Notice
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Be cautious when entering sensitive information on embedded websites. 
                    Some websites may not load due to security restrictions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Embedded Website */}
        {embedUrl && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Embedded Website</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {embedUrl}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-[800px] border rounded-b-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-0"
                  title="Embedded Website"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  loading="lazy"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Study Platforms Quick Access */}
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Study Platforms
            </CardTitle>
            <CardDescription>Quick access to Allen and Physics Wallah platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/niranx/website/study-platforms')}
                className="flex-1 gap-2 bg-blue-500 hover:bg-blue-600"
              >
                <GraduationCap className="w-4 h-4" />
                Allen & PW Platforms
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Popular Websites */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Click to quickly embed popular websites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { name: 'Google', url: 'https://google.com' },
                { name: 'YouTube', url: 'https://youtube.com' },
                { name: 'Wikipedia', url: 'https://wikipedia.org' },
                { name: 'GitHub', url: 'https://github.com' },
                { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
                { name: 'Reddit', url: 'https://reddit.com' },
                { name: 'Khan Academy', url: 'https://khanacademy.org' },
                { name: 'Coursera', url: 'https://coursera.org' },
              ].map((site) => (
                <Button
                  key={site.name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUrl(site.url);
                    setEmbedUrl(site.url);
                  }}
                  className="text-xs"
                >
                  {site.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebsiteEmbed;