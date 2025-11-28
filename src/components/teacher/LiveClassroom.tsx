import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AgoraRTC, { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack,
  ILocalVideoTrack
} from "agora-rtc-sdk-ng";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MonitorUp,
  MonitorOff,
  Phone,
  Send,
  Hand,
  MessageSquare,
  HelpCircle,
  Users,
  UserCheck,
  UserX
} from "lucide-react";

interface LiveClassroomProps {
  classroomId: string;
  isTeacher: boolean;
}

interface RaisedHand {
  id: string;
  user_id: string;
  raised_at: string;
  profiles: { display_name: string; username: string };
}

interface Doubt {
  id: string;
  user_id: string;
  question: string;
  answered: boolean;
  answer: string | null;
  created_at: string;
  profiles: { display_name: string; username: string };
}

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles: { display_name: string; username: string };
}

export function LiveClassroom({ classroomId, isTeacher }: LiveClassroomProps) {
  const { user } = useAuth();
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localScreenTrack, setLocalScreenTrack] = useState<ILocalVideoTrack | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [channelName, setChannelName] = useState<string>("");
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [doubt, setDoubt] = useState("");
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "doubts" | "attendance">("chat");
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  // Fetch all classroom students
  useEffect(() => {
    if (!classroomId) return;

    const fetchStudents = async () => {
      // First get the student IDs from classroom_members
      const { data: members, error: membersError } = await supabase
        .from('classroom_members')
        .select('student_id')
        .eq('classroom_id', classroomId)
        .eq('enrollment_status', 'active');

      if (membersError) {
        console.error('Error fetching members:', membersError);
        return;
      }

      if (!members || members.length === 0) {
        setAllStudents([]);
        return;
      }

      // Then fetch profile data for those students
      const studentIds = members.map(m => m.student_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, username, avatar_url')
        .in('user_id', studentIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      const students = profiles?.map(profile => ({
        id: profile.user_id,
        display_name: profile.display_name || 'Unknown',
        username: profile.username || 'unknown',
        avatar_url: profile.avatar_url
      })) || [];
      
      setAllStudents(students);
    };

    fetchStudents();
  }, [classroomId]);

  // Initialize Agora client
  useEffect(() => {
    const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setClient(agoraClient);

    return () => {
      agoraClient.leave();
    };
  }, []);

  // Track student presence when they join
  useEffect(() => {
    if (!sessionId || !user) return;

    const markAttendance = async () => {
      // Mark user as present when joining
      if (!presentStudents.includes(user.id)) {
        setPresentStudents(prev => [...prev, user.id]);

        // Save to attendance records
        const today = new Date().toISOString().split('T')[0];
        await supabase
          .from('attendance_records')
          .upsert({
            classroom_id: classroomId,
            student_id: user.id,
            date: today,
            status: 'present',
            auto_detected: true,
            notes: 'Auto-marked via live class attendance'
          }, {
            onConflict: 'classroom_id,student_id,date'
          });
      }
    };

    markAttendance();
  }, [sessionId, user, classroomId]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!sessionId) return;

    const messagesChannel = supabase
      .channel(`session-${sessionId}-messages`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_class_messages',
        filter: `session_id=eq.${sessionId}`
      }, async (payload) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, username')
          .eq('id', payload.new.user_id)
          .single();
        
        setMessages(prev => [...prev, {
          ...payload.new,
          profiles: profile || { display_name: 'Unknown', username: 'unknown' }
        } as Message]);
      })
      .subscribe();

    const doubtsChannel = supabase
      .channel(`session-${sessionId}-doubts`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_class_doubts',
        filter: `session_id=eq.${sessionId}`
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', payload.new.user_id)
            .single();
          setDoubts(prev => [...prev, {
            ...payload.new,
            profiles: profile || { display_name: 'Unknown', username: 'unknown' }
          } as Doubt]);
        } else if (payload.eventType === 'UPDATE') {
          setDoubts(prev => prev.map(d => d.id === payload.new.id ? { ...d, ...payload.new } as Doubt : d));
        }
      })
      .subscribe();

    const handsChannel = supabase
      .channel(`session-${sessionId}-hands`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_class_raised_hands',
        filter: `session_id=eq.${sessionId}`
      }, async (payload) => {
        if (payload.eventType === 'INSERT') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', payload.new.user_id)
            .single();
          setRaisedHands(prev => [...prev, {
            ...payload.new,
            profiles: profile || { display_name: 'Unknown', username: 'unknown' }
          } as RaisedHand]);
        } else if (payload.eventType === 'UPDATE' && payload.new.acknowledged) {
          setRaisedHands(prev => prev.filter(h => h.id !== payload.new.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(doubtsChannel);
      supabase.removeChannel(handsChannel);
    };
  }, [sessionId]);

  const startClass = async () => {
    if (!isTeacher) {
      toast({ title: "Error", description: "Only teachers can start classes", variant: "destructive" });
      return;
    }

    try {
      const channel = `class-${classroomId}-${Date.now()}`;
      
      const { data: session, error } = await supabase
        .from('live_class_sessions')
        .insert({
          classroom_id: classroomId,
          teacher_id: user?.id,
          channel_name: channel,
          status: 'live',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(session.id);
      setChannelName(channel);
      await joinChannel(channel, 'publisher');
      
      toast({ title: "Live class started", description: "Students can now join" });
    } catch (error: any) {
      console.error('Error starting class:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const joinClass = async () => {
    try {
      const { data: sessions, error } = await supabase
        .from('live_class_sessions')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('status', 'live')
        .order('started_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!sessions || sessions.length === 0) {
        toast({ title: "No live class", description: "No class is currently live", variant: "destructive" });
        return;
      }

      const session = sessions[0];
      setSessionId(session.id);
      setChannelName(session.channel_name);
      await joinChannel(session.channel_name, 'subscriber');
      
      // Load existing messages, doubts, and hands
      loadSessionData(session.id);
    } catch (error: any) {
      console.error('Error joining class:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const loadSessionData = async (sessionId: string) => {
    const [messagesRes, doubtsRes, handsRes] = await Promise.all([
      supabase.from('live_class_messages').select('*').eq('session_id', sessionId).order('created_at'),
      supabase.from('live_class_doubts').select('*').eq('session_id', sessionId).order('created_at'),
      supabase.from('live_class_raised_hands').select('*').eq('session_id', sessionId).eq('acknowledged', false)
    ]);

    // Fetch profile data separately
    const userIds = new Set([
      ...(messagesRes.data?.map(m => m.user_id) || []),
      ...(doubtsRes.data?.map(d => d.user_id) || []),
      ...(handsRes.data?.map(h => h.user_id) || [])
    ]);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, username')
      .in('id', Array.from(userIds));

    const profileMap = new Map(profiles?.map(p => [p.id, p]));

    if (messagesRes.data) {
      setMessages(messagesRes.data.map(m => ({
        ...m,
        profiles: profileMap.get(m.user_id) || { display_name: 'Unknown', username: 'unknown' }
      })));
    }
    if (doubtsRes.data) {
      setDoubts(doubtsRes.data.map(d => ({
        ...d,
        profiles: profileMap.get(d.user_id) || { display_name: 'Unknown', username: 'unknown' }
      })));
    }
    if (handsRes.data) {
      const hands = handsRes.data.map(h => ({
        ...h,
        profiles: profileMap.get(h.user_id) || { display_name: 'Unknown', username: 'unknown' }
      }));
      setRaisedHands(hands);
      setHasRaisedHand(hands.some(h => h.user_id === user?.id));
    }
  };

  const joinChannel = async (channel: string, role: 'publisher' | 'subscriber') => {
    if (!client || !user) {
      toast({ title: "Error", description: "Client not initialized", variant: "destructive" });
      return;
    }

    try {
      // Set up event listeners BEFORE joining
      client.on("user-published", async (remoteUser: IAgoraRTCRemoteUser, mediaType: "audio" | "video") => {
        if (!client) return;
        await client.subscribe(remoteUser, mediaType);
        
        if (mediaType === "video" && remoteVideoRef.current) {
          remoteUser.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === "audio") {
          remoteUser.audioTrack?.play();
        }
      });

      const { data, error } = await supabase.functions.invoke('generate-agora-token', {
        body: { channelName: channel, uid: 0, role }
      });

      if (error) throw error;

      await client.join(data.appId, channel, data.token, 0);

      if (role === 'publisher') {
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        
        setLocalVideoTrack(videoTrack);
        setLocalAudioTrack(audioTrack);
        
        await client.publish([videoTrack, audioTrack]);
        
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
      }

      setIsJoined(true);
      toast({ title: "Joined class", description: "You are now in the live class" });
    } catch (error: any) {
      console.error('Error joining channel:', error);
      toast({ title: "Failed to join class", description: error.message, variant: "destructive" });
    }
  };

  const toggleVideo = async () => {
    if (!localVideoTrack) return;
    
    await localVideoTrack.setEnabled(!isVideoOn);
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = async () => {
    if (!localAudioTrack) return;
    
    await localAudioTrack.setEnabled(!isAudioOn);
    setIsAudioOn(!isAudioOn);
  };

  const toggleScreenShare = async () => {
    if (!client || !isTeacher) {
      toast({ title: "Error", description: "Only teachers can share screen", variant: "destructive" });
      return;
    }

    try {
      if (isSharingScreen && localScreenTrack) {
        // Stop screen sharing
        await client.unpublish([localScreenTrack]);
        localScreenTrack.close();
        setLocalScreenTrack(null);
        setIsSharingScreen(false);
        
        // Clear the video element
        if (localVideoRef.current) {
          localVideoRef.current.innerHTML = '';
        }
        
        // Resume camera
        if (localVideoTrack) {
          await client.publish([localVideoTrack]);
          if (localVideoRef.current) {
            // Small delay to ensure clean transition
            setTimeout(() => {
              localVideoTrack.play(localVideoRef.current!);
            }, 100);
          }
        }
        
        toast({ title: "Screen sharing stopped", description: "Camera is now active" });
      } else {
        // Start screen sharing
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: "1080p_1",
          optimizationMode: "detail"
        });
        
        // Clear video element first
        if (localVideoRef.current) {
          localVideoRef.current.innerHTML = '';
        }
        
        // Unpublish camera before publishing screen
        if (localVideoTrack) {
          await client.unpublish([localVideoTrack]);
        }
        
        // Handle screen sharing cancellation from browser UI
        (screenTrack as ILocalVideoTrack).on("track-ended", async () => {
          console.log("Screen sharing track ended by browser");
          try {
            await client.unpublish([screenTrack as ILocalVideoTrack]);
          } catch (err) {
            console.error("Error unpublishing screen track on end:", err);
          }

          (screenTrack as ILocalVideoTrack).close();
          setLocalScreenTrack(null);
          setIsSharingScreen(false);

          // Clear video element
          if (localVideoRef.current) {
            localVideoRef.current.innerHTML = '';
          }

          // Resume camera if available
          if (localVideoTrack) {
            try {
              await client.publish([localVideoTrack]);
              if (localVideoRef.current) {
                setTimeout(() => {
                  localVideoTrack.play(localVideoRef.current!);
                }, 100);
              }
            } catch (err) {
              console.error("Error republishing camera after screen share end:", err);
            }
          }
        });
        
        await client.publish([screenTrack as ILocalVideoTrack]);
        setLocalScreenTrack(screenTrack as ILocalVideoTrack);
        setIsSharingScreen(true);
        
        if (localVideoRef.current) {
          (screenTrack as ILocalVideoTrack).play(localVideoRef.current);
        }
        
        toast({ title: "Screen sharing started", description: "Your screen is now visible to students" });
      }
    } catch (error: any) {
      console.error('Error toggling screen share:', error);
      
      // Clear video element on error
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = '';
      }
      
      // Reset state if error occurs
      if (localScreenTrack) {
        localScreenTrack.close();
        setLocalScreenTrack(null);
      }
      setIsSharingScreen(false);
      
      // Resume camera if available
      if (localVideoTrack) {
        await client.publish([localVideoTrack]);
        if (localVideoRef.current) {
          setTimeout(() => {
            localVideoTrack.play(localVideoRef.current!);
          }, 100);
        }
      }
      
      toast({ 
        title: "Screen sharing failed", 
        description: error.message || "Could not start screen sharing", 
        variant: "destructive" 
      });
    }
  };

  const leaveClass = async () => {
    if (localVideoTrack) {
      localVideoTrack.close();
      setLocalVideoTrack(null);
    }
    if (localAudioTrack) {
      localAudioTrack.close();
      setLocalAudioTrack(null);
    }
    if (localScreenTrack) {
      localScreenTrack.close();
      setLocalScreenTrack(null);
    }
    if (client) {
      await client.leave();
    }

    if (isTeacher && sessionId) {
      await supabase
        .from('live_class_sessions')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', sessionId);
    }

    setIsJoined(false);
    setSessionId(null);
    setChannelName("");
    toast({ title: "Left class", description: "You have left the live class" });
  };

  const sendMessage = async () => {
    if (!message.trim() || !sessionId || !user) return;

    try {
      await supabase.from('live_class_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        message: message.trim()
      });

      setMessage("");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const postDoubt = async () => {
    if (!doubt.trim() || !sessionId || !user) return;

    try {
      await supabase.from('live_class_doubts').insert({
        session_id: sessionId,
        user_id: user.id,
        question: doubt.trim()
      });

      setDoubt("");
      toast({ title: "Doubt posted", description: "Your question has been posted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const answerDoubt = async (doubtId: string, answer: string) => {
    try {
      await supabase
        .from('live_class_doubts')
        .update({ answered: true, answer, answered_at: new Date().toISOString() })
        .eq('id', doubtId);

      toast({ title: "Answered", description: "Doubt has been answered" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const raiseHand = async () => {
    if (!sessionId || !user || hasRaisedHand) return;

    try {
      await supabase.from('live_class_raised_hands').insert({
        session_id: sessionId,
        user_id: user.id
      });

      setHasRaisedHand(true);
      toast({ title: "Hand raised", description: "Teacher will be notified" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const acknowledgeHand = async (handId: string) => {
    try {
      await supabase
        .from('live_class_raised_hands')
        .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
        .eq('id', handId);

      toast({ title: "Acknowledged", description: "Hand has been acknowledged" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const markStudentAttendance = async (studentId: string, status: 'present' | 'absent') => {
    if (!isTeacher) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      await supabase
        .from('attendance_records')
        .upsert({
          classroom_id: classroomId,
          student_id: studentId,
          date: today,
          status,
          recorded_by: user?.id,
          notes: status === 'present' ? 'Manually marked present' : 'Marked absent'
        }, {
          onConflict: 'classroom_id,student_id,date'
        });

      if (status === 'present' && !presentStudents.includes(studentId)) {
        setPresentStudents(prev => [...prev, studentId]);
      } else if (status === 'absent') {
        setPresentStudents(prev => prev.filter(id => id !== studentId));
      }

      toast({ 
        title: "Attendance Updated", 
        description: `Student marked as ${status}` 
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const absentStudents = allStudents.filter(s => !presentStudents.includes(s.id));

  if (!isJoined) {
    return (
      <Card className="p-12 text-center">
        <Video className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="text-2xl font-bold mb-2">Live Classroom</h3>
        <p className="text-muted-foreground mb-6">
          {isTeacher
            ? "Start a live class to teach your students with video and screen sharing"
            : "Join the live class when your teacher starts one"}
        </p>
        {isTeacher ? (
          <Button onClick={startClass} size="lg">
            Start Live Class
          </Button>
        ) : (
          <Button onClick={joinClass} size="lg">
            Join Live Class
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-4">
          <div className="aspect-video bg-muted rounded-lg mb-4 relative overflow-hidden">
            <div ref={localVideoRef} className="w-full h-full" />
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <VideoOff className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant={isVideoOn ? "default" : "destructive"}
              size="icon"
              onClick={toggleVideo}
            >
              {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </Button>
            <Button
              variant={isAudioOn ? "default" : "destructive"}
              size="icon"
              onClick={toggleAudio}
            >
              {isAudioOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            {isTeacher && (
              <Button
                variant={isSharingScreen ? "secondary" : "outline"}
                size="icon"
                onClick={toggleScreenShare}
              >
                {isSharingScreen ? <MonitorOff className="w-4 h-4" /> : <MonitorUp className="w-4 h-4" />}
              </Button>
            )}
            {!isTeacher && (
              <Button
                variant={hasRaisedHand ? "secondary" : "outline"}
                size="icon"
                onClick={raiseHand}
                disabled={hasRaisedHand}
              >
                <Hand className="w-4 h-4" />
              </Button>
            )}
            <Button variant="destructive" size="icon" onClick={leaveClass}>
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {isTeacher && raisedHands.length > 0 && (
          <Card className="p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Hand className="w-4 h-4" />
              Raised Hands ({raisedHands.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {raisedHands.map((hand) => (
                <Badge key={hand.id} variant="outline" className="cursor-pointer" onClick={() => acknowledgeHand(hand.id)}>
                  {hand.profiles?.display_name || hand.profiles?.username}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        <Card className="aspect-video bg-muted rounded-lg">
          <div ref={remoteVideoRef} className="w-full h-full" />
        </Card>
      </div>

      <Card className="p-4 flex flex-col h-[600px]">
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "chat" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("chat")}
            className="flex-1"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button
            variant={activeTab === "doubts" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("doubts")}
            className="flex-1"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Doubts ({doubts.filter(d => !d.answered).length})
          </Button>
          {isTeacher && (
            <Button
              variant={activeTab === "attendance" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("attendance")}
              className="flex-1"
            >
              <Users className="w-4 h-4 mr-2" />
              Attendance
            </Button>
          )}
        </div>

        <Separator className="mb-4" />

        {activeTab === "chat" ? (
          <>
            <ScrollArea className="flex-1 pr-4">
              {messages.map((msg) => (
                <div key={msg.id} className="mb-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {msg.profiles?.display_name || msg.profiles?.username}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{msg.message}</p>
                </div>
              ))}
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button size="icon" onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : activeTab === "doubts" ? (
          <>
            <ScrollArea className="flex-1 pr-4">
              {doubts.map((doubt) => (
                <Card key={doubt.id} className="mb-3 p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {doubt.profiles?.display_name || doubt.profiles?.username}
                    </Badge>
                    {doubt.answered && <Badge variant="default" className="text-xs">Answered</Badge>}
                  </div>
                  <p className="text-sm mb-2">{doubt.question}</p>
                  {doubt.answered && doubt.answer && (
                    <div className="bg-muted p-2 rounded text-sm">
                      <strong>Answer:</strong> {doubt.answer}
                    </div>
                  )}
                  {isTeacher && !doubt.answered && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const answer = prompt("Enter your answer:");
                        if (answer) answerDoubt(doubt.id, answer);
                      }}
                    >
                      Answer
                    </Button>
                  )}
                </Card>
              ))}
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Input
                value={doubt}
                onChange={(e) => setDoubt(e.target.value)}
                placeholder="Ask a question..."
                onKeyPress={(e) => e.key === 'Enter' && postDoubt()}
              />
              <Button size="icon" onClick={postDoubt}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : activeTab === "attendance" && isTeacher ? (
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-green-500" />
                      Present ({presentStudents.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {allStudents
                      .filter(s => presentStudents.includes(s.id))
                      .map((student) => (
                        <Card key={student.id} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-sm font-medium">
                                {student.display_name || student.username}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markStudentAttendance(student.id, 'absent')}
                            >
                              Mark Absent
                            </Button>
                          </div>
                        </Card>
                      ))}
                    {presentStudents.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No students present yet
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <UserX className="w-4 h-4 text-red-500" />
                      Absent ({absentStudents.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {absentStudents.map((student) => (
                      <Card key={student.id} className="p-3 bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-sm text-muted-foreground">
                              {student.display_name || student.username}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markStudentAttendance(student.id, 'present')}
                          >
                            Mark Present
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {absentStudents.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        All students are present
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        ) : null}
      </Card>
    </div>
  );
}