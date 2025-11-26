import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, Code, Eye, Trash2, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function GeneratedWebsite() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: website, isLoading } = useQuery({
    queryKey: ["generated-website", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_websites")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
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
    navigate("/ai-website-generator");
  };

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`${type} code copied to clipboard`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Website not found</p>
        <Button onClick={() => navigate("/ai-website-generator")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Generator
        </Button>
      </div>
    );
  }

  const fullHTML = website.html_code;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/ai-website-generator")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{website.title}</h1>
              <p className="text-sm text-muted-foreground">{website.description}</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <Tabs defaultValue="preview" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="preview">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="mr-2 h-4 w-4" />
              Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <iframe
                    srcDoc={fullHTML}
                    className="w-full h-[600px] border-0"
                    title="Website Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>HTML Code</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(website.html_code, "HTML")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy HTML
                </Button>
              </CardHeader>
              <CardContent>
                <div className="max-h-[400px] overflow-auto rounded-lg">
                  <SyntaxHighlighter
                    language="html"
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, borderRadius: "0.5rem" }}
                  >
                    {website.html_code}
                  </SyntaxHighlighter>
                </div>
              </CardContent>
            </Card>

            {website.css_code && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>CSS Code</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(website.css_code, "CSS")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy CSS
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[300px] overflow-auto rounded-lg">
                    <SyntaxHighlighter
                      language="css"
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, borderRadius: "0.5rem" }}
                    >
                      {website.css_code}
                    </SyntaxHighlighter>
                  </div>
                </CardContent>
              </Card>
            )}

            {website.js_code && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>JavaScript Code</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(website.js_code, "JavaScript")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy JS
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[300px] overflow-auto rounded-lg">
                    <SyntaxHighlighter
                      language="javascript"
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, borderRadius: "0.5rem" }}
                    >
                      {website.js_code}
                    </SyntaxHighlighter>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
