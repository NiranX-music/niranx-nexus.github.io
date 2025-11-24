import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { List, LayoutGrid, Star, Calendar, User, GraduationCap } from "lucide-react";
import { format } from "date-fns";

interface Feedback {
  id: string;
  user_name: string;
  user_class: string | null;
  feature_suggestions: string | null;
  issues_faced: string | null;
  rating: number;
  status: string;
  created_at: string;
  admin_notes: string | null;
}

const FeedbackList = () => {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: feedbacks, isLoading, refetch } = useQuery({
    queryKey: ["feedbacks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Feedback[];
    },
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("feedback_submissions")
        .update({ 
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: "Feedback status has been updated successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveNotes = async (id: string) => {
    try {
      const { error } = await supabase
        .from("feedback_submissions")
        .update({ admin_notes: adminNotes })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Notes saved",
        description: "Admin notes have been saved successfully",
      });
      setSelectedFeedback(null);
      setAdminNotes("");
      refetch();
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "reviewed":
        return "bg-blue-500";
      case "resolved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const FeedbackCard = ({ feedback }: { feedback: Feedback }) => (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              {feedback.user_name}
            </CardTitle>
            {feedback.user_class && (
              <CardDescription className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {feedback.user_class}
              </CardDescription>
            )}
          </div>
          <Badge className={getStatusColor(feedback.status)}>
            {feedback.status}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(feedback.created_at), "MMM d, yyyy")}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {feedback.rating}/5
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback.feature_suggestions && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Feature Suggestions:</h4>
            <p className="text-sm text-muted-foreground">{feedback.feature_suggestions}</p>
          </div>
        )}
        {feedback.issues_faced && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Issues Faced:</h4>
            <p className="text-sm text-muted-foreground">{feedback.issues_faced}</p>
          </div>
        )}
        {feedback.admin_notes && (
          <div>
            <h4 className="font-semibold text-sm mb-1">Admin Notes:</h4>
            <p className="text-sm text-muted-foreground italic">{feedback.admin_notes}</p>
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <Select
            value={feedback.status}
            onValueChange={(value) => handleUpdateStatus(feedback.id, value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedFeedback(feedback.id);
              setAdminNotes(feedback.admin_notes || "");
            }}
          >
            {feedback.admin_notes ? "Edit Notes" : "Add Notes"}
          </Button>
        </div>
        {selectedFeedback === feedback.id && (
          <div className="space-y-2 pt-2 border-t">
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add admin notes..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSaveNotes(feedback.id)}>
                Save Notes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedFeedback(null);
                  setAdminNotes("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Feedback List</h1>
          <p className="text-muted-foreground">
            Manage and review user feedback submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({feedbacks?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({feedbacks?.filter((f) => f.status === "pending").length || 0})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({feedbacks?.filter((f) => f.status === "reviewed").length || 0})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({feedbacks?.filter((f) => f.status === "resolved").length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {feedbacks?.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {feedbacks?.filter((f) => f.status === "pending").map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviewed">
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {feedbacks?.filter((f) => f.status === "reviewed").map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resolved">
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
            {feedbacks?.filter((f) => f.status === "resolved").map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedbackList;