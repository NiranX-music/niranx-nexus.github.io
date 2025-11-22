import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function TrigonometricRatios() {
  const [angle, setAngle] = useState('30');
  const [results, setResults] = useState({
    sin: 0,
    cos: 0,
    tan: 0,
    csc: 0,
    sec: 0,
    cot: 0
  });

  const calculateRatios = () => {
    const angleRad = parseFloat(angle) * Math.PI / 180;
    const sinValue = Math.sin(angleRad);
    const cosValue = Math.cos(angleRad);
    const tanValue = Math.tan(angleRad);

    setResults({
      sin: parseFloat(sinValue.toFixed(6)),
      cos: parseFloat(cosValue.toFixed(6)),
      tan: parseFloat(tanValue.toFixed(6)),
      csc: parseFloat((1 / sinValue).toFixed(6)),
      sec: parseFloat((1 / cosValue).toFixed(6)),
      cot: parseFloat((1 / tanValue).toFixed(6))
    });
  };

  const commonAngles = [
    { angle: 0, sin: '0', cos: '1', tan: '0' },
    { angle: 30, sin: '1/2', cos: '√3/2', tan: '1/√3' },
    { angle: 45, sin: '1/√2', cos: '1/√2', tan: '1' },
    { angle: 60, sin: '√3/2', cos: '1/2', tan: '√3' },
    { angle: 90, sin: '1', cos: '0', tan: '∞' },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="formulas">Formulas</TabsTrigger>
          <TabsTrigger value="reference">Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trigonometric Calculator</CardTitle>
              <CardDescription>Calculate trigonometric ratios for any angle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="angle">Angle (degrees)</Label>
                <div className="flex gap-2">
                  <Input
                    id="angle"
                    type="number"
                    value={angle}
                    onChange={(e) => setAngle(e.target.value)}
                    placeholder="Enter angle in degrees"
                  />
                  <Button onClick={calculateRatios}>Calculate</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">sin θ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{results.sin}</p>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">cos θ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{results.cos}</p>
                  </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">tan θ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{results.tan}</p>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/5 border-secondary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">csc θ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-secondary">{results.csc}</p>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/5 border-secondary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">sec θ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-secondary">{results.sec}</p>
                  </CardContent>
                </Card>

                <Card className="bg-secondary/5 border-secondary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">cot θ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-secondary">{results.cot}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formulas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trigonometric Formulas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Basic Ratios</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">sin θ = Opposite / Hypotenuse</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">cos θ = Adjacent / Hypotenuse</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">tan θ = Opposite / Adjacent</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Reciprocal Identities</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">csc θ = 1 / sin θ</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">sec θ = 1 / cos θ</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">cot θ = 1 / tan θ</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Pythagorean Identities</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">sin² θ + cos² θ = 1</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">1 + tan² θ = sec² θ</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">1 + cot² θ = csc² θ</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Sum and Difference Formulas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">sin(A ± B) = sin A cos B ± cos A sin B</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">cos(A ± B) = cos A cos B ∓ sin A sin B</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">tan(A ± B) = (tan A ± tan B) / (1 ∓ tan A tan B)</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Double Angle Formulas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">sin 2θ = 2 sin θ cos θ</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">cos 2θ = cos² θ - sin² θ</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded">
                    <span className="font-mono">tan 2θ = 2 tan θ / (1 - tan² θ)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reference" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Angles Reference</CardTitle>
              <CardDescription>Trigonometric values for frequently used angles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Angle (°)</th>
                      <th className="text-left p-3 font-semibold">sin θ</th>
                      <th className="text-left p-3 font-semibold">cos θ</th>
                      <th className="text-left p-3 font-semibold">tan θ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commonAngles.map((row) => (
                      <tr key={row.angle} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-mono">{row.angle}°</td>
                        <td className="p-3 font-mono">{row.sin}</td>
                        <td className="p-3 font-mono">{row.cos}</td>
                        <td className="p-3 font-mono">{row.tan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="font-semibold text-lg">Unit Circle Values</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">0° / 360°</p>
                      <p className="font-mono text-sm">(1, 0)</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">90°</p>
                      <p className="font-mono text-sm">(0, 1)</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">180°</p>
                      <p className="font-mono text-sm">(-1, 0)</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground mb-1">270°</p>
                      <p className="font-mono text-sm">(0, -1)</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
