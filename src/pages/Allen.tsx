import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Building2, Users, Clock, Award } from 'lucide-react';
import { useXP } from '@/contexts/XPContext';

const Allen = () => {
  const { addXP } = useXP();

  const handleOpenAllen = () => {
    addXP(5); // Add XP for accessing study platform
    window.open('https://allen.in/login', '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ALLEN Online Classes
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access India's leading coaching institute for competitive exams including JEE, NEET, and Olympiad preparations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold">Expert Faculty</h3>
              <p className="text-sm text-muted-foreground">Top educators with years of experience</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold">Live Classes</h3>
              <p className="text-sm text-muted-foreground">Interactive live sessions</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold">Test Series</h3>
              <p className="text-sm text-muted-foreground">Comprehensive mock tests</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-4">
              <Building2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold">Study Material</h3>
              <p className="text-sm text-muted-foreground">Quality study resources</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Access Card */}
        <Card className="border-2 border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Building2 className="w-6 h-6" />
              Access ALLEN Portal
            </CardTitle>
            <p className="text-muted-foreground">
              Click below to access your ALLEN online classes and study materials
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline">JEE Main & Advanced</Badge>
              <Badge variant="outline">NEET</Badge>
              <Badge variant="outline">Olympiad</Badge>
              <Badge variant="outline">Board Exams</Badge>
            </div>
            
            <Button 
              size="lg" 
              className="w-full max-w-md mx-auto text-lg py-6"
              onClick={handleOpenAllen}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Open ALLEN Login Portal
            </Button>
            
            <p className="text-sm text-muted-foreground">
              You'll be redirected to the official ALLEN website. Please use your registered credentials to log in.
            </p>
          </CardContent>
        </Card>

        {/* Course Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Popular Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>JEE Main & Advanced</span>
                <Badge variant="secondary">Premium</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>NEET</span>
                <Badge variant="secondary">Premium</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Class 10 Board</span>
                <Badge variant="outline">Available</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Class 12 Board</span>
                <Badge variant="outline">Available</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Study Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Video Lectures</span>
                <Badge variant="secondary">1000+</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Practice Questions</span>
                <Badge variant="secondary">50,000+</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Mock Tests</span>
                <Badge variant="secondary">200+</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Study Notes</span>
                <Badge variant="secondary">Updated</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Embedded Frame */}
        <Card>
          <CardHeader>
            <CardTitle>ALLEN Online Platform</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-96 border rounded-lg overflow-hidden">
              <iframe
                src="https://allen.in/login"
                className="w-full h-full"
                title="ALLEN Online Classes"
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

export default Allen;