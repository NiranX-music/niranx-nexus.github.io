import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Dna, Microscope, Activity, ClipboardList, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LabQuiz } from '@/components/labs/LabQuiz';
import { LabNotebook } from '@/components/labs/LabNotebook';
import { biologyQuestions } from '@/data/quizQuestions';

export default function Biology() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cell-structure');

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
            <Dna className="w-8 h-8" />
            Biology Lab
          </h1>
          <p className="text-muted-foreground">
            Explore cells, DNA, and living organisms
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="cell-structure" className="flex items-center gap-2">
            <Microscope className="w-4 h-4" />
            Cells
          </TabsTrigger>
          <TabsTrigger value="dna" className="flex items-center gap-2">
            <Dna className="w-4 h-4" />
            DNA
          </TabsTrigger>
          <TabsTrigger value="systems" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Systems
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="notebook" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Notebook
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cell-structure" className="mt-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Interactive Cell Structure</CardTitle>
              <CardDescription>
                Explore the components of plant and animal cells
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Plant Cell</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-64 bg-green-100 dark:bg-green-900/20 rounded-lg border-4 border-green-500 flex items-center justify-center">
                      <div className="absolute inset-4 border-2 border-green-600 rounded-lg">
                        <div className="w-16 h-16 bg-green-600 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <span className="text-xs text-white flex items-center justify-center h-full">Nucleus</span>
                        </div>
                        <div className="w-12 h-12 bg-green-400 rounded-full absolute top-4 right-4">
                          <span className="text-xs flex items-center justify-center h-full">Chloroplast</span>
                        </div>
                        <div className="w-10 h-10 bg-blue-400 rounded-full absolute bottom-4 left-4">
                          <span className="text-xs flex items-center justify-center h-full">Vacuole</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <p><strong>Cell Wall:</strong> Rigid outer layer</p>
                      <p><strong>Chloroplasts:</strong> Site of photosynthesis</p>
                      <p><strong>Large Vacuole:</strong> Storage and support</p>
                      <p><strong>Nucleus:</strong> Control center</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10">
                  <CardHeader>
                    <CardTitle className="text-lg">Animal Cell</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-64 bg-pink-100 dark:bg-pink-900/20 rounded-full border-4 border-pink-500 flex items-center justify-center">
                      <div className="w-16 h-16 bg-purple-600 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <span className="text-xs text-white flex items-center justify-center h-full">Nucleus</span>
                      </div>
                      <div className="w-8 h-8 bg-red-400 rounded-full absolute top-12 right-12">
                        <span className="text-xs flex items-center justify-center h-full text-[10px]">Mito</span>
                      </div>
                      <div className="w-8 h-8 bg-yellow-400 rounded-full absolute bottom-12 left-12">
                        <span className="text-xs flex items-center justify-center h-full text-[10px]">Lyso</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <p><strong>Cell Membrane:</strong> Flexible outer layer</p>
                      <p><strong>Mitochondria:</strong> Powerhouse of cell</p>
                      <p><strong>Lysosomes:</strong> Waste removal</p>
                      <p><strong>Nucleus:</strong> Contains DNA</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dna">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>DNA Double Helix</CardTitle>
              <CardDescription>
                Explore the structure of DNA and genetic code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 200 400">
                  {[...Array(10)].map((_, i) => {
                    const y = 40 + i * 35;
                    const offset = Math.sin(i * 0.5) * 30;
                    return (
                      <g key={i}>
                        <line
                          x1={70 + offset}
                          y1={y}
                          x2={130 + offset}
                          y2={y}
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-primary"
                        />
                        <circle
                          cx={70 + offset}
                          cy={y}
                          r="6"
                          fill="#3b82f6"
                          className="animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                        <circle
                          cx={130 + offset}
                          cy={y}
                          r="6"
                          fill="#8b5cf6"
                          className="animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                        <path
                          d={`M ${70 + offset},${y} Q 100,${y - 10} ${130 + offset},${y}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          className="text-muted-foreground"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-blue-500/10">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <p className="text-sm font-semibold">Adenine</p>
                  </CardContent>
                </Card>
                <Card className="bg-green-500/10">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                      T
                    </div>
                    <p className="text-sm font-semibold">Thymine</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-500/10">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                      C
                    </div>
                    <p className="text-sm font-semibold">Cytosine</p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-500/10">
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                      G
                    </div>
                    <p className="text-sm font-semibold">Guanine</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Base Pairing Rules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">• Adenine (A) pairs with Thymine (T)</p>
                  <p className="text-sm">• Cytosine (C) pairs with Guanine (G)</p>
                  <p className="text-sm">• DNA forms a double helix structure</p>
                  <p className="text-sm">• Contains genetic instructions for development and function</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="systems">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Human Body Systems</CardTitle>
              <CardDescription>
                Learn about different organ systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Circulatory System', icon: '❤️', color: 'red' },
                  { name: 'Respiratory System', icon: '🫁', color: 'blue' },
                  { name: 'Digestive System', icon: '🍽️', color: 'green' },
                  { name: 'Nervous System', icon: '🧠', color: 'purple' },
                  { name: 'Skeletal System', icon: '🦴', color: 'gray' },
                  { name: 'Muscular System', icon: '💪', color: 'orange' },
                ].map((system, index) => (
                  <Card key={index} className={`bg-${system.color}-500/10`}>
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-2">{system.icon}</div>
                      <p className="font-semibold">{system.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <LabQuiz labType="biology" quizId="biology-basics" questions={biologyQuestions} />
        </TabsContent>

        <TabsContent value="notebook">
          <LabNotebook labType="biology" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
