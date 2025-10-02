import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Sparkles, Loader2, Shield } from "lucide-react";
import { z } from "zod";

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
  const [loading, setLoading] = useState(false);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: '', answer: 0 });
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
          emailRedirectTo: `${window.location.origin}/niranx`,
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
          navigate('/niranx');
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
        navigate('/niranx');
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 perspective-3d">
      {/* Enhanced 3D Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float transform-3d"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float transform-3d" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-glow/10 rounded-full blur-3xl animate-float transform-3d" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="w-full max-w-2xl glass-card shadow-2xl card-3d hover-lift">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center items-center gap-3 mb-6 transform-3d">
            <Brain className="w-12 h-12 text-primary animate-pulse-scale pulse-glow" />
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
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-primary"
            >
              Back to landing page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
