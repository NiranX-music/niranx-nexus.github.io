import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

const requestSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Invalid email address").max(255, "Email is too long"),
  reason: z.string().trim().min(50, "Please provide at least 50 characters explaining your reason").max(1000, "Reason is too long (max 1000 characters)"),
});

export default function BecomeAdmin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    try {
      requestSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a request");
      navigate("/niranx/auth");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      // Check if user already has a pending request
      const { data: existingRequest, error: checkError } = await supabase
        .from("admin_requests")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .single();

      if (existingRequest) {
        toast.error("You already have a pending admin request");
        setLoading(false);
        return;
      }

      // Insert the request
      const { data: newRequest, error: insertError } = await supabase
        .from("admin_requests")
        .insert([
          {
            user_id: user.id,
            full_name: formData.fullName.trim(),
            email: formData.email.trim(),
            reason: formData.reason.trim(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke("send-admin-request-email", {
        body: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          reason: formData.reason.trim(),
          requestId: newRequest.id,
        },
      });

      if (emailError) {
        console.error("Email sending failed:", emailError);
        // Don't fail the request if email fails
      }

      setSubmitted(true);
      toast.success("Admin request submitted successfully!");
    } catch (error: any) {
      console.error("Error submitting admin request:", error);
      toast.error(error.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card className="border-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>Request Submitted!</CardTitle>
                <CardDescription>Your admin access request has been sent for review</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Thank you for your interest in becoming an admin. Your request has been submitted and the platform administrator has been notified via email.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                <li>Your request will be reviewed by the administrator</li>
                <li>You'll receive a notification once a decision is made</li>
                <li>If approved, you'll gain access to the admin dashboard</li>
              </ul>
            </div>
            <Button onClick={() => navigate("/niranx/dashboard")} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8" />
          Request Admin Access
        </h1>
        <p className="text-muted-foreground mt-1">
          Submit your request to become a platform administrator
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin Access Request Form</CardTitle>
          <CardDescription>
            Please provide detailed information about why you need admin access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter your full name"
                maxLength={100}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                maxLength={255}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Admin Access *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Please explain in detail why you need admin access, your qualifications, and how you plan to contribute to the platform (minimum 50 characters)..."
                rows={6}
                maxLength={1000}
                className={errors.reason ? "border-destructive" : ""}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {formData.reason.length}/1000 characters
                </span>
                {errors.reason && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.reason}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Important Notes:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Admin access requests are reviewed carefully</li>
                <li>Provide genuine and detailed reasons for your request</li>
                <li>False or spam requests will be rejected</li>
                <li>You'll be notified once your request is reviewed</li>
              </ul>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
