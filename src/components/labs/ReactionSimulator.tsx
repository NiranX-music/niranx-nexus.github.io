import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowRight, Trash2, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';

interface Reactant {
  symbol: string;
  name: string;
  quantity: number;
}

interface Reaction {
  reactants: string[];
  products: string[];
  equation: string;
  type: string;
  description: string;
}

const commonElements = [
  { symbol: 'H', name: 'Hydrogen' },
  { symbol: 'O', name: 'Oxygen' },
  { symbol: 'C', name: 'Carbon' },
  { symbol: 'N', name: 'Nitrogen' },
  { symbol: 'Na', name: 'Sodium' },
  { symbol: 'Cl', name: 'Chlorine' },
  { symbol: 'Ca', name: 'Calcium' },
  { symbol: 'S', name: 'Sulfur' },
];

const knownReactions: Reaction[] = [
  {
    reactants: ['H', 'H', 'O'],
    products: ['H₂O'],
    equation: '2H₂ + O₂ → 2H₂O',
    type: 'Synthesis',
    description: 'Formation of water from hydrogen and oxygen gas',
  },
  {
    reactants: ['Na', 'Cl'],
    products: ['NaCl'],
    equation: '2Na + Cl₂ → 2NaCl',
    type: 'Synthesis',
    description: 'Formation of table salt (sodium chloride)',
  },
  {
    reactants: ['C', 'O', 'O'],
    products: ['CO₂'],
    equation: 'C + O₂ → CO₂',
    type: 'Combustion',
    description: 'Combustion of carbon producing carbon dioxide',
  },
  {
    reactants: ['H', 'H', 'O', 'O'],
    products: ['H₂O₂'],
    equation: 'H₂ + O₂ → H₂O₂',
    type: 'Synthesis',
    description: 'Formation of hydrogen peroxide',
  },
];

export function ReactionSimulator() {
  const [selectedReactants, setSelectedReactants] = useState<Reactant[]>([]);
  const [result, setResult] = useState<Reaction | null>(null);

  const addReactant = (element: { symbol: string; name: string }) => {
    const existing = selectedReactants.find(r => r.symbol === element.symbol);
    if (existing) {
      setSelectedReactants(
        selectedReactants.map(r =>
          r.symbol === element.symbol ? { ...r, quantity: r.quantity + 1 } : r
        )
      );
    } else {
      setSelectedReactants([...selectedReactants, { ...element, quantity: 1 }]);
    }
  };

  const removeReactant = (symbol: string) => {
    const existing = selectedReactants.find(r => r.symbol === symbol);
    if (existing && existing.quantity > 1) {
      setSelectedReactants(
        selectedReactants.map(r =>
          r.symbol === symbol ? { ...r, quantity: r.quantity - 1 } : r
        )
      );
    } else {
      setSelectedReactants(selectedReactants.filter(r => r.symbol !== symbol));
    }
  };

  const clearReactants = () => {
    setSelectedReactants([]);
    setResult(null);
  };

  const simulateReaction = () => {
    if (selectedReactants.length === 0) {
      toast.error('Please add some elements first!');
      return;
    }

    const reactantSymbols = selectedReactants.flatMap(r =>
      Array(r.quantity).fill(r.symbol)
    );

    const reaction = knownReactions.find(r => {
      const sortedReactants = [...r.reactants].sort();
      const sortedSelected = [...reactantSymbols].sort();
      return JSON.stringify(sortedReactants) === JSON.stringify(sortedSelected);
    });

    if (reaction) {
      setResult(reaction);
      toast.success('Reaction successful!');
    } else {
      setResult({
        reactants: reactantSymbols,
        products: ['?'],
        equation: 'Unknown reaction',
        type: 'Unknown',
        description: 'These elements do not form a known reaction in our database.',
      });
      toast.error('No known reaction found for these elements');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Elements</CardTitle>
          <CardDescription>Click on elements to add them to the reaction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {commonElements.map(element => (
              <Button
                key={element.symbol}
                variant="outline"
                className="h-20 flex flex-col gap-1"
                onClick={() => addReactant(element)}
              >
                <span className="text-2xl font-bold">{element.symbol}</span>
                <span className="text-xs">{element.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Selected Reactants</CardTitle>
              <CardDescription>Elements ready for reaction</CardDescription>
            </div>
            {selectedReactants.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearReactants}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedReactants.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {selectedReactants.map(reactant => (
                <div
                  key={reactant.symbol}
                  className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-lg"
                >
                  <span className="text-xl font-bold">{reactant.symbol}</span>
                  {reactant.quantity > 1 && (
                    <Badge variant="default">{reactant.quantity}</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-2"
                    onClick={() => removeReactant(reactant.symbol)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No elements selected. Choose elements from above to start.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={simulateReaction}
          disabled={selectedReactants.length === 0}
          className="gap-2"
        >
          <FlaskConical className="w-5 h-5" />
          Simulate Reaction
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {result && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Reaction Result
              <Badge variant={result.type !== 'Unknown' ? 'default' : 'secondary'}>
                {result.type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold mb-2">{result.equation}</div>
              <p className="text-muted-foreground">{result.description}</p>
            </div>

            {result.products[0] !== '?' && (
              <div className="bg-background/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Products Formed:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.products.map((product, index) => (
                    <Badge key={index} variant="default" className="text-lg px-4 py-2">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
