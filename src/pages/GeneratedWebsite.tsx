import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Code, Eye, Trash2, Copy, FileCode, Palette, Zap, Save, Globe, ExternalLink } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function GeneratedWebsite() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("preview");
  const [activeCode, setActiveCode] = useState<"html" | "css" | "js">("html");
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState({ html: "", css: "", js: "" });
  const [slug, setSlug] = useState("");

  const { data: website, isLoading } = useQuery({
    queryKey: ["generated-website", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_websites")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      // Initialize edit state and slug
      setEditedCode({
        html: data.html_code || "",
        css: data.css_code || "",
        js: data.js_code || ""
      });
      setSlug(data.slug || "");
      
      return data;
    },
  });

  const saveCodeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("generated_websites")
        .update({
          html_code: editedCode.html,
          css_code: editedCode.css,
          js_code: editedCode.js,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-website", id] });
      toast.success("Website code saved successfully");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to save website code");
    }
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!slug || slug.trim() === "") {
        throw new Error("Please enter a URL slug");
      }

      // Validate slug format
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        throw new Error("Slug can only contain lowercase letters, numbers, and hyphens");
      }

      const { error } = await supabase
        .from("generated_websites")
        .update({
          slug: slug.toLowerCase().trim(),
          is_published: true,
          published_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) {
        if (error.message.includes("duplicate") || error.message.includes("unique")) {
          throw new Error("This URL is already taken. Please choose another.");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-website", id] });
      toast.success("Website published successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to publish website");
    }
  });

  const unpublishMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("generated_websites")
        .update({
          is_published: false
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generated-website", id] });
      toast.success("Website unpublished");
    },
    onError: () => {
      toast.error("Failed to unpublish website");
    }
  });

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this website?")) return;

    const { error } = await supabase
      .from("generated_websites")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete website");
      return;
    }

    toast.success("Website deleted successfully");
    navigate("/niranx/ai-website-generator");
  };

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`${type} code copied to clipboard`);
  };

  const copyAllCode = () => {
    const allCode = `${website?.html_code || ""}\n\n/* CSS */\n${website?.css_code || ""}\n\n/* JavaScript */\n${website?.js_code || ""}`;
    navigator.clipboard.writeText(allCode);
    toast.success("All code copied to clipboard");
  };

  const handleSaveCode = () => {
    saveCodeMutation.mutate();
  };

  const handlePublish = () => {
    publishMutation.mutate();
  };

  const handleUnpublish = () => {
    unpublishMutation.mutate();
  };

  const getCurrentCode = () => {
    if (isEditing) {
      return activeCode === "html" ? editedCode.html :
             activeCode === "css" ? editedCode.css : editedCode.js;
    }
    return activeCode === "html" ? website?.html_code :
           activeCode === "css" ? website?.css_code : website?.js_code;
  };

  const handleCodeChange = (value: string) => {
    setEditedCode(prev => ({
      ...prev,
      [activeCode]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your website...</p>
        </div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Website not found</h2>
          <p className="text-muted-foreground">The website you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/niranx/ai-website-generator")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Generator
          </Button>
        </div>
      </div>
    );
  }

  const fullHTML = isEditing ? editedCode.html : website.html_code;
  const codeStats = {
    html: (isEditing ? editedCode.html : website.html_code)?.length || 0,
    css: (isEditing ? editedCode.css : website.css_code)?.length || 0,
    js: (isEditing ? editedCode.js : website.js_code)?.length || 0,
  };

  const currentCode = getCurrentCode();
  const publicUrl = website?.is_published && website?.slug 
    ? `${window.location.origin}/w/${website.slug}` 
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/niranx/ai-website-generator")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{website.title}</h1>
                <p className="text-sm text-muted-foreground line-clamp-1">{website.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {publicUrl && (
                <Button variant="outline" size="sm" onClick={() => window.open(publicUrl, '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Live
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={copyAllCode}>
                <Copy className="mr-2 h-4 w-4" />
                Copy All
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-12">
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="gap-2">
                <Code className="h-4 w-4" />
                Code Editor
              </TabsTrigger>
              <TabsTrigger value="publish" className="gap-2">
                <Globe className="h-4 w-4" />
                Publish
              </TabsTrigger>
            </TabsList>

            {activeTab === "code" && (
              <div className="flex items-center gap-2">
                {isEditing && (
                  <Button size="sm" onClick={handleSaveCode} disabled={saveCodeMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {saveCodeMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                )}
                <Button
                  variant={isEditing ? "outline" : "default"}
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      setEditedCode({
                        html: website?.html_code || "",
                        css: website?.css_code || "",
                        js: website?.js_code || ""
                      });
                    }
                    setIsEditing(!isEditing);
                  }}
                >
                  <Code className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Code"}
                </Button>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <FileCode className="h-4 w-4" />
                  <span>{codeStats.html + codeStats.css + codeStats.js} characters</span>
                </div>
              </div>
            )}
          </div>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4 mt-0">
            <Card className="overflow-hidden border-2">
              <div className="bg-muted/50 border-b px-4 py-2 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm text-muted-foreground ml-4">Live Preview</span>
              </div>
              <div className="bg-white">
                <iframe
                  srcDoc={fullHTML}
                  className="w-full h-[calc(100vh-280px)] border-0"
                  title="Website Preview"
                  sandbox="allow-scripts"
                />
              </div>
            </Card>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="space-y-4 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Code Files Sidebar */}
              <div className="lg:col-span-1">
                <Card className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    Files
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveCode("html")}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                        activeCode === "html"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <FileCode className="h-4 w-4" />
                      index.html
                      <span className="ml-auto text-xs opacity-70">
                        {Math.round(codeStats.html / 1024)}KB
                      </span>
                    </button>
                    {website.css_code && (
                      <button
                        onClick={() => setActiveCode("css")}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                          activeCode === "css"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Palette className="h-4 w-4" />
                        styles.css
                        <span className="ml-auto text-xs opacity-70">
                          {Math.round(codeStats.css / 1024)}KB
                        </span>
                      </button>
                    )}
                    {website.js_code && (
                      <button
                        onClick={() => setActiveCode("js")}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                          activeCode === "js"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Zap className="h-4 w-4" />
                        script.js
                        <span className="ml-auto text-xs opacity-70">
                          {Math.round(codeStats.js / 1024)}KB
                        </span>
                      </button>
                    )}
                  </div>
                </Card>
              </div>

              {/* Code Editor */}
              <div className="lg:col-span-3">
                <Card className="overflow-hidden">
                  <div className="bg-muted/50 border-b px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {activeCode === "html" && "index.html"}
                        {activeCode === "css" && "styles.css"}
                        {activeCode === "js" && "script.js"}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const code = activeCode === "html" ? website.html_code : 
                                    activeCode === "css" ? website.css_code : website.js_code;
                        copyToClipboard(code || "", activeCode.toUpperCase());
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <div className="max-h-[calc(100vh-280px)] overflow-auto">
                    {isEditing ? (
                      <Textarea
                        value={currentCode || ""}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        className="min-h-[calc(100vh-280px)] font-mono text-sm"
                        placeholder={`Enter your ${activeCode.toUpperCase()} code here...`}
                      />
                    ) : (
                      <SyntaxHighlighter
                        language={activeCode === "html" ? "html" : activeCode === "css" ? "css" : "javascript"}
                        style={vscDarkPlus}
                        customStyle={{ 
                          margin: 0, 
                          borderRadius: 0,
                          fontSize: "14px",
                          lineHeight: "1.6"
                        }}
                        showLineNumbers
                        wrapLines
                      >
                        {currentCode || (activeCode === "css" ? "/* No additional CSS */" : "// No additional JavaScript")}
                      </SyntaxHighlighter>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Publish Tab */}
          <TabsContent value="publish" className="space-y-4 mt-0">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Publish Your Website</h3>
                  <p className="text-sm text-muted-foreground">
                    Make your website accessible via a custom URL that anyone can visit.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="slug">Custom URL Slug</Label>
                    <div className="flex gap-2 mt-2">
                      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md text-sm">
                        {window.location.origin}/w/
                      </div>
                      <Input
                        id="slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="my-awesome-website"
                        disabled={website?.is_published}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Only lowercase letters, numbers, and hyphens allowed
                    </p>
                  </div>

                  {publicUrl && (
                    <div className="p-4 bg-muted rounded-lg">
                      <Label className="text-sm font-medium">Your Published URL</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="flex-1 px-3 py-2 bg-background rounded text-sm">
                          {publicUrl}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(publicUrl);
                            toast.success("URL copied to clipboard");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(publicUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {website?.is_published ? (
                      <Button
                        variant="destructive"
                        onClick={handleUnpublish}
                        disabled={unpublishMutation.isPending}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {unpublishMutation.isPending ? "Unpublishing..." : "Unpublish Website"}
                      </Button>
                    ) : (
                      <Button
                        onClick={handlePublish}
                        disabled={!slug || publishMutation.isPending}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {publishMutation.isPending ? "Publishing..." : "Publish Website"}
                      </Button>
                    )}
                  </div>

                  {website?.is_published && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ Your website is live and accessible to anyone with the URL!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
