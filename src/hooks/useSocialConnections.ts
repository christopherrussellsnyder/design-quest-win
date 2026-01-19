import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface SocialConnection {
  platform: string;
  connected: boolean;
  username: string;
  connectedAt: string | null;
  followerCount?: number;
}

const PLATFORMS = ['tiktok', 'twitter', 'facebook', 'instagram', 'linkedin', 'youtube'] as const;

export const useSocialConnections = () => {
  const [connections, setConnections] = useState<Record<string, SocialConnection>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load connections from localStorage on mount
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = useCallback(() => {
    setIsLoading(true);
    const loadedConnections: Record<string, SocialConnection> = {};
    
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

  const disconnectPlatform = useCallback((platform: string) => {
    return new Promise<void>((resolve) => {
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
      resolve();
    });
  }, []);

  const isConnected = useCallback((platform: string) => {
    return connections[platform]?.connected || false;
  }, [connections]);

  const getConnection = useCallback((platform: string) => {
    return connections[platform];
  }, [connections]);

  return {
    connections,
    isLoading,
    loadConnections,
    connectPlatform,
    disconnectPlatform,
    isConnected,
    getConnection,
  };
};
