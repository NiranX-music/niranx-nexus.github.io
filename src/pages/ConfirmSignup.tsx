import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function ConfirmSignup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (!token || type !== 'signup') {
        setStatus('error');
        setMessage('Invalid confirmation link');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) throw error;

        setStatus('success');
        setMessage('Your email has been confirmed successfully!');
        
        toast({
          title: "Email Confirmed",
          description: "You can now sign in to your account",
        });

        setTimeout(() => {
          navigate('/niranx/auth');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to confirm email');
        
        toast({
          title: "Confirmation Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    confirmEmail();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
      
      <Card className="w-full max-w-md glass-panel relative z-10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
            {status === 'loading' && <Loader2 className="w-8 h-8 text-primary animate-spin" />}
            {status === 'success' && <CheckCircle2 className="w-8 h-8 text-green-500" />}
            {status === 'error' && <XCircle className="w-8 h-8 text-destructive" />}
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">
            {status === 'loading' && "Confirming Email..."}
            {status === 'success' && "Email Confirmed!"}
            {status === 'error' && "Confirmation Failed"}
          </CardTitle>
          <CardDescription>
            {message || "Please wait while we confirm your email address"}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          {status === 'success' && (
            <p className="text-sm text-muted-foreground mb-4">
              Redirecting you to login...
            </p>
          )}
          {status === 'error' && (
            <Button
              className="w-full"
              onClick={() => navigate('/niranx/auth')}
            >
              Go to Login
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
