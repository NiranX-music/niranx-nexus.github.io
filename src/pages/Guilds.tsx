import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Trophy, MessageCircle, Target, Crown, Shield, UserPlus, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface Guild {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  avatar_url: string | null;
  total_xp: number;
  rank: number | null;
  member_limit: number;
  is_public: boolean;
}

interface GuildMember {
  id: string;
  user_id: string;
  role: string;
  contribution_xp: number;
}

interface GuildChallenge {
  id: string;
  name: string;
  description: string;
  challenge_type: string;
  target_value: number;
  reward_xp: number;
  end_date: string;
  is_active: boolean;
}

interface ChallengeProgress {
  challenge_id: string;
  guild_id: string;
  current_value: number;
  completed: boolean;
}

export default function Guilds() {
  const { user } = useAuth();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [challenges, setChallenges] = useState<GuildChallenge[]>([]);
  const [progress, setProgress] = useState<ChallengeProgress[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [guildName, setGuildName] = useState("");
  const [guildDescription, setGuildDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGuilds();
      fetchMyGuild();
      fetchChallenges();
    }
  }, [user]);

  // Realtime sync for guilds data across devices
  useEffect(() => {
    if (!user) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Guilds list sync
    const guildsChannel = supabase
      .channel(`guilds-list-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guilds',
        },
        () => {
          fetchGuilds();
          fetchMyGuild();
        }
      )
      .subscribe();
    channels.push(guildsChannel);

    // Guild members sync
    if (myGuild) {
      const membersChannel = supabase
        .channel(`guild-members-sync-${myGuild.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'guild_members',
            filter: `guild_id=eq.${myGuild.id}`,
          },
          () => {
            fetchMembers();
          }
        )
        .subscribe();
      channels.push(membersChannel);

      // Challenges progress sync
      const progressChannel = supabase
        .channel(`guild-progress-sync-${myGuild.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'guild_challenge_progress',
            filter: `guild_id=eq.${myGuild.id}`,
          },
          () => {
            fetchProgress();
          }
        )
        .subscribe();
      channels.push(progressChannel);
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, myGuild]);

  useEffect(() => {
    if (myGuild) {
      fetchMembers();
      fetchProgress();
      fetchMessages();
      subscribeToMessages();
    }
  }, [myGuild]);

  const fetchGuilds = async () => {
    const { data, error } = await supabase
      .from("guilds")
      .select("*")
      .eq("is_public", true)
      .order("total_xp", { ascending: false })
      .limit(20);

    if (!error && data) {
      setGuilds(data);
    }
  };

  const fetchMyGuild = async () => {
    if (!user) return;

    const { data: memberData } = await supabase
      .from("guild_members")
      .select("guild_id")
      .eq("user_id", user.id)
      .single();

    if (memberData) {
      const { data: guildData } = await supabase
        .from("guilds")
        .select("*")
        .eq("id", memberData.guild_id)
        .single();

      if (guildData) {
        setMyGuild(guildData);
      }
    }
  };

  const fetchMembers = async () => {
    if (!myGuild) return;

    const { data, error } = await supabase
      .from("guild_members")
      .select("*")
      .eq("guild_id", myGuild.id)
      .order("contribution_xp", { ascending: false });

    if (!error && data) {
      setMembers(data);
    }
  };

  const fetchChallenges = async () => {
    const { data, error } = await supabase
      .from("guild_challenges")
      .select("*")
      .eq("is_active", true)
      .order("end_date", { ascending: true });

    if (!error && data) {
      setChallenges(data);
    }
  };

  const fetchProgress = async () => {
    if (!myGuild) return;

    const { data, error } = await supabase
      .from("guild_challenge_progress")
      .select("*")
      .eq("guild_id", myGuild.id);

    if (!error && data) {
      setProgress(data);
    }
  };

  const fetchMessages = async () => {
    if (!myGuild) return;

    const { data, error } = await supabase
      .from("guild_messages")
      .select("*")
      .eq("guild_id", myGuild.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setMessages(data.reverse());
    }
  };

  const subscribeToMessages = () => {
    if (!myGuild) return;

    const channel = supabase
      .channel(`guild-${myGuild.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "guild_messages",
          filter: `guild_id=eq.${myGuild.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const createGuild = async () => {
    if (!user || !guildName) {
      toast({
        title: "Error",
        description: "Please enter a guild name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: guild, error: guildError } = await supabase
        .from("guilds")
        .insert({
          name: guildName,
          description: guildDescription,
          owner_id: user.id,
        })
        .select()
        .single();

      if (guildError) throw guildError;

      await supabase.from("guild_members").insert({
        guild_id: guild.id,
        user_id: user.id,
        role: "owner",
      });

      toast({
        title: "Guild Created! 🎉",
        description: `Your guild "${guildName}" is ready`,
      });

      setGuildName("");
      setGuildDescription("");
      fetchMyGuild();
    } catch (error: any) {
      console.error("Error creating guild:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create guild",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGuild = async (guildId: string) => {
    if (!user) return;

    try {
      await supabase.from("guild_members").insert({
        guild_id: guildId,
        user_id: user.id,
      });

      toast({
        title: "Joined Guild! ⚔️",
        description: "Welcome to your new guild!",
      });

      fetchMyGuild();
    } catch (error) {
      console.error("Error joining guild:", error);
      toast({
        title: "Error",
        description: "Failed to join guild",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!user || !myGuild || !newMessage.trim()) return;

    try {
      await supabase.from("guild_messages").insert({
        guild_id: myGuild.id,
        user_id: user.id,
        message: newMessage,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getChallengeProgress = (challengeId: string) => {
    return progress.find((p) => p.challenge_id === challengeId);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2 animate-fade-in">Study Guilds</h1>
        <p className="text-muted-foreground animate-fade-in">
          Join or create a study guild, compete in challenges, and achieve together!
        </p>
      </div>

      <Tabs defaultValue={myGuild ? "my-guild" : "browse"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-guild" disabled={!myGuild}>
            My Guild
          </TabsTrigger>
          <TabsTrigger value="browse">Browse Guilds</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="create" disabled={!!myGuild}>
            Create Guild
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-guild" className="space-y-6">
          {myGuild && (
            <>
              <Card className="animate-scale-in">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={myGuild.avatar_url || undefined} />
                        <AvatarFallback>
                          <Shield className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {myGuild.name}
                          {myGuild.rank && myGuild.rank <= 3 && (
                            <Badge variant="secondary" className="gap-1">
                              <Trophy className="h-3 w-3" />#{myGuild.rank}
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{myGuild.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{myGuild.total_xp.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total XP</div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Members ({members.length}/{myGuild.member_limit})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">User {member.user_id.slice(0, 8)}</div>
                                <div className="text-sm text-muted-foreground capitalize">{member.role}</div>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {member.contribution_xp.toLocaleString()} XP
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Guild Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {messages.map((msg) => (
                          <div key={msg.id} className="p-2 rounded bg-muted/30">
                            <div className="text-sm font-medium">
                              User {msg.user_id.slice(0, 8)}
                            </div>
                            <div className="text-sm">{msg.message}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      />
                      <Button onClick={sendMessage} size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {guilds.map((guild, index) => (
              <Card
                key={guild.id}
                className="hover-scale cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={guild.avatar_url || undefined} />
                      <AvatarFallback>
                        <Shield className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{guild.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{guild.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total XP</span>
                    <span className="font-semibold">{guild.total_xp.toLocaleString()}</span>
                  </div>
                  {guild.rank && guild.rank <= 10 && (
                    <Badge variant="secondary" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      Rank #{guild.rank}
                    </Badge>
                  )}
                  <Button
                    onClick={() => joinGuild(guild.id)}
                    className="w-full gap-2"
                    disabled={!!myGuild}
                  >
                    <UserPlus className="h-4 w-4" />
                    Join Guild
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          {challenges.map((challenge, index) => {
            const prog = getChallengeProgress(challenge.id);
            const percentage = prog ? (prog.current_value / challenge.target_value) * 100 : 0;

            return (
              <Card
                key={challenge.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {challenge.name}
                      </CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">+{challenge.reward_xp} XP</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {prog?.current_value.toLocaleString() || 0} /{" "}
                      {challenge.target_value.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    Ends: {new Date(challenge.end_date).toLocaleDateString()}
                  </div>
                  {prog?.completed && (
                    <Badge variant="default" className="gap-1">
                      <Trophy className="h-3 w-3" />
                      Completed!
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Create Your Guild
              </CardTitle>
              <CardDescription>Start your own study guild and lead your team to victory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guild-name">Guild Name</Label>
                <Input
                  id="guild-name"
                  placeholder="The Study Warriors"
                  value={guildName}
                  onChange={(e) => setGuildName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guild-desc">Description</Label>
                <Textarea
                  id="guild-desc"
                  placeholder="We're a group of dedicated students focused on excellence..."
                  value={guildDescription}
                  onChange={(e) => setGuildDescription(e.target.value)}
                />
              </div>
              <Button onClick={createGuild} disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Guild"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
