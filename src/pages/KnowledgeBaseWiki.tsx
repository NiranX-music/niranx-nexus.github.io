import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Plus, Tag, Clock, ChevronRight, FileText, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface WikiArticle {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const SUBJECTS = ["Math", "Science", "History", "English", "Coding", "Art", "General"];

export default function KnowledgeBaseWiki() {
  const [articles, setArticles] = useState<WikiArticle[]>(() => {
    try { return JSON.parse(localStorage.getItem("wiki-articles") || "[]"); } catch { return []; }
  });
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newSubject, setNewSubject] = useState("General");
  const [newTags, setNewTags] = useState("");

  const save = (updated: WikiArticle[]) => {
    setArticles(updated);
    localStorage.setItem("wiki-articles", JSON.stringify(updated));
  };

  const createArticle = () => {
    if (!newTitle.trim() || !newContent.trim()) { toast.error("Title and content required"); return; }
    const article: WikiArticle = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      content: newContent.trim(),
      subject: newSubject,
      tags: newTags.split(",").map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    save([article, ...articles]);
    setNewTitle(""); setNewContent(""); setNewTags("");
    setIsCreating(false);
    toast.success("Article created!");
  };

  const deleteArticle = (id: string) => {
    save(articles.filter(a => a.id !== id));
    if (selectedArticle?.id === id) setSelectedArticle(null);
    toast.success("Article deleted");
  };

  const filtered = articles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchSubject = filterSubject === "all" || a.subject === filterSubject;
    return matchSearch && matchSubject;
  });

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><BookOpen className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-3xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground text-sm">Your personal wiki for study notes</p>
          </div>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Article</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Article</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Article title..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <Select value={newSubject} onValueChange={setNewSubject}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea placeholder="Write your notes..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={8} />
              <Input placeholder="Tags (comma separated)" value={newTags} onChange={e => setNewTags(e.target.value)} />
              <Button onClick={createArticle} className="w-full">Save Article</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Article List */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{filtered.length} articles</p>
          <ScrollArea className="h-[600px]">
            <AnimatePresence>
              {filtered.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedArticle(article)}
                  className={`p-3 rounded-lg cursor-pointer mb-2 border transition-colors ${
                    selectedArticle?.id === article.id ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-transparent hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{article.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{article.subject}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {article.tags.slice(0, 3).map(t => (
                          <Badge key={t} variant="outline" className="text-[10px] px-1 py-0">{t}</Badge>
                        ))}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No articles found</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Article Viewer */}
        <Card className="md:col-span-2">
          <CardContent className="p-6 min-h-[600px]">
            {selectedArticle ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Badge variant="secondary">{selectedArticle.subject}</Badge>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(selectedArticle.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteArticle(selectedArticle.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {selectedArticle.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {selectedArticle.tags.map(t => (
                      <Badge key={t} variant="outline" className="gap-1"><Tag className="h-3 w-3" />{t}</Badge>
                    ))}
                  </div>
                )}
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
                  {selectedArticle.content}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <BookOpen className="h-16 w-16 mb-4 opacity-30" />
                <p>Select an article to read</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
