import { NotificationSettings as NotificationSettingsComponent } from "@/components/NotificationSettings";

export default function NotificationSettings() {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Notification Settings</h1>
        <p className="text-muted-foreground">
          Manage your notification preferences and how you receive updates
        </p>
      </div>

      <NotificationSettingsComponent />
    </div>
  );
}
