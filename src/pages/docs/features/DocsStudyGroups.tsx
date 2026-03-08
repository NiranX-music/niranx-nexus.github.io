import { DocPage } from "@/components/docs/DocPage";

export default function DocsStudyGroups() {
  return (
    <DocPage breadcrumb="Features › Study Groups" title="Study Groups" description="Collaborate with peers in real-time study rooms with chat, shared resources, and co-study sessions.">
      <h2>Creating Groups</h2>
      <p>Create study groups for specific subjects or topics. Invite members via link or username. Each group has its own chat, resource library, and scheduled sessions.</p>

      <h2>Study Rooms</h2>
      <p>Join or create virtual study rooms with real-time presence. See who's online, what they're studying, and how long they've been focused.</p>

      <h2>Shared Resources</h2>
      <p>Upload and share notes, flashcards, and study materials within your group. Members can collaborate on documents in real-time.</p>

      <h2>Accountability Partners</h2>
      <p>Pair up with a study buddy for mutual accountability. Track each other's progress, set shared goals, and compete on streak leaderboards.</p>
    </DocPage>
  );
}
