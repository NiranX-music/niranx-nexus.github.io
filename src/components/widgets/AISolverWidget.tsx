import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export default function AISolverWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <Button
      onClick={() => navigate("/niranx/ai-corner")}
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50 bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-110"
      size="icon"
      title="AI Corner"
    >
      <div className="flex flex-col items-center">
        <Brain className="h-6 w-6" />
        <span className="text-[10px] font-medium mt-0.5">AI</span>
      </div>
    </Button>
  );
}