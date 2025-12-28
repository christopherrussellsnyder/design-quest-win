import { supabase } from "@/integrations/supabase/client";

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
}

export interface TweetResult {
  data: {
    id: string;
    text: string;
  };
}

class TwitterService {
  /**
   * Verify Twitter credentials by getting user info
   */
  async verifyCredentials(): Promise<{ success: boolean; user?: TwitterUser; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('twitter-post', {
        body: { action: 'verify' }
      });

      if (error) {
        console.error('Twitter verify error:', error);
        return { success: false, error: error.message };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return { success: true, user: data.user?.data };
    } catch (err: any) {
      console.error('Twitter service error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Post a tweet
   */
  async postTweet(content: string): Promise<{ success: boolean; data?: TweetResult; error?: string }> {
    try {
      if (!content || content.trim().length === 0) {
        return { success: false, error: 'Tweet content cannot be empty' };
      }

      if (content.length > 280) {
        return { success: false, error: 'Tweet exceeds 280 character limit' };
      }

      const { data, error } = await supabase.functions.invoke('twitter-post', {
        body: { action: 'tweet', tweet: content }
      });

      if (error) {
        console.error('Twitter post error:', error);
        return { success: false, error: error.message };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return { success: true, data: data.data };
    } catch (err: any) {
      console.error('Twitter service error:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Check if Twitter is configured (credentials are set)
   */
  isConfigured(): boolean {
    // Since we're using edge function secrets, we can't check client-side
    // The edge function will validate credentials
    return true;
  }
}

export const twitterService = new TwitterService();
