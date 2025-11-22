import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface Element {
  number: number;
  symbol: string;
  name: string;
  category: string;
  atomicMass?: number;
  electronConfiguration?: string;
  electronegativity?: number;
  meltingPoint?: number;
  boilingPoint?: number;
  density?: number;
  uses?: string[];
  discoveredBy?: string;
  discoveryYear?: number;
}

interface ElementDetailModalProps {
  element: Element | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const elementData: Record<number, Partial<Element>> = {
  1: {
    atomicMass: 1.008,
    electronConfiguration: '1s¹',
    electronegativity: 2.20,
    meltingPoint: -259.16,
    boilingPoint: -252.87,
    density: 0.0899,
    uses: ['Fuel cells', 'Ammonia production', 'Hydrogenation', 'Rocket fuel'],
    discoveredBy: 'Henry Cavendish',
    discoveryYear: 1766,
  },
  6: {
    atomicMass: 12.011,
    electronConfiguration: '1s² 2s² 2p²',
    electronegativity: 2.55,
    meltingPoint: 3550,
    boilingPoint: 4027,
    density: 2.267,
    uses: ['Steel production', 'Organic chemistry', 'Pencils', 'Diamonds', 'Graphite'],
    discoveredBy: 'Known since ancient times',
    discoveryYear: undefined,
  },
  8: {
    atomicMass: 15.999,
    electronConfiguration: '1s² 2s² 2p⁴',
    electronegativity: 3.44,
    meltingPoint: -218.79,
    boilingPoint: -182.96,
    density: 1.429,
    uses: ['Breathing', 'Steel production', 'Medical applications', 'Water purification'],
    discoveredBy: 'Joseph Priestley, Carl Wilhelm Scheele',
    discoveryYear: 1774,
  },
  79: {
    atomicMass: 196.967,
    electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹',
    electronegativity: 2.54,
    meltingPoint: 1064.18,
    boilingPoint: 2856,
    density: 19.32,
    uses: ['Jewelry', 'Electronics', 'Dentistry', 'Investment'],
    discoveredBy: 'Known since ancient times',
    discoveryYear: undefined,
  },
};

export function ElementDetailModal({ element, open, onOpenChange }: ElementDetailModalProps) {
  if (!element) return null;

  const details = elementData[element.number] || {};
  const combinedElement = { ...element, ...details };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'alkali-metal': 'bg-orange-500',
      'alkaline-earth-metal': 'bg-orange-400',
      'transition-metal': 'bg-green-500',
      'post-transition-metal': 'bg-green-400',
      'metalloid': 'bg-purple-500',
      'nonmetal': 'bg-blue-500',
      'halogen': 'bg-blue-400',
      'noble-gas': 'bg-purple-600',
      'lanthanide': 'bg-yellow-400',
      'actinide': 'bg-yellow-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-lg ${getCategoryColor(element.category)} flex items-center justify-center text-white`}>
              <div className="text-center">
                <div className="text-xs">{element.number}</div>
                <div className="text-3xl font-bold">{element.symbol}</div>
              </div>
            </div>
            <div>
              <DialogTitle className="text-3xl">{element.name}</DialogTitle>
              <DialogDescription className="text-lg">
                {element.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="uses">Uses</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                {combinedElement.atomicMass && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Atomic Mass:</span>
                    <span>{combinedElement.atomicMass} u</span>
                  </div>
                )}
                {combinedElement.electronConfiguration && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Electron Configuration:</span>
                    <span className="font-mono text-sm">{combinedElement.electronConfiguration}</span>
                  </div>
                )}
                {combinedElement.electronegativity && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Electronegativity:</span>
                    <span>{combinedElement.electronegativity}</span>
                  </div>
                )}
                {combinedElement.meltingPoint !== undefined && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Melting Point:</span>
                    <span>{combinedElement.meltingPoint}°C</span>
                  </div>
                )}
                {combinedElement.boilingPoint !== undefined && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Boiling Point:</span>
                    <span>{combinedElement.boilingPoint}°C</span>
                  </div>
                )}
                {combinedElement.density && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-semibold">Density:</span>
                    <span>{combinedElement.density} g/cm³</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {(combinedElement.discoveredBy || combinedElement.discoveryYear) && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">Discovery</h3>
                  {combinedElement.discoveredBy && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Discovered by:</strong> {combinedElement.discoveredBy}
                    </p>
                  )}
                  {combinedElement.discoveryYear && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Year:</strong> {combinedElement.discoveryYear}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="structure">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="w-64 h-64 mx-auto bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary rounded-full animate-pulse" />
                  </div>
                  {[...Array(Math.min(element.number, 7))].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-4 h-4 bg-secondary rounded-full"
                      style={{
                        top: `${50 + 35 * Math.cos((i * 2 * Math.PI) / Math.min(element.number, 7))}%`,
                        left: `${50 + 35 * Math.sin((i * 2 * Math.PI) / Math.min(element.number, 7))}%`,
                        animation: `orbit ${3 + i}s linear infinite`,
                      }}
                    />
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Simplified atomic structure visualization
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Nucleus with {element.number} proton{element.number !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="uses">
            <Card>
              <CardContent className="pt-6">
                {combinedElement.uses && combinedElement.uses.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold mb-3">Common Uses & Applications:</h3>
                    <div className="flex flex-wrap gap-2">
                      {combinedElement.uses.map((use, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {use}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Detailed usage information not available for this element.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
