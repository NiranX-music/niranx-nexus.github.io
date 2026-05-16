import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

const MESSAGE = 'INTRODUCING THE QUANTUM AGENT FOR YOUR PC';

export function QuantumAgentBanner() {
  return (
    <Link
      to="/quantum-agent"
      className="group fixed top-0 left-0 right-0 z-[60] block overflow-hidden border-b border-primary/30 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 backdrop-blur-xl"
      aria-label="Introducing the Quantum Agent for your PC"
    >
      <div className="flex animate-[marquee_28s_linear_infinite] whitespace-nowrap py-1.5 text-xs font-bold tracking-[0.25em] text-foreground font-[Orbitron]">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="mx-8 inline-flex items-center gap-3">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{MESSAGE}</span>
            <span className="text-accent">→ NEW DESKTOP AI AGENT</span>
            <ArrowRight className="h-3.5 w-3.5 text-accent transition-transform group-hover:translate-x-1" />
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </Link>
  );
}
