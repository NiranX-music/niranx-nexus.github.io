import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentGuardianRequests } from "@/components/guardian/StudentGuardianRequests";
import { Shield, Users } from "lucide-react";

export default function StudentGuardianSettings() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Guardian Access Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage who can monitor your study progress
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">What is Guardian Access?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Parents and teachers can request to view your study statistics, progress, and goals to support your learning journey.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">What Can Guardians See?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Study time and focus sessions</li>
                <li>• Task completion rates</li>
                <li>• Exam preparation progress</li>
                <li>• Weekly activity summaries</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Your Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have full control. Accept or reject requests, and revoke access anytime. Your personal messages and private notes remain private.
            </p>
          </CardContent>
        </Card>
      </div>

      <StudentGuardianRequests />
    </div>
  );
}
