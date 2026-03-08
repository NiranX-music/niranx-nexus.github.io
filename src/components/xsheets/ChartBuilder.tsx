import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { SheetData } from './SpreadsheetGrid';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

interface ChartBuilderProps {
  open: boolean;
  onClose: () => void;
  data: SheetData;
}

export default function ChartBuilder({ open, onClose, data }: ChartBuilderProps) {
  const [range, setRange] = useState('A1:B5');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  const parseRange = () => {
    try {
      const [start, end] = range.toUpperCase().split(':');
      const sc = start.charCodeAt(0) - 65, sr = parseInt(start.slice(1));
      const ec = end.charCodeAt(0) - 65, er = parseInt(end.slice(1));
      const rows: { name: string; value: number }[] = [];
      for (let r = sr; r <= er; r++) {
        const label = data[`${String.fromCharCode(65 + sc)}${r}`]?.value || `Row ${r}`;
        const val = parseFloat(data[`${String.fromCharCode(65 + ec)}${r}`]?.value || '0');
        rows.push({ name: label, value: isNaN(val) ? 0 : val });
      }
      return rows;
    } catch { return []; }
  };

  const chartData = parseRange();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Build Chart</DialogTitle></DialogHeader>
        <div className="flex gap-2 mb-4">
          <Input value={range} onChange={(e) => setRange(e.target.value)} placeholder="Range e.g. A1:B5" className="flex-1" />
          <Select value={chartType} onValueChange={(v) => setChartType(v as any)}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="pie">Pie</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="hsl(var(--primary))" /></BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" /></LineChart>
              ) : (
                <PieChart><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Enter a valid range</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
