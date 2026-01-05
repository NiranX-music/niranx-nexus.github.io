import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FlaskConical, Atom, Zap, TestTube, 
  Play, RotateCcw, Save, Sparkles,
  Beaker, Flame, Thermometer, Scale
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LabExperiment {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  variables: { name: string; min: number; max: number; unit: string; default: number }[];
}

const chemistryExperiments: LabExperiment[] = [
  {
    id: "acid-base",
    name: "Acid-Base Titration",
    description: "Determine the concentration of an unknown acid by titrating with a base",
    icon: <Beaker className="h-6 w-6" />,
    variables: [
      { name: "NaOH Concentration", min: 0.1, max: 1.0, unit: "M", default: 0.5 },
      { name: "Volume Added", min: 0, max: 50, unit: "mL", default: 25 },
    ],
  },
  {
    id: "reaction-rate",
    name: "Reaction Rate Analysis",
    description: "Study how temperature and concentration affect reaction rates",
    icon: <Flame className="h-6 w-6" />,
    variables: [
      { name: "Temperature", min: 20, max: 100, unit: "°C", default: 50 },
      { name: "Concentration", min: 0.1, max: 2.0, unit: "M", default: 1.0 },
    ],
  },
];

const physicsExperiments: LabExperiment[] = [
  {
    id: "pendulum",
    name: "Simple Pendulum",
    description: "Investigate the relationship between length and period",
    icon: <Scale className="h-6 w-6" />,
    variables: [
      { name: "Length", min: 10, max: 100, unit: "cm", default: 50 },
      { name: "Initial Angle", min: 5, max: 45, unit: "°", default: 15 },
    ],
  },
  {
    id: "projectile",
    name: "Projectile Motion",
    description: "Analyze the trajectory of a projectile under gravity",
    icon: <Zap className="h-6 w-6" />,
    variables: [
      { name: "Initial Velocity", min: 5, max: 50, unit: "m/s", default: 20 },
      { name: "Launch Angle", min: 15, max: 75, unit: "°", default: 45 },
    ],
  },
];

export default function VirtualLabs() {
  const [selectedLab, setSelectedLab] = useState<"chemistry" | "physics">("chemistry");
  const [selectedExperiment, setSelectedExperiment] = useState<LabExperiment | null>(null);
  const [variables, setVariables] = useState<Record<string, number>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [observations, setObservations] = useState("");
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const experiments = selectedLab === "chemistry" ? chemistryExperiments : physicsExperiments;

  const selectExperiment = (exp: LabExperiment) => {
    setSelectedExperiment(exp);
    const defaultVars: Record<string, number> = {};
    exp.variables.forEach(v => {
      defaultVars[v.name] = v.default;
    });
    setVariables(defaultVars);
    setResults(null);
    setObservations("");
    setAiFeedback(null);
  };

  const runExperiment = () => {
    if (!selectedExperiment) return;
    
    setIsRunning(true);
    
    // Simulate experiment results based on variables
    setTimeout(() => {
      let simulatedResults: any = {};
      
      if (selectedExperiment.id === "acid-base") {
        const volume = variables["Volume Added"] || 25;
        const concentration = variables["NaOH Concentration"] || 0.5;
        const pH = 7 + Math.log10(concentration * volume / 25);
        simulatedResults = {
          pH: Math.min(14, Math.max(0, pH)).toFixed(2),
          equivalencePoint: (25 / concentration).toFixed(1) + " mL",
          indicator: pH > 8 ? "Pink (Phenolphthalein)" : "Colorless",
        };
      } else if (selectedExperiment.id === "reaction-rate") {
        const temp = variables["Temperature"] || 50;
        const conc = variables["Concentration"] || 1.0;
        const rate = conc * Math.exp((temp - 25) / 10);
        simulatedResults = {
          reactionRate: rate.toFixed(3) + " mol/L·s",
          halfLife: (0.693 / rate).toFixed(2) + " s",
          activationEnergy: "52.3 kJ/mol",
        };
      } else if (selectedExperiment.id === "pendulum") {
        const length = variables["Length"] || 50;
        const period = 2 * Math.PI * Math.sqrt(length / 100 / 9.81);
        simulatedResults = {
          period: period.toFixed(3) + " s",
          frequency: (1 / period).toFixed(3) + " Hz",
          maxVelocity: (Math.sqrt(2 * 9.81 * length / 100 * (1 - Math.cos(variables["Initial Angle"] * Math.PI / 180)))).toFixed(2) + " m/s",
        };
      } else if (selectedExperiment.id === "projectile") {
        const v = variables["Initial Velocity"] || 20;
        const angle = variables["Launch Angle"] || 45;
        const rad = angle * Math.PI / 180;
        const range = (v * v * Math.sin(2 * rad)) / 9.81;
        const maxHeight = (v * v * Math.sin(rad) * Math.sin(rad)) / (2 * 9.81);
        const flightTime = (2 * v * Math.sin(rad)) / 9.81;
        simulatedResults = {
          range: range.toFixed(2) + " m",
          maxHeight: maxHeight.toFixed(2) + " m",
          flightTime: flightTime.toFixed(2) + " s",
        };
      }
      
      setResults(simulatedResults);
      setIsRunning(false);
    }, 2000);
  };

  const analyzeWithAI = async () => {
    if (!selectedExperiment || !results) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-experiment', {
        body: {
          labType: selectedLab,
          experimentName: selectedExperiment.name,
          variables,
          observations,
          provider: 'lovable',
        },
      });

      if (error) throw error;
      setAiFeedback(data.feedback);
      toast({ title: "Analysis complete!", description: "AI feedback is ready" });
    } catch (error: any) {
      toast({ 
        title: "Analysis failed", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveExperiment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !selectedExperiment) {
      toast({ title: "Please sign in to save experiments", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from('virtual_lab_experiments').insert({
        user_id: user.id,
        lab_type: selectedLab,
        experiment_name: selectedExperiment.name,
        variables,
        observations,
        conclusion: aiFeedback?.analysis || null,
        ai_feedback: aiFeedback,
        is_completed: true,
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast({ title: "Experiment saved!", description: "Your lab work has been recorded" });
    } catch (error: any) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              <FlaskConical className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              3D Virtual Labs
            </h1>
          </div>
          <p className="text-muted-foreground">
            Conduct interactive experiments in chemistry and physics
          </p>
        </motion.div>

        {/* Lab Selection */}
        <Tabs value={selectedLab} onValueChange={(v) => setSelectedLab(v as any)}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="chemistry" className="gap-2">
              <TestTube className="h-4 w-4" />
              Chemistry
            </TabsTrigger>
            <TabsTrigger value="physics" className="gap-2">
              <Atom className="h-4 w-4" />
              Physics
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedLab} className="mt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Experiment Selection */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Choose Experiment</h3>
                <div className="space-y-3">
                  {experiments.map((exp) => (
                    <motion.div
                      key={exp.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all ${
                          selectedExperiment?.id === exp.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-accent/50'
                        }`}
                        onClick={() => selectExperiment(exp)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              {exp.icon}
                            </div>
                            <CardTitle className="text-base">{exp.name}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>{exp.description}</CardDescription>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Experiment Controls */}
              <div className="lg:col-span-2 space-y-6">
                {selectedExperiment ? (
                  <>
                    {/* Variables */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Thermometer className="h-5 w-5" />
                          Variables
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {selectedExperiment.variables.map((variable) => (
                          <div key={variable.name} className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">{variable.name}</span>
                              <span className="text-primary font-mono">
                                {variables[variable.name]?.toFixed(1)} {variable.unit}
                              </span>
                            </div>
                            <Slider
                              value={[variables[variable.name] || variable.default]}
                              min={variable.min}
                              max={variable.max}
                              step={(variable.max - variable.min) / 100}
                              onValueChange={([value]) => 
                                setVariables(prev => ({ ...prev, [variable.name]: value }))
                              }
                            />
                          </div>
                        ))}

                        <div className="flex gap-3 pt-4">
                          <Button 
                            onClick={runExperiment} 
                            disabled={isRunning}
                            className="flex-1"
                          >
                            {isRunning ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <Atom className="h-4 w-4 mr-2" />
                                </motion.div>
                                Running...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Run Experiment
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => selectExperiment(selectedExperiment)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Results */}
                    <AnimatePresence>
                      {results && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                Results
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid sm:grid-cols-3 gap-4">
                                {Object.entries(results).map(([key, value]) => (
                                  <div key={key} className="p-4 rounded-xl bg-background border">
                                    <p className="text-sm text-muted-foreground">{key}</p>
                                    <p className="text-xl font-bold text-primary">{value as string}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-2">
                                <label className="font-medium">Your Observations</label>
                                <Textarea
                                  placeholder="Record your observations about this experiment..."
                                  value={observations}
                                  onChange={(e) => setObservations(e.target.value)}
                                  rows={4}
                                />
                              </div>

                              <div className="flex gap-3">
                                <Button 
                                  onClick={analyzeWithAI}
                                  disabled={isAnalyzing}
                                  variant="secondary"
                                  className="flex-1"
                                >
                                  {isAnalyzing ? "Analyzing..." : (
                                    <>
                                      <Sparkles className="h-4 w-4 mr-2" />
                                      Get AI Feedback
                                    </>
                                  )}
                                </Button>
                                <Button onClick={saveExperiment} className="flex-1">
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Experiment
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* AI Feedback */}
                    <AnimatePresence>
                      {aiFeedback && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle>AI Analysis</CardTitle>
                                <Badge variant={
                                  aiFeedback.grade === 'A' ? 'default' :
                                  aiFeedback.grade === 'B' ? 'secondary' : 'outline'
                                }>
                                  Grade: {aiFeedback.grade}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <p className="text-muted-foreground">{aiFeedback.analysis}</p>
                              
                              {aiFeedback.scientificPrinciples?.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Scientific Principles</h4>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    {aiFeedback.scientificPrinciples.map((p: string, i: number) => (
                                      <li key={i}>{p}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {aiFeedback.realWorldApplications?.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Real-World Applications</h4>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    {aiFeedback.realWorldApplications.map((a: string, i: number) => (
                                      <li key={i}>{a}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Card className="h-[400px] flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <FlaskConical className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>Select an experiment to begin</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
