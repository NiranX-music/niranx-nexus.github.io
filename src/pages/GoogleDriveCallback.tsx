import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useGoogleDrive } from '@/hooks/useGoogleDrive';

export default function GoogleDriveCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useGoogleDrive();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setStatus('error');
      setError(errorParam === 'access_denied' 
        ? 'Access was denied. Please try again and grant the required permissions.' 
        : `Error: ${errorParam}`
      );
      return;
    }

    if (!code) {
      setStatus('error');
      setError('No authorization code received');
      return;
    }

    handleCallback(code).then((success) => {
      if (success) {
        setStatus('success');
        setTimeout(() => navigate('/niranx/google-drive'), 1500);
      } else {
        setStatus('error');
        setError('Failed to complete authentication');
      }
    });
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 mx-auto text-primary animate-spin" />
              <h2 className="text-xl font-semibold">Connecting to Google Drive...</h2>
              <p className="text-muted-foreground">Please wait while we complete the authentication.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
              <h2 className="text-xl font-semibold text-green-600">Connected Successfully!</h2>
              <p className="text-muted-foreground">Redirecting to Google Drive...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 mx-auto text-destructive" />
              <h2 className="text-xl font-semibold text-destructive">Connection Failed</h2>
              <p className="text-muted-foreground">{error}</p>
              <button
                onClick={() => navigate('/niranx/google-drive')}
                className="text-primary hover:underline"
              >
                Go back to Google Drive
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
