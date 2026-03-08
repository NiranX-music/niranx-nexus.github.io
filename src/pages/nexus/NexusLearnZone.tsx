import { NexusShowcase } from "@/components/nexus/NexusShowcase";
import { GraduationCap } from "lucide-react";
export default function NexusLearnZone() {
  return <NexusShowcase title="Learn Zone" subtitle="Education" description="Interactive courses, quizzes, flashcards, virtual labs, and AI-powered study tools to accelerate your learning." icon={<GraduationCap className="h-8 w-8 text-primary" />} gradient="from-blue-500/20 via-background to-cyan-500/20" appLink="/niranx/exams" highlights={["Virtual Labs", "AI Quizzes", "Spaced Repetition", "Course Generator"]} features={[
    { title: "Virtual Labs", description: "Chemistry, Physics, Biology, and Math simulations", icon: "🔬" },
    { title: "Flashcards", description: "Spaced repetition with AI-generated cards", icon: "📇" },
    { title: "Exam Simulator", description: "Timed practice exams with analytics", icon: "📝" },
    { title: "Course Generator", description: "AI creates complete courses from topics", icon: "📚" },
    { title: "Quiz Generator", description: "Generate quizzes from any content", icon: "❓" },
    { title: "Grade Calculator", description: "Track and calculate grades across subjects", icon: "📊" },
  ]} />;
}
