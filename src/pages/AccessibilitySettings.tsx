import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Eye, Type, Zap, Volume2, Keyboard, Focus } from 'lucide-react';
import { toast } from 'sonner';

export const AccessibilitySettings = () => {
  const { preferences, updatePreferences } = useAccessibility();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleTestSpeech = () => {
    const utterance = new SpeechSynthesisUtterance('This is a test of the text to speech feature');
    utterance.rate = preferences.tts_rate;
    
    if (preferences.tts_voice) {
      const selectedVoice = voices.find(v => v.name === preferences.tts_voice);
      if (selectedVoice) utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Eye className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Accessibility Settings</h1>
            <p className="text-muted-foreground">Customize your experience for better accessibility</p>
          </div>
        </div>

        {/* Visual Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visual Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="high-contrast">High Contrast Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enhanced contrast for better visibility (WCAG AAA compliant)
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={preferences.high_contrast_mode}
                onCheckedChange={(checked) => {
                  updatePreferences({ high_contrast_mode: checked });
                  toast.success(checked ? 'High contrast mode enabled' : 'High contrast mode disabled');
                }}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="font-size">
                  <Type className="w-4 h-4 inline mr-2" />
                  Font Size: {Math.round(preferences.font_size_multiplier * 100)}%
                </Label>
              </div>
              <Slider
                id="font-size"
                min={0.8}
                max={2.0}
                step={0.1}
                value={[preferences.font_size_multiplier]}
                onValueChange={([value]) => {
                  updatePreferences({ font_size_multiplier: value });
                }}
              />
              <p className="text-sm text-muted-foreground">
                Adjust the base font size across the entire application
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reduce-motion">Reduce Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Minimize animations and transitions for reduced distraction
                </p>
              </div>
              <Switch
                id="reduce-motion"
                checked={preferences.reduce_motion}
                onCheckedChange={(checked) => {
                  updatePreferences({ reduce_motion: checked });
                  toast.success(checked ? 'Motion reduced' : 'Motion restored');
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Text-to-Speech
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tts-enabled">Enable Text-to-Speech</Label>
                <p className="text-sm text-muted-foreground">
                  Have study materials, notes, and tasks read aloud
                </p>
              </div>
              <Switch
                id="tts-enabled"
                checked={preferences.text_to_speech_enabled}
                onCheckedChange={(checked) => {
                  updatePreferences({ text_to_speech_enabled: checked });
                  toast.success(checked ? 'Text-to-speech enabled' : 'Text-to-speech disabled');
                }}
              />
            </div>

            {preferences.text_to_speech_enabled && (
              <>
                <Separator />

                <div className="space-y-3">
                  <Label htmlFor="tts-voice">Voice Selection</Label>
                  <Select
                    value={preferences.tts_voice || ''}
                    onValueChange={(value) => updatePreferences({ tts_voice: value })}
                  >
                    <SelectTrigger id="tts-voice">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.name} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tts-rate">
                      Speech Rate: {preferences.tts_rate}x
                    </Label>
                  </div>
                  <Slider
                    id="tts-rate"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={[preferences.tts_rate]}
                    onValueChange={([value]) => updatePreferences({ tts_rate: value })}
                  />
                  <Button onClick={handleTestSpeech} variant="outline" className="w-full">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Test Speech
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Navigation & Interaction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="keyboard-enhanced">Enhanced Keyboard Navigation</Label>
                <p className="text-sm text-muted-foreground">
                  Additional keyboard shortcuts and navigation hints
                </p>
              </div>
              <Switch
                id="keyboard-enhanced"
                checked={preferences.keyboard_shortcuts_enhanced}
                onCheckedChange={(checked) => {
                  updatePreferences({ keyboard_shortcuts_enhanced: checked });
                  toast.success(checked ? 'Enhanced keyboard navigation enabled' : 'Enhanced keyboard navigation disabled');
                }}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="focus-enhanced">Enhanced Focus Indicators</Label>
                <p className="text-sm text-muted-foreground">
                  Stronger visual indicators for focused elements
                </p>
              </div>
              <Switch
                id="focus-enhanced"
                checked={preferences.focus_indicators_enhanced}
                onCheckedChange={(checked) => {
                  updatePreferences({ focus_indicators_enhanced: checked });
                  toast.success(checked ? 'Enhanced focus indicators enabled' : 'Enhanced focus indicators disabled');
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Focus className="w-5 h-5" />
              Accessibility Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              StudyVerse is committed to providing an accessible learning experience for all users.
            </p>
            <p>
              Our accessibility features follow WCAG 2.1 AA guidelines and include support for:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Screen readers and assistive technologies</li>
              <li>Keyboard-only navigation</li>
              <li>High contrast modes for visual clarity</li>
              <li>Customizable text sizes</li>
              <li>Reduced motion for vestibular sensitivity</li>
            </ul>
            <p className="mt-3">
              If you encounter any accessibility issues, please report them through our feedback system.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
