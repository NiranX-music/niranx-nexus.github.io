import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiveClassControls } from '@/components/teacher/LiveClassControls';
import { toast } from 'sonner';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import { Loader2, Monitor, VideoOff } from 'lucide-react';

interface LiveClassData {
  id: string;
  title: string;
  description: string | null;
  classroom_id: string;
  teacher_id: string;
  agora_channel_name: string;
  screen_share_active: boolean;
  screen_share_user_id: string | null;
}

const LiveClassSession = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [classData, setClassData] = useState<LiveClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [agoraToken, setAgoraToken] = useState<string>('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [participants, setParticipants] = useState<number>(0);
  
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingData, setRecordingData] = useState<{ resourceId: string; sid: string } | null>(null);
  
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  
  const [showChat, setShowChat] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);

  useEffect(() => {
    if (!classId || !user) {
      navigate('/niranx/teacher/dashboard');
      return;
    }

    loadClassData();
    loadDevices();

    // Don't automatically leave on unmount - allow persistence
    return () => {
      // Only cleanup local media, don't end the class
      if (clientRef.current) {
        localAudioTrackRef.current?.close();
        localVideoTrackRef.current?.close();
        screenTrackRef.current?.close();
        clientRef.current.leave();
      }
    };
  }, [classId, user]);

  const loadDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');
      
      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);
      
      if (audioInputs.length > 0) setSelectedAudioDevice(audioInputs[0].deviceId);
      if (videoInputs.length > 0) setSelectedVideoDevice(videoInputs[0].deviceId);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const loadClassData = async () => {
    try {
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Class not found');
        navigate('/niranx/teacher/dashboard');
        return;
      }

      setClassData(data as any);
      const userIsTeacher = data.teacher_id === user?.id;
      setIsTeacher(userIsTeacher);

      // Ensure we have a valid Agora channel name
      const channelName = data.agora_channel_name || data.id;

      // If the channel name was missing, persist it for future sessions
      if (!data.agora_channel_name) {
        await supabase
          .from('live_classes')
          .update({ agora_channel_name: channelName })
          .eq('id', data.id);
      }

      // Get Agora token and initialize client with determined role
      const tokenData = await getAgoraToken(channelName, user!.id, userIsTeacher);
      if (tokenData) {
        await initializeAgora(channelName, tokenData.token, tokenData.appId);
      }

      // Record attendance
      await supabase
        .from('live_class_attendance')
        .upsert({
          class_id: classId,
          user_id: user!.id,
          joined_at: new Date().toISOString(),
        });

      // Update class status to live
      if (data.status === 'scheduled') {
        await supabase
          .from('live_classes')
          .update({ status: 'live', actual_start: new Date().toISOString() })
          .eq('id', classId);
      }
    } catch (error) {
      console.error('Error loading class:', error);
      toast.error('Failed to load class');
    } finally {
      setLoading(false);
    }
  };

  const getAgoraToken = async (channelName: string, userId: string, userIsTeacher: boolean): Promise<{ token: string; appId: string } | null> => {
    try {
      const role = userIsTeacher ? 'host' : 'audience';
      console.log('Requesting Agora token for:', { channelName, userId, role });
      
      const { data, error } = await supabase.functions.invoke('generate-agora-token', {
        body: { channelName, userId, role },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }
      
      if (!data || !data.token || !data.appId) {
        console.error('Invalid response from token endpoint:', data);
        throw new Error('Invalid token response');
      }

      console.log('Token and appId received successfully');
      setAgoraToken(data.token);
      return { token: data.token, appId: data.appId };
    } catch (error) {
      console.error('Error getting Agora token:', error);
      toast.error(`Failed to get video token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const initializeAgora = async (channelName: string, token: string, appId: string) => {
    try {
      if (!appId || !token) {
        console.error('Missing Agora credentials', { appId: !!appId, token: !!token });
        toast.error('Video configuration is missing');
        return;
      }

      console.log('Creating Agora client with appId:', appId);
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      // Convert userId to numeric UID (same as edge function)
      const uid = Math.abs(user!.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 2147483647);
      
      console.log('Joining Agora channel:', { channelName, uid });
      await clientRef.current.join(appId, channelName, token, uid);

      // Track participant count
      clientRef.current.on('user-joined', (remoteUser) => {
        console.log('User joined:', remoteUser.uid);
        setParticipants((prev) => prev + 1);
      });

      clientRef.current.on('user-left', (remoteUser) => {
        console.log('User left:', remoteUser.uid);
        setParticipants((prev) => Math.max(0, prev - 1));
      });

      // Handle remote user publishing video (including screen share)
      clientRef.current.on('user-published', async (remoteUser, mediaType) => {
        console.log('User published:', remoteUser.uid, mediaType);
        await clientRef.current!.subscribe(remoteUser, mediaType);
        
        if (mediaType === 'video') {
          // Check if this is a screen share by looking at the track
          const remoteVideoTrack = remoteUser.videoTrack;
          if (remoteVideoTrack) {
            // Play in the screen-share-video container
            remoteVideoTrack.play('screen-share-video');
            console.log('Playing remote video in screen-share-video');
          }
        }
        
        if (mediaType === 'audio') {
          remoteUser.audioTrack?.play();
        }
      });

      clientRef.current.on('user-unpublished', (remoteUser, mediaType) => {
        console.log('User unpublished:', remoteUser.uid, mediaType);
        if (mediaType === 'video') {
          // Clear the screen share display
          const container = document.getElementById('screen-share-video');
          if (container) {
            container.innerHTML = '';
          }
        }
      });

      setParticipants(clientRef.current.remoteUsers.length + 1);
    } catch (error) {
      console.error('Error initializing Agora:', error);
      toast.error('Failed to join class');
    }
  };

  const toggleMic = async () => {
    try {
      console.log('Toggle mic called. Current state:', { 
        isMicOn, 
        hasClient: !!clientRef.current,
        selectedAudioDevice 
      });

      if (!clientRef.current) {
        throw new Error('Not connected to class. Please refresh and try again.');
      }

      if (!isMicOn) {
        console.log('Creating audio track...');
        localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack({
          microphoneId: selectedAudioDevice || undefined
        });
        
        console.log('Publishing audio track...');
        await clientRef.current.publish(localAudioTrackRef.current);
        
        setIsMicOn(true);
        toast.success('Microphone enabled');
        console.log('Microphone enabled successfully');
      } else {
        if (localAudioTrackRef.current) {
          console.log('Stopping microphone...');
          await clientRef.current.unpublish(localAudioTrackRef.current);
          localAudioTrackRef.current.close();
          localAudioTrackRef.current = null;
        }
        setIsMicOn(false);
        toast.success('Microphone disabled');
        console.log('Microphone disabled successfully');
      }
    } catch (error) {
      console.error('Error toggling mic:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to toggle microphone: ${errorMessage}`);
    }
  };

  const toggleCamera = async () => {
    try {
      console.log('Toggle camera called. Current state:', { 
        isCameraOn, 
        hasClient: !!clientRef.current,
        selectedVideoDevice 
      });

      if (!clientRef.current) {
        throw new Error('Not connected to class. Please refresh and try again.');
      }

      if (!isCameraOn) {
        console.log('Creating camera track...');
        localVideoTrackRef.current = await AgoraRTC.createCameraVideoTrack({
          cameraId: selectedVideoDevice || undefined
        });
        
        console.log('Publishing camera track...');
        await clientRef.current.publish(localVideoTrackRef.current);
        
        // Display local video
        console.log('Playing video in local-video container...');
        localVideoTrackRef.current.play('local-video');
        
        setIsCameraOn(true);
        toast.success('Camera enabled');
        console.log('Camera enabled successfully');
      } else {
        if (localVideoTrackRef.current) {
          console.log('Stopping camera...');
          await clientRef.current.unpublish(localVideoTrackRef.current);
          localVideoTrackRef.current.close();
          localVideoTrackRef.current = null;
          
          // Clear video container
          const container = document.getElementById('local-video');
          if (container) container.innerHTML = '';
        }
        setIsCameraOn(false);
        toast.success('Camera disabled');
        console.log('Camera disabled successfully');
      }
    } catch (error) {
      console.error('Error toggling camera:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to toggle camera: ${errorMessage}`);
    }
  };

  const switchAudioDevice = async (deviceId: string) => {
    setSelectedAudioDevice(deviceId);
    if (isMicOn && localAudioTrackRef.current) {
      try {
        await localAudioTrackRef.current.setDevice(deviceId);
        toast.success('Microphone switched');
      } catch (error) {
        console.error('Error switching audio device:', error);
        toast.error('Failed to switch microphone');
      }
    }
  };

  const switchVideoDevice = async (deviceId: string) => {
    setSelectedVideoDevice(deviceId);
    if (isCameraOn && localVideoTrackRef.current) {
      try {
        await localVideoTrackRef.current.setDevice(deviceId);
        toast.success('Camera switched');
      } catch (error) {
        console.error('Error switching video device:', error);
        toast.error('Failed to switch camera');
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isTeacher) {
      toast.error('Only teachers can share screen');
      return;
    }

    try {
      if (!isScreenSharing) {
        // Start screen sharing
        screenTrackRef.current = await AgoraRTC.createScreenVideoTrack({}, 'disable');
        await clientRef.current?.publish(screenTrackRef.current);
        
        // Display screen share
        screenTrackRef.current.play('screen-share-video');
        
        // Update database
        await supabase
          .from('live_classes')
          .update({
            screen_share_active: true,
            screen_share_user_id: user!.id,
          })
          .eq('id', classId);

        setIsScreenSharing(true);
        toast.success('Screen sharing started');

        // Handle when user stops sharing via browser button
        screenTrackRef.current.on('track-ended', () => {
          stopScreenShare();
        });
      } else {
        await stopScreenShare();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen sharing');
    }
  };

  const stopScreenShare = async () => {
    try {
      if (screenTrackRef.current) {
        screenTrackRef.current.close();
        screenTrackRef.current = null;
      }

      // Update database
      await supabase
        .from('live_classes')
        .update({
          screen_share_active: false,
          screen_share_user_id: null,
        })
        .eq('id', classId);

      setIsScreenSharing(false);
      toast.success('Screen sharing stopped');
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  };

  const leaveClass = async () => {
    try {
      // Stop all tracks
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      screenTrackRef.current?.close();

      // Leave channel
      await clientRef.current?.leave();

      // Update attendance
      await supabase
        .from('live_class_attendance')
        .update({ left_at: new Date().toISOString() })
        .eq('class_id', classId)
        .eq('user_id', user!.id);

      navigate('/niranx/teacher/dashboard');
    } catch (error) {
      console.error('Error leaving class:', error);
    }
  };

  const toggleRecording = async () => {
    if (!isTeacher) {
      toast.error('Only teachers can control recording');
      return;
    }

    try {
      if (!isRecording) {
        // Start recording
        const { data, error } = await supabase.functions.invoke('agora-cloud-recording', {
          body: {
            action: 'start',
            classId,
            channelName: classData?.agora_channel_name,
            uid: `${user!.id}_recorder`,
          },
        });

        if (error) throw error;

        setRecordingData({ resourceId: data.resourceId, sid: data.sid });
        setIsRecording(true);
        toast.success('Recording started');
      } else {
        // Stop recording
        if (!recordingData) throw new Error('No recording data');

        await supabase.functions.invoke('agora-cloud-recording', {
          body: {
            action: 'stop',
            classId,
            channelName: classData?.agora_channel_name,
            uid: `${user!.id}_recorder`,
            resourceId: recordingData.resourceId,
            sid: recordingData.sid,
          },
        });

        setIsRecording(false);
        setRecordingData(null);
        toast.success('Recording stopped');
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
      toast.error('Failed to toggle recording');
    }
  };

  const endClass = async () => {
    if (!isTeacher) {
      toast.error('Only teachers can end the class');
      return;
    }

    try {
      // Stop recording if active and save to recordings
      if (isRecording && recordingData) {
        toast.info('Stopping recording and saving...');
        
        const { error: stopError } = await supabase.functions.invoke('agora-cloud-recording', {
          body: {
            action: 'stop',
            classId,
            channelName: classData?.agora_channel_name,
            uid: `${user!.id}_recorder`,
            resourceId: recordingData.resourceId,
            sid: recordingData.sid,
          },
        });

        if (stopError) {
          console.error('Error stopping recording:', stopError);
          toast.error('Failed to stop recording, but class will end');
        }
      }

      // Update class status to completed
      await supabase
        .from('live_classes')
        .update({ 
          status: 'completed',
          actual_end: new Date().toISOString() 
        })
        .eq('id', classId);

      toast.success('Class ended successfully. Recording will be available soon.');
      await leaveClass();
    } catch (error) {
      console.error('Error ending class:', error);
      toast.error('Failed to end class');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!classData) return null;

  return (
    <div className="h-screen flex bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{classData.title}</h1>
              {classData.description && (
                <p className="text-sm text-muted-foreground">{classData.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
              {isTeacher && <Badge variant="secondary">Teacher</Badge>}
            </div>
          </div>
        </div>

      {/* Video Grid */}
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4 mb-20">
        {/* Main Screen Area (Screen Share or Remote Videos) */}
        <Card className="flex-1 min-h-[60vh]">
          <CardContent className="p-4 h-full">
            <div className="flex items-center gap-2 mb-2">
              <Monitor className="w-4 h-4 text-primary" />
              <span className="font-semibold">
                {isScreenSharing ? 'Screen Share' : 'Main Display'}
              </span>
            </div>
            <div
              id="screen-share-video"
              className="w-full h-[calc(100%-2rem)] bg-black rounded-lg flex items-center justify-center"
            >
              {!isScreenSharing && (
                <div className="text-center text-muted-foreground">
                  <Monitor className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No screen being shared</p>
                  <p className="text-sm mt-2">
                    {isTeacher 
                      ? 'Click the monitor icon below to share your screen' 
                      : 'Waiting for teacher to share screen...'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Local Camera (Smaller Box Below) */}
        <Card className="w-full md:w-80 self-end">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">You</Badge>
              {isTeacher && <Badge variant="default" className="text-xs">Teacher</Badge>}
            </div>
            <div
              id="local-video"
              className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center"
            >
              {!isCameraOn && (
                <div className="text-center">
                  <VideoOff className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Camera off</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Remote participants container (hidden, Agora will manage) */}
        <div id="remote-videos-container" className="hidden"></div>
      </div>

        {/* Controls */}
        <LiveClassControls
          isTeacher={isTeacher}
          isScreenSharing={isScreenSharing}
          onToggleScreenShare={toggleScreenShare}
          isMicOn={isMicOn}
          onToggleMic={toggleMic}
          isCameraOn={isCameraOn}
          onToggleCamera={toggleCamera}
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
          participantCount={participants}
          onLeaveClass={leaveClass}
          onEndClass={endClass}
          onShowChat={() => setShowChat(!showChat)}
          onShowQuestions={() => setShowQuestions(!showQuestions)}
          onShowParticipants={() => setShowParticipants(!showParticipants)}
          onShowPoll={() => setShowPoll(!showPoll)}
          audioDevices={audioDevices}
          videoDevices={videoDevices}
          selectedAudioDevice={selectedAudioDevice}
          selectedVideoDevice={selectedVideoDevice}
          onAudioDeviceChange={switchAudioDevice}
          onVideoDeviceChange={switchVideoDevice}
        />
      </div>

      {/* Right Sidebar Panels */}
      {(showChat || showQuestions || showParticipants || showPoll) && (
        <div className="w-80 border-l bg-background/95 backdrop-blur-lg flex flex-col">
          {/* Tabs */}
          <div className="flex border-b">
            {showChat && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 rounded-none border-b-2 border-primary"
              >
                Chat
              </Button>
            )}
            {showQuestions && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 rounded-none"
              >
                Questions
              </Button>
            )}
            {showParticipants && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 rounded-none"
              >
                Participants
              </Button>
            )}
            {showPoll && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 rounded-none"
              >
                Poll
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4">
            {showChat && (
              <div className="space-y-4">
                <h3 className="font-semibold">Class Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Chat functionality will be available here
                </p>
              </div>
            )}
            {showQuestions && (
              <div className="space-y-4">
                <h3 className="font-semibold">Questions & Doubts</h3>
                <p className="text-sm text-muted-foreground">
                  Raised questions will appear here
                </p>
              </div>
            )}
            {showParticipants && (
              <div className="space-y-4">
                <h3 className="font-semibold">Participants ({participants})</h3>
                <p className="text-sm text-muted-foreground">
                  List of participants in the class
                </p>
              </div>
            )}
            {showPoll && (
              <div className="space-y-4">
                <h3 className="font-semibold">Create Poll</h3>
                <p className="text-sm text-muted-foreground">
                  Poll creation interface for teachers
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveClassSession;
