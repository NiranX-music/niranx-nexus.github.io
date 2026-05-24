import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, X, Layers, Square } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export interface LandingModeSettings {
  splitMode: boolean;
  intensity: number;
  stiffness: number;
  damping: number;
  snap: boolean;
}

const STORAGE_KEY = 'niranx.landing.mode.v1';

export const DEFAULT_SETTINGS: LandingModeSettings = {
  splitMode: false,
  intensity: 18,
  stiffness: 60,
  damping: 24,
  snap: false,
};


export function useLandingModeSettings() {
  const [settings, setSettings] = useState<LandingModeSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const update = (patch: Partial<LandingModeSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return { settings, update };
}

interface Props {
  settings: LandingModeSettings;
  onChange: (patch: Partial<LandingModeSettings>) => void;
}

export function LandingModeControls({ settings, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 w-80 rounded-2xl border border-primary/30 bg-background/80 backdrop-blur-xl shadow-2xl p-5 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-[Orbitron] text-sm tracking-wider text-primary">
                LANDING MODE
              </h3>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChange({ splitMode: false })}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition ${
                  !settings.splitMode
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/40 text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Square className="h-4 w-4" />
                <span className="text-xs">Normal</span>
              </button>
              <button
                onClick={() => onChange({ splitMode: true })}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition ${
                  settings.splitMode
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/40 text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span className="text-xs">3D Split</span>
              </button>
            </div>

            {settings.splitMode && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Tilt intensity</span>
                    <span className="text-primary font-mono">{settings.intensity}%</span>
                  </div>
                  <Slider
                    value={[settings.intensity]}
                    min={0}
                    max={40}
                    step={1}
                    onValueChange={([v]) => onChange({ intensity: v })}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Smoothness</span>
                    <span className="text-primary font-mono">{settings.stiffness}</span>
                  </div>
                  <Slider
                    value={[settings.stiffness]}
                    min={20}
                    max={200}
                    step={5}
                    onValueChange={([v]) => onChange({ stiffness: v })}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Damping</span>
                    <span className="text-primary font-mono">{settings.damping}</span>
                  </div>
                  <Slider
                    value={[settings.damping]}
                    min={5}
                    max={60}
                    step={1}
                    onValueChange={([v]) => onChange({ damping: v })}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-sm">Scroll snap</div>
                    <div className="text-xs text-muted-foreground">Align sections cleanly</div>
                  </div>
                  <Switch
                    checked={settings.snap}
                    onCheckedChange={(v) => onChange({ snap: v })}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        onClick={() => setOpen((o) => !o)}
        className="h-12 w-12 rounded-full shadow-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground hover:scale-105 transition"
        aria-label="Landing mode controls"
      >
        <Settings2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
