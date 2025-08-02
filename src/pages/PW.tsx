import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Play, BookOpen, Users, Trophy, Target } from 'lucide-react';
import { useXP } from '@/contexts/XPContext';

const PW = () => {
  const { addXP } = useXP();

  const handleOpenPW = () => {
    addXP(5); // Add XP for accessing study platform
    window.open('https://www.pw.live/study/batches/', '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Physics Wallah
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join India's most affordable and accessible learning platform for JEE, NEET, and competitive exam preparation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <Play className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold">Live Lectures</h3>
              <p className="text-sm text-muted-foreground">Interactive live classes</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold">Study Material</h3>
              <p className="text-sm text-muted-foreground">Comprehensive notes & PDFs</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold">Test Series</h3>
              <p className="text-sm text-muted-foreground">Practice & mock tests</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">Community</h3>
              <p className="text-sm text-muted-foreground">Student discussions</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Access Card */}
        <Card className="border-2 border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Target className="w-6 h-6" />
              Access PW Study Batches
            </CardTitle>
            <p className="text-muted-foreground">
              Explore available batches and join the learning revolution
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline">JEE Main & Advanced</Badge>
              <Badge variant="outline">NEET</Badge>
              <Badge variant="outline">Class 9-12</Badge>
              <Badge variant="outline">Foundation</Badge>
              <Badge variant="outline">Dropper Batches</Badge>
            </div>
            
            <Button 
              size="lg" 
              className="w-full max-w-md mx-auto text-lg py-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              onClick={handleOpenPW}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Open PW Study Batches
            </Button>
            
            <p className="text-sm text-muted-foreground">
              You'll be redirected to Physics Wallah's official platform. Create an account or log in to access courses.
            </p>
          </CardContent>
        </Card>

        {/* Batch Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Batches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Arjuna JEE 2025</span>
                <Badge variant="secondary">Live</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Yakeen NEET 2025</span>
                <Badge variant="secondary">Live</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Lakshya JEE 2026</span>
                <Badge variant="outline">Starting Soon</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Vidyapeeth Class 11</span>
                <Badge variant="outline">Available</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What You Get</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Live Classes</span>
                <Badge variant="secondary">Daily</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Recorded Lectures</span>
                <Badge variant="secondary">500+</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>DPPs & Tests</span>
                <Badge variant="secondary">Weekly</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Doubt Resolution</span>
                <Badge variant="secondary">24/7</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>Why Choose Physics Wallah?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold">Affordable Learning</h3>
                <p className="text-sm text-muted-foreground">Quality education at the most affordable prices</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Expert Faculty</h3>
                <p className="text-sm text-muted-foreground">Learn from IITians and subject experts</p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Proven Results</h3>
                <p className="text-sm text-muted-foreground">Thousands of successful students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Embedded Frame */}
        <Card>
          <CardHeader>
            <CardTitle>PW Study Batches Platform</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-96 border rounded-lg overflow-hidden">
              <iframe
                src="https://www.pw.live/study/batches/"
                className="w-full h-full"
                title="Physics Wallah Study Batches"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PW;