import { useState, useRef, useCallback, useEffect } from 'react';

export type CellData = { value: string; formula?: string; bold?: boolean; align?: string; color?: string };
export type SheetData = Record<string, CellData>;

const COLS = 26;
const ROWS = 50;
const colLabel = (i: number) => String.fromCharCode(65 + i);

interface SpreadsheetGridProps {
  data: SheetData;
  onChange: (data: SheetData) => void;
  selectedCell: string;
  onSelectCell: (cell: string) => void;
}

function evaluateFormula(formula: string, data: SheetData): string {
  try {
    const f = formula.slice(1).toUpperCase();
    const rangeMatch = f.match(/^(SUM|AVG|AVERAGE|COUNT|MIN|MAX)\(([A-Z]\d+):([A-Z]\d+)\)$/);
    if (rangeMatch) {
      const [, fn, start, end] = rangeMatch;
      const sc = start.charCodeAt(0) - 65, sr = parseInt(start.slice(1));
      const ec = end.charCodeAt(0) - 65, er = parseInt(end.slice(1));
      const vals: number[] = [];
      for (let c = sc; c <= ec; c++) {
        for (let r = sr; r <= er; r++) {
          const key = `${colLabel(c)}${r}`;
          const v = parseFloat(getCellDisplay(data[key], data));
          if (!isNaN(v)) vals.push(v);
        }
      }
      if (vals.length === 0) return '0';
      switch (fn) {
        case 'SUM': return vals.reduce((a, b) => a + b, 0).toString();
        case 'AVG': case 'AVERAGE': return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
        case 'COUNT': return vals.length.toString();
        case 'MIN': return Math.min(...vals).toString();
        case 'MAX': return Math.max(...vals).toString();
      }
    }
    // IF function
    const ifMatch = f.match(/^IF\((.+),(.+),(.+)\)$/);
    if (ifMatch) {
      const [, cond, t, fa] = ifMatch;
      const evalCond = cond.includes('>') || cond.includes('<') || cond.includes('=');
      if (evalCond) {
        const result = new Function(`return ${cond.replace(/[A-Z]\d+/g, (ref) => {
          const v = getCellDisplay(data[ref], data);
          return isNaN(Number(v)) ? `"${v}"` : v;
        })}`)();
        return result ? t.trim() : fa.trim();
      }
    }
    // Simple cell ref
    const refMatch = f.match(/^[A-Z]\d+$/);
    if (refMatch) return getCellDisplay(data[f], data);
    // Basic arithmetic
    const expr = f.replace(/[A-Z]\d+/g, (ref) => {
      const v = getCellDisplay(data[ref], data);
      return isNaN(Number(v)) ? '0' : v;
    });
    return new Function(`return ${expr}`)().toString();
  } catch { return '#ERROR'; }
}

function getCellDisplay(cell: CellData | undefined, data: SheetData): string {
  if (!cell) return '';
  if (cell.formula || cell.value.startsWith('=')) return evaluateFormula(cell.formula || cell.value, data);
  return cell.value;
}

export default function SpreadsheetGrid({ data, onChange, selectedCell, onSelectCell }: SpreadsheetGridProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const startEdit = (key: string) => {
    setEditing(key);
    const cell = data[key];
    setEditValue(cell?.formula || cell?.value || '');
  };

  const commitEdit = () => {
    if (!editing) return;
    const isFormula = editValue.startsWith('=');
    const newData = { ...data };
    newData[editing] = { ...newData[editing], value: editValue, formula: isFormula ? editValue : undefined };
    onChange(newData);
    setEditing(null);
  };

  return (
    <div className="overflow-auto flex-1">
      <table className="border-collapse text-xs w-full">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="bg-muted border border-border w-10 h-7 text-muted-foreground sticky left-0 z-20" />
            {Array.from({ length: COLS }, (_, i) => (
              <th key={i} className="bg-muted border border-border min-w-[80px] h-7 text-muted-foreground font-medium">
                {colLabel(i)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROWS }, (_, r) => (
            <tr key={r}>
              <td className="bg-muted border border-border text-center text-muted-foreground font-medium sticky left-0 z-10 w-10">
                {r + 1}
              </td>
              {Array.from({ length: COLS }, (_, c) => {
                const key = `${colLabel(c)}${r + 1}`;
                const cell = data[key];
                const isSelected = selectedCell === key;
                const isEditing = editing === key;
                const display = getCellDisplay(cell, data);
                return (
                  <td
                    key={c}
                    onClick={() => { onSelectCell(key); if (!isEditing) setEditing(null); }}
                    onDoubleClick={() => startEdit(key)}
                    className={`border border-border h-7 px-1 cursor-cell transition-colors ${
                      isSelected ? 'ring-2 ring-primary ring-inset bg-primary/5' : 'hover:bg-muted/30'
                    } ${cell?.bold ? 'font-bold' : ''}`}
                    style={{ textAlign: (cell?.align as any) || 'left', color: cell?.color }}
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={commitEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { commitEdit(); onSelectCell(`${colLabel(c)}${r + 2}`); }
                          if (e.key === 'Tab') { e.preventDefault(); commitEdit(); onSelectCell(`${colLabel(c + 1)}${r + 1}`); }
                          if (e.key === 'Escape') setEditing(null);
                        }}
                        className="w-full h-full bg-background outline-none border-none text-xs font-mono"
                      />
                    ) : (
                      <span className="block truncate">{display}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
