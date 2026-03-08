import { DocPage } from "@/components/docs/DocPage";

export default function DocsExamHub() {
  return (
    <DocPage breadcrumb="Features › Exam Hub" title="Exam Hub" description="Create, take, and analyze exams with AI-powered test generation and detailed analytics.">
      <h2>Test Builder</h2>
      <p>Create custom tests with multiple question types: multiple choice, true/false, short answer, essay, and code exercises. Set time limits, passing scores, and randomization.</p>

      <h2>AI Test Generator</h2>
      <p>Generate complete exams from a topic, textbook chapter, or uploaded document. The AI creates varied questions with answer keys and explanations.</p>

      <h2>Taking Tests</h2>
      <p>Timed test environment with progress tracking, question flagging, and auto-save. Results are graded instantly with detailed feedback.</p>

      <h2>Analytics</h2>
      <p>View performance analytics across all tests: score trends, weak topics, time per question, and comparison with peers.</p>
    </DocPage>
  );
}
