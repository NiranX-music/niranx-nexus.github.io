import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Table, Plus, Trash2, Download, Upload, BarChart3, Loader2 } from 'lucide-react';
import ExportMenu from '@/components/xoffice/ExportMenu';
import { exportSheetAsCSV, exportSheetAsXLSX } from '@/utils/exportUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import SpreadsheetGrid, { type SheetData } from '@/components/xsheets/SpreadsheetGrid';
import FormulaBar from '@/components/xsheets/FormulaBar';
import ChartBuilder from '@/components/xsheets/ChartBuilder';

interface Sheet {
  id: string;
  user_id: string;
  title: string;
  data: SheetData;
  created_at: string;
  updated_at: string;
}

export default function XSheets() {
  const { user } = useAuth();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [sheetData, setSheetData] = useState<SheetData>({});
  const [selectedCell, setSelectedCell] = useState('A1');
  const [formulaValue, setFormulaValue] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();

  const fetchSheets = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('xsheets_spreadsheets')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setSheets(data.map((s: any) => ({ ...s, data: (s.data as SheetData) || {} })));
  }, [user]);

  useEffect(() => { fetchSheets(); }, [fetchSheets]);

  useEffect(() => {
    const sheet = sheets.find(s => s.id === selectedId);
    if (sheet) { setSheetData(sheet.data); setTitle(sheet.title); }
  }, [selectedId]);

  useEffect(() => {
    const cell = sheetData[selectedCell];
    setFormulaValue(cell?.formula || cell?.value || '');
  }, [selectedCell, sheetData]);

  const autoSave = useCallback((newData: SheetData) => {
    setSheetData(newData);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!selectedId) return;
      setSaving(true);
      await supabase.from('xsheets_spreadsheets').update({ data: newData as any, title }).eq('id', selectedId);
      setSaving(false);
    }, 2000);
  }, [selectedId, title]);

  const createSheet = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('xsheets_spreadsheets')
      .insert({ user_id: user.id, title: 'Untitled Spreadsheet', data: {} as any })
      .select()
      .single();
    if (data) {
      const newSheet = { ...data, data: {} as SheetData };
      setSheets(prev => [newSheet, ...prev]);
      setSelectedId(data.id);
      toast.success('Spreadsheet created');
    }
  };

  const deleteSheet = async (id: string) => {
    await supabase.from('xsheets_spreadsheets').delete().eq('id', id);
    setSheets(prev => prev.filter(s => s.id !== id));
    if (selectedId === id) { setSelectedId(null); setSheetData({}); }
    toast.success('Deleted');
  };

  const exportCSV = () => {
    const rows: string[][] = [];
    Object.entries(sheetData).forEach(([key, cell]) => {
      const col = key.charCodeAt(0) - 65;
      const row = parseInt(key.slice(1)) - 1;
      while (rows.length <= row) rows.push([]);
      while (rows[row].length <= col) rows[row].push('');
      rows[row][col] = cell.value;
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${title}.csv`; a.click();
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const newData: SheetData = {};
      text.split('\n').forEach((row, r) => {
        row.split(',').forEach((val, c) => {
          if (val.trim()) newData[`${String.fromCharCode(65 + c)}${r + 1}`] = { value: val.trim() };
        });
      });
      autoSave(newData);
      toast.success('CSV imported');
    };
    reader.readAsText(file);
  };

  const commitFormula = () => {
    const newData = { ...sheetData };
    const isFormula = formulaValue.startsWith('=');
    newData[selectedCell] = { ...newData[selectedCell], value: formulaValue, formula: isFormula ? formulaValue : undefined };
    autoSave(newData);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-3 p-3 border-b border-border bg-background">
        <div className="p-2 rounded-lg bg-emerald-500/10"><Table className="h-5 w-5 text-emerald-500" /></div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">XSheets</h1>
          <p className="text-xs text-muted-foreground">Spreadsheet Tool</p>
        </div>
        {saving && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 border-r border-border bg-muted/20 flex flex-col">
          <div className="p-2"><Button onClick={createSheet} size="sm" className="w-full"><Plus className="h-4 w-4 mr-1" /> New Sheet</Button></div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {sheets.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left p-2 rounded-lg text-sm group flex items-center justify-between ${selectedId === s.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/60 border border-transparent'}`}
                >
                  <span className="truncate text-foreground">{s.title}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteSheet(s.id); }} className="opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3 text-destructive" /></button>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main */}
        {selectedId ? (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="border-none font-semibold bg-transparent focus-visible:ring-0 px-0 flex-1" />
              <ExportMenu options={[
                { label: 'CSV', icon: '📊', onClick: () => exportSheetAsCSV(sheetData, title) },
                { label: 'XLSX (Excel)', icon: '📗', onClick: () => exportSheetAsXLSX(sheetData, title) },
              ]} />
              <label className="cursor-pointer"><Upload className="h-4 w-4 text-muted-foreground hover:text-foreground" /><input type="file" accept=".csv" onChange={importCSV} className="hidden" /></label>
              <Button variant="ghost" size="sm" onClick={() => setShowChart(true)}><BarChart3 className="h-4 w-4" /></Button>
            </div>
            <FormulaBar cellRef={selectedCell} value={formulaValue} onChange={setFormulaValue} onCommit={commitFormula} />
            <SpreadsheetGrid data={sheetData} onChange={autoSave} selectedCell={selectedCell} onSelectCell={setSelectedCell} />
            <ChartBuilder open={showChart} onClose={() => setShowChart(false)} data={sheetData} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Table className="h-16 w-16 opacity-20" />
            <p>Select or create a spreadsheet</p>
            <Button onClick={createSheet}><Plus className="h-4 w-4 mr-2" /> New Spreadsheet</Button>
          </div>
        )}
      </div>
    </div>
  );
}
