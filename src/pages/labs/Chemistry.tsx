import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Beaker, Table2, FlaskConical, ClipboardList, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PeriodicTable from '@/components/labs/PeriodicTable';
import { ReactionSimulator } from '@/components/labs/ReactionSimulator';
import { LabQuiz } from '@/components/labs/LabQuiz';
import { LabNotebook } from '@/components/labs/LabNotebook';
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
          onClick={() => navigate('/labs')}
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
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="periodic-table" className="flex items-center gap-2">
            <Table2 className="w-4 h-4" />
            Periodic Table
          </TabsTrigger>
          <TabsTrigger value="reactions" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            Reactions
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="notebook" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Notebook
          </TabsTrigger>
          <TabsTrigger value="molecules" disabled>
            Molecules
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

        <TabsContent value="quiz">
          <LabQuiz labType="chemistry" quizId="chemistry-basics" questions={chemistryQuestions} />
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
