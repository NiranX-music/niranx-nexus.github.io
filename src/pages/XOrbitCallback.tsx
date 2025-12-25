import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Orbit } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

export default function XOrbitCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback } = useGoogleCalendar();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting to Google Calendar...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage(error === 'access_denied' 
        ? 'Access was denied. Please try again.' 
        : `Error: ${error}`);
      setTimeout(() => navigate('/niranx/xorbit'), 3000);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received');
      setTimeout(() => navigate('/niranx/xorbit'), 3000);
      return;
    }

    handleCallback(code).then((success) => {
      if (success) {
        setStatus('success');
        setMessage('Connected successfully! Redirecting...');
      } else {
        setStatus('error');
        setMessage('Failed to connect. Please try again.');
      }
      setTimeout(() => navigate('/niranx/xorbit'), 2000);
    });
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <div className="mb-4">
            {status === 'loading' && (
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Orbit className="h-10 w-10 text-white" />
                </div>
                <Loader2 className="h-8 w-8 animate-spin text-primary absolute -bottom-2 -right-2 bg-background rounded-full p-1" />
              </div>
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 mx-auto text-destructive" />
            )}
          </div>
          <h2 className="text-xl font-semibold mb-2">
            {status === 'loading' && 'Connecting...'}
            {status === 'success' && 'Connected!'}
            {status === 'error' && 'Connection Failed'}
          </h2>
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
