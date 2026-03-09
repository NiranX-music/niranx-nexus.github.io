import { useNavigate } from 'react-router-dom';
import { FileText, Table, Presentation, Briefcase, ArrowRight, Sparkles, Clock, Users, Cloud, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const tools = [
  { name: 'XDocs', desc: 'Smart Document Editor — rich text, templates, AI writing assistant', icon: FileText, route: '/xdocs', color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-500' },
  { name: 'XSheets', desc: 'Spreadsheet Tool — formulas, charts, CSV import/export', icon: Table, route: '/xsheets', color: 'from-emerald-500/20 to-green-500/20', iconColor: 'text-emerald-500' },
  { name: 'XSlides', desc: 'Presentation Builder — visual slide editor, fullscreen presenting', icon: Presentation, route: '/xslides', color: 'from-orange-500/20 to-amber-500/20', iconColor: 'text-orange-500' },
];

const features = [
  { icon: Sparkles, title: 'AI-Powered Writing', desc: 'Generate content, fix grammar, and summarize text with built-in AI assistance.' },
  { icon: Cloud, title: 'Cloud Auto-Save', desc: 'Your work is automatically saved to the cloud. Never lose a document again.' },
  { icon: Users, title: 'Collaboration Ready', desc: 'Share docs with your team and work together in real-time.' },
  { icon: Shield, title: 'Secure & Private', desc: 'End-to-end encrypted storage. Your documents belong to you.' },
  { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed. Load, edit, and export documents instantly.' },
  { icon: Clock, title: 'Version History', desc: 'Track every change. Revert to any previous version anytime.' },
];

export default function XOffice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">XOffice</h1>
            <p className="text-muted-foreground">Your complete office suite — documents, spreadsheets & presentations</p>
          </div>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {tools.map((tool, i) => (
            <motion.button
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(tool.route)}
              className={`group relative p-6 rounded-2xl border border-border bg-gradient-to-br ${tool.color} hover:scale-[1.02] transition-all text-left`}
            >
              <tool.icon className={`h-10 w-10 ${tool.iconColor} mb-4`} />
              <h2 className="text-xl font-bold text-foreground mb-1">{tool.name}</h2>
              <p className="text-sm text-muted-foreground mb-4">{tool.desc}</p>
              <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                Open <ArrowRight className="h-4 w-4" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Features Section */}
        <div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-foreground mb-6"
          >
            Suite Features
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                className="p-5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm"
              >
                <f.icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'File Formats', value: 'PDF, DOCX, CSV, PPTX' },
            { label: 'AI Models', value: 'Built-in' },
            { label: 'Max File Size', value: 'Unlimited' },
            { label: 'Price', value: 'Free' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl border border-border/50 bg-card/30 text-center">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-foreground mt-1">{s.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
