import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Mail, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      setIsLoading(false);
      toast({
        title: "Welcome to StudyVerse! 🎉",
        description: "Successfully authenticated",
      });
      // Redirect to dashboard
      window.location.href = '/';
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              StudyVerse
            </h1>
            <Sparkles className="w-6 h-6 text-accent animate-bounce" />
          </div>
          
          <div className="space-y-2">
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
              Email Verification
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
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
                  className="h-11 text-base"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
                />
              </div>

              <Button 
                onClick={handleSendCode}
                className="w-full h-11 text-base font-medium"
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
                  className="h-11 text-base text-center text-lg font-mono tracking-widest"
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
                  className="w-full h-11 text-base font-medium"
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

          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms & Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;