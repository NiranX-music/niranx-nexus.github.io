import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Beaker, FlaskConical, Droplet, Scale, Thermometer } from 'lucide-react';
import { toast } from 'sonner';

type Equipment = 'beaker' | 'test-tube' | 'measuring-cylinder' | 'scale' | 'thermometer';

interface Measurement {
  value: number;
  unit: string;
}

export function VirtualEquipment() {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment>('beaker');
  const [measurement, setMeasurement] = useState<Measurement>({ value: 0, unit: 'ml' });
  const [liquidColor, setLiquidColor] = useState('#3b82f6');

  const equipment = [
    { type: 'beaker' as Equipment, icon: Beaker, name: 'Beaker', capacity: 500, unit: 'ml' },
    { type: 'test-tube' as Equipment, icon: FlaskConical, name: 'Test Tube', capacity: 20, unit: 'ml' },
    { type: 'measuring-cylinder' as Equipment, icon: Droplet, name: 'Measuring Cylinder', capacity: 100, unit: 'ml' },
    { type: 'scale' as Equipment, icon: Scale, name: 'Digital Scale', capacity: 500, unit: 'g' },
    { type: 'thermometer' as Equipment, icon: Thermometer, name: 'Thermometer', capacity: 100, unit: '°C' },
  ];

  const currentEquipment = equipment.find(e => e.type === selectedEquipment)!;
  const fillPercentage = (measurement.value / currentEquipment.capacity) * 100;

  const handleMeasure = () => {
    toast.success(`Measured ${measurement.value}${currentEquipment.unit} using ${currentEquipment.name}`);
  };

  const handleReset = () => {
    setMeasurement({ value: 0, unit: currentEquipment.unit });
    toast.info('Equipment reset');
  };

  return (
    <div className="space-y-6">
      {/* Equipment Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {equipment.map((item) => (
          <Button
            key={item.type}
            variant={selectedEquipment === item.type ? 'default' : 'outline'}
            className="flex flex-col h-auto py-4"
            onClick={() => {
              setSelectedEquipment(item.type);
              setMeasurement({ value: 0, unit: item.unit });
            }}
          >
            <item.icon className="w-8 h-8 mb-2" />
            <span className="text-xs">{item.name}</span>
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Virtual Equipment Display */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <currentEquipment.icon className="w-5 h-5" />
              {currentEquipment.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-96 flex items-end justify-center">
              {/* Equipment Container */}
              <div className="relative w-48 h-80 border-4 border-foreground rounded-b-lg bg-background/50">
                {/* Liquid Fill */}
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-b"
                  style={{
                    height: `${fillPercentage}%`,
                    backgroundColor: liquidColor,
                    opacity: 0.7,
                  }}
                />
                
                {/* Measurement Markings */}
                <div className="absolute inset-0 flex flex-col justify-between py-4">
                  {[100, 75, 50, 25].map((percent) => (
                    <div key={percent} className="flex items-center justify-between px-2">
                      <div className="w-4 h-px bg-foreground/50" />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(currentEquipment.capacity * (percent / 100))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Current Measurement Display */}
            <div className="mt-6 text-center">
              <Badge variant="secondary" className="text-2xl px-6 py-3">
                {measurement.value.toFixed(1)} {currentEquipment.unit}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Measurement Slider */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Adjust Measurement
              </label>
              <Slider
                value={[measurement.value]}
                onValueChange={([value]) => 
                  setMeasurement({ value, unit: currentEquipment.unit })
                }
                max={currentEquipment.capacity}
                step={currentEquipment.capacity / 100}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground text-center">
                Max: {currentEquipment.capacity} {currentEquipment.unit}
              </p>
            </div>

            {/* Liquid Color Picker */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Liquid Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#06b6d4'].map((color) => (
                  <button
                    key={color}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      liquidColor === color ? 'border-foreground scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setLiquidColor(color)}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleMeasure} className="flex-1">
                Record Measurement
              </Button>
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            </div>

            {/* Equipment Info */}
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-2">Equipment Info</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Capacity:</strong> {currentEquipment.capacity} {currentEquipment.unit}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Precision:</strong> ±{(currentEquipment.capacity / 100).toFixed(2)} {currentEquipment.unit}
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
