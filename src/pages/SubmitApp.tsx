import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Code, FileCode, Send, ArrowLeft, Eye, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SubmitApp() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    htmlContent: "",
    cssContent: "",
    jsContent: "",
    reactContent: "",
    pythonContent: "",
    cppContent: "",
    javaContent: "",
    typescriptContent: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .substring(0, 50);
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in to submit an app");
      return;
    }

    if (!formData.title || !formData.slug || !formData.htmlContent) {
      toast.error("Please fill in title, slug, and HTML content");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if slug already exists
      const { data: existing } = await supabase
        .from("admin_custom_pages")
        .select("id")
        .eq("slug", formData.slug)
        .single();

      if (existing) {
        toast.error("This URL slug is already taken. Please choose a different one.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("admin_custom_pages").insert({
        title: formData.title,
        slug: formData.slug,
        meta_description: formData.description,
        html_content: formData.htmlContent,
        css_content: formData.cssContent || null,
        js_content: formData.jsContent || null,
        created_by: user.id,
        is_published: false, // Submitted apps need admin approval
      });

      if (error) throw error;

      toast.success("App submitted successfully! It will be reviewed by an admin before publishing.");
      navigate("/app-library");
    } catch (error) {
      console.error("Error submitting app:", error);
      toast.error("Failed to submit app. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${formData.cssContent}</style>
      </head>
      <body>
        ${formData.htmlContent}
        <script>${formData.jsContent}</script>
      </body>
    </html>
  `;

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app-library")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Code className="h-8 w-8" />
            Submit Your App
          </h1>
          <p className="text-muted-foreground mt-1">
            Share your creation with the community
          </p>
        </div>
      </div>

      {!user && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please sign in to submit an app to the library.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            App Details
          </CardTitle>
          <CardDescription>
            Provide information about your app and paste your code below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">App Title *</Label>
              <Input
                id="title"
                placeholder="My Awesome App"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/p/</span>
                <Input
                  id="slug"
                  placeholder="my-awesome-app"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what your app does..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Code Tabs */}
          <div className="space-y-2">
            <Label>Code</Label>
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="flex flex-wrap gap-1 h-auto p-1">
                <TabsTrigger value="html" className="text-xs">HTML *</TabsTrigger>
                <TabsTrigger value="css" className="text-xs">CSS</TabsTrigger>
                <TabsTrigger value="js" className="text-xs">JavaScript</TabsTrigger>
                <TabsTrigger value="react" className="text-xs">React/JSX</TabsTrigger>
                <TabsTrigger value="typescript" className="text-xs">TypeScript</TabsTrigger>
                <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
                <TabsTrigger value="cpp" className="text-xs">C++</TabsTrigger>
                <TabsTrigger value="java" className="text-xs">Java</TabsTrigger>
              </TabsList>
              <TabsContent value="html">
                <Textarea
                  placeholder="<div>Your HTML content here...</div>"
                  value={formData.htmlContent}
                  onChange={(e) => handleInputChange("htmlContent", e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="css">
                <Textarea
                  placeholder="/* Your CSS styles here */"
                  value={formData.cssContent}
                  onChange={(e) => handleInputChange("cssContent", e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="js">
                <Textarea
                  placeholder="// Your JavaScript code here"
                  value={formData.jsContent}
                  onChange={(e) => handleInputChange("jsContent", e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="react">
                <Textarea
                  placeholder={`import React from 'react';\n\nfunction MyComponent() {\n  return (\n    <div className="app">\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default MyComponent;`}
                  value={formData.reactContent}
                  onChange={(e) => handleInputChange("reactContent", e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="typescript">
                <Textarea
                  placeholder={`interface Props {\n  name: string;\n  age: number;\n}\n\nconst greet = (props: Props): string => {\n  return \`Hello \${props.name}!\`;\n};`}
                  value={formData.typescriptContent}
                  onChange={(e) => handleInputChange("typescriptContent", e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="python">
                <Textarea
                  placeholder={`# Python code\ndef main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()`}
                  value={formData.pythonContent}
                  onChange={(e) => handleInputChange("pythonContent", e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="cpp">
                <Textarea
                  placeholder={`#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`}
                  value={formData.cppContent}
                  onChange={(e) => handleInputChange("cppContent", e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </TabsContent>
              <TabsContent value="java">
                <Textarea
                  placeholder={`public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`}
                  value={formData.javaContent}
                  onChange={(e) => handleInputChange("javaContent", e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview */}
          {showPreview && formData.htmlContent && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg overflow-hidden bg-white">
                <iframe
                  srcDoc={previewContent}
                  className="w-full h-96"
                  sandbox="allow-scripts"
                  title="Preview"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              disabled={!formData.htmlContent}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !user}
              className="flex-1 md:flex-none"
            >
              {isSubmitting ? (
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit for Review
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            * Your app will be reviewed by an admin before being published to the library.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
