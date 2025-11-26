import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GraduationCap, Users, ExternalLink, ArrowLeft, AlertTriangle, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const StudyPlatforms = () => {
  const [activeEmbed, setActiveEmbed] = useState<{ name: string; url: string } | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const platforms = [
    {
      name: 'Allen Digital',
      url: 'https://allen.in/login',
      icon: GraduationCap,
      description: 'Access Allen Digital platform for comprehensive study materials and online classes',
      color: 'bg-blue-500',
    },
    {
      name: 'Physics Wallah',
      url: 'https://www.pw.live/study/batches/',
      icon: Users,
      description: 'Join Physics Wallah live batches and study sessions',
      color: 'bg-green-500',
    },
  ];

  const handlePlatformSelect = (platform: { name: string; url: string }) => {
    setActiveEmbed(platform);
    toast({
      title: `${platform.name} Loaded`,
      description: `${platform.name} has been embedded successfully`,
    });
  };

  const handleOpenInNewTab = () => {
    if (activeEmbed) {
      window.open(activeEmbed.url, '_blank');
    }
  };

  const handleClearEmbed = () => {
    setActiveEmbed(null);
    setCustomUrl('');
  };

  const handleCustomEmbed = () => {
    if (!customUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to embed",
        variant: "destructive",
      });
      return;
    }

    let formattedUrl = customUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setActiveEmbed({ name: 'Custom Website', url: formattedUrl });
    toast({
      title: "Website Loaded",
      description: "Custom website embedded successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/niranx/website')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Website Embed
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              <GraduationCap className="w-8 h-8" />
              Study Platforms
            </h1>
            <p className="text-muted-foreground">
              Access Allen and Physics Wallah platforms directly in the app
            </p>
          </div>
        </div>

        {/* Custom Website Embedder */}
        {!activeEmbed && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Embed Any Website
              </CardTitle>
              <CardDescription>
                Enter any website URL to embed it here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Type URL here"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomEmbed()}
                  className="flex-1"
                />
                <Button onClick={handleCustomEmbed} className="gap-2">
                  <Globe className="w-4 h-4" />
                  Embed
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform Selection */}
        {!activeEmbed && (
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {platforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Card key={platform.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${platform.color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{platform.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          Study Platform
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{platform.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handlePlatformSelect(platform)}
                        className="flex-1"
                      >
                        Open in App
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.open(platform.url, '_blank')}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        New Tab
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Active Platform Display */}
        {activeEmbed && (
          <>
            {/* Platform Controls */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{activeEmbed.name}</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleOpenInNewTab}
                      className="gap-2"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      New Tab
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleClearEmbed}
                      size="sm"
                    >
                      Back to Selection
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Security Warning */}
            <Card className="max-w-2xl mx-auto border-orange-200 bg-orange-50 dark:bg-orange-900/10">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      Platform Access
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      You'll need to log in to access your courses and materials. Use your existing credentials for {activeEmbed.name}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Embedded Platform */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{activeEmbed.name} Platform</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {activeEmbed.url}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[800px] border rounded-b-lg overflow-hidden">
                  <iframe
                    src={activeEmbed.url}
                    className="w-full h-full border-0"
                    title={`${activeEmbed.name} Platform`}
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
                    loading="lazy"
                  />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Platform Features */}
        {!activeEmbed && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
              <CardDescription>What you can access on each platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-blue-500" />
                    Allen Digital Features
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Live and recorded video lectures</li>
                    <li>• Comprehensive study materials</li>
                    <li>• Mock tests and assessments</li>
                    <li>• Doubt clearing sessions</li>
                    <li>• Progress tracking and analytics</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    Physics Wallah Features
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Interactive live classes</li>
                    <li>• Batch-wise organized content</li>
                    <li>• Student community access</li>
                    <li>• Regular tests and quizzes</li>
                    <li>• Affordable quality education</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudyPlatforms;