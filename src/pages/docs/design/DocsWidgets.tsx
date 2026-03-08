import { DocPage } from "@/components/docs/DocPage";
export default function DocsWidgets() {
  return (
    <DocPage breadcrumb="Design › Widgets" title="Widget Settings" description="Customize your dashboard layout by enabling, disabling, and reordering widgets.">
      <h2>Available Widgets</h2>
      <ul>
        <li>Task Overview — Active tasks and deadlines</li>
        <li>Focus Stats — Today's study time and sessions</li>
        <li>AI Quick Actions — One-click AI tools</li>
        <li>Daily Challenge — Today's challenge progress</li>
        <li>Streak Counter — Current study streak</li>
        <li>Music Player — Quick access to XVibe</li>
        <li>Calendar — Upcoming events and classes</li>
      </ul>
      <h2>Customization</h2>
      <p>Drag and drop widgets to reorder them. Toggle visibility for each widget. Settings persist across sessions via local storage and cloud sync.</p>
    </DocPage>
  );
}
