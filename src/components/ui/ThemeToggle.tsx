import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Sun, Moon, Sparkles, Circle, Heart } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { name: 'light', icon: Sun, label: 'Light', color: 'bg-white' },
    { name: 'dark', icon: Moon, label: 'Dark', color: 'bg-gray-900' },
    { name: 'space', icon: Sparkles, label: 'Space', color: 'bg-purple-900' },
    { name: 'grey', icon: Circle, label: 'Grey', color: 'bg-gray-500' },
    { name: 'pink', icon: Heart, label: 'Pink', color: 'bg-pink-500' },
  ];

  return (
    <div className="fixed top-4 left-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full shadow-lg">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <h3 className="font-semibold mb-3">Choose Theme</h3>
          <div className="grid grid-cols-1 gap-2">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              return (
                <Button
                  key={themeOption.name}
                  variant={theme === themeOption.name ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setTheme(themeOption.name as any)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${themeOption.color} border`} />
                    <Icon className="h-4 w-4" />
                    <span>{themeOption.label}</span>
                  </div>
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ThemeToggle;