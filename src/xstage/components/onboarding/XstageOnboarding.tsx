import { useState } from 'react';
import { useXstage } from '../../contexts/XstageContext';
import { ProjectType, PROJECT_TYPE_CONFIG } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc3, ArrowRight, ArrowLeft, Check, Music, Mic, Shuffle, Handshake } from 'lucide-react';
import { cn } from '@/lib/utils';

const projectTypeIcons: Record<ProjectType, typeof Music> = {
  band: Music,
  solo: Mic,
  side_project: Shuffle,
  collaboration: Handshake,
};

export const XstageOnboarding = () => {
  const { createProject } = useXstage();
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('band');
  const [projectDesc, setProjectDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!projectName.trim()) return;
    setIsCreating(true);
    await createProject(projectName.trim(), projectType, projectDesc.trim());
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-cyan-500/5 via-background to-fuchsia-500/5">
      <Card className="w-full max-w-lg border-border/50 bg-card/80 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center">
              <Disc3 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Xstage</CardTitle>
          <CardDescription>Let's set up your first project</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-2 rounded-full transition-all',
                  s === step ? 'w-8 bg-cyan-500' : s < step ? 'w-2 bg-cyan-500' : 'w-2 bg-muted'
                )}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="name">What's your project called?</Label>
                  <Input
                    id="name"
                    placeholder="e.g., The Midnight Echo"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="text-lg"
                    autoFocus
                  />
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                  disabled={!projectName.trim()}
                  onClick={() => setStep(2)}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Label>What type of project is this?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.entries(PROJECT_TYPE_CONFIG) as [ProjectType, { label: string; emoji: string }][]).map(
                    ([type, config]) => {
                      const Icon = projectTypeIcons[type];
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setProjectType(type)}
                          className={cn(
                            'p-4 rounded-xl border-2 text-left transition-all',
                            projectType === type
                              ? 'border-cyan-500 bg-cyan-500/10'
                              : 'border-border hover:border-muted-foreground/50'
                          )}
                        >
                          <Icon className={cn('h-6 w-6 mb-2', projectType === type ? 'text-cyan-400' : 'text-muted-foreground')} />
                          <p className="font-medium">{config.label}</p>
                        </button>
                      );
                    }
                  )}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                    onClick={() => setStep(3)}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="desc">Add a description (optional)</Label>
                  <Textarea
                    id="desc"
                    placeholder="What's this project about?"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                  <p className="text-sm text-muted-foreground">Your project:</p>
                  <p className="font-semibold text-lg">{projectName}</p>
                  <p className="text-sm text-muted-foreground">
                    {PROJECT_TYPE_CONFIG[projectType].emoji} {PROJECT_TYPE_CONFIG[projectType].label}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                    onClick={handleCreate}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      'Creating...'
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Create Project
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};
