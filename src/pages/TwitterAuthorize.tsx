import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const TwitterAuthorize = () => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [permissions, setPermissions] = useState({
    profile: true,
    tweet: true,
    directMessages: true,
    analytics: true,
  });

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsAuthorizing(false);
    setIsSuccess(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('twitter_connected', 'true');
    localStorage.setItem('twitter_username', '@marketai_demo');
    localStorage.setItem('twitter_connected_at', new Date().toISOString());
    
    if (window.opener) {
      window.opener.postMessage({ type: 'TWITTER_AUTH_SUCCESS', username: '@marketai_demo' }, '*');
    }
    
    window.close();
  };

  const handleCancel = () => {
    if (window.opener) {
      window.opener.postMessage({ type: 'TWITTER_AUTH_CANCELLED' }, '*');
    }
    window.close();
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-500 flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authorization Successful!</h2>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                <path d="M12 3L14.5 8.5L20 9.5L16 14L17 20L12 17L7 20L8 14L4 9.5L9.5 8.5L12 3Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Authorize MarketAI</h1>
            <p className="text-gray-400 text-sm">MarketAI would like to access your X account</p>
          </div>

          <div className="space-y-4 bg-gray-900 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.profile} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, profile: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
              />
              <div>
                <p className="text-white text-sm font-medium">Read your profile information</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.tweet} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, tweet: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
              />
              <div>
                <p className="text-white text-sm font-medium">Post and delete posts on your behalf</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.analytics} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, analytics: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-sky-500 data-[state=checked]:border-sky-500"
              />
              <div>
                <p className="text-white text-sm font-medium">View your post analytics</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <p className="text-white font-medium">MarketAI Demo</p>
                <p className="text-gray-500 text-sm">@marketai_demo</p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold rounded-full bg-white text-black hover:bg-gray-200"
            onClick={handleAuthorize}
            disabled={isAuthorizing}
          >
            {isAuthorizing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Authorizing...
              </>
            ) : (
              'Authorize app'
            )}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={handleCancel}
            disabled={isAuthorizing}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TwitterAuthorize;
