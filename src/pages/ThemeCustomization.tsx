import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Palette, Share2, Download, Save, Sparkles, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CustomTheme {
  id: string;
  theme_name: string;
  colors: any;
  is_public: boolean;
  share_token: string | null;
  downloads_count: number;
}

interface PresetTheme {
  id: string;
  theme_name: string;
  description: string;
  colors: any;
  category: string;
  is_featured: boolean;
}

export default function ThemeCustomization() {
  const { user } = useAuth();
  const [presetThemes, setPresetThemes] = useState<PresetTheme[]>([]);
  const [myThemes, setMyThemes] = useState<CustomTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<CustomTheme | null>(null);
  const [themeName, setThemeName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [colors, setColors] = useState({
    primary: "220 100% 50%",
    secondary: "280 100% 50%",
    accent: "340 100% 50%",
    background: "240 10% 10%",
    foreground: "0 0% 95%",
  });

  useEffect(() => {
    if (user) {
      fetchPresetThemes();
      fetchMyThemes();
    }
  }, [user]);

  const fetchPresetThemes = async () => {
    const { data, error } = await supabase
      .from("preset_themes")
      .select("*")
      .order("is_featured", { ascending: false });

    if (!error && data) {
      setPresetThemes(data as PresetTheme[]);
    }
  };

  const fetchMyThemes = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("custom_themes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMyThemes(data as CustomTheme[]);
    }
  };

  const handleColorChange = (key: string, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  const saveTheme = async () => {
    if (!user || !themeName) {
      toast({
        title: "Error",
        description: "Please enter a theme name",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("custom_themes").insert({
        user_id: user.id,
        theme_name: themeName,
        colors,
        is_public: isPublic,
      });

      if (error) throw error;

      toast({
        title: "Theme Saved! 🎨",
        description: `Your theme "${themeName}" has been saved`,
      });

      setThemeName("");
      fetchMyThemes();
    } catch (error) {
      console.error("Error saving theme:", error);
      toast({
        title: "Error",
        description: "Failed to save theme",
        variant: "destructive",
      });
    }
  };

  const applyTheme = (themeColors: Record<string, string>) => {
    const root = document.documentElement;
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    toast({
      title: "Theme Applied! ✨",
      description: "Your new theme is now active",
    });
  };

  const shareTheme = async (themeId: string) => {
    if (!user) return;

    try {
      // Generate share token
      const { data, error } = await supabase.rpc("generate_theme_share_token");
      if (error) throw error;

      const shareToken = data;
      await supabase
        .from("custom_themes")
        .update({ share_token: shareToken, is_public: true })
        .eq("id", themeId);

      const shareUrl = `${window.location.origin}/theme/${shareToken}`;
      await navigator.clipboard.writeText(shareUrl);

      toast({
        title: "Share Link Copied! 📋",
        description: "Theme link copied to clipboard",
      });
    } catch (error) {
      console.error("Error sharing theme:", error);
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      });
    }
  };

  const deleteTheme = async (themeId: string) => {
    if (!user) return;

    const { error } = await supabase.from("custom_themes").delete().eq("id", themeId);

    if (!error) {
      toast({
        title: "Theme Deleted",
        description: "Your custom theme has been removed",
      });
      fetchMyThemes();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Theme Customization</h1>
        <p className="text-muted-foreground">
          Create, customize, and share your own color themes
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Theme</TabsTrigger>
          <TabsTrigger value="presets">Preset Themes</TabsTrigger>
          <TabsTrigger value="my-themes">My Themes</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Builder
              </CardTitle>
              <CardDescription>Create your own custom color theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme-name">Theme Name</Label>
                <Input
                  id="theme-name"
                  placeholder="My Awesome Theme"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="capitalize">
                      {key}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={key}
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        placeholder="220 100% 50%"
                      />
                      <div
                        className="w-12 h-10 rounded border"
                        style={{ backgroundColor: `hsl(${value})` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label>Make theme public</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => applyTheme(colors)} variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button onClick={saveTheme} className="gap-2 flex-1">
                  <Save className="h-4 w-4" />
                  Save Theme
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {presetThemes.map((theme) => (
              <Card key={theme.id} className="overflow-hidden">
                <div
                  className="h-24 relative"
                  style={{
                    background: `linear-gradient(135deg, hsl(${theme.colors.primary}), hsl(${theme.colors.secondary}))`,
                  }}
                >
                  {theme.is_featured && (
                    <Badge className="absolute top-2 right-2 gap-1">
                      <Sparkles className="h-3 w-3" />
                      Featured
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{theme.theme_name}</CardTitle>
                  <CardDescription>{theme.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3">
                    {Object.entries(theme.colors).map(([key, value]) => (
                      <div
                        key={key}
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: `hsl(${value})` }}
                        title={key}
                      />
                    ))}
                  </div>
                  <Button onClick={() => applyTheme(theme.colors)} className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Apply Theme
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-themes">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myThemes.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't created any custom themes yet.</p>
                  <p className="text-sm mt-2">Go to the Create Theme tab to get started!</p>
                </CardContent>
              </Card>
            ) : (
              myThemes.map((theme) => (
                <Card key={theme.id} className="overflow-hidden">
                  <div
                    className="h-24"
                    style={{
                      background: `linear-gradient(135deg, hsl(${theme.colors.primary}), hsl(${theme.colors.secondary}))`,
                    }}
                  />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {theme.theme_name}
                      {theme.is_public && <Badge variant="outline">Public</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2 mb-3">
                      {Object.entries(theme.colors).map(([key, value]) => (
                        <div
                          key={key}
                          className="w-8 h-8 rounded border"
                          style={{ backgroundColor: `hsl(${value})` }}
                          title={key}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => applyTheme(theme.colors)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Apply
                      </Button>
                      <Button
                        onClick={() => shareTheme(theme.id)}
                        variant="outline"
                        size="sm"
                        className="gap-1"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => deleteTheme(theme.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
