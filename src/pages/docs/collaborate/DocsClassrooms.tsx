import { DocPage, DocCallout } from "@/components/docs/DocPage";
export default function DocsClassrooms() {
  return (
    <DocPage breadcrumb="Collaborate › Classrooms" title="Classrooms" description="Full classroom management with enrollment, assignments, attendance, live sessions, and grading.">
      <h2>For Teachers</h2>
      <p>Create classrooms with unique class codes. Manage students, post announcements, create assignments, track attendance, and host live video sessions.</p>
      <h2>For Students</h2>
      <p>Join classrooms using a class code. View assignments, submit work, participate in live sessions, and track grades.</p>
      <h2>Live Sessions</h2>
      <p>Host real-time video classroom sessions with screen sharing, chat, and recording capabilities. Recordings are saved with AI-generated timestamps.</p>
      <DocCallout type="info" title="Teacher Role">
        You need the Teacher role to create classrooms. Request the role from your administrator.
      </DocCallout>
    </DocPage>
  );
}
