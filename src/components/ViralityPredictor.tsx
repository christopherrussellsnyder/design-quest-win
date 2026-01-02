import { useState, useEffect } from 'react';
import { Zap, TrendingUp, Sparkles, Target, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ViralityPredictorProps {
  content: string;
  platform: string;
}

export function ViralityPredictor({ content, platform }: ViralityPredictorProps) {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (content && content.trim().length > 20) {
      const debounce = setTimeout(() => {
        predictVirality();
      }, 1500);
      
      return () => clearTimeout(debounce);
    } else {
      setPrediction(null);
      setSuggestions([]);
    }
  }, [content, platform]);
  
  const predictVirality = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('content-success-predictor', {
        body: { 
          userId: user.id, 
          action: 'predict_virality',
          content,
          platform
        }
      });
      
      if (data?.success) {
        setPrediction(data.prediction);
        
        const { data: suggestionsData } = await supabase.functions.invoke('content-success-predictor', {
          body: { 
            userId: user.id, 
            action: 'suggest_improvements',
            content,
            platform
          }
        });
        
        setSuggestions(suggestionsData?.suggestions || []);
      }
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!content || content.trim().length < 20) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">Start typing to see virality prediction...</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  if (!prediction) return null;
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'viral': return 'text-purple-400 border-purple-500/50 bg-purple-500/10';
      case 'high_potential': return 'text-green-400 border-green-500/50 bg-green-500/10';
      case 'moderate': return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
      default: return 'text-red-400 border-red-500/50 bg-red-500/10';
    }
  };
  
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'viral': return '🚀 Viral Potential';
      case 'high_potential': return '⭐ High Potential';
      case 'moderate': return '📊 Moderate';
      default: return '⚠️ Needs Work';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-purple-500';
    if (score >= 65) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-foreground font-semibold">Virality Prediction</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(prediction.virality_category)}`}>
            {getCategoryLabel(prediction.virality_category)}
          </span>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted-foreground text-sm">Virality Score</span>
            <span className="text-2xl font-bold text-foreground">{prediction.virality_score}/100</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full ${getScoreColor(prediction.virality_score)} transition-all duration-500`}
              style={{ width: `${prediction.virality_score}%` }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Est. Impressions</p>
            <p className="text-foreground font-bold text-lg">{(prediction.predicted_impressions || 0).toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Est. Engagement</p>
            <p className="text-foreground font-bold text-lg">{(prediction.predicted_engagement_rate || 0).toFixed(1)}%</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Est. Shares</p>
            <p className="text-foreground font-bold text-lg">{prediction.predicted_shares || 0}</p>
          </div>
        </div>
        
        {prediction.trending_elements && prediction.trending_elements.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-foreground text-sm font-medium">Trending Topics Detected</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {prediction.trending_elements.map((topic: string, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                  #{topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {suggestions && suggestions.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <p className="text-foreground font-semibold">AI Improvement Suggestions</p>
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion: any, idx: number) => (
              <div key={idx} className={`p-3 rounded-lg border ${
                suggestion.priority === 'high' ? 'border-red-500/30 bg-red-500/5' :
                suggestion.priority === 'medium' ? 'border-yellow-500/30 bg-yellow-500/5' :
                'border-muted bg-muted/30'
              }`}>
                <div className="flex items-start gap-3">
                  <Target className={`w-4 h-4 mt-0.5 ${
                    suggestion.priority === 'high' ? 'text-red-400' :
                    suggestion.priority === 'medium' ? 'text-yellow-400' :
                    'text-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-foreground font-medium text-sm">{suggestion.title}</p>
                      {suggestion.expectedImpact && (
                        <span className="text-green-400 text-xs font-medium">{suggestion.expectedImpact}</span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">{suggestion.description}</p>
                    {suggestion.example && (
                      <p className="text-primary/80 text-xs mt-1">💡 {suggestion.example}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}