import { useXstage } from '../contexts/XstageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { UserPlus, Crown, Shield, User, Music } from 'lucide-react';
import { toast } from 'sonner';

const roleIcons = { owner: Crown, admin: Shield, member: User, session_musician: Music, viewer: User };
const roleColors = { owner: 'text-amber-400', admin: 'text-cyan-400', member: 'text-foreground', session_musician: 'text-fuchsia-400', viewer: 'text-muted-foreground' };

export const XstageTeam = () => {
  const { members, inviteMember, currentMember } = useXstage();
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setInviting(true);
    const success = await inviteMember(email.trim(), 'member');
    if (success) setEmail('');
    setInviting(false);
  };

  const isAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin';

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-bold">Team</h1>
      
      {isAdmin && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Invite Member</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
              <Button onClick={handleInvite} disabled={!email.trim() || inviting} className="bg-gradient-to-r from-cyan-500 to-fuchsia-500">
                <UserPlus className="mr-2 h-4 w-4" />{inviting ? 'Inviting...' : 'Invite'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
          const Icon = roleIcons[member.role];
          return (
            <Card key={member.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.profile?.avatar_url || undefined} />
                    <AvatarFallback>{member.profile?.full_name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{member.profile?.full_name || 'Unknown'}</p>
                    <div className="flex items-center gap-1">
                      <Icon className={`h-3 w-3 ${roleColors[member.role]}`} />
                      <span className="text-xs text-muted-foreground capitalize">{member.role.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
