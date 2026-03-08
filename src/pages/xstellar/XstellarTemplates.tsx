import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Layout, ShoppingBag, FileText, BarChart3, Search, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const TEMPLATES = [
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Personal portfolio with hero, projects, and contact sections",
    icon: Layout,
    category: "Personal",
    html: `<header class="hero"><h1>Your Name</h1><p>Developer & Designer</p></header>
<section class="projects"><h2>Projects</h2><div class="grid"><div class="card"><h3>Project 1</h3><p>Description here</p></div><div class="card"><h3>Project 2</h3><p>Description here</p></div></div></section>
<footer><p>&copy; 2026 Your Name</p></footer>`,
    css: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #fafafa; }
.hero { text-align:center; padding:6rem 2rem; background: linear-gradient(135deg, #1a1a2e, #16213e); }
.hero h1 { font-size:3rem; margin-bottom:0.5rem; }
.hero p { opacity:0.7; font-size:1.2rem; }
.projects { padding:4rem 2rem; max-width:800px; margin:0 auto; }
.projects h2 { margin-bottom:2rem; }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:1.5rem; }
.card { background:#1a1a2e; padding:1.5rem; border-radius:12px; border:1px solid #ffffff10; }
footer { text-align:center; padding:2rem; opacity:0.5; }`,
    js: `document.querySelectorAll('.card').forEach(card => { card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-4px)'); card.addEventListener('mouseleave', () => card.style.transform = ''); });`
  },
  {
    id: "blog",
    name: "Blog",
    description: "Minimal blog layout with sidebar and article cards",
    icon: FileText,
    category: "Content",
    html: `<nav class="navbar"><span class="logo">MyBlog</span><div class="nav-links"><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a></div></nav>
<main class="blog-layout"><div class="articles"><article class="post"><h2>First Post</h2><p class="meta">Jan 1, 2026</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></article><article class="post"><h2>Second Post</h2><p class="meta">Jan 15, 2026</p><p>Sed do eiusmod tempor incididunt ut labore.</p></article></div>
<aside class="sidebar"><h3>Categories</h3><ul><li>Tech</li><li>Design</li><li>Life</li></ul></aside></main>`,
    css: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: Georgia, serif; background:#fafaf9; color:#1a1a1a; }
.navbar { display:flex; justify-content:space-between; align-items:center; padding:1rem 2rem; border-bottom:1px solid #e5e5e5; }
.logo { font-weight:bold; font-size:1.3rem; }
.nav-links a { margin-left:1.5rem; text-decoration:none; color:#555; }
.blog-layout { display:grid; grid-template-columns:1fr 280px; gap:2rem; max-width:1000px; margin:2rem auto; padding:0 2rem; }
.post { padding:2rem 0; border-bottom:1px solid #e5e5e5; }
.post h2 { margin-bottom:0.3rem; }
.meta { color:#888; font-size:0.85rem; margin-bottom:0.8rem; }
.sidebar h3 { margin-bottom:1rem; }
.sidebar li { list-style:none; padding:0.3rem 0; color:#555; }`,
    js: ``
  },
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Admin dashboard with stats, charts placeholder, and data table",
    icon: BarChart3,
    category: "App",
    html: `<div class="dash"><aside class="dash-sidebar"><h2>Dashboard</h2><nav><a href="#" class="active">Overview</a><a href="#">Users</a><a href="#">Settings</a></nav></aside>
<main class="dash-main"><div class="stats"><div class="stat"><span class="stat-num">1,234</span><span class="stat-label">Users</span></div><div class="stat"><span class="stat-num">$12.4k</span><span class="stat-label">Revenue</span></div><div class="stat"><span class="stat-num">98%</span><span class="stat-label">Uptime</span></div></div>
<div class="chart-placeholder">Chart goes here</div></main></div>`,
    css: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: system-ui; background:#09090b; color:#fafafa; }
.dash { display:grid; grid-template-columns:220px 1fr; min-height:100vh; }
.dash-sidebar { background:#111; padding:2rem 1.5rem; }
.dash-sidebar h2 { margin-bottom:2rem; font-size:1.1rem; }
.dash-sidebar nav { display:flex; flex-direction:column; gap:0.5rem; }
.dash-sidebar a { color:#888; text-decoration:none; padding:0.6rem 1rem; border-radius:8px; }
.dash-sidebar a.active { background:#1a1a2e; color:#fff; }
.dash-main { padding:2rem; }
.stats { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:2rem; }
.stat { background:#111; padding:1.5rem; border-radius:12px; text-align:center; }
.stat-num { display:block; font-size:2rem; font-weight:bold; }
.stat-label { color:#888; font-size:0.85rem; }
.chart-placeholder { background:#111; border-radius:12px; padding:4rem; text-align:center; color:#444; }`,
    js: `document.querySelectorAll('.stat-num').forEach(el => { const target = el.textContent; el.textContent = '0'; setTimeout(() => el.textContent = target, 300); });`
  },
  {
    id: "ecommerce",
    name: "E-commerce",
    description: "Product listing page with cart and filters",
    icon: ShoppingBag,
    category: "Business",
    html: `<header class="store-header"><h1>Store</h1><button class="cart-btn">Cart (0)</button></header>
<div class="store-grid"><div class="product"><div class="product-img"></div><h3>Product 1</h3><p class="price">$29.99</p><button class="add-btn">Add to Cart</button></div>
<div class="product"><div class="product-img"></div><h3>Product 2</h3><p class="price">$49.99</p><button class="add-btn">Add to Cart</button></div>
<div class="product"><div class="product-img"></div><h3>Product 3</h3><p class="price">$19.99</p><button class="add-btn">Add to Cart</button></div></div>`,
    css: `* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:system-ui; background:#fafafa; color:#111; }
.store-header { display:flex; justify-content:space-between; align-items:center; padding:1.5rem 2rem; border-bottom:1px solid #eee; }
.cart-btn { background:#111; color:#fff; border:none; padding:0.6rem 1.2rem; border-radius:8px; cursor:pointer; }
.store-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:1.5rem; padding:2rem; max-width:1000px; margin:0 auto; }
.product { background:#fff; border-radius:12px; overflow:hidden; border:1px solid #eee; }
.product-img { height:200px; background:#f0f0f0; }
.product h3 { padding:1rem 1rem 0.3rem; }
.price { padding:0 1rem; color:#666; }
.add-btn { margin:1rem; background:#111; color:#fff; border:none; padding:0.6rem 1rem; border-radius:6px; cursor:pointer; width:calc(100%-2rem); }`,
    js: `let count=0; document.querySelectorAll('.add-btn').forEach(btn => btn.addEventListener('click', () => { count++; document.querySelector('.cart-btn').textContent = 'Cart ('+count+')'; }));`
  },
];

export function XstellarTemplates({ onUseTemplate }: { onUseTemplate: (template: typeof TEMPLATES[0]) => void }) {
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<typeof TEMPLATES[0] | null>(null);

  const filtered = TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="group cursor-pointer hover:border-primary/50 transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <t.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{t.name}</h3>
                      <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => setPreview(t)}>Preview</Button>
                      <Button size="sm" className="h-6 text-[10px]" onClick={() => onUseTemplate(t)}>
                        <Sparkles className="h-3 w-3 mr-1" />Use
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{preview?.name} Template</DialogTitle></DialogHeader>
          {preview && (
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><style>${preview.css}</style></head><body>${preview.html}<script>${preview.js}<\/script></body></html>`}
              className="w-full h-[400px] border rounded-lg"
              sandbox="allow-scripts"
              title="Template Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
