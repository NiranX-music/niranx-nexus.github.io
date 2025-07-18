import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Edit, 
  Save, 
  Camera, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Phone,
  Mail,
  Shield,
  MessageSquare,
  Settings,
  Trophy,
  Star,
  Zap,
  Gift,
  Target,
  GraduationCap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [xpData, setXpData] = useState({ xp: 0, level: 1, nextLevelXp: 1000, progress: 0 });
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    phone_number: '',
    location: '',
    website: '',
    date_of_birth: '',
    avatar_url: '',
    class: '',
    ambition: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        phone_number: profile.phone_number || '',
        location: profile.location || '',
        website: profile.website || '',
        date_of_birth: profile.date_of_birth || '',
        avatar_url: profile.avatar_url || '',
        class: profile.class || '',
        ambition: profile.ambition || ''
      });

      // Calculate XP data
      const currentXp = profile.xp || 0;
      const currentLevel = profile.level || 1;
      const nextLevelXp = getXpForLevel(currentLevel + 1);
      const currentLevelXp = getXpForLevel(currentLevel);
      
      setXpData({
        xp: currentXp,
        level: currentLevel,
        nextLevelXp: nextLevelXp - currentLevelXp,
        progress: Math.max(0, ((currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100)
      });

      // Check if daily reward already claimed
      checkDailyReward();
    }
  }, [profile]);

  const getXpForLevel = (level: number) => {
    const xpThresholds = [0, 1000, 2500, 5000, 10000, 20000, 35000, 50000, 75000, 100000, 100000];
    return xpThresholds[Math.min(level, xpThresholds.length - 1)] || 100000;
  };

  const checkDailyReward = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_rewards')
      .select('*')
      .eq('user_id', user.id)
      .eq('reward_date', today)
      .single();
    
    setDailyRewardClaimed(!!data);
  };

  const claimDailyReward = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('claim_daily_reward', {
        user_uuid: user.id
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast({
          title: result.level_up ? "🎉 Level Up!" : "🎁 Daily Reward Claimed!",
          description: result.level_up 
            ? `Congratulations! You reached level ${result.new_level}!`
            : `You earned ${result.xp_earned} XP! Keep it up!`,
        });
        
        setDailyRewardClaimed(true);
        // Refresh profile to update XP
        window.location.reload();
      } else {
        toast({
          title: "Already Claimed",
          description: result?.message || "Daily reward already claimed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      toast({
        title: "Error",
        description: "Failed to claim daily reward",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    await updateProfile(formData);
    setIsEditing(false);
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            My Profile
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/messages')}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </Button>
            <Button 
              variant="outline" 
              onClick={signOut}
              className="gap-2"
            >
              Sign Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="level">Level & XP</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="level" className="space-y-6">
            {/* XP and Level Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Level {xpData.level}
                    </CardTitle>
                    <CardDescription>
                      {xpData.xp.toLocaleString()} XP Total
                    </CardDescription>
                  </div>
                  {!dailyRewardClaimed ? (
                    <Button 
                      onClick={claimDailyReward}
                      className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    >
                      <Gift className="w-4 h-4" />
                      Claim Daily Reward (+100 XP)
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="w-3 h-3" />
                      Daily Reward Claimed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress to Level {xpData.level + 1}</span>
                      <span>{Math.round(xpData.progress || 0)}%</span>
                    </div>
                    <Progress value={xpData.progress || 0} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.max(0, xpData.nextLevelXp - (xpData.xp - getXpForLevel(xpData.level)))} XP to next level
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-500">{xpData.xp.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">Total XP</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-yellow-500">{xpData.level}</div>
                        <p className="text-sm text-muted-foreground">Current Level</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-500">
                          {Math.max(0, getXpForLevel(xpData.level + 1) - xpData.xp)}
                        </div>
                        <p className="text-sm text-muted-foreground">XP to Next Level</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Level Rewards & Milestones</h3>
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                        <div 
                          key={level}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            xpData.level >= level ? 'bg-green-50 border-green-200 dark:bg-green-900/20' : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              xpData.level >= level ? 'bg-green-500 text-white' : 'bg-muted-foreground text-background'
                            }`}>
                              {xpData.level >= level ? <Star className="w-4 h-4" /> : level}
                            </div>
                            <div>
                              <p className="font-medium">Level {level}</p>
                              <p className="text-sm text-muted-foreground">
                                {getXpForLevel(level).toLocaleString()} XP required
                              </p>
                            </div>
                          </div>
                          <Badge variant={xpData.level >= level ? "default" : "secondary"}>
                            {xpData.level >= level ? "Unlocked" : "Locked"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">....
            {/* Profile Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={formData.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {getInitials(formData.display_name || formData.username || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                      <h2 className="text-2xl font-bold">
                        {formData.display_name || formData.username || 'User'}
                      </h2>
                      <Badge variant="default" className="gap-1">
                        <Star className="w-3 h-3" />
                        Level {xpData.level}
                      </Badge>
                      {profile?.is_verified && (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">@{formData.username}</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.class && (
                        <Badge variant="outline" className="gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {formData.class}
                        </Badge>
                      )}
                      {formData.ambition && (
                        <Badge variant="outline" className="gap-1">
                          <Target className="w-3 h-3" />
                          {formData.ambition}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{formData.bio}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start text-sm text-muted-foreground">
                      {formData.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {formData.location}
                        </div>
                      )}
                      {formData.website && (
                        <div className="flex items-center gap-1">
                          <LinkIcon className="w-4 h-4" />
                          <a href={formData.website} target="_blank" rel="noopener noreferrer" 
                             className="text-primary hover:underline">
                            Website
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {new Date(profile?.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} className="gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSave} 
                          disabled={loading}
                          className="gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {loading ? 'Saving...' : 'Save'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Details */}
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Your unique username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) => handleInputChange('display_name', e.target.value)}
                        placeholder="Your display name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://your-website.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="class">Class/Year</Label>
                      <Input
                        id="class"
                        value={formData.class}
                        onChange={(e) => handleInputChange('class', e.target.value)}
                        placeholder="e.g., Class 12, First Year, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ambition">Ambition/Goal</Label>
                      <Input
                        id="ambition"
                        value={formData.ambition}
                        onChange={(e) => handleInputChange('ambition', e.target.value)}
                        placeholder="e.g., Doctor, Engineer, etc."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input
                      id="avatar_url"
                      value={formData.avatar_url}
                      onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {formData.phone_number && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">{formData.phone_number}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings options coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent activity on NiranX StudyVerse</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Activity feed coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;