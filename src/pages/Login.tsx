import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const seconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      toast({ title: 'Too many attempts', description: `Please wait ${seconds} seconds before trying again.`, variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.session) {
        setFailedAttempts(0);
        await new Promise(resolve => setTimeout(resolve, 500));
        const redirect = searchParams.get('redirect') || '/ai-strategist';
        navigate(redirect);
      }
    } catch (error: any) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        setLockoutUntil(Date.now() + 5 * 60 * 1000);
        toast({ title: 'Account locked', description: 'Too many failed attempts. Please wait 5 minutes.', variant: 'destructive' });
      } else {
        toast({ title: 'Login failed', description: 'Invalid email or password.', variant: 'destructive' });
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-8">
          <img src="/korex-wordmark-lockup.svg" alt="Korex Intelligence Systems Logo" className="h-[100px]" />
        </div>

        <div className="card-glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold mb-2 text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mb-6">Sign in to your account to continue</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:shadow-glow transition-all"
                placeholder="you@example.com" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-korex-red-light transition-colors">Forgot password?</Link>
              </div>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:shadow-glow transition-all"
                placeholder="••••••••" />
            </div>

            <button type="submit" disabled={loading || (!!lockoutUntil && Date.now() < lockoutUntil)}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-korex-red-light transition-colors disabled:opacity-50 shadow-glow">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-muted-foreground text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:text-korex-red-light font-medium transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
