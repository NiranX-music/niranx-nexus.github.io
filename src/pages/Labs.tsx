import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Beaker, FlaskConical, Atom, Dna, Microscope, Calculator } from 'lucide-react';

export default function Labs() {
  const navigate = useNavigate();

  const subjects = [
    {
      id: 'chemistry',
      title: 'Chemistry Lab',
      description: 'Explore the periodic table, chemical reactions, and molecular structures',
      icon: Beaker,
      color: 'from-blue-500 to-cyan-500',
      available: true,
    },
    {
      id: 'physics',
      title: 'Physics Lab',
      description: 'Experiment with mechanics, electricity, and quantum phenomena',
      icon: Atom,
      color: 'from-purple-500 to-pink-500',
      available: true,
    },
    {
      id: 'biology',
      title: 'Biology Lab',
      description: 'Study cells, genetics, and living organisms',
      icon: Dna,
      color: 'from-green-500 to-emerald-500',
      available: true,
    },
    {
      id: 'advanced',
      title: 'Advanced Lab',
      description: 'Interdisciplinary experiments and research projects',
      icon: Microscope,
      color: 'from-orange-500 to-red-500',
      available: false,
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Virtual Science Labs</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore interactive scientific experiments and visualizations across different subjects.
          Learn through hands-on virtual experiences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const Icon = subject.icon;
          return (
            <Card
              key={subject.id}
              className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-neon"
            >
              <CardHeader>
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${subject.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle>{subject.title}</CardTitle>
                <CardDescription>{subject.description}</CardDescription>
              </CardHeader>
              <CardContent>
              {subject.available ? (
                  <Button
                    onClick={() => navigate(`/niranx/labs/${subject.id}`)}
                    className={`w-full bg-gradient-to-r ${subject.color} text-white hover:opacity-90 transition-all duration-300 hover:shadow-lg`}
                  >
                    Enter Lab
                  </Button>
                ) : (
                  <Button disabled className="w-full bg-muted text-muted-foreground">
                    Coming Soon
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            About Virtual Labs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Virtual Science Labs provide interactive simulations and visualizations to help you
            understand complex scientific concepts. Each lab is designed to be educational and
            engaging, allowing you to explore at your own pace.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background/50 border border-border">
              <h3 className="font-semibold mb-2">Interactive</h3>
              <p className="text-sm text-muted-foreground">
                Hands-on exploration of scientific concepts
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border">
              <h3 className="font-semibold mb-2">Educational</h3>
              <p className="text-sm text-muted-foreground">
                Learn through visual and interactive experiences
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background/50 border border-border">
              <h3 className="font-semibold mb-2">Safe</h3>
              <p className="text-sm text-muted-foreground">
                Experiment without physical lab equipment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
