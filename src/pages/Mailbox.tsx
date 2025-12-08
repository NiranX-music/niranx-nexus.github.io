import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
}

const folderIcons: Record<string, any> = {
  inbox: Inbox,
  sent: Send,
  drafts: FileText,
  trash: Trash2,
  archive: Archive,
  spam: AlertCircle,
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
  });

  useEffect(() => {
    if (user) {
      fetchMailboxes();
    }
  }, [user]);

  useEffect(() => {
    if (activeMailbox) {
      fetchEmails();
    }
  }, [activeMailbox, activeFolder]);

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
          query = query.eq("folder", "inbox").eq("is_trash", false).eq("is_spam", false);
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

  const handleSendEmail = async () => {
    if (!activeMailbox || !composeData.to) return;

    setComposing(true);
    try {
      const toAddresses = composeData.to.split(",").map((e) => e.trim());

      // Create sent email in sender's mailbox
      const { error: sentError } = await supabase.from("niranx_emails").insert({
        mailbox_id: activeMailbox.id,
        from_address: activeMailbox.email_address,
        to_addresses: toAddresses,
        subject: composeData.subject || "(No Subject)",
        body: composeData.body,
        is_sent: true,
        folder: "sent",
        sent_at: new Date().toISOString(),
      });

      if (sentError) throw sentError;

      // For each recipient with @niranx.com, create inbox email
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
              body: composeData.body,
              folder: "inbox",
              sent_at: new Date().toISOString(),
            });
          }
        }
      }

      toast({
        title: "Email sent!",
        description: `Email sent to ${toAddresses.join(", ")}`,
      });

      setComposeOpen(false);
      setComposeData({ to: "", subject: "", body: "" });
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

  const handleToggleStar = async (email: Email) => {
    try {
      const { error } = await supabase
        .from("niranx_emails")
        .update({ is_starred: !email.is_starred })
        .eq("id", email.id);

      if (error) throw error;
      fetchEmails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (email: Email) => {
    if (email.is_read) return;

    try {
      await supabase.from("niranx_emails").update({ is_read: true }).eq("id", email.id);
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredEmails = emails.filter(
    (email) =>
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              { id: "starred", label: "Starred" },
              { id: "sent", label: "Sent" },
              { id: "drafts", label: "Drafts" },
              { id: "archive", label: "Archive" },
              { id: "spam", label: "Spam" },
              { id: "trash", label: "Trash" },
            ].map((folder) => {
              const Icon = folderIcons[folder.id] || Mail;
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

        {/* Email List */}
        <ScrollArea className="flex-1">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <Mail className="w-8 h-8 mb-2" />
              <p>No emails</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedEmail?.id === email.id ? "bg-muted" : ""
                  } ${!email.is_read ? "bg-primary/5" : ""}`}
                  onClick={() => {
                    setSelectedEmail(email);
                    handleMarkAsRead(email);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {email.from_address.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${!email.is_read ? "font-semibold" : ""}`}>
                          {email.from_address.split("@")[0]}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStar(email);
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
                <div className="flex items-center gap-2">
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
                </div>
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

            {/* Reply Actions */}
            <div className="p-4 border-t flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setComposeData({
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              className="min-h-[300px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setComposeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={composing || !composeData.to}>
                {composing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Mailbox;
