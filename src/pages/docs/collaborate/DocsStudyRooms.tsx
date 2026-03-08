import { DocPage } from "@/components/docs/DocPage";
export default function DocsStudyRooms() {
  return (
    <DocPage breadcrumb="Collaborate › Study Rooms" title="Study Rooms" description="Join virtual study spaces with real-time presence, shared timers, and group chat.">
      <h2>How It Works</h2>
      <p>Study Rooms provide a virtual space where students can study together. Each room shows active participants, their study time, and subjects. Real-time chat enables quick discussions.</p>
      <h2>Room Types</h2>
      <ul>
        <li><strong>Public</strong> — Open to all authenticated users</li>
        <li><strong>Private</strong> — Invite-only with room code</li>
        <li><strong>Subject-Based</strong> — Auto-created rooms for popular subjects</li>
      </ul>
      <h2>Features</h2>
      <ul>
        <li>Shared Pomodoro timer for synchronized sessions</li>
        <li>Live presence indicators and study status</li>
        <li>Group chat with message history</li>
        <li>Resource sharing within the room</li>
      </ul>
    </DocPage>
  );
}
