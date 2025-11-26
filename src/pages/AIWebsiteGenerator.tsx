import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles, Zap, Infinity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function AIWebsiteGenerator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch user's websites and role info
  const { data: websitesData, refetch } = useQuery({
    queryKey: ["user-websites", user?.id],
    queryFn: async () => {
      const { data: websites } = await supabase
        .from("generated_websites")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      const { data: canCreate } = await supabase.rpc("can_create_website", {
        p_user_id: user?.id,
      });

      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user?.id,
        _role: "admin",
      });

      const { data: isModerator } = await supabase.rpc("has_role", {
        _user_id: user?.id,
        _role: "moderator",
      });

      const { data: isTeacher } = await supabase.rpc("has_role", {
        _user_id: user?.id,
        _role: "teacher",
      });

      return {
        websites: websites || [],
        canCreate: canCreate || false,
        isAdmin: isAdmin || false,
        isModerator: isModerator || false,
        isTeacher: isTeacher || false,
      };
    },
    enabled: !!user,
  });

  const getCreditsInfo = () => {
    if (websitesData?.isAdmin) {
      return { total: "Unlimited", used: websitesData.websites.length, icon: Infinity };
    }
    if (websitesData?.isModerator || websitesData?.isTeacher) {
      return { total: 5, used: websitesData.websites.length, icon: Zap };
    }
    return { total: 2, used: websitesData?.websites.length || 0, icon: Sparkles };
  };

  const handleGenerate = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in both title and description");
      return;
    }

    if (!websitesData?.canCreate) {
      toast.error("You've reached your project limit. Delete an existing project to create a new one.");
      return;
    }

    setIsGenerating(true);

    try {
      // Call edge function to generate website
      const { data, error } = await supabase.functions.invoke("generate-website", {
        body: { title, description },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to generate website");
      }

      if (!data || !data.html) {
        throw new Error("Invalid response from AI. Please try again.");
      }

      // Save to database
      const { data: website, error: dbError } = await supabase
        .from("generated_websites")
        .insert({
          user_id: user?.id,
          title,
          description,
          html_code: data.html,
          css_code: data.css || "",
          js_code: data.js || "",
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Failed to save website. Please try again.");
      }

      // Save to AI generations history
      await supabase.from("ai_generations").insert({
        user_id: user?.id,
        tool_type: "website",
        prompt: `Title: ${title}\nDescription: ${description}`,
        result_data: {
          website_id: website.id,
          title: title,
          description: description,
        },
        status: "completed",
      });

      toast.success("Website generated successfully!");
      setTitle("");
      setDescription("");
      refetch();
      navigate(`/niranx/generated-website/${website.id}`);
    } catch (error: any) {
      console.error("Generation error:", error);
      const errorMessage = error?.message || "Failed to generate website. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const creditsInfo = getCreditsInfo();
  const CreditsIcon = creditsInfo.icon;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AI Website Generator
            </h1>
            <p className="text-muted-foreground mt-2">
              Describe your landing page and let AI create it for you
            </p>
          </div>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CreditsIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">
                  {typeof creditsInfo.total === "number" 
                    ? `${creditsInfo.used}/${creditsInfo.total}` 
                    : "Unlimited"} Credits
                </p>
                <p className="text-xs text-muted-foreground">
                  {websitesData?.isAdmin 
                    ? "Admin" 
                    : websitesData?.isModerator || websitesData?.isTeacher 
                    ? "Staff" 
                    : "User"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Website</CardTitle>
            <CardDescription>
              Provide a title and description for your landing page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Website Title</label>
              <Input
                placeholder="e.g., My Awesome Product"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe what your website is about, its purpose, target audience, and any specific features you want..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isGenerating}
                rows={6}
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !websitesData?.canCreate}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Website
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Your Websites</h2>
          <div className="grid gap-4">
            {websitesData?.websites.map((website) => (
              <Card
                key={website.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate(`/niranx/generated-website/${website.id}`)}
              >
                <CardHeader>
                  <CardTitle>{website.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {website.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Created {new Date(website.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
            {websitesData?.websites.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  No websites yet. Create your first one above!
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
