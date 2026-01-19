import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const FacebookAuthorize = () => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [permissions, setPermissions] = useState({
    profile: true,
    pages: true,
    publish: true,
    insights: true,
  });

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsAuthorizing(false);
    setIsSuccess(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('facebook_connected', 'true');
    localStorage.setItem('facebook_username', 'MarketAI Page');
    localStorage.setItem('facebook_connected_at', new Date().toISOString());
    
    if (window.opener) {
      window.opener.postMessage({ type: 'FACEBOOK_AUTH_SUCCESS', username: 'MarketAI Page' }, '*');
    }
    
    window.close();
  };

  const handleCancel = () => {
    if (window.opener) {
      window.opener.postMessage({ type: 'FACEBOOK_AUTH_CANCELLED' }, '*');
    }
    window.close();
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#18191A]">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-600 flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authorization Successful!</h2>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#18191A' }}>
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="text-2xl font-bold text-white">Facebook</span>
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
            <h1 className="text-2xl font-bold text-white mb-2">Log in with Facebook</h1>
            <p className="text-gray-400 text-sm">MarketAI wants to access your account</p>
          </div>

          <div className="space-y-4 bg-[#242526] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.profile} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, profile: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <div>
                <p className="text-white text-sm font-medium">Your public profile</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.pages} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, pages: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <div>
                <p className="text-white text-sm font-medium">Manage your Pages</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.publish} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, publish: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <div>
                <p className="text-white text-sm font-medium">Publish content to your Page</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.insights} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, insights: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <div>
                <p className="text-white text-sm font-medium">Access Page insights</p>
              </div>
            </div>
          </div>

          <div className="bg-[#242526] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <p className="text-white font-medium">MarketAI Page</p>
                <p className="text-gray-500 text-sm">Business Page</p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold rounded-lg bg-blue-600 hover:bg-blue-700"
            onClick={handleAuthorize}
            disabled={isAuthorizing}
          >
            {isAuthorizing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Continuing...
              </>
            ) : (
              'Continue as MarketAI'
            )}
          </Button>

          <Button 
            variant="ghost" 
            className="w-full text-gray-400 hover:text-white hover:bg-[#3A3B3C]"
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

export default FacebookAuthorize;
