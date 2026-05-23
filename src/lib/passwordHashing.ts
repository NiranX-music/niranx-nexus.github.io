import { supabase } from "@/integrations/supabase/client";

/**
 * Hash a password using the secure server-side edge function
 */
export async function hashPassword(password: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('hash-password', {
    body: { action: 'hash', password }
  });

  if (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }

  return data.hash;
}

/**
 * Verify a password against a stored hash using the secure server-side edge function
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Reject legacy base64-encoded passwords - they are trivially reversible.
  // Users with legacy credentials must reset their password.
  if (!storedHash || !storedHash.includes(':')) {
    console.warn('Legacy password format detected - password reset required');
    return false;
  }

  const { data, error } = await supabase.functions.invoke('hash-password', {
    body: { action: 'verify', password, storedHash }
  });

  if (error) {
    console.error('Error verifying password:', error);
    return false;
  }

  return data.isValid;
}