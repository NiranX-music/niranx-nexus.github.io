import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu, Mic, Shield, Zap, Download, ExternalLink, Sparkles,
  Terminal, Eye, Network, Lock, Bot, Activity, Layers, Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NiranXNavigation } from '@/components/niranx/NiranXNavigation';
import { LiquidBackground } from '@/components/LiquidBackground';
import { Footer3D } from '@/components/landing/Footer3D';

const AGENT_URL = 'https://niranx-nexus-agent.vercel.app';
const INSTALLER_URL = 'https://niranx-nexus-agent.vercel.app/installer';
const AUTH_URL = 'https://niranx-nexus-agent.vercel.app/auth=desktop';

const capabilities = [
  { icon: Terminal, tag: 'Execution', title: 'Autonomous Desktop Actions', desc: 'Turns intent into app launches, file operations, keyboard input, and workflow steps.' },
  { icon: Cpu, tag: 'Cognition', title: 'NVIDIA Model Matrix', desc: 'Routes chat, coding, reasoning, speech, and utility tasks through configurable NVIDIA endpoints.' },
  { icon: Lock, tag: 'Identity', title: 'Vault Induction Gate', desc: 'External email verification pairs with the local encrypted vault before users enter Nexus.' },
  { icon: Eye, tag: 'Perception', title: 'Voice + Vision Layer', desc: 'Voice commands, optical scanning, face verification, and desktop context awareness.' },
  { icon: Network, tag: 'Network', title: 'Device Uplink', desc: 'ADB and local device modules prepare Nexus to move between desktop and connected devices.' },
  { icon: Shield, tag: 'Control', title: 'Manual Override', desc: 'A fallback path for operators to set default vault access when biometric setup is not ready.' },
];

const chapters = [
  { n: '01', title: 'The passive AI loop is broken', body: 'Most assistants stop at suggestions. Nexus is designed as an action layer that can receive intent, plan the route, and prepare execution on the desktop.' },
  { n: '02', title: 'Induct the agent into your system', body: 'The web portal verifies the operator, then routes them to the desktop installer where the local agent, vault, and model settings are activated.' },
  { n: '03', title: 'Local autonomy stays local', body: 'Sensitive actions remain on the machine. The cloud-facing surface handles account access, while the desktop layer owns execution and private state.' },
  { n: '04', title: 'Voice becomes command infrastructure', body: 'Nexus is shaped around hands-free operation: speak, verify, inspect, automate, and keep momentum without returning to prompt-only workflows.' },
];

const pillars = [
  { icon: Layers, title: 'Persistent Dock', desc: 'A compact floating Dock Nexus layer stays available while the desktop agent is running.' },
  { icon: Radio, title: 'Reactive Presence', desc: 'Speaking mode drives RGB lighting, live screen sweep effects, and cleaner assistant state feedback.' },
  { icon: Activity, title: 'Readable System Core', desc: 'The dashboard keeps machine stats visible even when the assistant is idle, muted, or waiting.' },
];

export default function QuantumAgent() {
  useEffect(() => {
    document.title = 'Quantum Agent — Desktop AI for your PC | NiranX';
    const desc = 'Introducing the Quantum Agent: an autonomous desktop AI by NiranX with persistent dock, voice control, NVIDIA model matrix, and local vault.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', desc);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LiquidBackground />
      <NiranXNavigation />

      <main className="relative pt-32">
        {/* HERO */}
        <section className="container mx-auto px-4 py-20 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 backdrop-blur-md text-xs font-semibold tracking-[0.2em] text-primary font-[Orbitron] mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" /> NEW LAUNCH · RELEASE 1.3.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight font-[Orbitron] bg-gradient-to-br from-foreground via-primary to-accent bg-clip-text text-transparent mb-6"
          >
            QUANTUM AGENT
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Induct an autonomous AI agent into your desktop. A persistent floating command layer,
            reactive voice lighting, readable live system telemetry, and a cleaner command shell —
            wrapped around NVIDIA-powered intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 font-semibold">
              <a href={INSTALLER_URL} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 mr-2" /> Download for PC
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10">
              <a href={AUTH_URL} target="_blank" rel="noopener noreferrer">
                Begin Induction <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href={AGENT_URL} target="_blank" rel="noopener noreferrer">
                Visit Full Site →
              </a>
            </Button>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3 mt-10 text-xs font-[Orbitron] tracking-wider text-muted-foreground">
            {['24/7 AUTONOMOUS', 'DOCK NEXUS LIVE', 'TRAY + LOCAL VAULT', 'NVIDIA POWERED'].map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full border border-border/50 bg-card/40 backdrop-blur-md">{t}</span>
            ))}
          </div>
        </section>

        {/* PILLARS */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl hover:border-primary/40 transition-colors"
              >
                <p.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-bold font-[Orbitron] tracking-wide mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-[Orbitron] tracking-[0.3em] text-primary mb-3">NEXUS_OS // ACTIVE_MODULES</p>
            <h2 className="text-3xl md:text-5xl font-bold font-[Orbitron]">System Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              Not a passive chat surface — a desktop induction layer for authenticated operators,
              local execution, voice control, and configurable AI model routing.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="p-6 rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl hover:border-accent/40 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <c.icon className="w-7 h-7 text-accent" />
                  <span className="text-[10px] font-[Orbitron] tracking-[0.2em] text-muted-foreground px-2 py-1 rounded border border-border/40">{c.tag.toUpperCase()}</span>
                </div>
                <h3 className="text-lg font-bold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TECH STACK STRIP */}
        <section className="py-8 border-y border-border/30 bg-card/20 backdrop-blur-md overflow-hidden">
          <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap text-sm font-[Orbitron] tracking-[0.3em] text-muted-foreground">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="mx-6 inline-flex gap-6">
                <span>ELECTRON</span><span className="text-primary">·</span>
                <span>REACT</span><span className="text-primary">·</span>
                <span>SUPABASE AUTH</span><span className="text-primary">·</span>
                <span>NVIDIA BUILD</span><span className="text-primary">·</span>
                <span>VOICE ASSISTANT</span><span className="text-primary">·</span>
                <span>VAULT SECURITY</span><span className="text-primary">·</span>
                <span>ADB UPLINK</span><span className="text-primary">·</span>
                <span>WORKFLOW MACROS</span><span className="text-primary">·</span>
              </span>
            ))}
          </div>
          <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
        </section>

        {/* CHAPTERS */}
        <section className="container mx-auto px-4 py-24">
          <div className="grid md:grid-cols-2 gap-8">
            {chapters.map((ch, i) => (
              <motion.div
                key={ch.n}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-8 rounded-2xl border border-border/40 bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl"
              >
                <p className="text-xs font-[Orbitron] tracking-[0.3em] text-primary mb-3">CHAPTER {ch.n}</p>
                <h3 className="text-2xl md:text-3xl font-bold mb-3 font-[Orbitron]">{ch.title}</h3>
                <p className="text-muted-foreground">{ch.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* INDUCTION FLOW */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-[Orbitron] tracking-[0.3em] text-accent mb-3">DESKTOP INDUCTION ROUTE</p>
            <h2 className="text-3xl md:text-5xl font-bold font-[Orbitron]">Authenticate. Install. Activate.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Mic, step: '01', title: 'EMAIL', body: 'Supabase OTP gate verifies the operator.' },
              { icon: Download, step: '02', title: 'INSTALL', body: 'Download the Nexus Agent installer to your PC.' },
              { icon: Bot, step: '03', title: 'ACTIVATE', body: 'Local vault, agent, and model settings come online.' },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative p-8 rounded-2xl border border-primary/30 bg-card/40 backdrop-blur-xl"
              >
                <span className="absolute top-4 right-4 text-5xl font-[Orbitron] font-bold text-primary/10">{s.step}</span>
                <s.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-bold font-[Orbitron] tracking-wider mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-24">
          <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 backdrop-blur-xl p-12 md:p-16 text-center">
            <Zap className="w-12 h-12 text-accent mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-bold font-[Orbitron] mb-4">Ready to induct Quantum Agent?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Move from chat to action. Download the desktop agent and activate the local Nexus layer.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                <a href={INSTALLER_URL} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-2" /> Download Nexus Agent
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/40">
                <a href={AGENT_URL} target="_blank" rel="noopener noreferrer">
                  Explore Full Site <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer3D />
    </div>
  );
}
