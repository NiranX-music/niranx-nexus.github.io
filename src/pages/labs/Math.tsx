import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calculator as CalculatorIcon, Shapes, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Calculator } from '@/components/labs/Calculator';
import { TrigonometricRatios } from '@/components/labs/TrigonometricRatios';

export default function Math() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calculator');

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
            <CalculatorIcon className="w-8 h-8" />
            Math Lab
          </h1>
          <p className="text-muted-foreground">
            Explore mathematical calculations, formulas, and concepts
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <CalculatorIcon className="w-4 h-4" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="trigonometry" className="flex items-center gap-2">
            <Shapes className="w-4 h-4" />
            Trigonometry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <Calculator />
        </TabsContent>

        <TabsContent value="trigonometry" className="space-y-4">
          <TrigonometricRatios />
        </TabsContent>
      </Tabs>
    </div>
  );
}
