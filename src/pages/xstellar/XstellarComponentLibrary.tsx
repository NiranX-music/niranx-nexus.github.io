import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Smartphone, Monitor, Tablet } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ComponentDef {
  id: string;
  name: string;
  category: string;
  html: string;
  css: string;
}

const COMPONENTS: ComponentDef[] = [
  { id: "hero-1", name: "Hero Section", category: "Layout", html: `<section class="hero-comp"><h1>Welcome</h1><p>Build something amazing</p><button>Get Started</button></section>`, css: `.hero-comp{text-align:center;padding:5rem 2rem;background:linear-gradient(135deg,#1a1a2e,#0f3460);color:#fff;border-radius:12px}.hero-comp h1{font-size:2.5rem;margin-bottom:.5rem}.hero-comp p{opacity:.7;margin-bottom:1.5rem}.hero-comp button{background:#fff;color:#111;border:none;padding:.7rem 1.5rem;border-radius:8px;font-weight:600;cursor:pointer}` },
  { id: "card-1", name: "Feature Card", category: "Cards", html: `<div class="feat-card"><div class="feat-icon">✨</div><h3>Feature</h3><p>Description of the feature goes here.</p></div>`, css: `.feat-card{background:#111;padding:2rem;border-radius:12px;border:1px solid #ffffff10;max-width:300px}.feat-icon{font-size:2rem;margin-bottom:1rem}.feat-card h3{margin-bottom:.5rem;color:#fff}.feat-card p{color:#888;font-size:.9rem}` },
  { id: "nav-1", name: "Navbar", category: "Navigation", html: `<nav class="comp-nav"><span class="comp-logo">Brand</span><div class="comp-links"><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a></div></nav>`, css: `.comp-nav{display:flex;justify-content:space-between;align-items:center;padding:1rem 2rem;background:#111;border-radius:12px;color:#fff}.comp-logo{font-weight:bold;font-size:1.2rem}.comp-links a{color:#888;text-decoration:none;margin-left:1.5rem;font-size:.9rem}.comp-links a:hover{color:#fff}` },
  { id: "pricing-1", name: "Pricing Card", category: "Cards", html: `<div class="price-card"><span class="plan-name">Pro</span><div class="plan-price">$29<span>/mo</span></div><ul><li>Unlimited projects</li><li>Priority support</li><li>Custom domain</li></ul><button>Subscribe</button></div>`, css: `.price-card{background:#111;padding:2rem;border-radius:16px;border:1px solid #ffffff15;max-width:280px;text-align:center;color:#fff}.plan-name{font-size:.85rem;text-transform:uppercase;letter-spacing:2px;color:#888}.plan-price{font-size:3rem;font-weight:bold;margin:1rem 0}.plan-price span{font-size:1rem;color:#666}.price-card ul{list-style:none;padding:0;margin:1.5rem 0}.price-card li{padding:.4rem 0;color:#aaa;font-size:.9rem}.price-card button{width:100%;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;padding:.8rem;border-radius:8px;font-weight:600;cursor:pointer}` },
  { id: "footer-1", name: "Footer", category: "Layout", html: `<footer class="comp-footer"><div class="footer-cols"><div><h4>Product</h4><a href="#">Features</a><a href="#">Pricing</a></div><div><h4>Company</h4><a href="#">About</a><a href="#">Blog</a></div><div><h4>Support</h4><a href="#">Help</a><a href="#">Docs</a></div></div><p class="footer-copy">&copy; 2026 Brand. All rights reserved.</p></footer>`, css: `.comp-footer{background:#0a0a0a;padding:3rem 2rem 1.5rem;border-radius:12px;color:#fff}.footer-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;margin-bottom:2rem}.footer-cols h4{margin-bottom:.8rem;font-size:.9rem}.footer-cols a{display:block;color:#666;text-decoration:none;font-size:.85rem;padding:.2rem 0}.footer-copy{text-align:center;color:#444;font-size:.8rem;border-top:1px solid #ffffff10;padding-top:1.5rem}` },
  { id: "testimonial-1", name: "Testimonial", category: "Social Proof", html: `<div class="test-card"><p class="test-quote">"This product changed how I work. Highly recommend!"</p><div class="test-author"><div class="test-avatar"></div><div><strong>Jane Doe</strong><span>CEO, Company</span></div></div></div>`, css: `.test-card{background:#111;padding:2rem;border-radius:12px;max-width:400px;color:#fff;border:1px solid #ffffff10}.test-quote{font-style:italic;line-height:1.6;margin-bottom:1.5rem;color:#ccc}.test-author{display:flex;align-items:center;gap:1rem}.test-avatar{width:40px;height:40px;border-radius:50%;background:#333}.test-author strong{display:block;font-size:.9rem}.test-author span{color:#666;font-size:.8rem}` },
];

export function XstellarComponentLibrary({ onInsert }: { onInsert: (html: string, css: string) => void }) {
  const [selected, setSelected] = useState<ComponentDef | null>(null);
  const categories = [...new Set(COMPONENTS.map(c => c.category))];

  const copyComponent = (comp: ComponentDef) => {
    navigator.clipboard.writeText(comp.html + "\n\n/* CSS */\n" + comp.css);
    toast({ title: "Copied", description: `${comp.name} copied to clipboard` });
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue={categories[0]}>
        <TabsList className="h-8 flex-wrap">
          {categories.map(c => (
            <TabsTrigger key={c} value={c} className="text-xs">{c}</TabsTrigger>
          ))}
        </TabsList>
        {categories.map(cat => (
          <TabsContent key={cat} value={cat}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMPONENTS.filter(c => c.category === cat).map((comp, i) => (
                <motion.div key={comp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="overflow-hidden">
                    <div className="h-32 border-b border-border overflow-hidden bg-background">
                      <iframe
                        srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:8px;font-family:system-ui}${comp.css}</style></head><body>${comp.html}</body></html>`}
                        className="w-full h-full pointer-events-none"
                        sandbox=""
                        title={comp.name}
                        style={{ transform: "scale(0.6)", transformOrigin: "top left", width: "166%", height: "166%" }}
                      />
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-semibold">{comp.name}</h4>
                          <Badge variant="secondary" className="text-[10px] mt-0.5">{comp.category}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => copyComponent(comp)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button size="sm" className="h-6 text-[10px]" onClick={() => onInsert(comp.html, comp.css)}>
                            Insert
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
