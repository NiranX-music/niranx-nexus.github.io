import { Card } from "@/components/ui/card";
import { Radio } from "lucide-react";

export default function LiveDebateRooms() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Radio className="w-10 h-10" />
          Live Debate Rooms
        </h1>
        <p className="text-muted-foreground mt-2">
          Join real-time debates with other users
        </p>
      </div>

      <Card className="p-12 text-center">
        <Radio className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-semibold mb-2">Coming Soon!</h2>
        <p className="text-muted-foreground">
          Live debate rooms with real-time discussions are coming soon.
        </p>
      </Card>
    </div>
  );
}