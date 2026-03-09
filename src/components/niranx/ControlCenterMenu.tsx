import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  BellRing,
  BellOff,
  Monitor,
  Airplay,
  Battery,
  Maximize2,
  Lock,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface ToggleState {
  wifi: boolean;
  bluetooth: boolean;
  sound: boolean;
  darkMode: boolean;
  dnd: boolean;
  airdrop: boolean;
  screenMirror: boolean;
  lockScreen: boolean;
}

export function ControlCenterMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [brightness, setBrightness] = useState([75]);
  const [volume, setVolume] = useState([60]);
  const [toggles, setToggles] = useState<ToggleState>(() => {
    const saved = localStorage.getItem('niranx_control_center');
    return saved ? JSON.parse(saved) : {
      wifi: true,
      bluetooth: false,
      sound: true,
      darkMode: true,
      dnd: false,
      airdrop: false,
      screenMirror: false,
      lockScreen: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('niranx_control_center', JSON.stringify(toggles));
  }, [toggles]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (key: keyof ToggleState) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const quickToggles = [
    { key: 'wifi' as const, label: 'Wi-Fi', iconOn: Wifi, iconOff: WifiOff },
    { key: 'bluetooth' as const, label: 'Bluetooth', iconOn: Bluetooth, iconOff: BluetoothOff },
    { key: 'sound' as const, label: 'Sound', iconOn: Volume2, iconOff: VolumeX },
    { key: 'darkMode' as const, label: 'Dark Mode', iconOn: Moon, iconOff: Sun },
    { key: 'dnd' as const, label: 'Do Not Disturb', iconOn: BellOff, iconOff: BellRing },
    { key: 'airdrop' as const, label: 'AirDrop', iconOn: Airplay, iconOff: Airplay },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
        title="Control Center"
      >
        <Settings2 className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-[340px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Control Center
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Battery className="w-3.5 h-3.5 text-green-500" />
                <span>100%</span>
              </div>
            </div>

            {/* Quick Toggles */}
            <div className="grid grid-cols-3 gap-2 p-3">
              {quickToggles.map(t => {
                const active = toggles[t.key];
                const Icon = active ? t.iconOn : t.iconOff;
                return (
                  <button
                    key={t.key}
                    onClick={() => toggle(t.key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      active
                        ? 'bg-primary/15 border border-primary/30 text-primary'
                        : 'bg-muted/20 border border-border/30 text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium leading-tight text-center">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sliders */}
            <div className="px-4 pb-2 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5" /> Brightness
                  </span>
                  <span>{brightness[0]}%</span>
                </div>
                <Slider
                  value={brightness}
                  onValueChange={setBrightness}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" /> Volume
                  </span>
                  <span>{volume[0]}%</span>
                </div>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Bottom actions */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
              <button
                onClick={() => toggle('screenMirror')}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${toggles.screenMirror ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/30'}`}
              >
                <Monitor className="w-3.5 h-3.5" /> Screen Mirror
              </button>
              <button
                onClick={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    document.documentElement.requestFullscreen();
                  }
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
              </button>
              <button
                onClick={() => toggle('lockScreen')}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" /> Lock
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
