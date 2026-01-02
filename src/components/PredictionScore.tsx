import { useState, useEffect } from 'react';
import { Target, TrendingUp, Eye, Heart, Share2, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PredictionScoreProps {
  userId: string;
  content: string;
  platform: string;
  mediaUrls?: string[];
  scheduledTime?: string;
}

interface Prediction {
  prediction: {
    overallScore: number;
    grade: string;
    predictedEngagementRate: string;
    predictedImpressions: number;
    predictedLikes: number;
    predictedShares: number;
    predictedComments: number;
    confidence: string;
    factors: Array<{ factor: string; impact: number; description: string }>;
    recommendations: Array<{ priority: string; action: string; example?: string; expectedImpact?: string }>;
  };
  baseline: {
    yourAvgEngagement: string;
    basedOnPosts: number;
  };
}

export function PredictionScore({ userId, content, platform, mediaUrls, scheduledTime }: PredictionScoreProps) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (content && content.trim().length > 10) {
      const debounce = setTimeout(() => {
        predictEngagement();
      }, 1000);
      
      return () => clearTimeout(debounce);
    } else {
      setPrediction(null);
    }
  }, [content, platform, mediaUrls, scheduledTime]);
  
  const predictEngagement = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-engagement', {
        body: { userId, content, platform, mediaUrls, scheduledTime }
      });
      
      if (error) throw error;
      setPrediction(data);
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!content || content.trim().length < 10) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Target className="w-5 h-5" />
          <p>Start typing to see engagement prediction...</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Analyzing content...</p>
        </div>
      </div>
    );
  }
  
  if (!prediction) return null;
  
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400 border-green-400 bg-green-400/10';
    if (score >= 75) return 'text-blue-400 border-blue-400 bg-blue-400/10';
    if (score >= 65) return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
    if (score >= 55) return 'text-orange-400 border-orange-400 bg-orange-400/10';
    return 'text-red-400 border-red-400 bg-red-400/10';
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-900/30 text-green-400';
      case 'medium': return 'bg-yellow-900/30 text-yellow-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Engagement Prediction
          </h3>
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg ${getScoreColor(prediction.prediction.overallScore)}`}>
            {prediction.prediction.grade}
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-background/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Predicted Rate</span>
            </div>
            <p className="text-xl font-bold text-foreground">{prediction.prediction.predictedEngagementRate}%</p>
            <p className="text-xs text-muted-foreground">vs your avg: {prediction.baseline.yourAvgEngagement}</p>
          </div>
          
          <div className="bg-background/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Eye className="w-4 h-4" />
              <span>Est. Impressions</span>
            </div>
            <p className="text-xl font-bold text-foreground">{prediction.prediction.predictedImpressions.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Heart className="w-4 h-4 text-red-400" />
              <span>{prediction.prediction.predictedLikes}</span>
              <span className="text-xs">Likes</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>{prediction.prediction.predictedShares}</span>
              <span className="text-xs">Shares</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="w-4 h-4 text-green-400" />
              <span>{prediction.prediction.predictedComments}</span>
              <span className="text-xs">Comments</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Confidence:</span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${getConfidenceColor(prediction.prediction.confidence)}`}>
            {prediction.prediction.confidence.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="p-4 border-b border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Score Factors</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {prediction.prediction.factors.map((factor, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm">
              {factor.impact > 0 ? (
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground truncate">{factor.factor}</p>
                  <span className={`text-xs font-semibold flex-shrink-0 ${factor.impact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {factor.impact > 0 ? '+' : ''}{factor.impact}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{factor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {prediction.prediction.recommendations && prediction.prediction.recommendations.length > 0 && (
        <div className="p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Quick Wins</h4>
          <div className="space-y-2">
            {prediction.prediction.recommendations.map((rec, idx) => (
              <div key={idx} className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{rec.action}</p>
                  {rec.expectedImpact && (
                    <span className="text-xs font-semibold text-green-400 flex-shrink-0">{rec.expectedImpact}</span>
                  )}
                </div>
                {rec.example && (
                  <p className="text-xs text-muted-foreground mt-1">💡 {rec.example}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
