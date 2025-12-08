import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Inbox,
  Send,
  FileText,
  Trash2,
  Archive,
  AlertCircle,
  Star,
  StarOff,
  Plus,
  Search,
  RefreshCw,
  MoreVertical,
  Reply,
  Forward,
  ChevronLeft,
  Loader2,
  Pencil,
  X,
  Check,
  Clock,
  Shield,
  Lock,
  Unlock,
  Users,
  Filter,
  Ban,
  Sparkles,
  Eye,
  EyeOff,
  AlertTriangle,
  Settings,
  FileSignature,
  Copy,
  Zap,
  Bell,
  BellOff,
  Paperclip,
  Tag,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";
import { CreateMailDialog } from "@/components/mail/CreateMailDialog";

interface Mailbox {
  id: string;
  email_address: string;
  display_name: string;
  is_primary: boolean;
  storage_used: number;
  storage_limit: number;
  settings?: any;
}

interface Email {
  id: string;
  mailbox_id: string;
  from_address: string;
  to_addresses: string[];
  subject: string;
  body: string;
  html_body: string;
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  is_spam: boolean;
  is_trash: boolean;
  is_draft: boolean;
  is_sent: boolean;
  folder: string;
  sent_at: string;
  created_at: string;
  is_encrypted?: boolean;
  is_read_receipt_requested?: boolean;
  read_at?: string;
  scheduled_at?: string;
  is_scheduled?: boolean;
  priority?: string;
  snoozed_until?: string;
  thread_id?: string;
  attachments?: any;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

interface EmailSignature {
  id: string;
  name: string;
  content: string;
  is_default: boolean;
}

interface ContactGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  member_count?: number;
}

interface BlockedSender {
  id: string;
  email_address: string;
  reason: string;
  blocked_at: string;
}

interface AISuggestion {
  label: string;
  content: string;
}

const folderIcons: Record<string, any> = {
  inbox: Inbox,
  sent: Send,
  drafts: FileText,
  trash: Trash2,
  archive: Archive,
  spam: AlertCircle,
  scheduled: Clock,
  snoozed: Bell,
  priority: Zap,
};

const Mailbox = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [activeMailbox, setActiveMailbox] = useState<Mailbox | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composing, setComposing] = useState(false);
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    body: "",
    priority: "normal",
    isEncrypted: false,
    requestReadReceipt: false,
    scheduledAt: "",
    signatureId: "",
  });

  // New feature states
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const [blockedSenders, setBlockedSenders] = useState<BlockedSender[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [loadingAiSuggestions, setLoadingAiSuggestions] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [signaturesOpen, setSignaturesOpen] = useState(false);
  const [contactGroupsOpen, setContactGroupsOpen] = useState(false);
  const [blockedSendersOpen, setBlockedSendersOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newSignatureName, setNewSignatureName] = useState("");
  const [newSignatureContent, setNewSignatureContent] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [blockEmailInput, setBlockEmailInput] = useState("");
  const [priorityInboxEnabled, setPriorityInboxEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMailboxes();
    }
  }, [user]);

  useEffect(() => {
    if (activeMailbox) {
      fetchEmails();
      fetchTemplates();
      fetchSignatures();
      fetchContactGroups();
      fetchBlockedSenders();
      setPriorityInboxEnabled(activeMailbox.settings?.priority_inbox || false);
    }
  }, [activeMailbox, activeFolder]);

  useEffect(() => {
    if (selectedEmail && !selectedEmail.is_sent) {
      generateAiSuggestions();
    }
  }, [selectedEmail]);

  const fetchMailboxes = async () => {
    try {
      const { data, error } = await supabase
        .from("niranx_mailboxes")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      setMailboxes(data || []);
      if (data && data.length > 0 && !activeMailbox) {
        setActiveMailbox(data[0]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    if (!activeMailbox) return;
    setRefreshing(true);

    try {
      let query = supabase
        .from("niranx_emails")
        .select("*")
        .eq("mailbox_id", activeMailbox.id)
        .order("created_at", { ascending: false });

      switch (activeFolder) {
        case "inbox":
          query = query.eq("folder", "inbox").eq("is_trash", false).eq("is_spam", false).is("snoozed_until", null);
          break;
        case "sent":
          query = query.eq("is_sent", true).eq("is_trash", false);
          break;
        case "drafts":
          query = query.eq("is_draft", true).eq("is_trash", false);
          break;
        case "trash":
          query = query.eq("is_trash", true);
          break;
        case "spam":
          query = query.eq("is_spam", true).eq("is_trash", false);
          break;
        case "archive":
          query = query.eq("is_archived", true).eq("is_trash", false);
          break;
        case "starred":
          query = query.eq("is_starred", true).eq("is_trash", false);
          break;
        case "scheduled":
          query = query.eq("is_scheduled", true).eq("is_trash", false);
          break;
        case "snoozed":
          query = query.not("snoozed_until", "is", null).eq("is_trash", false);
          break;
        case "priority":
          query = query.eq("priority", "high").eq("is_trash", false);
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      setEmails(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching emails",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchTemplates = async () => {
    if (!activeMailbox) return;
    const { data } = await supabase
      .from("niranx_email_templates")
      .select("*")
      .eq("user_id", user?.id)
      .order("use_count", { ascending: false });
    setTemplates(data || []);
  };

  const fetchSignatures = async () => {
    if (!activeMailbox) return;
    const { data } = await supabase
      .from("niranx_email_signatures")
      .select("*")
      .eq("user_id", user?.id);
    setSignatures(data || []);
  };

  const fetchContactGroups = async () => {
    if (!activeMailbox) return;
    const { data } = await supabase
      .from("niranx_contact_groups")
      .select("*")
      .eq("user_id", user?.id);
    setContactGroups(data || []);
  };

  const fetchBlockedSenders = async () => {
    if (!activeMailbox) return;
    const { data } = await supabase
      .from("niranx_blocked_senders")
      .select("*")
      .eq("mailbox_id", activeMailbox.id);
    setBlockedSenders(data || []);
  };

  const generateAiSuggestions = async () => {
    if (!selectedEmail) return;
    setLoadingAiSuggestions(true);
    setAiSuggestions([]);

    try {
      const response = await supabase.functions.invoke("mail-ai-suggestions", {
        body: {
          emailContent: selectedEmail.body?.substring(0, 1000),
          emailSubject: selectedEmail.subject,
          senderName: selectedEmail.from_address,
        },
      });

      if (response.data?.suggestions) {
        setAiSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error("Failed to generate AI suggestions:", error);
    } finally {
      setLoadingAiSuggestions(false);
    }
  };

  const handleSendEmail = async () => {
    if (!activeMailbox || !composeData.to) return;

    setComposing(true);
    try {
      const toAddresses = composeData.to.split(",").map((e) => e.trim());
      const selectedSignature = signatures.find(s => s.id === composeData.signatureId);
      const bodyWithSignature = selectedSignature 
        ? `${composeData.body}\n\n${selectedSignature.content}`
        : composeData.body;

      const emailData: any = {
        mailbox_id: activeMailbox.id,
        from_address: activeMailbox.email_address,
        to_addresses: toAddresses,
        subject: composeData.subject || "(No Subject)",
        body: bodyWithSignature,
        is_encrypted: composeData.isEncrypted,
        is_read_receipt_requested: composeData.requestReadReceipt,
        priority: composeData.priority,
      };

      if (composeData.scheduledAt) {
        emailData.is_scheduled = true;
        emailData.scheduled_at = composeData.scheduledAt;
        emailData.folder = "scheduled";
      } else {
        emailData.is_sent = true;
        emailData.folder = "sent";
        emailData.sent_at = new Date().toISOString();
      }

      const { error: sentError } = await supabase.from("niranx_emails").insert(emailData);
      if (sentError) throw sentError;

      // Deliver to @niranx.com recipients if not scheduled
      if (!composeData.scheduledAt) {
        for (const toAddress of toAddresses) {
          if (toAddress.endsWith("@niranx.com")) {
            const { data: recipientMailbox } = await supabase
              .from("niranx_mailboxes")
              .select("id")
              .eq("email_address", toAddress)
              .single();

            if (recipientMailbox) {
              await supabase.from("niranx_emails").insert({
                mailbox_id: recipientMailbox.id,
                from_address: activeMailbox.email_address,
                to_addresses: [toAddress],
                subject: composeData.subject || "(No Subject)",
                body: bodyWithSignature,
                folder: "inbox",
                sent_at: new Date().toISOString(),
                priority: composeData.priority,
                is_encrypted: composeData.isEncrypted,
                is_read_receipt_requested: composeData.requestReadReceipt,
              });
            }
          }
        }
      }

      toast({
        title: composeData.scheduledAt ? "Email scheduled!" : "Email sent!",
        description: composeData.scheduledAt 
          ? `Email will be sent at ${format(new Date(composeData.scheduledAt), "PPpp")}`
          : `Email sent to ${toAddresses.join(", ")}`,
      });

      setComposeOpen(false);
      setComposeData({ to: "", subject: "", body: "", priority: "normal", isEncrypted: false, requestReadReceipt: false, scheduledAt: "", signatureId: "" });
      fetchEmails();
    } catch (error: any) {
      toast({
        title: "Failed to send email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setComposing(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName || !composeData.subject || !composeData.body) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("niranx_email_templates").insert({
        user_id: user?.id,
        mailbox_id: activeMailbox?.id,
        name: newTemplateName,
        subject: composeData.subject,
        body: composeData.body,
      });
      if (error) throw error;
      toast({ title: "Template saved!" });
      setNewTemplateName("");
      fetchTemplates();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleLoadTemplate = (template: EmailTemplate) => {
    setComposeData({
      ...composeData,
      subject: template.subject || "",
      body: template.body || "",
    });
    // Increment use count
    supabase.from("niranx_email_templates")
      .update({ use_count: (template as any).use_count + 1 })
      .eq("id", template.id);
    toast({ title: `Template "${template.name}" loaded` });
  };

  const handleSaveSignature = async () => {
    if (!newSignatureName || !newSignatureContent) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("niranx_email_signatures").insert({
        user_id: user?.id,
        mailbox_id: activeMailbox?.id,
        name: newSignatureName,
        content: newSignatureContent,
        is_default: signatures.length === 0,
      });
      if (error) throw error;
      toast({ title: "Signature saved!" });
      setNewSignatureName("");
      setNewSignatureContent("");
      fetchSignatures();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleCreateContactGroup = async () => {
    if (!newGroupName) return;

    try {
      const { error } = await supabase.from("niranx_contact_groups").insert({
        user_id: user?.id,
        name: newGroupName,
      });
      if (error) throw error;
      toast({ title: "Contact group created!" });
      setNewGroupName("");
      fetchContactGroups();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleBlockSender = async (emailAddress?: string) => {
    const address = emailAddress || blockEmailInput;
    if (!address || !activeMailbox) return;

    try {
      const { error } = await supabase.from("niranx_blocked_senders").insert({
        user_id: user?.id,
        mailbox_id: activeMailbox.id,
        email_address: address,
      });
      if (error) throw error;
      toast({ title: `${address} blocked` });
      setBlockEmailInput("");
      fetchBlockedSenders();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUnblockSender = async (id: string) => {
    try {
      await supabase.from("niranx_blocked_senders").delete().eq("id", id);
      toast({ title: "Sender unblocked" });
      fetchBlockedSenders();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSnoozeEmail = async (email: Email, duration: string) => {
    const snoozedUntil = new Date();
    switch (duration) {
      case "1h": snoozedUntil.setHours(snoozedUntil.getHours() + 1); break;
      case "3h": snoozedUntil.setHours(snoozedUntil.getHours() + 3); break;
      case "tomorrow": snoozedUntil.setDate(snoozedUntil.getDate() + 1); snoozedUntil.setHours(9, 0, 0, 0); break;
      case "nextweek": snoozedUntil.setDate(snoozedUntil.getDate() + 7); snoozedUntil.setHours(9, 0, 0, 0); break;
    }

    try {
      await supabase.from("niranx_emails")
        .update({ snoozed_until: snoozedUntil.toISOString() })
        .eq("id", email.id);
      toast({ title: `Snoozed until ${format(snoozedUntil, "PPp")}` });
      setSelectedEmail(null);
      fetchEmails();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSetPriority = async (email: Email, priority: string) => {
    try {
      await supabase.from("niranx_emails")
        .update({ priority })
        .eq("id", email.id);
      toast({ title: `Priority set to ${priority}` });
      fetchEmails();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleStar = async (email: Email) => {
    try {
      const { error } = await supabase
        .from("niranx_emails")
        .update({ is_starred: !email.is_starred })
        .eq("id", email.id);

      if (error) throw error;
      fetchEmails();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleMarkAsRead = async (email: Email) => {
    if (email.is_read) return;

    try {
      await supabase.from("niranx_emails").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", email.id);
      
      // Send read receipt if requested
      if (email.is_read_receipt_requested) {
        await supabase.from("niranx_read_receipts").insert({
          email_id: email.id,
          read_by: activeMailbox?.email_address,
        });
      }
      
      fetchEmails();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMoveToTrash = async (email: Email) => {
    try {
      const { error } = await supabase
        .from("niranx_emails")
        .update({ is_trash: true })
        .eq("id", email.id);

      if (error) throw error;
      setSelectedEmail(null);
      fetchEmails();
      toast({ title: "Moved to trash" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleArchive = async (email: Email) => {
    try {
      const { error } = await supabase
        .from("niranx_emails")
        .update({ is_archived: true, folder: "archive" })
        .eq("id", email.id);

      if (error) throw error;
      setSelectedEmail(null);
      fetchEmails();
      toast({ title: "Email archived" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleTogglePriorityInbox = async () => {
    if (!activeMailbox) return;
    const newValue = !priorityInboxEnabled;
    setPriorityInboxEnabled(newValue);

    try {
      await supabase.from("niranx_mailboxes")
        .update({ settings: { ...activeMailbox.settings, priority_inbox: newValue } })
        .eq("id", activeMailbox.id);
      toast({ title: newValue ? "Priority Inbox enabled" : "Priority Inbox disabled" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Group emails by thread for conversation threading
  const groupedEmails = useMemo(() => {
    if (!priorityInboxEnabled || activeFolder !== "inbox") {
      return { priority: [], normal: emails };
    }
    
    const priority = emails.filter(e => e.priority === "high" || e.is_starred);
    const normal = emails.filter(e => e.priority !== "high" && !e.is_starred);
    return { priority, normal };
  }, [emails, priorityInboxEnabled, activeFolder]);

  const filteredEmails = useMemo(() => {
    const allEmails = priorityInboxEnabled && activeFolder === "inbox" 
      ? [...groupedEmails.priority, ...groupedEmails.normal]
      : emails;
    
    return allEmails.filter(
      (email) =>
        email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.body?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [emails, searchQuery, priorityInboxEnabled, groupedEmails, activeFolder]);

  const unreadCount = emails.filter((e) => !e.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mailboxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 p-4">
        <div className="text-center space-y-4">
          <Mail className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold">Welcome to NiranX Mail</h1>
          <p className="text-muted-foreground max-w-md">
            Create your own @niranx.com email address to start sending and receiving emails.
          </p>
        </div>
        <CreateMailDialog
          onSuccess={fetchMailboxes}
          trigger={
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Create Your @niranx.com Email
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col">
        {/* Mailbox Selector */}
        <div className="p-4 border-b">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="truncate">{activeMailbox?.email_address}</span>
                <MoreVertical className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {mailboxes.map((mailbox) => (
                <DropdownMenuItem
                  key={mailbox.id}
                  onClick={() => setActiveMailbox(mailbox)}
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{mailbox.email_address}</span>
                  {mailbox.is_primary && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Primary
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
              <Separator className="my-1" />
              <CreateMailDialog
                onSuccess={fetchMailboxes}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add another mailbox
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Compose Button */}
        <div className="p-4">
          <Button className="w-full gap-2" onClick={() => setComposeOpen(true)}>
            <Pencil className="w-4 h-4" />
            Compose
          </Button>
        </div>

        {/* Folders */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {[
              { id: "inbox", label: "Inbox", count: unreadCount },
              { id: "priority", label: "Priority", icon: Zap },
              { id: "starred", label: "Starred", icon: Star },
              { id: "snoozed", label: "Snoozed", icon: Bell },
              { id: "scheduled", label: "Scheduled", icon: Clock },
              { id: "sent", label: "Sent" },
              { id: "drafts", label: "Drafts" },
              { id: "archive", label: "Archive" },
              { id: "spam", label: "Spam" },
              { id: "trash", label: "Trash" },
            ].map((folder) => {
              const Icon = folder.icon || folderIcons[folder.id] || Mail;
              return (
                <Button
                  key={folder.id}
                  variant={activeFolder === folder.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    setActiveFolder(folder.id);
                    setSelectedEmail(null);
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {folder.label}
                  {folder.count !== undefined && folder.count > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {folder.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          <Separator className="my-2" />

          {/* Settings & Features */}
          <div className="p-2 space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => setTemplatesOpen(true)}>
              <FileText className="w-4 h-4" />
              Templates
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => setSignaturesOpen(true)}>
              <FileSignature className="w-4 h-4" />
              Signatures
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => setContactGroupsOpen(true)}>
              <Users className="w-4 h-4" />
              Contact Groups
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => setBlockedSendersOpen(true)}>
              <Ban className="w-4 h-4" />
              Blocked Senders
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => setSettingsOpen(true)}>
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Email List */}
      <div className="w-80 border-r flex flex-col">
        {/* Search & Refresh */}
        <div className="p-4 border-b space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchEmails}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Priority Inbox Section */}
        {priorityInboxEnabled && activeFolder === "inbox" && groupedEmails.priority.length > 0 && (
          <>
            <div className="px-4 py-2 bg-primary/5 border-b">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Zap className="w-4 h-4" />
                Important & Starred
              </div>
            </div>
            <ScrollArea className="max-h-48">
              <div className="divide-y">
                {groupedEmails.priority.map((email) => (
                  <EmailListItem
                    key={email.id}
                    email={email}
                    selected={selectedEmail?.id === email.id}
                    onClick={() => {
                      setSelectedEmail(email);
                      handleMarkAsRead(email);
                    }}
                    onToggleStar={() => handleToggleStar(email)}
                  />
                ))}
              </div>
            </ScrollArea>
            <div className="px-4 py-2 bg-muted/30 border-b border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Inbox className="w-4 h-4" />
                Everything Else
              </div>
            </div>
          </>
        )}

        {/* Email List */}
        <ScrollArea className="flex-1">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Mail className="w-8 h-8 mb-2" />
              <p>No emails</p>
            </div>
          ) : (
            <div className="divide-y">
              {(priorityInboxEnabled && activeFolder === "inbox" ? groupedEmails.normal : filteredEmails).map((email) => (
                <EmailListItem
                  key={email.id}
                  email={email}
                  selected={selectedEmail?.id === email.id}
                  onClick={() => {
                    setSelectedEmail(email);
                    handleMarkAsRead(email);
                  }}
                  onToggleStar={() => handleToggleStar(email)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Email View */}
      <div className="flex-1 flex flex-col">
        {selectedEmail ? (
          <>
            {/* Email Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEmail(null)}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <div className="flex items-center gap-1">
                  {/* Priority Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <AlertTriangle className={`w-4 h-4 ${selectedEmail.priority === "high" ? "text-red-500" : ""}`} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleSetPriority(selectedEmail, "high")}>
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-500" /> High Priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSetPriority(selectedEmail, "normal")}>
                        <Check className="w-4 h-4 mr-2" /> Normal
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSetPriority(selectedEmail, "low")}>
                        <ChevronLeft className="w-4 h-4 mr-2 rotate-[-90deg]" /> Low Priority
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Snooze Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Clock className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleSnoozeEmail(selectedEmail, "1h")}>
                        <Clock className="w-4 h-4 mr-2" /> Snooze 1 hour
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSnoozeEmail(selectedEmail, "3h")}>
                        <Clock className="w-4 h-4 mr-2" /> Snooze 3 hours
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSnoozeEmail(selectedEmail, "tomorrow")}>
                        <Bell className="w-4 h-4 mr-2" /> Tomorrow 9 AM
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSnoozeEmail(selectedEmail, "nextweek")}>
                        <Bell className="w-4 h-4 mr-2" /> Next week
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleStar(selectedEmail)}
                  >
                    {selectedEmail.is_starred ? (
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleArchive(selectedEmail)}>
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveToTrash(selectedEmail)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {!selectedEmail.is_sent && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleBlockSender(selectedEmail.from_address)}
                    >
                      <Ban className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {selectedEmail.is_encrypted && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="w-3 h-3" /> Encrypted
                  </Badge>
                )}
                {selectedEmail.priority === "high" && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="w-3 h-3" /> High Priority
                  </Badge>
                )}
                {selectedEmail.is_read_receipt_requested && (
                  <Badge variant="outline" className="gap-1">
                    <Eye className="w-3 h-3" /> Read receipt requested
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-semibold">{selectedEmail.subject || "(No Subject)"}</h2>
              <div className="flex items-center gap-3 mt-2">
                <Avatar>
                  <AvatarFallback>
                    {selectedEmail.from_address.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedEmail.from_address}</p>
                  <p className="text-sm text-muted-foreground">
                    To: {selectedEmail.to_addresses?.join(", ")}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground ml-auto">
                  {format(new Date(selectedEmail.created_at), "PPpp")}
                </p>
              </div>
            </div>

            {/* Email Body */}
            <ScrollArea className="flex-1 p-6">
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                {selectedEmail.body}
              </div>
            </ScrollArea>

            {/* AI Quick Reply Suggestions */}
            {!selectedEmail.is_sent && (
              <div className="p-4 border-t bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Quick Reply Suggestions</span>
                  <Badge variant="outline" className="text-xs">Powered by Groq LPU</Badge>
                </div>
                {loadingAiSuggestions ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating suggestions...
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          setComposeData({
                            ...composeData,
                            to: selectedEmail.from_address,
                            subject: `Re: ${selectedEmail.subject}`,
                            body: suggestion.content,
                          });
                          setComposeOpen(true);
                        }}
                      >
                        {suggestion.label}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={generateAiSuggestions}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Regenerate
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Reply Actions */}
            <div className="p-4 border-t flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setComposeData({
                    ...composeData,
                    to: selectedEmail.from_address,
                    subject: `Re: ${selectedEmail.subject}`,
                    body: `\n\n---\nOn ${format(
                      new Date(selectedEmail.created_at),
                      "PPpp"
                    )}, ${selectedEmail.from_address} wrote:\n${selectedEmail.body}`,
                  });
                  setComposeOpen(true);
                }}
              >
                <Reply className="w-4 h-4" />
                Reply
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setComposeData({
                    ...composeData,
                    to: "",
                    subject: `Fwd: ${selectedEmail.subject}`,
                    body: `\n\n---\nForwarded message:\nFrom: ${selectedEmail.from_address}\nDate: ${format(
                      new Date(selectedEmail.created_at),
                      "PPpp"
                    )}\nSubject: ${selectedEmail.subject}\n\n${selectedEmail.body}`,
                  });
                  setComposeOpen(true);
                }}
              >
                <Forward className="w-4 h-4" />
                Forward
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Mail className="w-16 h-16 mb-4" />
            <p>Select an email to read</p>
          </div>
        )}
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Templates Selector */}
            {templates.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Templates:</span>
                <div className="flex flex-wrap gap-1">
                  {templates.slice(0, 3).map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleLoadTemplate(template)}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Groups */}
            {contactGroups.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Groups:</span>
                <div className="flex flex-wrap gap-1">
                  {contactGroups.map((group) => (
                    <Button
                      key={group.id}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        // TODO: Load group members
                        toast({ title: `Group "${group.name}" - add contacts to use` });
                      }}
                    >
                      <Users className="w-3 h-3 mr-1" />
                      {group.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Input
                placeholder="To (separate multiple with commas)"
                value={composeData.to}
                onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Subject"
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
              />
            </div>
            <Textarea
              placeholder="Write your message..."
              value={composeData.body}
              onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
              className="min-h-[200px]"
            />

            {/* Options Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Select
                  value={composeData.priority}
                  onValueChange={(v) => setComposeData({ ...composeData, priority: v })}
                >
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="encrypt"
                  checked={composeData.isEncrypted}
                  onCheckedChange={(v) => setComposeData({ ...composeData, isEncrypted: v })}
                />
                <Label htmlFor="encrypt" className="text-sm flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Encrypt
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="readReceipt"
                  checked={composeData.requestReadReceipt}
                  onCheckedChange={(v) => setComposeData({ ...composeData, requestReadReceipt: v })}
                />
                <Label htmlFor="readReceipt" className="text-sm flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Read Receipt
                </Label>
              </div>

              {signatures.length > 0 && (
                <Select
                  value={composeData.signatureId}
                  onValueChange={(v) => setComposeData({ ...composeData, signatureId: v })}
                >
                  <SelectTrigger className="w-36 h-8">
                    <SelectValue placeholder="Signature" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No signature</SelectItem>
                    {signatures.map((sig) => (
                      <SelectItem key={sig.id} value={sig.id}>{sig.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Schedule */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Input
                type="datetime-local"
                value={composeData.scheduledAt}
                onChange={(e) => setComposeData({ ...composeData, scheduledAt: e.target.value })}
                className="w-auto"
                placeholder="Schedule send"
              />
              {composeData.scheduledAt && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setComposeData({ ...composeData, scheduledAt: "" })}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveTemplate}
                disabled={!composeData.subject || !composeData.body}
              >
                <Plus className="w-4 h-4 mr-1" />
                Save as Template
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setComposeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail} disabled={composing || !composeData.to}>
                  {composing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : composeData.scheduledAt ? (
                    <Clock className="mr-2 h-4 w-4" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {composeData.scheduledAt ? "Schedule" : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Templates</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Template name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
              <Button onClick={handleSaveTemplate} disabled={!newTemplateName}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="h-64">
              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No templates yet. Create one from the compose dialog.</p>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">{template.subject}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            handleLoadTemplate(template);
                            setTemplatesOpen(false);
                            setComposeOpen(true);
                          }}
                        >
                          Use
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            await supabase.from("niranx_email_templates").delete().eq("id", template.id);
                            fetchTemplates();
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signatures Dialog */}
      <Dialog open={signaturesOpen} onOpenChange={setSignaturesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Signatures</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Signature name"
                value={newSignatureName}
                onChange={(e) => setNewSignatureName(e.target.value)}
              />
              <Textarea
                placeholder="Signature content"
                value={newSignatureContent}
                onChange={(e) => setNewSignatureContent(e.target.value)}
              />
              <Button onClick={handleSaveSignature} disabled={!newSignatureName || !newSignatureContent}>
                <Plus className="w-4 h-4 mr-2" /> Add Signature
              </Button>
            </div>
            <ScrollArea className="h-48">
              {signatures.map((sig) => (
                <div key={sig.id} className="flex items-start justify-between p-3 rounded-lg border mb-2">
                  <div>
                    <p className="font-medium">{sig.name}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{sig.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      await supabase.from("niranx_email_signatures").delete().eq("id", sig.id);
                      fetchSignatures();
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Groups Dialog */}
      <Dialog open={contactGroupsOpen} onOpenChange={setContactGroupsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Groups</DialogTitle>
            <DialogDescription>Create groups to easily send emails to multiple contacts.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Button onClick={handleCreateContactGroup} disabled={!newGroupName}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="h-48">
              {contactGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{group.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      await supabase.from("niranx_contact_groups").delete().eq("id", group.id);
                      fetchContactGroups();
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blocked Senders Dialog */}
      <Dialog open={blockedSendersOpen} onOpenChange={setBlockedSendersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Blocked Senders</DialogTitle>
            <DialogDescription>Emails from blocked senders will automatically go to spam.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Email address to block"
                value={blockEmailInput}
                onChange={(e) => setBlockEmailInput(e.target.value)}
              />
              <Button onClick={() => handleBlockSender()} disabled={!blockEmailInput}>
                <Ban className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="h-48">
              {blockedSenders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No blocked senders</p>
              ) : (
                blockedSenders.map((blocked) => (
                  <div key={blocked.id} className="flex items-center justify-between p-3 rounded-lg border mb-2">
                    <div>
                      <p>{blocked.email_address}</p>
                      <p className="text-xs text-muted-foreground">
                        Blocked {format(new Date(blocked.blocked_at), "PPp")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnblockSender(blocked.id)}
                    >
                      Unblock
                    </Button>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mail Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Priority Inbox</p>
                <p className="text-sm text-muted-foreground">Show important emails at the top</p>
              </div>
              <Switch
                checked={priorityInboxEnabled}
                onCheckedChange={handleTogglePriorityInbox}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Encryption</p>
                <p className="text-sm text-muted-foreground">End-to-end encryption for sensitive emails</p>
              </div>
              <Badge variant="secondary">Available</Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Email List Item Component
const EmailListItem = ({
  email,
  selected,
  onClick,
  onToggleStar,
}: {
  email: Email;
  selected: boolean;
  onClick: () => void;
  onToggleStar: () => void;
}) => (
  <div
    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
      selected ? "bg-muted" : ""
    } ${!email.is_read ? "bg-primary/5" : ""}`}
    onClick={onClick}
  >
    <div className="flex items-start gap-3">
      <Avatar className="w-8 h-8">
        <AvatarFallback>
          {email.from_address.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className={`text-sm truncate ${!email.is_read ? "font-semibold" : ""}`}>
              {email.from_address.split("@")[0]}
            </p>
            {email.priority === "high" && (
              <AlertTriangle className="w-3 h-3 text-red-500" />
            )}
            {email.is_encrypted && (
              <Lock className="w-3 h-3 text-primary" />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
          >
            {email.is_starred ? (
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            ) : (
              <StarOff className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className={`text-sm truncate ${!email.is_read ? "font-medium" : ""}`}>
          {email.subject || "(No Subject)"}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {email.body?.substring(0, 60)}...
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(email.created_at), "MMM d, h:mm a")}
        </p>
      </div>
    </div>
  </div>
);

export default Mailbox;
