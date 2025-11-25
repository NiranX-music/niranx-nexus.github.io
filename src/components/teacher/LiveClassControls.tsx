import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Monitor,
  MonitorOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  MessageCircle,
  HelpCircle,
  LogOut,
  Circle,
  Square,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LiveClassControlsProps {
  isTeacher: boolean;
  isScreenSharing: boolean;
  onToggleScreenShare: () => void;
  isMicOn: boolean;
  onToggleMic: () => void;
  isCameraOn: boolean;
  onToggleCamera: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  participantCount: number;
  onLeaveClass: () => void;
  onEndClass?: () => void;
  onShowChat: () => void;
  onShowQuestions: () => void;
  onShowParticipants: () => void;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedAudioDevice: string;
  selectedVideoDevice: string;
  onAudioDeviceChange: (deviceId: string) => void;
  onVideoDeviceChange: (deviceId: string) => void;
}

export const LiveClassControls = ({
  isTeacher,
  isScreenSharing,
  onToggleScreenShare,
  isMicOn,
  onToggleMic,
  isCameraOn,
  onToggleCamera,
  isRecording,
  onToggleRecording,
  participantCount,
  onLeaveClass,
  onEndClass,
  onShowChat,
  onShowQuestions,
  onShowParticipants,
  audioDevices,
  videoDevices,
  selectedAudioDevice,
  selectedVideoDevice,
  onAudioDeviceChange,
  onVideoDeviceChange,
}: LiveClassControlsProps) => {
  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 shadow-2xl border-primary/20 bg-background/95 backdrop-blur-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Mic Control */}
          <Button
            variant={isMicOn ? 'default' : 'destructive'}
            size="icon"
            onClick={onToggleMic}
            className="rounded-full"
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          {/* Camera Control */}
          <Button
            variant={isCameraOn ? 'default' : 'destructive'}
            size="icon"
            onClick={onToggleCamera}
            className="rounded-full"
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          {/* Device Selection */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full" title="Choose Device">
                <Settings className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Microphone</label>
                  <Select value={selectedAudioDevice} onValueChange={onAudioDeviceChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      {audioDevices.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Camera</label>
                  <Select value={selectedVideoDevice} onValueChange={onVideoDeviceChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      {videoDevices.map((device) => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-8 w-px bg-border mx-1" />

          {/* Screen Share (Teacher Only) */}
          {isTeacher && (
            <Button
              variant={isScreenSharing ? 'secondary' : 'outline'}
              size="icon"
              onClick={onToggleScreenShare}
              className="rounded-full"
              title="Screen Share"
            >
              {isScreenSharing ? (
                <MonitorOff className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </Button>
          )}

          {/* Recording (Teacher Only) */}
          {isTeacher && (
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="icon"
              onClick={onToggleRecording}
              className="rounded-full relative"
              title={isRecording ? 'Stop Recording' : 'Start Recording'}
            >
              {isRecording ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </>
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </Button>
          )}

          <div className="h-8 w-px bg-border mx-2" />

          {/* Participants */}
          <Button variant="ghost" size="sm" onClick={onShowParticipants} className="gap-2">
            <Users className="w-4 h-4" />
            <Badge variant="secondary">{participantCount}</Badge>
          </Button>

          {/* Chat */}
          <Button variant="ghost" size="sm" onClick={onShowChat}>
            <MessageCircle className="w-4 h-4" />
          </Button>

          {/* Questions */}
          <Button variant="ghost" size="sm" onClick={onShowQuestions}>
            <HelpCircle className="w-4 h-4" />
          </Button>

          <div className="h-8 w-px bg-border mx-2" />

          {/* End Class (Teacher Only) & Leave */}
          {isTeacher && onEndClass && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onEndClass}
              className="gap-2"
            >
              End Class
            </Button>
          )}
          
          <Button
            variant="secondary"
            size="sm"
            onClick={onLeaveClass}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Leave
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
