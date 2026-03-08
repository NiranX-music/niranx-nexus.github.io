import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Presentation, Plus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import SlideCanvas, { type Slide, type SlideElement } from '@/components/xslides/SlideCanvas';
import SlideThumbnails from '@/components/xslides/SlideThumbnails';
import SlideToolbar from '@/components/xslides/SlideToolbar';
import PresentationMode from '@/components/xslides/PresentationMode';

interface Pres {
  id: string;
  user_id: string;
  title: string;
  slides: Slide[];
  theme: string;
  created_at: string;
  updated_at: string;
}

const emptySlide = (): Slide => ({
  id: crypto.randomUUID(),
  elements: [
    { id: crypto.randomUUID(), type: 'text', x: 200, y: 200, width: 1520, height: 120, content: 'Click to edit title', style: { fontSize: '64px', fontWeight: 'bold', color: 'hsl(var(--foreground))' } },
    { id: crypto.randomUUID(), type: 'text', x: 200, y: 400, width: 1520, height: 300, content: 'Click to add content', style: { fontSize: '32px', color: 'hsl(var(--muted-foreground))' } },
  ],
  background: 'hsl(var(--background))',
});

export default function XSlides() {
  const { user } = useAuth();
  const [presentations, setPresentations] = useState<Pres[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [presenting, setPresenting] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setScale(Math.min((width - 40) / 1920, (height - 40) / 1080));
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [selectedId]);

  const fetchPres = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('xslides_presentations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setPresentations(data.map((p: any) => ({ ...p, slides: (Array.isArray(p.slides) ? p.slides : []) as Slide[] })));
  }, [user]);

  useEffect(() => { fetchPres(); }, [fetchPres]);

  useEffect(() => {
    const pres = presentations.find(p => p.id === selectedId);
    if (pres) { setSlides(pres.slides.length ? pres.slides : [emptySlide()]); setTitle(pres.title); setCurrentSlide(0); }
  }, [selectedId]);

  const autoSave = useCallback((newSlides: Slide[]) => {
    setSlides(newSlides);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!selectedId) return;
      setSaving(true);
      await supabase.from('xslides_presentations').update({ slides: newSlides as any, title }).eq('id', selectedId);
      setSaving(false);
    }, 2000);
  }, [selectedId, title]);

  const createPres = async () => {
    if (!user) return;
    const initial = [emptySlide()];
    const { data } = await supabase
      .from('xslides_presentations')
      .insert({ user_id: user.id, title: 'Untitled Presentation', slides: initial as any })
      .select()
      .single();
    if (data) {
      const newPres = { ...data, slides: initial } as Pres;
      setPresentations(prev => [newPres, ...prev]);
      setSelectedId(data.id);
      toast.success('Presentation created');
    }
  };

  const deletePres = async (id: string) => {
    await supabase.from('xslides_presentations').delete().eq('id', id);
    setPresentations(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) { setSelectedId(null); setSlides([]); }
    toast.success('Deleted');
  };

  const addSlide = () => {
    const newSlides = [...slides, emptySlide()];
    setCurrentSlide(newSlides.length - 1);
    autoSave(newSlides);
  };

  const deleteSlide = (i: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, idx) => idx !== i);
    setCurrentSlide(Math.min(currentSlide, newSlides.length - 1));
    autoSave(newSlides);
  };

  const duplicateSlide = (i: number) => {
    const dup: Slide = { ...JSON.parse(JSON.stringify(slides[i])), id: crypto.randomUUID() };
    dup.elements = dup.elements.map(el => ({ ...el, id: crypto.randomUUID() }));
    const newSlides = [...slides]; newSlides.splice(i + 1, 0, dup);
    setCurrentSlide(i + 1);
    autoSave(newSlides);
  };

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    const newSlides = slides.map((s, i) => {
      if (i !== currentSlide) return s;
      return { ...s, elements: s.elements.map(el => el.id === elementId ? { ...el, ...updates } : el) };
    });
    autoSave(newSlides);
  };

  const addText = () => {
    const el: SlideElement = { id: crypto.randomUUID(), type: 'text', x: 300, y: 300, width: 600, height: 80, content: 'New text', style: { fontSize: '32px', color: 'hsl(var(--foreground))' } };
    const newSlides = [...slides]; newSlides[currentSlide] = { ...newSlides[currentSlide], elements: [...newSlides[currentSlide].elements, el] };
    autoSave(newSlides);
  };

  const addImage = () => {
    const url = prompt('Image URL:');
    if (!url) return;
    const el: SlideElement = { id: crypto.randomUUID(), type: 'image', x: 400, y: 200, width: 600, height: 400, src: url };
    const newSlides = [...slides]; newSlides[currentSlide] = { ...newSlides[currentSlide], elements: [...newSlides[currentSlide].elements, el] };
    autoSave(newSlides);
  };

  const addShape = () => {
    const el: SlideElement = { id: crypto.randomUUID(), type: 'shape', x: 500, y: 300, width: 300, height: 200, style: { backgroundColor: 'hsl(var(--primary))' } };
    const newSlides = [...slides]; newSlides[currentSlide] = { ...newSlides[currentSlide], elements: [...newSlides[currentSlide].elements, el] };
    autoSave(newSlides);
  };

  const changeBg = () => {
    const color = prompt('Background color (hex or CSS):', slides[currentSlide]?.background || '#ffffff');
    if (!color) return;
    const newSlides = [...slides]; newSlides[currentSlide] = { ...newSlides[currentSlide], background: color };
    autoSave(newSlides);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-3 p-3 border-b border-border bg-background">
        <div className="p-2 rounded-lg bg-orange-500/10"><Presentation className="h-5 w-5 text-orange-500" /></div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">XSlides</h1>
          <p className="text-xs text-muted-foreground">Presentation Builder</p>
        </div>
        {saving && <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar list */}
        <div className="w-48 border-r border-border bg-muted/20 flex flex-col">
          <div className="p-2"><Button onClick={createPres} size="sm" className="w-full"><Plus className="h-4 w-4 mr-1" /> New</Button></div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {presentations.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left p-2 rounded-lg text-sm group flex items-center justify-between ${selectedId === p.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/60 border border-transparent'}`}
                >
                  <span className="truncate text-foreground">{p.title}</span>
                  <button onClick={(e) => { e.stopPropagation(); deletePres(p.id); }} className="opacity-0 group-hover:opacity-100"><Trash2 className="h-3 w-3 text-destructive" /></button>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {selectedId && slides.length > 0 ? (
          <>
            <SlideThumbnails
              slides={slides}
              currentIndex={currentSlide}
              onSelect={setCurrentSlide}
              onAdd={addSlide}
              onDelete={deleteSlide}
              onDuplicate={duplicateSlide}
            />
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="border-none font-semibold bg-transparent focus-visible:ring-0 px-0 flex-1" />
              </div>
              <SlideToolbar onAddText={addText} onAddImage={addImage} onAddShape={addShape} onChangeBackground={changeBg} onPresent={() => setPresenting(true)} />
              <div ref={containerRef} className="flex-1 flex items-center justify-center bg-muted/30 overflow-hidden">
                <SlideCanvas
                  slide={slides[currentSlide]}
                  scale={scale}
                  editable
                  onUpdateElement={updateElement}
                  selectedElement={selectedElement}
                  onSelectElement={setSelectedElement}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Presentation className="h-16 w-16 opacity-20" />
            <p>Select or create a presentation</p>
            <Button onClick={createPres}><Plus className="h-4 w-4 mr-2" /> New Presentation</Button>
          </div>
        )}
      </div>

      {presenting && <PresentationMode slides={slides} startIndex={currentSlide} onExit={() => setPresenting(false)} />}
    </div>
  );
}
