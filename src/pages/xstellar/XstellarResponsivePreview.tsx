import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Monitor, Tablet } from "lucide-react";

const DEVICE_SIZES = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "100%", maxWidth: "100%" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "768px", maxWidth: "768px" },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: "375px", maxWidth: "375px" },
];

export function XstellarResponsivePreview({
  html, css, js
}: {
  html: string;
  css: string;
  js: string;
}) {
  const [device, setDevice] = useState("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentDevice = DEVICE_SIZES.find(d => d.id === device) || DEVICE_SIZES[0];

  const srcDoc = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Responsive Preview</CardTitle>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {DEVICE_SIZES.map(d => (
              <Button
                key={d.id}
                size="sm"
                variant={device === d.id ? "default" : "ghost"}
                className="h-7 w-7 p-0"
                onClick={() => setDevice(d.id)}
              >
                <d.icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <div
            className="border rounded-lg overflow-hidden bg-background transition-all duration-300"
            style={{ width: currentDevice.width, maxWidth: currentDevice.maxWidth }}
          >
            <div className="bg-muted/50 px-3 py-1 flex items-center justify-between border-b">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-destructive/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
              </div>
              <Badge variant="secondary" className="text-[9px] h-4">{currentDevice.label}</Badge>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={srcDoc}
              className="w-full min-h-[500px]"
              sandbox="allow-scripts"
              title="Responsive Preview"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
