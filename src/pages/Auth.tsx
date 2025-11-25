import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Sparkles, Loader2, Shield, KeyRound, UserPlus, Users, Bug } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useGuestMode } from "@/contexts/GuestModeContext";
import niranxLogo from '@/assets/niranx-logo.jpg';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const SpotifyIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1DB954">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const usernameSchema = z.string().min(3, "Username must be at least 3 characters").max(50);
const fullNameSchema = z.string().min(2, "Full name must be at least 2 characters").max(100);
const classSchema = z.string().min(1, "Class is required");

interface Institute {
  id: string;
  name: string;
}

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { enableGuestMode } = useGuestMode();
  const [loading, setLoading] = useState(false);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: '', answer: 0 });
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    retypePassword: '',
    username: '',
    fullName: '',
    class: '',
    instituteId: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/niranx/dashboard');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchInstitutes();
    generateCaptcha();
  }, []);

  const fetchInstitutes = async () => {
    const { data, error } = await supabase
      .from('institutes')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setInstitutes(data);
    }
  };

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({
      question: `${num1} + ${num2} = ?`,
      answer: num1 + num2
    });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate captcha
      if (parseInt(captchaAnswer) !== captchaQuestion.answer) {
        toast({
          title: "Invalid Captcha",
          description: "Please solve the math problem correctly",
          variant: "destructive",
        });
        setLoading(false);
        generateCaptcha();
        setCaptchaAnswer('');
        return;
      }

      // Validate password match
      if (signUpData.password !== signUpData.retypePassword) {
        toast({
          title: "Passwords don't match",
          description: "Please make sure both passwords are the same",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validate all inputs
      emailSchema.parse(signUpData.email);
      passwordSchema.parse(signUpData.password);
      usernameSchema.parse(signUpData.username);
      fullNameSchema.parse(signUpData.fullName);
      classSchema.parse(signUpData.class);

      if (!signUpData.instituteId) {
        toast({
          title: "Institute required",
          description: "Please select your institute",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/niranx/dashboard`,
          data: {
            username: signUpData.username,
            display_name: signUpData.fullName,
            full_name: signUpData.fullName,
            class: signUpData.class,
            institute_id: signUpData.instituteId
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please login instead.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "Account created successfully. Please check your email to confirm.",
        });
        // Auto-navigate if email confirmation is disabled
        if (data.session) {
          navigate('/niranx/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      emailSchema.parse(loginData.email);
      passwordSchema.parse(loginData.password);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Login failed",
            description: "Invalid email or password",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });
        navigate('/niranx/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/niranx/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
      }
      // Note: Don't set loading to false here as the page will redirect
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "An error occurred during Google authentication",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  const handleSpotifyAuth = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'spotify',
        options: {
          redirectTo: `${window.location.origin}/niranx/dashboard`,
          scopes: 'user-read-email user-read-private user-library-read user-read-recently-played',
        },
      });

      if (error) {
        toast({
          title: "Authentication failed",
          description: error.message,
          variant: "destructive",
        });
        setLoading(false);
      }
      // Note: Don't set loading to false here as the page will redirect
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "An error occurred during Spotify authentication",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 perspective-3d">
      {/* Debug Panel Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 flex items-center gap-2"
        onClick={() => setShowDebugPanel(!showDebugPanel)}
      >
        <Bug className="w-4 h-4" />
        Debug
      </Button>

      {/* Debug Panel */}
      {showDebugPanel && (
        <Card className="fixed top-16 right-4 z-50 w-80 glass-card shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Auth Debug Panel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="space-y-1">
              <div className="font-semibold text-muted-foreground">Project ID:</div>
              <code className="block p-2 bg-muted rounded text-xs break-all">
                {import.meta.env.VITE_SUPABASE_PROJECT_ID || 'tophenwypevlfbznlwil'}
              </code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-muted-foreground">Supabase URL:</div>
              <code className="block p-2 bg-muted rounded text-xs break-all">
                {import.meta.env.VITE_SUPABASE_URL || 'https://tophenwypevlfbznlwil.supabase.co'}
              </code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-muted-foreground">Redirect URL:</div>
              <code className="block p-2 bg-muted rounded text-xs break-all">
                {`${window.location.origin}/niranx/dashboard`}
              </code>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-muted-foreground">Auth Status:</div>
              <div className={`p-2 rounded font-semibold ${user ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                {authLoading ? 'Loading...' : user ? `✓ Logged in as ${user.email}` : '✗ Not logged in'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold text-muted-foreground">User ID:</div>
              <code className="block p-2 bg-muted rounded text-xs break-all">
                {user?.id || 'N/A'}
              </code>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced 3D Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float transform-3d"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float transform-3d" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-glow/10 rounded-full blur-3xl animate-float transform-3d" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="w-full max-w-2xl glass-card shadow-2xl card-3d hover-lift">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center items-center gap-3 mb-6 transform-3d">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-black shadow-lg shadow-primary/20">
              <img src={niranxLogo} alt="NiranX Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-4xl font-bold gradient-text neon-glow">NiranX StudyVerse</h1>
            <Sparkles className="w-8 h-8 text-accent animate-float" />
          </div>
          <CardTitle className="text-2xl">Welcome</CardTitle>
          <CardDescription className="text-lg mt-2">
            Join your personalized study ecosystem with 3D interactive experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>

                <div className="flex items-center justify-between text-sm mt-2">
                  <Link to="/niranx/reset-password" className="text-primary hover:underline flex items-center gap-1">
                    <KeyRound className="w-3 h-3" />
                    Forgot Password?
                  </Link>
                  <Link to="/niranx/magic-link" className="text-primary hover:underline flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Magic Link
                  </Link>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full hover-lift"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span className="ml-2">Continue with Google</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full hover-lift"
                    onClick={handleSpotifyAuth}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <SpotifyIcon />
                    )}
                    <span className="ml-2">Continue with Spotify</span>
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Full Name *</Label>
                    <Input
                      id="signup-fullname"
                      type="text"
                      placeholder="John Doe"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                      required
                      className="backdrop-blur-sm transform-3d"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username *</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="johndoe123"
                      value={signUpData.username}
                      onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                      required
                      className="backdrop-blur-sm transform-3d"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-class">Class *</Label>
                    <Input
                      id="signup-class"
                      type="text"
                      placeholder="e.g., 12th Science"
                      value={signUpData.class}
                      onChange={(e) => setSignUpData({ ...signUpData, class: e.target.value })}
                      required
                      className="backdrop-blur-sm transform-3d"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-institute">Institute *</Label>
                    <Select
                      value={signUpData.instituteId}
                      onValueChange={(value) => setSignUpData({ ...signUpData, instituteId: value })}
                      required
                    >
                      <SelectTrigger className="backdrop-blur-sm transform-3d">
                        <SelectValue placeholder="Select institute" />
                      </SelectTrigger>
                      <SelectContent>
                        {institutes.map((institute) => (
                          <SelectItem key={institute.id} value={institute.id}>
                            {institute.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                    className="backdrop-blur-sm transform-3d"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      className="backdrop-blur-sm transform-3d"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-retype-password">Retype Password *</Label>
                    <Input
                      id="signup-retype-password"
                      type="password"
                      placeholder="••••••••"
                      value={signUpData.retypePassword}
                      onChange={(e) => setSignUpData({ ...signUpData, retypePassword: e.target.value })}
                      required
                      className="backdrop-blur-sm transform-3d"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="captcha" className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Captcha Verification *
                  </Label>
                  <div className="flex gap-3 items-center">
                    <div className="flex-1 p-4 bg-muted/50 rounded-lg border border-primary/20 text-center font-mono text-xl font-bold backdrop-blur-sm">
                      {captchaQuestion.question}
                    </div>
                    <Input
                      id="captcha"
                      type="number"
                      placeholder="Answer"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      required
                      className="w-24 backdrop-blur-sm transform-3d"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full btn-3d hover-lift" disabled={loading} size="lg">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full hover-lift"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span className="ml-2">Continue with Google</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full hover-lift mt-3"
                  onClick={handleSpotifyAuth}
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <SpotifyIcon />
                  )}
                  <span className="ml-2">Continue with Spotify</span>
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Guest Mode Button */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                enableGuestMode();
                navigate('/niranx/focus-engine');
                toast({
                  title: "Guest Mode Enabled",
                  description: "You can now access the Focus Engine without signing in.",
                });
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              Continue as Guest
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Guest mode gives you limited access to the Focus Engine
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="text-center text-sm text-muted-foreground">
              <Button
                variant="link"
                onClick={() => navigate('/')}
                className="text-primary"
              >
                Back to landing page
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
              <Link to="/niranx/reauthentication" className="hover:text-primary flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Reauthenticate
              </Link>
              <Link to="/niranx/invite-user" className="hover:text-primary flex items-center gap-1">
                <UserPlus className="w-3 h-3" />
                Invite User
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
