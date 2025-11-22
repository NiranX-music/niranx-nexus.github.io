import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [mode, setMode] = useState<'normal' | 'scientific'>('normal');

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(String(inputValue));
    } else if (operation) {
      const currentValue = parseFloat(previousValue);
      let newValue = currentValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = currentValue / inputValue;
          break;
        case '%':
          newValue = currentValue % inputValue;
          break;
        case '^':
          newValue = Math.pow(currentValue, inputValue);
          break;
      }

      setDisplay(String(newValue));
      setPreviousValue(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const performScientific = (func: string) => {
    const inputValue = parseFloat(display);
    let result = inputValue;

    switch (func) {
      case 'sin':
        result = Math.sin(inputValue * Math.PI / 180);
        break;
      case 'cos':
        result = Math.cos(inputValue * Math.PI / 180);
        break;
      case 'tan':
        result = Math.tan(inputValue * Math.PI / 180);
        break;
      case 'sqrt':
        result = Math.sqrt(inputValue);
        break;
      case 'log':
        result = Math.log10(inputValue);
        break;
      case 'ln':
        result = Math.log(inputValue);
        break;
      case '1/x':
        result = 1 / inputValue;
        break;
      case 'x²':
        result = inputValue * inputValue;
        break;
    }

    setDisplay(String(result));
  };

  const buttonClass = "h-14 text-lg font-medium transition-all hover:scale-105";
  const numberButtonClass = `${buttonClass} bg-card hover:bg-accent text-card-foreground hover:text-accent-foreground`;
  const operatorButtonClass = `${buttonClass} bg-primary/20 hover:bg-primary/30 text-primary font-semibold`;
  const scientificButtonClass = `${buttonClass} bg-secondary/50 hover:bg-secondary text-secondary-foreground`;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Calculator</span>
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'normal' | 'scientific')} className="w-auto">
            <TabsList>
              <TabsTrigger value="normal">Normal</TabsTrigger>
              <TabsTrigger value="scientific">Scientific</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg">
          <Input
            type="text"
            value={display}
            readOnly
            className="text-right text-3xl font-mono bg-transparent border-none h-16"
          />
        </div>

        {/* Scientific Functions */}
        {mode === 'scientific' && (
          <div className="grid grid-cols-4 gap-2">
          <Button onClick={() => performScientific('sin')} className={scientificButtonClass}>
            sin
          </Button>
          <Button onClick={() => performScientific('cos')} className={scientificButtonClass}>
            cos
          </Button>
          <Button onClick={() => performScientific('tan')} className={scientificButtonClass}>
            tan
          </Button>
          <Button onClick={() => performScientific('sqrt')} className={scientificButtonClass}>
            √
          </Button>
          <Button onClick={() => performScientific('log')} className={scientificButtonClass}>
            log
          </Button>
          <Button onClick={() => performScientific('ln')} className={scientificButtonClass}>
            ln
          </Button>
          <Button onClick={() => performScientific('x²')} className={scientificButtonClass}>
            x²
          </Button>
          <Button onClick={() => performScientific('1/x')} className={scientificButtonClass}>
            1/x
          </Button>
        </div>
        )}

        {/* Main Calculator */}
        <div className="grid grid-cols-4 gap-2">
          <Button onClick={clear} className={`${buttonClass} bg-destructive/20 hover:bg-destructive/30 text-destructive`}>
            C
          </Button>
          <Button onClick={() => performOperation('^')} className={operatorButtonClass}>
            x^y
          </Button>
          <Button onClick={() => performOperation('%')} className={operatorButtonClass}>
            %
          </Button>
          <Button onClick={() => performOperation('÷')} className={operatorButtonClass}>
            ÷
          </Button>

          <Button onClick={() => inputDigit('7')} className={numberButtonClass}>
            7
          </Button>
          <Button onClick={() => inputDigit('8')} className={numberButtonClass}>
            8
          </Button>
          <Button onClick={() => inputDigit('9')} className={numberButtonClass}>
            9
          </Button>
          <Button onClick={() => performOperation('×')} className={operatorButtonClass}>
            ×
          </Button>

          <Button onClick={() => inputDigit('4')} className={numberButtonClass}>
            4
          </Button>
          <Button onClick={() => inputDigit('5')} className={numberButtonClass}>
            5
          </Button>
          <Button onClick={() => inputDigit('6')} className={numberButtonClass}>
            6
          </Button>
          <Button onClick={() => performOperation('-')} className={operatorButtonClass}>
            -
          </Button>

          <Button onClick={() => inputDigit('1')} className={numberButtonClass}>
            1
          </Button>
          <Button onClick={() => inputDigit('2')} className={numberButtonClass}>
            2
          </Button>
          <Button onClick={() => inputDigit('3')} className={numberButtonClass}>
            3
          </Button>
          <Button onClick={() => performOperation('+')} className={operatorButtonClass}>
            +
          </Button>

          <Button onClick={() => inputDigit('0')} className={`${numberButtonClass} col-span-2`}>
            0
          </Button>
          <Button onClick={inputDecimal} className={numberButtonClass}>
            .
          </Button>
          <Button onClick={() => performOperation('=')} className={`${buttonClass} bg-primary hover:bg-primary/90 text-primary-foreground`}>
            =
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
