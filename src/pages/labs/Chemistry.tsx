import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Beaker, Table2, FlaskConical, ClipboardList, BookOpen, Users, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PeriodicTable from '@/components/labs/PeriodicTable';
import { ReactionSimulator } from '@/components/labs/ReactionSimulator';
import { LabQuiz } from '@/components/labs/LabQuiz';
import { LabNotebook } from '@/components/labs/LabNotebook';
import { VirtualEquipment } from '@/components/labs/VirtualEquipment';
import { QuizLeaderboard } from '@/components/labs/QuizLeaderboard';
import { CollaborativeExperiments } from '@/components/labs/CollaborativeExperiments';
import { chemistryQuestions } from '@/data/quizQuestions';

export default function Chemistry() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('periodic-table');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/niranx/labs')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Beaker className="w-8 h-8" />
            Chemistry Lab
          </h1>
          <p className="text-muted-foreground">
            Explore chemical elements, reactions, and molecular structures
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 lg:w-auto">
          <TabsTrigger value="periodic-table" className="flex items-center gap-2">
            <Table2 className="w-4 h-4" />
            <span className="hidden lg:inline">Periodic Table</span>
          </TabsTrigger>
          <TabsTrigger value="reactions" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            <span className="hidden lg:inline">Reactions</span>
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Beaker className="w-4 h-4" />
            <span className="hidden lg:inline">Equipment</span>
          </TabsTrigger>
          <TabsTrigger value="collaborative" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden lg:inline">Collaborative</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden lg:inline">Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span className="hidden lg:inline">Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="notebook" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden lg:inline">Notebook</span>
          </TabsTrigger>
          <TabsTrigger value="molecules" disabled>
            <span className="hidden lg:inline">Molecules</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="periodic-table" className="mt-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Interactive Periodic Table</CardTitle>
              <CardDescription>
                Explore all 118 chemical elements with detailed information about each one.
                Elements are color-coded by category for easy identification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PeriodicTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reactions">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Chemical Reaction Simulator</CardTitle>
              <CardDescription>
                Mix elements together to see chemical reactions. Select elements and simulate their interactions!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReactionSimulator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Virtual Lab Equipment</CardTitle>
              <CardDescription>
                Use virtual beakers, test tubes, and measuring tools for precise measurements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VirtualEquipment />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collaborative">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Collaborative Experiments</CardTitle>
              <CardDescription>
                Work together with classmates on shared experiments and projects.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CollaborativeExperiments labType="chemistry" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <LabQuiz labType="chemistry" quizId="chemistry-basics" questions={chemistryQuestions} />
        </TabsContent>

        <TabsContent value="leaderboard">
          <QuizLeaderboard labType="chemistry" />
        </TabsContent>

        <TabsContent value="notebook">
          <LabNotebook labType="chemistry" />
        </TabsContent>

        <TabsContent value="molecules">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Molecular Models</CardTitle>
              <CardDescription>Coming soon...</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                3D molecular structure viewer will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
