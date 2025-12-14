import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'login-required'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        if (!token) {
          setStatus('error');
          setErrorMessage('Invalid invitation link');
          return;
        }

        // Get invitation
        const { data: invite, error: inviteError } = await supabase
          .from('team_members')
          .select('*')
          .eq('invitation_token', token)
          .maybeSingle();

        if (inviteError || !invite) {
          setStatus('error');
          setErrorMessage('Invalid or expired invitation');
          return;
        }

        // Check if expired
        if (invite.invitation_expires_at && new Date(invite.invitation_expires_at) < new Date()) {
          setStatus('error');
          setErrorMessage('This invitation has expired');
          return;
        }

        // Check if already accepted
        if (invite.status === 'active') {
          setStatus('success');
          toast({
            title: 'Already accepted',
            description: 'This invitation has already been accepted',
          });
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }

        // Check if user is logged in
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setStatus('login-required');
          return;
        }

        // Accept invitation
        const { error: updateError } = await supabase
          .from('team_members')
          .update({
            user_id: user.id,
            status: 'active',
            accepted_at: new Date().toISOString(),
          })
          .eq('invitation_token', token);

        if (updateError) throw updateError;

        setStatus('success');
        toast({
          title: 'Invitation accepted!',
          description: 'You now have access to the team',
        });

        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error: any) {
        console.error('Error accepting invitation:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Failed to accept invitation');
      }
    };

    acceptInvite();
  }, [token, navigate, toast]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Processing invitation...</p>
        </div>
      </div>
    );
  }

  if (status === 'login-required') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Sign in required
          </h2>
          <p className="text-muted-foreground mb-6">
            Please sign in or create an account to accept this invitation.
          </p>
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => navigate(`/login?redirect=/accept-invite/${token}`)}
            >
              Sign in
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/signup?invite=${token}`)}
            >
              Create account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Invitation Error
          </h2>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          <Button onClick={() => navigate('/login')}>Go to login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Invitation Accepted!
        </h2>
        <p className="text-muted-foreground mb-6">
          Redirecting you to the dashboard...
        </p>
      </div>
    </div>
  );
}
