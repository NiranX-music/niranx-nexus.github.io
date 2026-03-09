import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function HeaderClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-primary/20 bg-primary/5 font-mono text-xs text-primary tracking-wider">
      <Clock className="w-3 h-3" />
      <span>{hours}:{minutes}</span>
      <span className="text-primary/50 animate-pulse">:</span>
      <span className="text-primary/70">{seconds}</span>
    </div>
  );
}
