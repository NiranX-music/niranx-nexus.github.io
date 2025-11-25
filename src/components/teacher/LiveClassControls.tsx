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
} from 'lucide-react';
import { toast } from 'sonner';

interface LiveClassControlsProps {
  isTeacher: boolean;
  isScreenSharing: boolean;
  onToggleScreenShare: () => void;
  isMicOn: boolean;
  onToggleMic: () => void;
  isCameraOn: boolean;
  onToggleCamera: () => void;
  participantCount: number;
  onLeaveClass: () => void;
  onShowChat: () => void;
  onShowQuestions: () => void;
  onShowParticipants: () => void;
}

export const LiveClassControls = ({
  isTeacher,
  isScreenSharing,
  onToggleScreenShare,
  isMicOn,
  onToggleMic,
  isCameraOn,
  onToggleCamera,
  participantCount,
  onLeaveClass,
  onShowChat,
  onShowQuestions,
  onShowParticipants,
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

          {/* Screen Share (Teacher Only) */}
          {isTeacher && (
            <Button
              variant={isScreenSharing ? 'secondary' : 'outline'}
              size="icon"
              onClick={onToggleScreenShare}
              className="rounded-full"
            >
              {isScreenSharing ? (
                <MonitorOff className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
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

          {/* Leave Class */}
          <Button
            variant="destructive"
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
