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
  user_name?: string;
  question: string;
  answered: boolean;
  answer: string | null;
  created_at: string;
}

interface Participant {
  user_id: string;
  display_name: string;
  username: string;
  online_at: string;
}

interface Poll {
  id: string;
  session_id: string;
  created_by: string;
  question: string;
  options: any;
  is_active: boolean;
  created_at: string;
}

interface PollResponse {
  id: string;
  poll_id: string;
  user_id: string;
  user_name: string;
  selected_option: string;
  created_at: string;
}

interface Message {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles: { display_name: string; username: string };
}

interface SharedFile {
  id: string;
  session_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  created_at: string;
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
  const [isTogglingScreen, setIsTogglingScreen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [channelName, setChannelName] = useState<string>("");
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [doubt, setDoubt] = useState("");
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([]);
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "doubts" | "attendance" | "participants" | "polls">("chat");
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollResponses, setPollResponses] = useState<PollResponse[]>([]);
  const [chatMode, setChatMode] = useState<'public' | 'teacher-only'>('public');
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '', '', '']);
  const presenceChannelRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      // Cleanup on unmount
      if (localVideoTrack) {
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (localScreenTrack) {
        localScreenTrack.close();
      }
      agoraClient.leave().catch(err => console.error("Error leaving on unmount:", err));
      setIsJoined(false);
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
          setDoubts(prev => [...prev, {
            ...payload.new,
            user_name: payload.new.user_name
          } as Doubt]);
        } else if (payload.eventType === 'UPDATE') {
          setDoubts(prev => prev.map(d => d.id === payload.new.id ? { ...d, ...payload.new } as Doubt : d));
        }
      })
      .subscribe();

    // Presence channel for real-time participant tracking
    const presenceChannel = supabase.channel(`session-${sessionId}-presence`, {
      config: { presence: { key: user?.id || '' } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const participantsList: Participant[] = [];
        
        Object.keys(state).forEach(key => {
          const presences = state[key] as any[];
          presences.forEach(presence => {
            participantsList.push(presence);
          });
        });
        
        setParticipants(participantsList);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username')
            .eq('id', user.id)
            .single();

          await presenceChannel.track({
            user_id: user.id,
            display_name: profile?.display_name || 'Unknown',
            username: profile?.username || 'unknown',
            online_at: new Date().toISOString()
          });
        }
      });

    presenceChannelRef.current = presenceChannel;

    // Polls channel for real-time poll updates
    const pollsChannel = supabase
      .channel(`session-${sessionId}-polls`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'live_class_polls',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPolls(prev => [...prev, payload.new as Poll]);
        } else if (payload.eventType === 'UPDATE') {
          setPolls(prev => prev.map(p => p.id === payload.new.id ? payload.new as Poll : p));
        }
      })
      .subscribe();

    // Poll responses channel
    const pollResponsesChannel = supabase
      .channel(`session-${sessionId}-poll-responses`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_class_poll_responses'
      }, (payload) => {
        setPollResponses(prev => [...prev, payload.new as PollResponse]);
      })
      .subscribe();

    // Files channel for real-time file uploads
    const filesChannel = supabase
      .channel(`session-${sessionId}-files`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'live_class_files',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setSharedFiles(prev => [...prev, payload.new as SharedFile]);
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
      supabase.removeChannel(pollsChannel);
      supabase.removeChannel(pollResponsesChannel);
      supabase.removeChannel(filesChannel);
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [sessionId]);

  const startClass = async () => {
    if (!isTeacher) {
      toast({ title: "Error", description: "Only teachers can start classes", variant: "destructive" });
      return;
    }

    if (isJoined) {
      toast({ title: "Already started", description: "Class is already live" });
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
    if (isJoined) {
      toast({ title: "Already joined", description: "You are already in a live class" });
      return;
    }

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
      toast({ title: "Failed to join class", description: error.message, variant: "destructive" });
    }
  };

  const loadSessionData = async (sessionId: string) => {
    const [messagesRes, doubtsRes, handsRes, pollsRes, pollResponsesRes, sessionRes, filesRes] = await Promise.all([
      supabase.from('live_class_messages').select('*').eq('session_id', sessionId).order('created_at'),
      supabase.from('live_class_doubts').select('*').eq('session_id', sessionId).order('created_at'),
      supabase.from('live_class_raised_hands').select('*').eq('session_id', sessionId).eq('acknowledged', false),
      supabase.from('live_class_polls').select('*').eq('session_id', sessionId).order('created_at'),
      supabase.from('live_class_poll_responses').select('*'),
      supabase.from('live_class_sessions').select('chat_mode').eq('id', sessionId).single(),
      supabase.from('live_class_files').select('*').eq('session_id', sessionId).order('created_at')
    ]);

    // Set chat mode
    if (sessionRes.data?.chat_mode) {
      setChatMode(sessionRes.data.chat_mode as 'public' | 'teacher-only');
    }

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
        user_name: d.user_name
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
    if (pollsRes.data) {
      setPolls(pollsRes.data);
    }
    if (pollResponsesRes.data) {
      setPollResponses(pollResponsesRes.data);
    }
    if (filesRes.data) {
      setSharedFiles(filesRes.data);
    }
  };

  const joinChannel = async (channel: string, role: 'publisher' | 'subscriber') => {
    if (!client || !user) {
      toast({ title: "Error", description: "Client not initialized", variant: "destructive" });
      return;
    }

    // Prevent multiple simultaneous join attempts
    if (isJoined) {
      console.log("Already joined, skipping duplicate join attempt");
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

      // Check again before join in case state changed during async operation
      if (isJoined) {
        console.log("State changed during token fetch, aborting join");
        return;
      }

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

    // Require active class connection before sharing
    if (!isJoined) {
      toast({
        title: "Join class first",
        description: "Start or join the live class before sharing your screen",
        variant: "destructive",
      });
      return;
    }

    // Prevent double-clicking
    if (isTogglingScreen) {
      return;
    }

    setIsTogglingScreen(true);

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
          console.log("Screen sharing track ended event triggered");

          let mediaStreamTrack: MediaStreamTrack | null = null;
          try {
            const getter = (screenTrack as any).getMediaStreamTrack;
            if (typeof getter === "function") {
              mediaStreamTrack = getter.call(screenTrack);
            }
          } catch (err) {
            console.error("Error accessing screen share MediaStreamTrack:", err);
          }
          
          // If we can inspect the underlying track and it's still live, treat this as a transient state (e.g., tab switch)
          if (mediaStreamTrack && mediaStreamTrack.readyState === "live") {
            console.log("Underlying track is still live, ignoring track-ended (likely tab switch)");
            return;
          }
          
          // Only handle if still in screen sharing state
          if (!isSharingScreen) {
            console.log("Already stopped screen sharing, ignoring event");
            return;
          }
          
          console.log("Screen share actually ended, cleaning up");
          
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
      console.error("Error toggling screen share:", error);
      
      // Clear video element on error
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = "";
      }
      
      // Reset state if error occurs
      if (localScreenTrack) {
        try {
          localScreenTrack.close();
        } catch (closeError) {
          console.error("Error closing screen track after failure:", closeError);
        }
        setLocalScreenTrack(null);
      }
      setIsSharingScreen(false);
      
      // Resume camera if available and still in class
      if (localVideoTrack && isJoined) {
        try {
          await client.publish([localVideoTrack]);
          if (localVideoRef.current) {
            setTimeout(() => {
              localVideoTrack.play(localVideoRef.current!);
            }, 100);
          }
        } catch (camError: any) {
          console.error("Error republishing camera after screen share failure:", camError);
        }
      }
      
      toast({ 
        title: "Screen sharing failed", 
        description: error?.message || (error?.code as string) || "Could not start screen sharing", 
        variant: "destructive" 
      });
    } finally {
      setIsTogglingScreen(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !sessionId || !user) return;

    setUploadingFiles(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${sessionId}/${Date.now()}_${file.name}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('class-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('class-files')
          .getPublicUrl(fileName);

        // Save to database
        await supabase.from('live_class_files').insert({
          session_id: sessionId,
          uploaded_by: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type
        });
      }

      toast({ title: "Files uploaded", description: `${files.length} file(s) uploaded successfully` });
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Could not upload files",
        variant: "destructive"
      });
    } finally {
      setUploadingFiles(false);
    }
  };

  const leaveClass = async () => {
    try {
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
      
      // Clear video elements
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = '';
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.innerHTML = '';
      }

      if (client && isJoined) {
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
      setIsVideoOn(true);
      setIsAudioOn(true);
      setIsSharingScreen(false);
      
      toast({ title: "Left class", description: "You have left the live class" });
    } catch (error: any) {
      console.error("Error leaving class:", error);
      // Reset state even if there's an error
      setIsJoined(false);
      toast({ title: "Error leaving", description: error.message, variant: "destructive" });
    }
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

  const resolveDoubt = async (doubtId: string) => {
    try {
      await supabase
        .from('live_class_doubts')
        .update({ answered: true })
        .eq('id', doubtId);

      toast({ title: "Resolved", description: "Doubt has been marked as resolved" });
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

  const createPoll = async () => {
    if (!sessionId || !user || !newPollQuestion.trim()) return;
    
    const validOptions = newPollOptions.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      toast({ title: "Error", description: "Please provide at least 2 options", variant: "destructive" });
      return;
    }

    try {
      await supabase.from('live_class_polls').insert({
        session_id: sessionId,
        created_by: user.id,
        question: newPollQuestion,
        options: validOptions.map(text => ({ text }))
      });

      setNewPollQuestion('');
      setNewPollOptions(['', '', '', '']);
      setShowCreatePoll(false);
      toast({ title: "Poll created", description: "Students can now vote" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const submitPollResponse = async (pollId: string, option: string) => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('id', user.id)
        .single();

      await supabase.from('live_class_poll_responses').insert({
        poll_id: pollId,
        user_id: user.id,
        user_name: profile?.display_name || profile?.username || 'Unknown',
        selected_option: option
      });

      toast({ title: "Vote submitted", description: "Your response has been recorded" });
    } catch (error: any) {
      if (error.code === '23505') {
        toast({ title: "Already voted", description: "You have already voted on this poll", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  const closePoll = async (pollId: string) => {
    try {
      await supabase
        .from('live_class_polls')
        .update({ is_active: false })
        .eq('id', pollId);

      toast({ title: "Poll closed", description: "No more votes will be accepted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleChatMode = async () => {
    if (!sessionId || !isTeacher) return;

    const newMode = chatMode === 'public' ? 'teacher-only' : 'public';
    
    try {
      await supabase
        .from('live_class_sessions')
        .update({ chat_mode: newMode })
        .eq('id', sessionId);

      setChatMode(newMode);
      toast({ 
        title: "Chat mode updated", 
        description: newMode === 'public' ? "Everyone can send messages" : "Only teacher messages visible" 
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredMessages = chatMode === 'teacher-only' 
    ? messages.filter(m => m.user_id === (isTeacher ? user?.id : messages.find(msg => msg.user_id !== user?.id)?.user_id))
    : messages;

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
            variant={activeTab === "polls" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("polls")}
            className="flex-1"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Polls
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
          <Button
            variant={activeTab === "participants" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("participants")}
            className="flex-1"
          >
            <Users className="w-4 h-4 mr-2" />
            Live ({participants.length})
          </Button>
          {isTeacher && (
            <Button
              variant={activeTab === "attendance" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("attendance")}
              className="flex-1"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Attendance
            </Button>
          )}
        </div>

        <Separator className="mb-4" />

        {activeTab === "chat" ? (
          <>
            {isTeacher && (
              <div className="mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleChatMode}
                  className="w-full"
                >
                  {chatMode === 'public' ? '🔓 Public Chat' : '🔒 Teacher Only'}
                </Button>
              </div>
            )}
            <ScrollArea className="flex-1 pr-4">
              {filteredMessages.map((msg) => (
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
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFiles}
                title="Upload files"
              >
                📎
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={chatMode === 'teacher-only' && !isTeacher ? "Only teacher can send messages" : "Type a message..."}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={chatMode === 'teacher-only' && !isTeacher}
              />
              <Button size="icon" onClick={sendMessage} disabled={chatMode === 'teacher-only' && !isTeacher}>
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {sharedFiles.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-xs font-semibold mb-2">Shared Files ({sharedFiles.length})</h4>
                <ScrollArea className="max-h-32">
                  {sharedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 hover:bg-muted rounded mb-1">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg">📄</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(file.file_url, '_blank')}
                      >
                        ⬇️
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}
          </>
        ) : activeTab === "polls" ? (
          <>
            <ScrollArea className="flex-1 pr-4">
              {isTeacher && !showCreatePoll && (
                <Button onClick={() => setShowCreatePoll(true)} className="w-full mb-4">
                  Create New Poll
                </Button>
              )}
              
              {showCreatePoll && isTeacher && (
                <Card className="p-4 mb-4">
                  <Input
                    value={newPollQuestion}
                    onChange={(e) => setNewPollQuestion(e.target.value)}
                    placeholder="Enter poll question..."
                    className="mb-3"
                  />
                  {newPollOptions.map((option, idx) => (
                    <Input
                      key={idx}
                      value={option}
                      onChange={(e) => {
                        const updated = [...newPollOptions];
                        updated[idx] = e.target.value;
                        setNewPollOptions(updated);
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="mb-2"
                    />
                  ))}
                  <div className="flex gap-2">
                    <Button onClick={createPoll} className="flex-1">Create</Button>
                    <Button onClick={() => setShowCreatePoll(false)} variant="outline" className="flex-1">Cancel</Button>
                  </div>
                </Card>
              )}

              {polls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No polls yet</p>
                </div>
              ) : (
                polls.map((poll) => {
                  const responses = pollResponses.filter(r => r.poll_id === poll.id);
                  const userVoted = responses.some(r => r.user_id === user?.id);
                  
                  return (
                    <Card key={poll.id} className="mb-4 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold">{poll.question}</h4>
                        {!poll.is_active && <Badge variant="secondary">Closed</Badge>}
                      </div>
                      
                      {poll.options.map((option: any, idx: number) => {
                        const optionResponses = responses.filter(r => r.selected_option === option.text);
                        const percentage = responses.length > 0 
                          ? Math.round((optionResponses.length / responses.length) * 100) 
                          : 0;
                        
                        return (
                          <div key={idx} className="mb-2">
                            <Button
                              variant={userVoted ? "outline" : "default"}
                              className="w-full justify-between"
                              onClick={() => submitPollResponse(poll.id, option.text)}
                              disabled={!poll.is_active || userVoted}
                            >
                              <span>{option.text}</span>
                              <Badge variant="secondary">{optionResponses.length} ({percentage}%)</Badge>
                            </Button>
                          </div>
                        );
                      })}
                      
                      {isTeacher && poll.is_active && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => closePoll(poll.id)}
                          className="mt-2 w-full"
                        >
                          Close Poll
                        </Button>
                      )}
                    </Card>
                  );
                })
              )}
            </ScrollArea>
          </>
        ) : activeTab === "doubts" ? (
          <>
            <ScrollArea className="flex-1 pr-4">
              {doubts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No doubts yet. Post your questions!</p>
                </div>
              ) : (
                doubts.map((doubt) => (
                  <Card key={doubt.id} className="mb-3 p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {doubt.user_name || 'Unknown'}
                      </Badge>
                      {doubt.answered && <Badge variant="default" className="text-xs">Resolved</Badge>}
                    </div>
                    <p className="text-sm mb-2">{doubt.question}</p>
                    {doubt.answered && doubt.answer && (
                      <div className="bg-muted p-2 rounded text-sm mt-2">
                        <strong>Answer:</strong> {doubt.answer}
                      </div>
                    )}
                    {!doubt.answered && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveDoubt(doubt.id)}
                      >
                        Mark as Resolved
                      </Button>
                    )}
                  </Card>
                ))
              )}
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Input
                value={doubt}
                onChange={(e) => setDoubt(e.target.value)}
                placeholder="Type your doubt/question..."
                onKeyPress={(e) => e.key === 'Enter' && postDoubt()}
              />
              <Button size="icon" onClick={postDoubt}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : activeTab === "participants" ? (
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Active Participants</h4>
                  <Badge variant="secondary">{participants.length} online</Badge>
                </div>
                {participants.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No participants yet</p>
                  </div>
                ) : (
                  participants.map((participant) => (
                    <Card key={participant.user_id} className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {participant.display_name}
                            {participant.user_id === user?.id && " (You)"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{participant.username}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
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