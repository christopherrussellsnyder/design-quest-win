import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const TikTokAuthorize = () => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [permissions, setPermissions] = useState({
    profile: true,
    upload: true,
    publish: true,
    analytics: true,
  });

  const handleAuthorize = async () => {
    setIsAuthorizing(true);
    
    // Simulate authorization delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsAuthorizing(false);
    setIsSuccess(true);
    
    // Show success message for 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store connection state and notify opener
    localStorage.setItem('tiktok_connected', 'true');
    localStorage.setItem('tiktok_username', '@demouser');
    localStorage.setItem('tiktok_connected_at', new Date().toISOString());
    
    // Notify parent window
    if (window.opener) {
      window.opener.postMessage({ type: 'TIKTOK_AUTH_SUCCESS', username: '@demouser' }, '*');
    }
    
    // Close popup
    window.close();
  };

  const handleCancel = () => {
    if (window.opener) {
      window.opener.postMessage({ type: 'TIKTOK_AUTH_CANCELLED' }, '*');
    }
    window.close();
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#25F4EE' }}>
            <Check className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authorization Successful!</h2>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#000000' }}>
      {/* TikTok Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-center gap-2">
          {/* TikTok Logo */}
          <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
            <path d="M34.145 0H26.29v32.672c0 3.913-3.106 7.07-6.963 7.07-3.858 0-6.963-3.157-6.963-7.07s3.105-7.07 6.963-7.07c.728 0 1.419.11 2.073.323V17.85a15.093 15.093 0 0 0-2.073-.145C8.62 17.705 0 26.385 0 37.147 0 47.91 8.62 48 19.327 48c10.707 0 14.818-8.68 14.818-19.443V15.684c4.219 3.05 9.382 4.683 14.855 4.683V12.33c-8.402 0-14.855-5.525-14.855-12.33Z" fill="#FE2C55"/>
            <path d="M34.145 0H26.29v32.672c0 3.913-3.106 7.07-6.963 7.07-3.858 0-6.963-3.157-6.963-7.07s3.105-7.07 6.963-7.07c.728 0 1.419.11 2.073.323V17.85a15.093 15.093 0 0 0-2.073-.145C8.62 17.705 0 26.385 0 37.147 0 47.91 8.62 48 19.327 48c10.707 0 14.818-8.68 14.818-19.443V15.684c4.219 3.05 9.382 4.683 14.855 4.683V12.33c-8.402 0-14.855-5.525-14.855-12.33Z" fill="#25F4EE" style={{ transform: 'translateX(-3px)' }}/>
          </svg>
          <span className="text-2xl font-bold text-white">TikTok</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm space-y-6">
          {/* App Logo */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                <path d="M12 3L14.5 8.5L20 9.5L16 14L17 20L12 17L7 20L8 14L4 9.5L9.5 8.5L12 3Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Authorize MarketAI</h1>
            <p className="text-gray-400 text-sm">MarketAI would like to:</p>
          </div>

          {/* Permissions */}
          <div className="space-y-4 bg-gray-900 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.profile} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, profile: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-[#FE2C55] data-[state=checked]:border-[#FE2C55]"
              />
              <div>
                <p className="text-white text-sm font-medium">View your profile information</p>
                <p className="text-gray-500 text-xs">Access your display name, avatar, and bio</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.upload} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, upload: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-[#FE2C55] data-[state=checked]:border-[#FE2C55]"
              />
              <div>
                <p className="text-white text-sm font-medium">Upload videos to your account</p>
                <p className="text-gray-500 text-xs">Upload video content on your behalf</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.publish} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, publish: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-[#FE2C55] data-[state=checked]:border-[#FE2C55]"
              />
              <div>
                <p className="text-white text-sm font-medium">Publish videos on your behalf</p>
                <p className="text-gray-500 text-xs">Schedule and publish content</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={permissions.analytics} 
                onCheckedChange={(checked) => setPermissions(p => ({ ...p, analytics: !!checked }))}
                className="border-gray-600 data-[state=checked]:bg-[#FE2C55] data-[state=checked]:border-[#FE2C55]"
              />
              <div>
                <p className="text-white text-sm font-medium">View your video analytics</p>
                <p className="text-gray-500 text-xs">Access engagement and performance data</p>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FE2C55] to-[#25F4EE] flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <div>
                <p className="text-white font-medium">Demo User</p>
                <p className="text-gray-500 text-sm">@demouser</p>
              </div>
            </div>
          </div>

          {/* Authorize Button */}
          <Button 
            className="w-full h-12 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#FE2C55' }}
            onClick={handleAuthorize}
            disabled={isAuthorizing || !Object.values(permissions).some(Boolean)}
          >
            {isAuthorizing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Authorizing...
              </>
            ) : (
              'Authorize'
            )}
          </Button>

          {/* Cancel Button */}
          <Button 
            variant="ghost" 
            className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={handleCancel}
            disabled={isAuthorizing}
          >
            Cancel
          </Button>

          {/* Privacy Notice */}
          <p className="text-center text-xs text-gray-500">
            By authorizing, you agree to TikTok's{' '}
            <span className="text-[#FE2C55] cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-[#FE2C55] cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TikTokAuthorize;
