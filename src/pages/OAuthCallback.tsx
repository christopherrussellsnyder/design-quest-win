import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuthCallback() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state'); // platform identifier
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        sessionStorage.setItem('oauth_error', errorDescription || error);
        navigate('/dashboard?tab=settings&oauth=error');
        return;
      }
      
      if (!code || !state) {
        console.error('Invalid callback - missing code or state');
        sessionStorage.setItem('oauth_error', 'Invalid callback parameters');
        navigate('/dashboard?tab=settings&oauth=error');
        return;
      }
      
      // Store code and platform in sessionStorage
      sessionStorage.setItem('oauth_code', code);
      sessionStorage.setItem('oauth_platform', state);
      
      // Redirect back to dashboard settings
      navigate('/dashboard?tab=settings&oauth=complete');
    };
    
    handleCallback();
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-400">Connecting your account...</p>
      </div>
    </div>
  );
}