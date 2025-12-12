import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Download, Clock, BookOpen, Trophy, 
  GraduationCap, Languages, Briefcase, Star, Users
} from 'lucide-react';

interface StudyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template_data: Record<string, any>;
  downloads_count: number;
  created_at: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  language: <Languages className="w-5 h-5" />,
  competitive: <Trophy className="w-5 h-5" />,
  academic: <GraduationCap className="w-5 h-5" />,
  habit: <Clock className="w-5 h-5" />,
  professional: <Briefcase className="w-5 h-5" />
};

const categoryColors: Record<string, string> = {
  language: 'from-blue-500 to-cyan-500',
  competitive: 'from-orange-500 to-red-500',
  academic: 'from-green-500 to-emerald-500',
  habit: 'from-purple-500 to-pink-500',
  professional: 'from-gray-500 to-slate-500'
};

export default function StudyTemplates() {
  const [templates, setTemplates] = useState<StudyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('study_templates')
        .select('*')
        .eq('is_active', true)
        .order('downloads_count', { ascending: false });

      if (error) throw error;
      setTemplates((data || []).map(t => ({
        ...t,
        template_data: (t.template_data as Record<string, any>) || {}
      })));
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load study templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async (template: StudyTemplate) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to apply study templates',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    try {
      // Increment download count
      await supabase
        .from('study_templates')
        .update({ downloads_count: (template.downloads_count || 0) + 1 })
        .eq('id', template.id);

      // Create tasks based on template
      const templateData = template.template_data;
      const tasks = [];
      const startDate = new Date();

      if (templateData.phases) {
        templateData.phases.forEach((phase, index) => {
          const dueDate = new Date(startDate);
          dueDate.setDate(dueDate.getDate() + (index + 1) * 7);
          tasks.push({
            user_id: user.id,
            title: `${template.name}: ${phase}`,
            description: `Phase ${index + 1} of your study plan`,
            due_date: dueDate.toISOString(),
            priority: 'high',
            status: 'pending'
          });
        });
      } else if (templateData.subjects) {
        templateData.subjects.forEach((subject, index) => {
          const dueDate = new Date(startDate);
          dueDate.setDate(dueDate.getDate() + (index + 1) * 7);
          tasks.push({
            user_id: user.id,
            title: `${template.name}: ${subject}`,
            description: `Focus on ${subject}`,
            due_date: dueDate.toISOString(),
            priority: 'high',
            status: 'pending'
          });
        });
      }

      if (tasks.length > 0) {
        await supabase.from('tasks').insert(tasks);
      }

      toast({
        title: 'Template Applied! 🎉',
        description: `${template.name} has been added to your schedule`,
      });

      navigate('/tasks');
    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply template',
        variant: 'destructive'
      });
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Study Templates
          </h1>
          <p className="text-muted-foreground text-lg">
            Quick-start your preparation with proven study plans
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex-wrap h-auto">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="capitalize">
                  {cat === 'all' ? 'All' : cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-muted" />
                  <div className="h-6 w-3/4 bg-muted rounded mt-4" />
                  <div className="h-4 w-full bg-muted rounded mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Templates Found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Templates will appear here soon'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[template.category] || 'from-primary to-primary/60'} flex items-center justify-center text-white mb-2`}>
                      {categoryIcons[template.category] || <BookOpen className="w-5 h-5" />}
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">{template.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.template_data.weeks && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {template.template_data.weeks} weeks
                        </Badge>
                      )}
                      {template.template_data.daily_hours && (
                        <Badge variant="outline" className="text-xs">
                          {template.template_data.daily_hours}h/day
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs capitalize">
                        {template.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-1" />
                        {template.downloads_count || 0} users
                      </div>
                      <Button size="sm" onClick={() => handleApplyTemplate(template)}>
                        <Download className="w-4 h-4 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
