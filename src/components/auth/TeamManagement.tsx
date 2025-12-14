import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Mail, Clock, Check } from 'lucide-react';

interface TeamMember {
  id: string;
  user_id: string | null;
  invitation_email: string | null;
  role: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
}

export function TeamManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadTeamMembers();
    }
  }, [user]);

  const loadTeamMembers = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading team:', error);
      return;
    }

    setTeamMembers(data || []);
  };

  const inviteTeamMember = async () => {
    if (!user || !inviteEmail.trim()) return;

    setLoading(true);

    try {
      const invitationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from('team_members').insert({
        team_id: user.id,
        invitation_email: inviteEmail.trim(),
        invitation_token: invitationToken,
        invitation_expires_at: expiresAt.toISOString(),
        role: inviteRole,
        invited_by: user.id,
        status: 'pending',
      });

      if (error) throw error;

      toast({
        title: 'Invitation sent',
        description: `Invitation sent to ${inviteEmail}`,
      });

      setInviteEmail('');
      loadTeamMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Member removed',
        description: 'Team member has been removed',
      });

      loadTeamMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      editor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      viewer: 'bg-muted text-muted-foreground',
    };

    return (
      <Badge className={colors[role] || colors.viewer}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Team Member
          </CardTitle>
          <CardDescription>
            Send an invitation to add someone to your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={inviteTeamMember} disabled={loading || !inviteEmail.trim()}>
              {loading ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} in your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No team members yet. Send an invitation to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {member.invitation_email || 'Team Member'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleBadge(member.role)}
                        {getStatusBadge(member.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.status === 'pending' && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Awaiting response
                      </span>
                    )}
                    {member.status === 'active' && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Joined
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMember(member.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
