import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface StrategyOverview {
  id: string;
  title: string;
  platform: string | null;
  duration_days: number;
  start_date: string;
  end_date: string;
  goals?: string[] | null;
  content_mix?: Record<string, number> | null;
  predicted_metrics?: {
    total_reach?: number;
    avg_engagement_rate?: number;
    expected_follower_growth?: number;
  } | null;
  created_at?: string;
  user_id?: string;
}

export interface StrategyPost {
  id: string;
  strategy_id: string;
  day_number: number;
  post_date: string;
  post_time: string | null;
  post_type: string | null;
  theme: string | null;
  hook: string | null;
  caption: string;
  hashtags: string[] | null;
  cta: string | null;
  predicted_reach: number | null;
  predicted_engagement: number | null;
  rationale: string | null;
  sort_order: number | null;
}

export interface GeneratedStrategy {
  strategyId: string;
  strategy: StrategyOverview;
  postsCount: number;
}

export function useStrategyGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedStrategy, setGeneratedStrategy] = useState<GeneratedStrategy | null>(null);

  const generateStrategy = async (
    platform: string,
    durationDays: number = 30,
    goals?: string[],
    customInstructions?: string,
    conversationId?: string
  ): Promise<GeneratedStrategy | null> => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedStrategy(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 90));
      }, 1000);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-strategy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            platform,
            durationDays,
            goals,
            customInstructions,
            conversationId,
          }),
        }
      );

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted. Please add credits to continue.');
        }
        throw new Error(errorData.error || 'Failed to generate strategy');
      }

      const data = await response.json();
      setProgress(100);

      const result: GeneratedStrategy = {
        strategyId: data.strategyId,
        strategy: data.strategy,
        postsCount: data.postsCount,
      };

      setGeneratedStrategy(result);
      
      toast({
        title: 'Strategy Generated!',
        description: `Created ${data.postsCount} posts for your ${durationDays}-day ${platform} strategy.`,
      });

      return result;
    } catch (error) {
      console.error('Strategy generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate strategy',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchStrategy = async (strategyId: string) => {
    const { data: strategy, error } = await supabase
      .from('content_strategies')
      .select('*')
      .eq('id', strategyId)
      .single();

    if (error) {
      console.error('Error fetching strategy:', error);
      return null;
    }

    const { data: posts, error: postsError } = await supabase
      .from('strategy_posts')
      .select('*')
      .eq('strategy_id', strategyId)
      .order('day_number', { ascending: true });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return null;
    }

    return {
      strategy: {
        ...strategy,
        goals: Array.isArray(strategy.goals) ? strategy.goals : [],
        content_mix: strategy.content_mix as Record<string, number> | null,
        predicted_metrics: strategy.predicted_metrics as StrategyOverview['predicted_metrics'],
      } as StrategyOverview,
      posts: posts as StrategyPost[],
    };
  };

  const fetchAllStrategies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('content_strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching strategies:', error);
      return [];
    }

    return data;
  };

  const deleteStrategy = async (strategyId: string) => {
    // Delete posts first (cascade should handle this but being explicit)
    await supabase
      .from('strategy_posts')
      .delete()
      .eq('strategy_id', strategyId);

    const { error } = await supabase
      .from('content_strategies')
      .delete()
      .eq('id', strategyId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete strategy',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Strategy Deleted',
      description: 'The strategy has been removed.',
    });
    return true;
  };

  return {
    generateStrategy,
    fetchStrategy,
    fetchAllStrategies,
    deleteStrategy,
    isGenerating,
    progress,
    generatedStrategy,
  };
}
