import { useState, useEffect } from 'react';
import { TrendingUp, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TrendingTopic {
  id: string;
  topic: string;
  category: string;
  trend_score: number;
  mention_count: number;
  growth_rate: number;
  related_keywords: string[];
}

export function TrendingTopics() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadTrendingTopics();
  }, [user]);
  
  const loadTrendingTopics = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase.functions.invoke('content-success-predictor', {
        body: { userId: user.id, action: 'get_trending_topics' }
      });
      setTopics(data?.topics || []);
    } catch (error) {
      console.error('Failed to load trending topics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-8 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-foreground font-semibold">Trending Topics</h3>
      </div>
      
      <div className="space-y-2">
        {topics.slice(0, 10).map((topic, idx) => (
          <div key={topic.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${
                idx < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {idx + 1}
              </span>
              <div>
                <p className="text-foreground font-medium text-sm">#{topic.topic}</p>
                <p className="text-muted-foreground text-xs capitalize">{topic.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <Zap className="w-3 h-3" />
              <span className="text-sm font-medium">{topic.trend_score}</span>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-muted-foreground text-xs mt-4 text-center">
        Using trending topics can boost engagement by up to 20%
      </p>
    </div>
  );
}