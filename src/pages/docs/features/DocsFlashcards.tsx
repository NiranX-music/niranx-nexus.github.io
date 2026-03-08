import { DocPage } from "@/components/docs/DocPage";

export default function DocsFlashcards() {
  return (
    <DocPage breadcrumb="Features › Flashcards" title="Flashcards & Spaced Repetition" description="Create, study, and master flashcard decks using scientifically-proven spaced repetition algorithms.">
      <h2>Creating Decks</h2>
      <p>Create flashcard decks manually or use AI to auto-generate cards from your notes, PDFs, or topics. Each card supports rich text, images, and code blocks.</p>

      <h2>Spaced Repetition</h2>
      <p>The system uses a modified SM-2 algorithm to schedule card reviews. Cards you struggle with appear more frequently, while mastered cards are spaced further apart.</p>

      <h2>Study Modes</h2>
      <ul>
        <li><strong>Classic</strong> — Flip cards and self-rate difficulty</li>
        <li><strong>Quiz</strong> — Multiple choice from card answers</li>
        <li><strong>Type</strong> — Type the answer for active recall</li>
        <li><strong>AR Mode</strong> — Augmented reality flashcard sessions</li>
      </ul>

      <h2>AI Generation</h2>
      <p>The Flashcard Generator uses AI to create complete decks from a topic or uploaded document. Cards are organized by difficulty and include explanations.</p>
    </DocPage>
  );
}
