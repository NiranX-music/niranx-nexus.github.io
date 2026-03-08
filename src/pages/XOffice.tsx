import { useNavigate } from 'react-router-dom';
import { FileText, Table, Presentation, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const tools = [
  { name: 'XDocs', desc: 'Smart Document Editor — rich text, templates, AI writing assistant', icon: FileText, route: '/xdocs', color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-500' },
  { name: 'XSheets', desc: 'Spreadsheet Tool — formulas, charts, CSV import/export', icon: Table, route: '/xsheets', color: 'from-emerald-500/20 to-green-500/20', iconColor: 'text-emerald-500' },
  { name: 'XSlides', desc: 'Presentation Builder — visual slide editor, fullscreen presenting', icon: Presentation, route: '/xslides', color: 'from-orange-500/20 to-amber-500/20', iconColor: 'text-orange-500' },
];

export default function XOffice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">XOffice</h1>
            <p className="text-muted-foreground">Your complete office suite — documents, spreadsheets & presentations</p>
          </div>
        </motion.div>

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
      </div>
    </div>
  );
}
