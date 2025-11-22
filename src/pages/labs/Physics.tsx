import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Atom, Zap, Radio, Magnet, ClipboardList, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LabQuiz } from '@/components/labs/LabQuiz';
import { LabNotebook } from '@/components/labs/LabNotebook';
import { physicsQuestions } from '@/data/quizQuestions';

export default function Physics() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pendulum');
  const [pendulumAngle, setPendulumAngle] = useState(30);
  const [waveAmplitude, setWaveAmplitude] = useState(50);
  const [waveFrequency, setWaveFrequency] = useState(2);
  const [isPendulumSwinging, setIsPendulumSwinging] = useState(false);

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
            <Atom className="w-8 h-8" />
            Physics Lab
          </h1>
          <p className="text-muted-foreground">
            Experiment with mechanics, waves, and electricity
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="pendulum" className="flex items-center gap-2">
            <Magnet className="w-4 h-4" />
            Pendulum
          </TabsTrigger>
          <TabsTrigger value="waves" className="flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Waves
          </TabsTrigger>
          <TabsTrigger value="electricity" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Circuits
          </TabsTrigger>
          <TabsTrigger value="projectile" className="flex items-center gap-2">
            <Atom className="w-4 h-4" />
            Projectile
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

        <TabsContent value="pendulum" className="mt-6">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Simple Pendulum Simulator</CardTitle>
              <CardDescription>
                Adjust the angle and watch the pendulum swing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative h-96 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg flex items-start justify-center overflow-hidden pt-4">
                <div className="relative w-full h-full flex justify-center">
                  <div className="absolute top-0 w-2 h-2 bg-foreground rounded-full" />
                  <svg className="absolute top-0" width="400" height="384" style={{ overflow: 'visible' }}>
                    <line
                      x1="200"
                      y1="0"
                      x2={200 + Math.sin((pendulumAngle * Math.PI) / 180) * 150}
                      y2={Math.cos((pendulumAngle * Math.PI) / 180) * 150}
                      stroke="currentColor"
                      strokeWidth="2"
                      className={isPendulumSwinging ? 'animate-pulse' : ''}
                    />
                    <circle
                      cx={200 + Math.sin((pendulumAngle * Math.PI) / 180) * 150}
                      cy={Math.cos((pendulumAngle * Math.PI) / 180) * 150}
                      r="20"
                      fill="hsl(var(--primary))"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Initial Angle: {pendulumAngle}°
                  </label>
                  <Slider
                    value={[pendulumAngle]}
                    onValueChange={(value) => setPendulumAngle(value[0])}
                    min={0}
                    max={90}
                    step={1}
                    disabled={isPendulumSwinging}
                  />
                </div>
                <Button
                  onClick={() => setIsPendulumSwinging(!isPendulumSwinging)}
                  className="w-full"
                >
                  {isPendulumSwinging ? 'Stop' : 'Start'} Pendulum
                </Button>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-2 text-sm">
                  <p><strong>Period:</strong> Time for one complete swing</p>
                  <p><strong>Formula:</strong> T = 2π√(L/g)</p>
                  <p>Where L is length and g is gravity (9.8 m/s²)</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waves">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Wave Motion Simulator</CardTitle>
              <CardDescription>
                Adjust amplitude and frequency to see wave patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg flex items-center justify-center">
                <svg width="600" height="200" viewBox="0 0 600 200" className="w-full">
                  <path
                    d={Array.from({ length: 600 }, (_, x) => {
                      const y =
                        100 +
                        waveAmplitude *
                          Math.sin((x * waveFrequency * Math.PI) / 100);
                      return `${x === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                  />
                  <line
                    x1="0"
                    y1="100"
                    x2="600"
                    y2="100"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                    className="text-muted-foreground"
                  />
                </svg>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Amplitude: {waveAmplitude}
                  </label>
                  <Slider
                    value={[waveAmplitude]}
                    onValueChange={(value) => setWaveAmplitude(value[0])}
                    min={10}
                    max={80}
                    step={5}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    Frequency: {waveFrequency}
                  </label>
                  <Slider
                    value={[waveFrequency]}
                    onValueChange={(value) => setWaveFrequency(value[0])}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-semibold mb-1">Wavelength</p>
                    <p className="text-2xl font-bold">{(200 / waveFrequency).toFixed(1)} units</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-semibold mb-1">Amplitude</p>
                    <p className="text-2xl font-bold">{waveAmplitude} units</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="electricity">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Simple Circuit Simulator</CardTitle>
              <CardDescription>
                Build and test electrical circuits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-96 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg flex items-center justify-center">
                <svg width="400" height="300" viewBox="0 0 400 300">
                  {/* Battery */}
                  <g>
                    <rect x="50" y="140" width="30" height="20" fill="hsl(var(--primary))" />
                    <text x="65" y="155" textAnchor="middle" className="text-xs fill-primary-foreground">
                      +
                    </text>
                    <line x1="80" y1="150" x2="120" y2="150" stroke="currentColor" strokeWidth="2" />
                  </g>
                  
                  {/* Resistor */}
                  <g>
                    <rect x="280" y="140" width="40" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
                    <text x="300" y="155" textAnchor="middle" className="text-xs fill-current">
                      R
                    </text>
                  </g>

                  {/* Wires */}
                  <line x1="120" y1="150" x2="280" y2="150" stroke="currentColor" strokeWidth="2" />
                  <line x1="320" y1="150" x2="350" y2="150" stroke="currentColor" strokeWidth="2" />
                  <line x1="350" y1="150" x2="350" y2="250" stroke="currentColor" strokeWidth="2" />
                  <line x1="350" y1="250" x2="50" y2="250" stroke="currentColor" strokeWidth="2" />
                  <line x1="50" y1="250" x2="50" y2="160" stroke="currentColor" strokeWidth="2" />

                  {/* Current flow arrows */}
                  <g className="animate-pulse">
                    <path d="M 200 150 l -5 -5 l 0 10 z" fill="hsl(var(--primary))" />
                    <path d="M 350 200 l 5 -5 l -10 0 z" fill="hsl(var(--primary))" />
                  </g>
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-semibold mb-1">Voltage</p>
                    <p className="text-2xl font-bold">9V</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm font-semibold mb-1">Current</p>
                    <p className="text-2xl font-bold">0.9A</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-2 text-sm">
                  <p><strong>Ohm's Law:</strong> V = I × R</p>
                  <p>Voltage (V) = Current (I) × Resistance (R)</p>
                  <p>This circuit shows current flowing through a simple resistor</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projectile">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle>Projectile Motion</CardTitle>
              <CardDescription>
                Visualize parabolic motion of projectiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-96 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-lg relative overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
                  {/* Ground */}
                  <line x1="0" y1="350" x2="600" y2="350" stroke="currentColor" strokeWidth="2" />
                  
                  {/* Trajectory */}
                  <path
                    d={Array.from({ length: 100 }, (_, i) => {
                      const t = i / 20;
                      const x = 50 + t * 80;
                      const y = 350 - (t * 60 - 5 * t * t * 9.8);
                      return `${i === 0 ? 'M' : 'L'} ${x} ${Math.max(y, 350)}`;
                    }).join(' ')}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  
                  {/* Projectile */}
                  <circle cx="50" cy="350" r="8" fill="hsl(var(--primary))" className="animate-pulse" />
                </svg>
              </div>

              <Card>
                <CardContent className="pt-6 space-y-2 text-sm">
                  <p><strong>Initial Velocity:</strong> 50 m/s</p>
                  <p><strong>Angle:</strong> 45°</p>
                  <p><strong>Range Formula:</strong> R = (v² sin2θ) / g</p>
                  <p>Maximum range achieved at 45° angle</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz">
          <LabQuiz labType="physics" quizId="physics-basics" questions={physicsQuestions} />
        </TabsContent>

        <TabsContent value="notebook">
          <LabNotebook labType="physics" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
