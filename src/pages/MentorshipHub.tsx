import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, Star, BookOpen, Code, Brain, Palette, MessageCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const mentors = [
  { name: 'Alex Chen', subjects: ['Mathematics', 'Physics'], rating: 4.9, sessions: 142, bio: 'PhD student specializing in applied mathematics and quantum mechanics.', availability: 'Mon-Fri, 3-7 PM' },
  { name: 'Sarah Kim', subjects: ['Computer Science', 'Python'], rating: 4.8, sessions: 98, bio: 'Software engineer at a top tech company, passionate about teaching coding.', availability: 'Weekends, 10 AM-4 PM' },
  { name: 'James Wright', subjects: ['English Literature', 'Essay Writing'], rating: 4.7, sessions: 76, bio: 'Published author and English professor with 10 years of teaching experience.', availability: 'Tue-Thu, 5-9 PM' },
  { name: 'Maria Garcia', subjects: ['Biology', 'Chemistry'], rating: 4.9, sessions: 113, bio: 'Medical student with a passion for making science accessible and fun.', availability: 'Mon-Wed, 4-8 PM' },
  { name: 'David Park', subjects: ['Art', 'Design'], rating: 4.6, sessions: 64, bio: 'UI/UX designer and digital artist, mentor for creative projects.', availability: 'Flexible' },
  { name: 'Priya Sharma', subjects: ['AI', 'Machine Learning'], rating: 4.8, sessions: 87, bio: 'AI researcher focused on NLP and deep learning architectures.', availability: 'Wed-Sat, 2-6 PM' },
];

const subjectIcons: Record<string, typeof Brain> = {
  Mathematics: Brain, Physics: Brain, 'Computer Science': Code, Python: Code,
  'English Literature': BookOpen, 'Essay Writing': BookOpen, Biology: Brain,
  Chemistry: Brain, Art: Palette, Design: Palette, AI: Brain, 'Machine Learning': Brain,
};

export default function MentorshipHub() {
  const [search, setSearch] = useState('');
  const filtered = mentors.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.subjects.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Users className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold font-[Orbitron]">Mentorship Hub</h1>
        </div>
        <p className="text-muted-foreground">Find expert mentors and get personalized guidance</p>
      </div>

      <Tabs defaultValue="find">
        <TabsList className="w-full max-w-md mx-auto">
          <TabsTrigger value="find" className="flex-1">Find Mentors</TabsTrigger>
          <TabsTrigger value="become" className="flex-1">Become a Mentor</TabsTrigger>
        </TabsList>

        <TabsContent value="find" className="space-y-4 mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name or subject..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((m, i) => (
              <Card key={i} className="border-primary/20 bg-card/60 backdrop-blur-sm hover:border-primary/40 transition-all">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14 border-2 border-primary/30">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{m.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{m.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />{m.rating}
                        <span>·</span>{m.sessions} sessions
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{m.bio}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.subjects.map(s => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />{m.availability}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => toast.success(`Request sent to ${m.name}!`)}>
                      <MessageCircle className="w-4 h-4 mr-1" />Request Session
                    </Button>
                    <Button size="sm" variant="outline">View Profile</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="become" className="mt-6">
          <Card className="border-primary/20 bg-card/60 backdrop-blur-sm max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Apply to Become a Mentor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Share your expertise with the community. Mentors earn XP, badges, and recognition.</p>
              <Input placeholder="Your areas of expertise" />
              <Input placeholder="Years of experience" type="number" />
              <Input placeholder="Brief bio (what makes you a great mentor?)" />
              <Button className="w-full" onClick={() => toast.success('Application submitted! We\'ll review it shortly.')}>Submit Application</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
