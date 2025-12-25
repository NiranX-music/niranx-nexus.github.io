import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CalendarAccount {
  id: string;
  google_email: string;
  account_name: string;
  is_primary: boolean;
  created_at: string;
}

export interface Calendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
  location?: string;
  colorId?: string;
  status?: string;
  htmlLink?: string;
  attendees?: { email: string; responseStatus?: string }[];
}

export function useGoogleCalendar() {
  const { user, session } = useAuth();
  const [accounts, setAccounts] = useState<CalendarAccount[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const invokeFunction = useCallback(async (action: string, params: Record<string, any> = {}) => {
    if (!session?.access_token) {
      throw new Error('Please sign in first');
    }
    
    const { data, error } = await supabase.functions.invoke('google-calendar', {
      body: { action, ...params },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  }, [session?.access_token]);

  const loadAccounts = useCallback(async () => {
    if (!user) return;
    
    try {
      const data = await invokeFunction('list-accounts');
      setAccounts(data.accounts || []);
      
      // Set default selected account
      if (data.accounts?.length > 0 && !selectedAccountId) {
        const primary = data.accounts.find((a: CalendarAccount) => a.is_primary);
        setSelectedAccountId(primary?.id || data.accounts[0].id);
      }
    } catch (error) {
      console.error('Error loading calendar accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, invokeFunction, selectedAccountId]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const connect = useCallback(async () => {
    try {
      if (!session?.access_token) {
        toast.error('Please sign in first');
        return;
      }
      const redirectUri = `${window.location.origin}/niranx/xorbit/callback`;
      const data = await invokeFunction('get-auth-url', { redirectUri });
      window.location.href = data.authUrl;
    } catch (error: any) {
      console.error('Error connecting calendar:', error);
      toast.error(error.message || 'Failed to connect Google Calendar');
    }
  }, [invokeFunction, session?.access_token]);

  const handleCallback = useCallback(async (code: string) => {
    try {
      const redirectUri = `${window.location.origin}/niranx/xorbit/callback`;
      const data = await invokeFunction('exchange-code', { code, redirectUri });
      toast.success(`Connected to Google Calendar as ${data.email}`);
      await loadAccounts();
      return true;
    } catch (error: any) {
      console.error('Error exchanging code:', error);
      toast.error(error.message || 'Failed to connect');
      return false;
    }
  }, [invokeFunction, loadAccounts]);

  const disconnect = useCallback(async (accountId?: string) => {
    try {
      await invokeFunction('disconnect', { accountId });
      toast.success('Disconnected from Google Calendar');
      await loadAccounts();
    } catch (error: any) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect');
    }
  }, [invokeFunction, loadAccounts]);

  const loadCalendars = useCallback(async (accountId?: string) => {
    try {
      setIsLoading(true);
      const data = await invokeFunction('list-calendars', { accountId: accountId || selectedAccountId });
      setCalendars(data.calendars || []);
    } catch (error: any) {
      console.error('Error loading calendars:', error);
      toast.error('Failed to load calendars');
    } finally {
      setIsLoading(false);
    }
  }, [invokeFunction, selectedAccountId]);

  const loadEvents = useCallback(async (options: {
    accountId?: string;
    calendarId?: string;
    timeMin?: string;
    timeMax?: string;
  } = {}) => {
    try {
      setIsLoading(true);
      const data = await invokeFunction('list-events', {
        accountId: options.accountId || selectedAccountId,
        calendarId: options.calendarId || 'primary',
        timeMin: options.timeMin || new Date().toISOString(),
        timeMax: options.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setEvents(data.events || []);
    } catch (error: any) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  }, [invokeFunction, selectedAccountId]);

  const createEvent = useCallback(async (event: Partial<CalendarEvent>, calendarId = 'primary') => {
    try {
      const data = await invokeFunction('create-event', {
        accountId: selectedAccountId,
        calendarId,
        event,
      });
      toast.success('Event created');
      await loadEvents();
      return data.event;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      throw error;
    }
  }, [invokeFunction, selectedAccountId, loadEvents]);

  const updateEvent = useCallback(async (eventId: string, event: Partial<CalendarEvent>, calendarId = 'primary') => {
    try {
      const data = await invokeFunction('update-event', {
        accountId: selectedAccountId,
        calendarId,
        eventId,
        event,
      });
      toast.success('Event updated');
      await loadEvents();
      return data.event;
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      throw error;
    }
  }, [invokeFunction, selectedAccountId, loadEvents]);

  const deleteEvent = useCallback(async (eventId: string, calendarId = 'primary') => {
    try {
      await invokeFunction('delete-event', {
        accountId: selectedAccountId,
        calendarId,
        eventId,
      });
      toast.success('Event deleted');
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  }, [invokeFunction, selectedAccountId]);

  return {
    accounts,
    calendars,
    events,
    isLoading,
    selectedAccountId,
    setSelectedAccountId,
    isConnected: accounts.length > 0,
    connect,
    handleCallback,
    disconnect,
    loadAccounts,
    loadCalendars,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
