import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Search, Star, MessageCircle, BookOpen, Zap, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const MOCK_PEERS = [
  { id: '1', name: 'Alex Chen', subjects: ['Mathematics', 'Physics'], level: 12, compatibility: 94, avatar: '🧑‍💻', online: true, studyHours: 45 },
  { id: '2', name: 'Priya Sharma', subjects: ['Chemistry', 'Biology'], level: 8, compatibility: 87, avatar: '👩‍🔬', online: true, studyHours: 38 },
  { id: '3', name: 'Jordan Lee', subjects: ['Computer Science', 'Mathematics'], level: 15, compatibility: 82, avatar: '🧑‍🎓', online: false, studyHours: 52 },
  { id: '4', name: 'Fatima Al-Rashid', subjects: ['English', 'History'], level: 10, compatibility: 78, avatar: '📚', online: true, studyHours: 40 },
  { id: '5', name: 'Kenji Tanaka', subjects: ['Physics', 'Engineering'], level: 14, compatibility: 91, avatar: '⚡', online: false, studyHours: 48 },
  { id: '6', name: 'Maria Santos', subjects: ['Biology', 'Chemistry'], level: 9, compatibility: 85, avatar: '🔬', online: true, studyHours: 35 },
];

export default function PeerStudyMatching() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Engineering'];

  const filteredPeers = MOCK_PEERS.filter(peer => {
    const matchesSearch = peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      peer.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = !selectedSubject || peer.subjects.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen p-6 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Users className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Peer Study Matching</h1>
          <p className="text-muted-foreground">Find compatible study partners based on your subjects and goals</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {subjects.map(subject => (
            <Badge
              key={subject}
              variant={selectedSubject === subject ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/20 transition-colors"
              onClick={() => setSelectedSubject(selectedSubject === subject ? null : subject)}
            >
              {subject}
            </Badge>
          ))}
        </div>
      </div>

      {/* Peer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPeers.map(peer => (
          <div key={peer.id} className="holo-card p-6 space-y-4 group hover:scale-[1.02] transition-transform">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{peer.avatar}</div>
                <div>
                  <h3 className="font-semibold text-foreground">{peer.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Zap className="w-3 h-3 text-primary" />
                    Level {peer.level}
                    <span className={`ml-2 w-2 h-2 rounded-full ${peer.online ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    <span className="text-xs">{peer.online ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{peer.compatibility}%</div>
                <div className="text-xs text-muted-foreground">Match</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {peer.subjects.map(s => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{peer.studyHours}h this week</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" />Top 10%</span>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => toast.success(`Invite sent to ${peer.name}`)}>
                <MessageCircle className="w-4 h-4 mr-1" /> Connect
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info('Profile view coming soon')}>
                View Profile
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filteredPeers.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No peers found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
