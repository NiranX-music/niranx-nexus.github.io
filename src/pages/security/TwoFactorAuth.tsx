import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function TwoFactorAuth() {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTwoFactorStatus();
    }
  }, [user]);

  const fetchTwoFactorStatus = async () => {
    const { data, error } = await supabase
      .from('user_2fa')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setIsEnabled(data.is_enabled);
      setBackupCodes(data.backup_codes || []);
    }
  };

  const generateSecureRandomString = (length: number): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('').substring(0, length).toUpperCase();
  };

  const generateBackupCodes = (): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character cryptographically secure backup codes
      codes.push(generateSecureRandomString(8));
    }
    return codes;
  };

  const enableTwoFactor = async () => {
    setLoading(true);
    try {
      // Generate cryptographically secure secret (32 characters)
      const newSecret = generateSecureRandomString(32);
      const codes = generateBackupCodes();

      const { error } = await supabase
        .from('user_2fa')
        .upsert({
          user_id: user?.id,
          is_enabled: true,
          secret: newSecret,
          backup_codes: codes,
        });

      if (error) throw error;

      setSecret(newSecret);
      setBackupCodes(codes);
      setIsEnabled(true);
      toast.success('Two-factor authentication enabled');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_2fa')
        .update({ is_enabled: false })
        .eq('user_id', user?.id);

      if (error) throw error;

      setIsEnabled(false);
      setSecret('');
      setBackupCodes([]);
      toast.success('Two-factor authentication disabled');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Backup codes copied to clipboard');
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Two-Factor Authentication</h1>
          <p className="text-muted-foreground">Add an extra layer of security to your account</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>2FA Status</CardTitle>
          <CardDescription>
            {isEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEnabled ? (
            <>
              <p className="text-sm text-muted-foreground">
                Enable two-factor authentication to protect your account with an additional security layer.
              </p>
              <Button onClick={enableTwoFactor} disabled={loading}>
                Enable 2FA
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Backup Codes</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                  </p>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="font-mono text-sm">
                        {code}
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyBackupCodes}
                    className="mt-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Codes
                      </>
                    )}
                  </Button>
                </div>

                <Button variant="destructive" onClick={disableTwoFactor} disabled={loading}>
                  Disable 2FA
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}