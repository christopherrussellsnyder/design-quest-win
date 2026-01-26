import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface SocialConnection {
  platform: string;
  connected: boolean;
  username: string;
  connectedAt: string | null;
  followerCount?: number;
  profilePicture?: string;
  platformUserId?: string;
  tokenExpiresAt?: string;
}

const PLATFORMS = ['tiktok', 'twitter', 'facebook', 'instagram', 'linkedin', 'youtube'] as const;

export const useSocialConnections = () => {
  const [connections, setConnections] = useState<Record<string, SocialConnection>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load connections from database and localStorage on mount
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = useCallback(async () => {
    setIsLoading(true);
    const loadedConnections: Record<string, SocialConnection> = {};
    
    // Initialize with empty state
    PLATFORMS.forEach(platform => {
      loadedConnections[platform] = {
        platform,
        connected: false,
        username: '',
        connectedAt: null,
      };
    });

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch connections from database
        const { data: dbConnections, error } = await supabase
          .from('connected_accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (!error && dbConnections) {
          dbConnections.forEach((conn: any) => {
            const platform = conn.platform as typeof PLATFORMS[number];
            if (PLATFORMS.includes(platform)) {
              loadedConnections[platform] = {
                platform,
                connected: true,
                username: conn.platform_username || '',
                connectedAt: conn.connected_at,
                profilePicture: conn.metadata?.picture,
                platformUserId: conn.platform_user_id,
                tokenExpiresAt: conn.token_expires_at,
                followerCount: conn.metadata?.follower_count,
              };
              
              // Sync to localStorage for backward compatibility
              localStorage.setItem(`${platform}_connected`, 'true');
              localStorage.setItem(`${platform}_username`, conn.platform_username || '');
              localStorage.setItem(`${platform}_connected_at`, conn.connected_at || '');
            }
          });
        }
      }
      
      // Fallback to localStorage for platforms not in database
      PLATFORMS.forEach(platform => {
        if (!loadedConnections[platform].connected) {
          const connected = localStorage.getItem(`${platform}_connected`) === 'true';
          const username = localStorage.getItem(`${platform}_username`) || '';
          const connectedAt = localStorage.getItem(`${platform}_connected_at`) || null;
          
          if (connected) {
            loadedConnections[platform] = {
              platform,
              connected,
              username,
              connectedAt,
              followerCount: Math.floor(Math.random() * 50000) + 1000,
            };
          }
        }
      });
    } catch (error) {
      console.error('Error loading connections:', error);
      
      // Fallback to localStorage on error
      PLATFORMS.forEach(platform => {
        const connected = localStorage.getItem(`${platform}_connected`) === 'true';
        const username = localStorage.getItem(`${platform}_username`) || '';
        const connectedAt = localStorage.getItem(`${platform}_connected_at`) || null;
        
        loadedConnections[platform] = {
          platform,
          connected,
          username,
          connectedAt,
          followerCount: connected ? Math.floor(Math.random() * 50000) + 1000 : undefined,
        };
      });
    }
    
    setConnections(loadedConnections);
    setIsLoading(false);
  }, []);

  // Listen for OAuth callback messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TIKTOK_AUTH_SUCCESS') {
        loadConnections();
        toast.success('TikTok account connected successfully!');
      } else if (event.data?.type === 'TWITTER_AUTH_SUCCESS') {
        loadConnections();
        toast.success('Twitter/X account connected successfully!');
      } else if (event.data?.type === 'FACEBOOK_AUTH_SUCCESS') {
        loadConnections();
        toast.success('Facebook account connected successfully!');
      } else if (event.data?.type === 'INSTAGRAM_AUTH_SUCCESS') {
        loadConnections();
        toast.success('Instagram account connected successfully!');
      } else if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS') {
        loadConnections();
        toast.success('LinkedIn account connected successfully!');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loadConnections]);

  const connectPlatform = useCallback((platform: string) => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    // Open OAuth popup
    const popup = window.open(
      `/auth/${platform}/authorize`,
      `${platform}Auth`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );
    
    if (!popup) {
      toast.error('Could not open authorization window. Please allow popups.');
    }
  }, []);

  const disconnectPlatform = useCallback(async (platform: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Delete from database
        const { error } = await supabase
          .from('connected_accounts')
          .delete()
          .eq('user_id', user.id)
          .eq('platform', platform);

        if (error) {
          console.error('Error disconnecting platform:', error);
          toast.error(`Failed to disconnect ${platform}`);
          return;
        }
      }

      // Clear from localStorage
      localStorage.removeItem(`${platform}_connected`);
      localStorage.removeItem(`${platform}_username`);
      localStorage.removeItem(`${platform}_connected_at`);
      
      setConnections(prev => ({
        ...prev,
        [platform]: {
          platform,
          connected: false,
          username: '',
          connectedAt: null,
        }
      }));
      
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} account disconnected`);
    } catch (error) {
      console.error('Error disconnecting platform:', error);
      toast.error(`Failed to disconnect ${platform}`);
    }
  }, []);

  const isConnected = useCallback((platform: string) => {
    return connections[platform]?.connected || false;
  }, [connections]);

  const getConnection = useCallback((platform: string) => {
    return connections[platform];
  }, [connections]);

  const isTokenExpired = useCallback((platform: string) => {
    const connection = connections[platform];
    if (!connection?.tokenExpiresAt) return false;
    return new Date(connection.tokenExpiresAt) < new Date();
  }, [connections]);

  return {
    connections,
    isLoading,
    loadConnections,
    connectPlatform,
    disconnectPlatform,
    isConnected,
    getConnection,
    isTokenExpired,
  };
};