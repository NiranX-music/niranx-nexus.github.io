import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useXFlow } from "@/hooks/useXFlow";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, User, Lock, AtSign, Check, X } from "lucide-react";
import { motion } from "framer-motion";

export default function XFlowLogin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentProfile, 
    isAuthenticated, 
    createProfile, 
    loginToProfile, 
    checkUsernameAvailable,
    getUserProfiles 
  } = useXFlow();

  const [existingProfiles, setExistingProfiles] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("login");
  
  // Login form
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Create form
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newBio, setNewBio] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentProfile) {
      navigate('/xflow');
    }
  }, [isAuthenticated, currentProfile, navigate]);

  useEffect(() => {
    loadExistingProfiles();
  }, [user]);

  useEffect(() => {
    const checkUsername = async () => {
      if (newUsername.length < 3) {
        setUsernameAvailable(null);
        return;
      }
      
      setIsCheckingUsername(true);
      const available = await checkUsernameAvailable(newUsername);
      setUsernameAvailable(available);
      setIsCheckingUsername(false);
    };

    const debounce = setTimeout(checkUsername, 500);
    return () => clearTimeout(debounce);
  }, [newUsername]);

  const loadExistingProfiles = async () => {
    const profiles = await getUserProfiles();
    setExistingProfiles(profiles);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const success = await loginToProfile(loginUsername, loginPassword);
    if (success) {
      navigate('/xflow');
    }
    
    setIsLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameAvailable) return;
    
    setIsLoading(true);
    
    const profile = await createProfile(newUsername, newPassword, newDisplayName, newBio);
    if (profile) {
      navigate('/xflow');
    }
    
    setIsLoading(false);
  };

  const handleQuickLogin = async (username: string) => {
    setLoginUsername(username);
    setActiveTab("login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-bold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground mb-4">
              Please sign in to your account to access XFlow
            </p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/10 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              XFlow
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Share your moments with the world
            </p>
          </CardHeader>
          
          <CardContent>
            {existingProfiles.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Your profiles:</p>
                <div className="flex flex-wrap gap-2">
                  {existingProfiles.map((profile) => (
                    <Button
                      key={profile.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickLogin(profile.username)}
                      className="gap-1"
                    >
                      <AtSign className="h-3 w-3" />
                      {profile.username}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="create">Create New</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-username"
                        placeholder="username"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login to XFlow'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="create" className="mt-4">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-username">Choose Username</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-username"
                        placeholder="your_unique_username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="pl-10 pr-10"
                        required
                        minLength={3}
                      />
                      {newUsername.length >= 3 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isCheckingUsername ? (
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          ) : usernameAvailable ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {newUsername.length >= 3 && !isCheckingUsername && (
                      <p className={`text-xs ${usernameAvailable ? 'text-green-500' : 'text-red-500'}`}>
                        {usernameAvailable ? 'Username is available!' : 'Username is already taken'}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Create Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={4}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-display-name">Display Name (optional)</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-display-name"
                        placeholder="Your Name"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-bio">Bio (optional)</Label>
                    <Textarea
                      id="new-bio"
                      placeholder="Tell us about yourself..."
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      maxLength={150}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground text-right">{newBio.length}/150</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !usernameAvailable}
                  >
                    {isLoading ? 'Creating...' : 'Create XFlow Profile'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
