import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users } from "lucide-react";

export default function DebateTournaments() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Trophy className="w-10 h-10" />
          Debate Tournaments
        </h1>
        <p className="text-muted-foreground mt-2">
          Compete in weekly debate tournaments
        </p>
      </div>

      <Card className="p-12 text-center">
        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Coming Soon!</h2>
        <p className="text-muted-foreground">
          Weekly debate tournaments with prizes and exclusive badges are coming soon.
        </p>
      </Card>
    </div>
  );
}