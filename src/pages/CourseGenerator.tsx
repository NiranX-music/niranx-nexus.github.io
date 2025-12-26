import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIProviderSelector, useAIProvider, AI_PROVIDERS } from '@/components/ai/AIProviderSelector';
import { useCourses } from '@/hooks/useCourses';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Loader2, Sparkles, Clock, Layers, GraduationCap, ArrowRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const CourseGenerator = () => {
  const navigate = useNavigate();
  const { courses, loading, createCourse, deleteCourse } = useCourses();
  const { provider, setProvider, model, setModel } = useAIProvider('course-generator');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    difficulty: 'intermediate',
    moduleCount: 5,
    subject: '',
  });

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a course topic');
      return;
    }

    setIsGenerating(true);
    
    try {
      const selectedProvider = AI_PROVIDERS.find(p => p.id === provider);
      
      const prompt = `Create a comprehensive course on "${formData.topic}".
${formData.description ? `Additional context: ${formData.description}` : ''}
Difficulty level: ${formData.difficulty}
Number of modules: ${formData.moduleCount}

Generate a structured course with the following JSON format:
{
  "title": "Course Title",
  "description": "Brief course description",
  "estimated_hours": number,
  "modules": [
    {
      "id": "module-1",
      "title": "Module Title",
      "description": "Module overview",
      "lessons": [
        {
          "id": "lesson-1",
          "title": "Lesson Title",
          "content": "Detailed lesson content with explanations, examples, and key concepts",
          "duration_minutes": number
        }
      ],
      "quiz": {
        "id": "quiz-1",
        "questions": [
          {
            "id": "q1",
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 0,
            "explanation": "Why this answer is correct"
          }
        ]
      }
    }
  ]
}

Make the content educational, engaging, and appropriate for the ${formData.difficulty} level.
Each module should have 2-4 lessons. Each quiz should have 3-5 questions.
Return ONLY the JSON, no additional text.`;

      const response = await supabase.functions.invoke('perplexity-chat', {
        body: {
          messages: [
            { role: 'system', content: 'You are an expert course designer. Return ONLY valid JSON, no markdown or additional text.' },
            { role: 'user', content: prompt }
          ],
          model: 'sonar-pro',
        },
      });

      if (response.error) throw new Error(response.error.message);
      
      const content = response.data.choices?.[0]?.message?.content || response.data.content;
      
      // Parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Failed to parse course structure');
      
      const courseData = JSON.parse(jsonMatch[0]);
      
      const newCourse = await createCourse({
        title: courseData.title,
        description: courseData.description,
        subject: formData.subject || formData.topic,
        difficulty: formData.difficulty,
        modules: courseData.modules,
        ai_provider: `${provider}/${model}`,
        estimated_hours: courseData.estimated_hours,
      });

      if (newCourse) {
        toast.success('Course generated successfully!');
        setFormData({
          topic: '',
          description: '',
          difficulty: 'intermediate',
          moduleCount: 5,
          subject: '',
        });
      }
    } catch (error: any) {
      console.error('Error generating course:', error);
      toast.error(error.message || 'Failed to generate course');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">AI Course Generator</h1>
        <p className="text-muted-foreground">Generate structured courses with AI-powered content</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Course
            </CardTitle>
            <CardDescription>Create a complete course structure with AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Course Topic *</Label>
              <Input
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Introduction to Machine Learning"
              />
            </div>
            
            <div>
              <Label>Subject Area</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Computer Science"
              />
            </div>
            
            <div>
              <Label>Additional Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Any specific topics or areas to focus on..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Modules</Label>
                <Select 
                  value={formData.moduleCount.toString()} 
                  onValueChange={(v) => setFormData({ ...formData, moduleCount: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n} modules</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <AIProviderSelector
              selectedProvider={provider}
              selectedModel={model}
              onProviderChange={setProvider}
              onModelChange={setModel}
            />

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !formData.topic.trim()} 
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Course
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Courses */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Your Courses</h2>
          
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : courses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No courses yet</h3>
                <p className="text-muted-foreground">Generate your first course to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <Card key={course.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {course.description}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteCourse(course.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="gap-1">
                        <Layers className="h-3 w-3" />
                        {course.modules.length} modules
                      </Badge>
                      {course.estimated_hours && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {course.estimated_hours}h
                        </Badge>
                      )}
                      <Badge variant="secondary" className="capitalize">
                        {course.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(course.created_at).toLocaleDateString()}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        Start Learning
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseGenerator;
