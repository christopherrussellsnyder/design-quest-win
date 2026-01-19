import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const LinkedInAuthorize = () => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [permissions, setPermissions] = useState({
    profile: true,
    posts: true,
    company: true,
    analytics: true,
  });

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsAuthorizing(false);
    setIsSuccess(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('linkedin_connected', 'true');
    localStorage.setItem('linkedin_username', 'MarketAI Inc.');
    localStorage.setItem('linkedin_connected_at', new Date().toISOString());
    
    if (window.opener) {
      window.opener.postMessage({ type: 'LINKEDIN_AUTH_SUCCESS', username: 'MarketAI Inc.' }, '*');
    }
    
    window.close();
  };

  const handleCancel = () => {
    if (window.opener) {
      window.opener.postMessage({ type: 'LINKEDIN_AUTH_CANCELLED' }, '*');
    }
    window.close();
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0A66C2] flex items-center justify-center">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authorization Successful!</h2>
          <p className="text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F2EF]">
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#0A66C2">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          <span className="text-2xl font-bold text-[#0A66C2]">LinkedIn</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm space-y-6 bg-white rounded-xl p-6 shadow-lg">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                <path d="M12 3L14.5 8.5L20 9.5L16 14L17 20L12 17L7 20L8 14L4 9.5L9.5 8.5L12 3Z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Sign in to allow access</h1>
            <p className="text-gray-500 text-sm">MarketAI is requesting access to your LinkedIn account</p>
          </div>

          <div className="space-y-4 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.profile} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, profile: !!checked }))}
                className="border-gray-400 data-[state=checked]:bg-[#0A66C2] data-[state=checked]:border-[#0A66C2]"
              />
              <div>
                <p className="text-gray-900 text-sm font-medium">Use your basic profile information</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.posts} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, posts: !!checked }))}
                className="border-gray-400 data-[state=checked]:bg-[#0A66C2] data-[state=checked]:border-[#0A66C2]"
              />
              <div>
                <p className="text-gray-900 text-sm font-medium">Post, comment, and react on your behalf</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.company} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, company: !!checked }))}
                className="border-gray-400 data-[state=checked]:bg-[#0A66C2] data-[state=checked]:border-[#0A66C2]"
              />
              <div>
                <p className="text-gray-900 text-sm font-medium">Manage your company page</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.analytics} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, analytics: !!checked }))}
                className="border-gray-400 data-[state=checked]:bg-[#0A66C2] data-[state=checked]:border-[#0A66C2]"
              />
              <div>
                <p className="text-gray-900 text-sm font-medium">Retrieve statistics about your posts</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <p className="text-gray-900 font-medium">MarketAI Inc.</p>
                <p className="text-gray-500 text-sm">Company Page</p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold rounded-full bg-[#0A66C2] hover:bg-[#004182]"
            onClick={handleAuthorize}
            disabled={isAuthorizing}
          >
            {isAuthorizing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Allowing...
              </>
            ) : (
              'Allow'
            )}
          </Button>

          <Button 
            variant="outline" 
            className="w-full text-gray-700 border-gray-300 hover:bg-gray-100"
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

export default LinkedInAuthorize;
