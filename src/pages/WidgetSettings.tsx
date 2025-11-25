import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWidgets, AVAILABLE_WIDGETS } from "@/hooks/useWidgets";
import { Loader2 } from "lucide-react";

const WidgetSettings = () => {
  const { widgets, loading, toggleWidget, isWidgetEnabled } = useWidgets();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Widget Settings</h1>
        <p className="text-muted-foreground">
          Customize which widgets appear on your dashboard and other pages
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dashboard Widgets</CardTitle>
          <CardDescription>
            Toggle widgets on or off. Enabled widgets will appear on your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {AVAILABLE_WIDGETS.map((widget) => (
            <div key={widget.name} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{widget.icon}</span>
                <Label htmlFor={widget.name} className="cursor-pointer">
                  {widget.label}
                </Label>
              </div>
              <Switch
                id={widget.name}
                checked={isWidgetEnabled(widget.name)}
                onCheckedChange={(checked) => toggleWidget(widget.name, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default WidgetSettings;
