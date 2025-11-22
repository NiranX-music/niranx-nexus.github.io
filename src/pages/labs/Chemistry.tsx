import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Beaker, Table2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PeriodicTable from '@/components/labs/PeriodicTable';

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
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="periodic-table" className="flex items-center gap-2">
            <Table2 className="w-4 h-4" />
            Periodic Table
          </TabsTrigger>
          <TabsTrigger value="reactions" disabled>
            Chemical Reactions
          </TabsTrigger>
          <TabsTrigger value="molecules" disabled>
            Molecular Models
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
              <CardTitle>Chemical Reactions</CardTitle>
              <CardDescription>Coming soon...</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interactive chemical reaction simulator will be available here.
              </p>
            </CardContent>
          </Card>
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
