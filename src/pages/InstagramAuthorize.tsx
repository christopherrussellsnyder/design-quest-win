import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const InstagramAuthorize = () => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [permissions, setPermissions] = useState({
    profile: true,
    media: true,
    publish: true,
    insights: true,
  });

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsAuthorizing(false);
    setIsSuccess(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('instagram_connected', 'true');
    localStorage.setItem('instagram_username', '@marketai_official');
    localStorage.setItem('instagram_connected_at', new Date().toISOString());
    
    if (window.opener) {
      window.opener.postMessage({ type: 'INSTAGRAM_AUTH_SUCCESS', username: '@marketai_official' }, '*');
    }
    
    window.close();
  };

  const handleCancel = () => {
    if (window.opener) {
      window.opener.postMessage({ type: 'INSTAGRAM_AUTH_CANCELLED' }, '*');
    }
    window.close();
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)' }}>
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
            <Check className="w-8 h-8 text-pink-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authorization Successful!</h2>
          <p className="text-white/80">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="url(#instagram-gradient)">
            <defs>
              <radialGradient id="instagram-gradient" r="150%" cx="30%" cy="107%">
                <stop stopColor="#fdf497" offset="0" />
                <stop stopColor="#fdf497" offset="0.05" />
                <stop stopColor="#fd5949" offset="0.45" />
                <stop stopColor="#d6249f" offset="0.6" />
                <stop stopColor="#285AEB" offset="0.9" />
              </radialGradient>
            </defs>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span className="text-2xl font-bold text-white">Instagram</span>
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
            <p className="text-gray-400 text-sm">MarketAI would like to access your Instagram</p>
          </div>

          <div className="space-y-4 bg-gray-900 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.profile} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, profile: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
              />
              <div>
                <p className="text-white text-sm font-medium">Access profile info</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.media} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, media: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
              />
              <div>
                <p className="text-white text-sm font-medium">Access your media</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.publish} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, publish: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
              />
              <div>
                <p className="text-white text-sm font-medium">Publish content</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.insights} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, insights: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
              />
              <div>
                <p className="text-white text-sm font-medium">View insights</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <p className="text-white font-medium">MarketAI Official</p>
                <p className="text-gray-500 text-sm">@marketai_official</p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold rounded-lg"
            style={{ background: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)' }}
            onClick={handleAuthorize}
            disabled={isAuthorizing}
          >
            {isAuthorizing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Authorizing...
              </>
            ) : (
              'Allow'
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

export default InstagramAuthorize;
