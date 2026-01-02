import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export const XstageSongs = () => (
  <div className="p-4 md:p-6 lg:p-8">
    <h1 className="text-2xl font-bold mb-6">Songs & Setlists</h1>
    <Card><CardContent className="py-16 text-center">
      <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">Coming soon - Song library and setlist builder</p>
    </CardContent></Card>
  </div>
);

export const XstageSoundLab = () => (
  <div className="p-4 md:p-6 lg:p-8">
    <h1 className="text-2xl font-bold mb-6">SoundLab X</h1>
    <Card><CardContent className="py-16 text-center">
      <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">Coming soon - DAW-lite for music production</p>
    </CardContent></Card>
  </div>
);

export const XstageSettings = () => (
  <div className="p-4 md:p-6 lg:p-8">
    <h1 className="text-2xl font-bold mb-6">Settings</h1>
    <Card><CardContent className="py-16 text-center">
      <Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">Coming soon - User settings and preferences</p>
    </CardContent></Card>
  </div>
);
