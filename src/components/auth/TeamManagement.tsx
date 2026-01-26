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
import { UserPlus, Trash2, Mail, Clock, Check, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

interface TeamMember {
  id: string;
  user_id: string | null;
  invitation_email: string | null;
  role: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
  invitation_expires_at: string | null;
}

export function TeamManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

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

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkExistingInvitation = async (email: string): Promise<boolean> => {
    if (!user) return false;

    const { data } = await supabase
      .from('team_members')
      .select('id, status')
      .eq('team_id', user.id)
      .eq('invitation_email', email.toLowerCase().trim())
      .single();

    if (data) {
      if (data.status === 'active') {
        setEmailError('This email is already a team member');
        return true;
      }
      if (data.status === 'pending') {
        setEmailError('An invitation is already pending for this email');
        return true;
      }
    }
    return false;
  };

  const inviteTeamMember = async () => {
    if (!user || !inviteEmail.trim()) return;

    // Validate email format
    if (!validateEmail(inviteEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Check if inviting self
    if (inviteEmail.toLowerCase().trim() === user.email?.toLowerCase()) {
      setEmailError('You cannot invite yourself');
      return;
    }

    // Check if already invited
    const exists = await checkExistingInvitation(inviteEmail);
    if (exists) return;

    setLoading(true);
    setEmailError(null);

    try {
      const invitationToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from('team_members').insert({
        team_id: user.id,
        invitation_email: inviteEmail.trim().toLowerCase(),
        invitation_token: invitationToken,
        invitation_expires_at: expiresAt.toISOString(),
        role: inviteRole,
        invited_by: user.id,
        status: 'pending',
      });

      if (error) throw error;

      // Send invitation email via edge function
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-team-invitation', {
        body: {
          email: inviteEmail.trim().toLowerCase(),
          invitationToken,
          role: inviteRole,
          inviterName: user.email
        }
      });

      if (emailError) {
        console.error('Email sending error:', emailError);
        toast({
          title: 'Invitation created',
          description: `Invitation created but email could not be sent. Please share the invite link manually.`,
          variant: 'destructive'
        });
      } else if (emailResult?.simulated) {
        toast({
          title: 'Invitation created (Demo mode)',
          description: `Invitation sent to ${inviteEmail}. In production, an email will be sent.`,
        });
      } else {
        toast({
          title: 'Invitation sent',
          description: `Invitation email sent to ${inviteEmail}`,
          className: "bg-green-500/10 border-green-500/20 text-green-400"
        });
      }

      setInviteEmail('');
      loadTeamMembers();
    } catch (error: any) {
      console.error('Invitation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resendInvitation = async (member: TeamMember) => {
    if (!user || !member.invitation_email) return;

    setResendingId(member.id);

    try {
      // Generate new token and expiry
      const newToken = crypto.randomUUID();
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 7);

      // Update the invitation
      const { error: updateError } = await supabase
        .from('team_members')
        .update({
          invitation_token: newToken,
          invitation_expires_at: newExpiry.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', member.id);

      if (updateError) throw updateError;

      // Resend email
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-team-invitation', {
        body: {
          email: member.invitation_email,
          invitationToken: newToken,
          role: member.role,
          inviterName: user.email
        }
      });

      if (emailError) {
        throw emailError;
      }

      toast({
        title: 'Invitation resent',
        description: `New invitation sent to ${member.invitation_email}`,
        className: "bg-green-500/10 border-green-500/20 text-green-400"
      });

      loadTeamMembers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to resend invitation',
        variant: 'destructive',
      });
    } finally {
      setResendingId(null);
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

  const isExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getStatusBadge = (member: TeamMember) => {
    if (member.status === 'pending' && isExpired(member.invitation_expires_at)) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Expired</Badge>;
    }
    switch (member.status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Suspended</Badge>;
      default:
        return <Badge variant="outline">{member.status}</Badge>;
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

  const pendingCount = teamMembers.filter(m => m.status === 'pending' && !isExpired(m.invitation_expires_at)).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Team Member
          </CardTitle>
          <CardDescription>
            Send an invitation to add someone to your team. They'll receive an email with a link to join.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    setEmailError(null);
                  }}
                  placeholder="email@example.com"
                  className={emailError ? 'border-red-500' : ''}
                />
                {emailError && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {emailError}
                  </p>
                )}
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
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''} in your team
            {pendingCount > 0 && (
              <span className="ml-2 text-yellow-400">
                ({pendingCount} pending invitation{pendingCount !== 1 ? 's' : ''})
              </span>
            )}
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
                        {getStatusBadge(member)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.status === 'pending' && (
                      <>
                        {isExpired(member.invitation_expires_at) ? (
                          <span className="text-xs text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Expired
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Awaiting response
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resendInvitation(member)}
                          disabled={resendingId === member.id}
                          className="text-primary hover:text-primary"
                        >
                          {resendingId === member.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          <span className="ml-1 text-xs">Resend</span>
                        </Button>
                      </>
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