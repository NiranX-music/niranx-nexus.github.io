import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, CheckCircle, XCircle, Trash } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MessageReport {
  id: string;
  message_id: string;
  reported_by: string;
  reason: string;
  status: string;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  messages?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
}

export default function AdminMessageReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<MessageReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MessageReport | null>(null);
  const [actionType, setActionType] = useState<'dismiss' | 'delete' | null>(null);

  useEffect(() => {
    fetchReports();
    setupRealtimeSubscription();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("message_reports")
        .select(`
          *,
          messages:message_id (
            id,
            content,
            sender_id,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data as any) || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("message-reports-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "message_reports",
        },
        () => {
          fetchReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from("message_reports")
        .update({
          status: "dismissed",
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;
      toast.success("Report dismissed");
      setActionType(null);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error dismissing report:", error);
      toast.error("Failed to dismiss report");
    }
  };

  const handleDeleteMessage = async (report: MessageReport) => {
    try {
      // Delete the message
      const { error: deleteError } = await supabase
        .from("messages")
        .delete()
        .eq("id", report.message_id);

      if (deleteError) throw deleteError;

      // Update report status
      const { error: updateError } = await supabase
        .from("message_reports")
        .update({
          status: "resolved",
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", report.id);

      if (updateError) throw updateError;

      toast.success("Message deleted and report resolved");
      setActionType(null);
      setSelectedReport(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="default" className="bg-yellow-500">Pending</Badge>;
      case "resolved":
        return <Badge variant="default" className="bg-green-500">Resolved</Badge>;
      case "dismissed":
        return <Badge variant="secondary">Dismissed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filterReports = (status?: string) => {
    if (!status) return reports;
    return reports.filter((r) => r.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text">Message Reports</h1>
        <p className="text-muted-foreground">
          Review and manage reported community messages
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({filterReports("pending").length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({filterReports("resolved").length})
          </TabsTrigger>
          <TabsTrigger value="dismissed">
            Dismissed ({filterReports("dismissed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          {filterReports("pending").length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p className="text-muted-foreground">No pending reports</p>
              </CardContent>
            </Card>
          ) : (
            filterReports("pending").map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">Reported Message</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {getStatusBadge(report.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">Message Content:</p>
                    <p className="text-sm">{(report.messages as any)?.content}</p>
                  </div>

                  <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      Report Reason:
                    </p>
                    <p className="text-sm">{report.reason}</p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedReport(report);
                        setActionType("dismiss");
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Dismiss
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSelectedReport(report);
                        setActionType("delete");
                      }}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Delete Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4 mt-6">
          {filterReports("resolved").map((report) => (
            <Card key={report.id} className="opacity-75">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">Resolved Report</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Resolved {formatDistanceToNow(new Date(report.reviewed_at!), { addSuffix: true })}
                    </p>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Report Reason:</p>
                  <p className="text-sm">{report.reason}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="dismissed" className="space-y-4 mt-6">
          {filterReports("dismissed").map((report) => (
            <Card key={report.id} className="opacity-75">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">Dismissed Report</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Dismissed {formatDistanceToNow(new Date(report.reviewed_at!), { addSuffix: true })}
                    </p>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">{(report.messages as any)?.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!actionType} onOpenChange={() => {
        setActionType(null);
        setSelectedReport(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "dismiss" ? "Dismiss Report" : "Delete Message"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "dismiss"
                ? "Are you sure you want to dismiss this report? The message will remain visible."
                : "Are you sure you want to delete this message? This action cannot be undone and the message will be permanently removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!selectedReport) return;
                if (actionType === "dismiss") {
                  handleDismissReport(selectedReport.id);
                } else {
                  handleDeleteMessage(selectedReport);
                }
              }}
              className={actionType === "delete" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {actionType === "dismiss" ? "Dismiss" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
