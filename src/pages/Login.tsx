import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Mail, Shield, Sparkles, ArrowRight, Eye, EyeOff, User, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const GOOGLE_CLIENT_ID = "994620627677-vkpe20tuhved8tcgu34na01m1ea8scld.apps.googleusercontent.com";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      // Initialize Google Sign-In
      if (typeof window !== 'undefined' && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("authMethod", "google");
            localStorage.setItem("userEmail", email);
            toast({
              title: "Welcome to StudyVerse! 🎉",
              description: "Google login successful",
            });
            navigate("/");
          },
        });
        
        (window as any).google.accounts.id.prompt();
      } else {
        // Fallback for development
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("authMethod", "google");
        toast({
          title: "Welcome to StudyVerse! 🎉",
          description: "Google login successful",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleGuestMode = () => {
    localStorage.setItem("isLoggedIn", "false");
    localStorage.setItem("authMethod", "guest");
    toast({
      title: "Guest Mode Activated 🕐",
      description: "Limited to Pomodoro timer only",
    });
    navigate("/");
  };

  const handlePasswordLogin = async () => {
    if (!username || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("authMethod", "password");
      localStorage.setItem("userEmail", username);
      setIsLoading(false);
      toast({
        title: "Welcome back! 👋",
        description: "Login successful",
      });
      navigate("/");
    }, 1500);
  };

  const handleSendCode = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call - Replace with actual Supabase auth
    setTimeout(() => {
      setIsCodeSent(true);
      setIsLoading(false);
      toast({
        title: "Code Sent! 📧",
        description: `Verification code sent to ${email}`,
      });
    }, 1500);
  };

  const handleVerifyCode = async () => {
    if (!code) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate verification - Replace with actual Supabase auth
    setTimeout(() => {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("authMethod", "email");
      localStorage.setItem("userEmail", email);
      setIsLoading(false);
      toast({
        title: "Welcome to StudyVerse! 🎉",
        description: "Successfully authenticated",
      });
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-lg relative z-10 shadow-2xl border-0 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-6 pb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-10 h-10 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StudyVerse
            </h1>
            <Sparkles className="w-8 h-8 text-accent animate-bounce" />
          </div>
          
          <div className="space-y-3">
            <CardTitle className="text-2xl">Welcome Back! 👋</CardTitle>
            <CardDescription className="text-base">
              Your Gen-Z study ecosystem awaits
            </CardDescription>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Secure Login
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Mail className="w-3 h-3 mr-1" />
              Multi-Auth
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Google Login */}
          <Button 
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-12 text-base font-medium gap-3"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Tabs for different login methods */}
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email Code</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 mt-6">
              {!isCodeSent ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 text-base"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
                    />
                  </div>

                  <Button 
                    onClick={handleSendCode}
                    className="w-full h-12 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Sending Code..."
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium">
                      Verification Code
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="h-12 text-base text-center text-lg font-mono tracking-widest"
                      maxLength={6}
                      onKeyPress={(e) => e.key === 'Enter' && handleVerifyCode()}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Code sent to {email}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      onClick={handleVerifyCode}
                      className="w-full h-12 text-base font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? "Verifying..." : "Verify & Login"}
                    </Button>

                    <Button 
                      variant="ghost" 
                      onClick={() => setIsCodeSent(false)}
                      className="w-full text-sm"
                    >
                      ← Back to Email
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="password" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username or Email
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="username or email@domain.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 text-base pr-10"
                      onKeyPress={(e) => e.key === 'Enter' && handlePasswordLogin()}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 w-12"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handlePasswordLogin}
                  className="w-full h-12 text-base font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Signing In..."
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Guest Mode */}
          <Button 
            onClick={handleGuestMode}
            variant="outline"
            className="w-full h-12 text-base font-medium gap-2"
          >
            <Clock className="w-4 h-4" />
            Continue as Guest (Pomodoro Only)
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms & Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;