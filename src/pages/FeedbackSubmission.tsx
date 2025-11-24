import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Star, Send } from "lucide-react";

const FeedbackSubmission = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    class: "",
    featureSuggestions: "",
    issuesFaced: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit feedback",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("feedback_submissions").insert({
        user_id: user.id,
        user_name: formData.name,
        user_class: formData.class || null,
        feature_suggestions: formData.featureSuggestions || null,
        issues_faced: formData.issuesFaced || null,
        rating: rating,
      });

      if (error) throw error;

      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. Our team will review it soon.",
      });

      // Reset form
      setFormData({
        name: "",
        class: "",
        featureSuggestions: "",
        issuesFaced: "",
      });
      setRating(0);
      
      navigate("/niranx/dashboard");
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Submit Feedback</CardTitle>
          <CardDescription>
            Help us improve StudyVerse by sharing your suggestions and experiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Class/Grade (Optional)</Label>
              <Input
                id="class"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                placeholder="e.g., Grade 10, Class 12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suggestions">Feature Suggestions (Optional)</Label>
              <Textarea
                id="suggestions"
                value={formData.featureSuggestions}
                onChange={(e) => setFormData({ ...formData, featureSuggestions: e.target.value })}
                placeholder="What features would you like to see?"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issues">Issues Faced (Optional)</Label>
              <Textarea
                id="issues"
                value={formData.issuesFaced}
                onChange={(e) => setFormData({ ...formData, issuesFaced: e.target.value })}
                placeholder="Describe any problems or bugs you've encountered"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Your Experience Rating *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {rating} / 5 stars
                  </span>
                )}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackSubmission;