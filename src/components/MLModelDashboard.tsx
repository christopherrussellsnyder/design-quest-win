import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Zap, BarChart3, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MLModel {
  id: string;
  model_version: string;
  training_samples: number;
  accuracy_score: number;
  mean_absolute_error: number;
  feature_importance: Record<string, number>;
  is_active: boolean;
  trained_at: string;
}

interface OptimalTime {
  dayOfWeek: number;
  hour: number;
  predictedEngagement: number;
  confidence: number;
  datetime: string;
}

interface Predictions {
  optimalTimes: OptimalTime[];
  modelVersion: string;
  accuracy: number;
}

export function MLModelDashboard() {
  const { user } = useAuth();
  const [model, setModel] = useState<MLModel | null>(null);
  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [training, setTraining] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postCount, setPostCount] = useState<number | null>(null);
  const [trainingProgress, setTrainingProgress] = useState(0);
  
  useEffect(() => {
    if (user) {
      loadModel();
      loadPostCount();
    }
  }, [user]);
  
  const loadPostCount = async () => {
    if (!user) return;
    try {
      const { count } = await supabase
        .from('scheduled_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'published')
        .not('impressions', 'is', null)
        .gt('impressions', 0);
      setPostCount(count || 0);
    } catch (error) {
      console.error('Failed to load post count:', error);
    }
  };
  
  const loadModel = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('ml-model-training', {
        body: { userId: user.id, action: 'get_active_model' }
      });
      
      if (data?.model) {
        setModel(data.model);
        await loadPredictions();
      }
    } catch (error) {
      console.error('Failed to load model:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadPredictions = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.functions.invoke('ml-model-training', {
        body: { 
          userId: user.id, 
          action: 'predict_optimal_times',
          modelData: { platform: 'all' }
        }
      });
      if (data?.success) {
        setPredictions(data);
      }
    } catch (error) {
      console.error('Failed to load predictions:', error);
    }
  };
  
  const trainNewModel = async () => {
    if (!user) return;
    
    // Check if enough posts
    if (postCount !== null && postCount < 30) {
      toast.error(`Need at least 30 published posts with engagement data. You have ${postCount}.`);
      return;
    }
    
    setTraining(true);
    setTrainingProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setTrainingProgress(prev => Math.min(prev + 10, 90));
    }, 500);
    
    try {
      const { data } = await supabase.functions.invoke('ml-model-training', {
        body: { userId: user.id, action: 'train_model' }
      });
      
      clearInterval(progressInterval);
      setTrainingProgress(100);
      
      if (data?.success) {
        toast.success('ML model trained successfully!');
        setModel(data.model);
        await loadPredictions();
      } else {
        toast.error(data?.message || 'Failed to train model');
      }
    } catch (error) {
      clearInterval(progressInterval);
      toast.error('Training failed: ' + (error as Error).message);
    } finally {
      setTraining(false);
      setTrainingProgress(0);
    }
  };
  
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>ML Audience Activity Model</CardTitle>
              <CardDescription>AI-powered optimal posting time predictions</CardDescription>
            </div>
          </div>
          
          {model ? (
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Button onClick={trainNewModel} disabled={training} className="gap-2">
              {training ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Training...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Train Model
                </>
              )}
            </Button>
          )}
        </CardHeader>
        
        <CardContent>
          {training && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Training progress</span>
                <span className="text-foreground">{trainingProgress}%</span>
              </div>
              <Progress value={trainingProgress} className="h-2" />
            </div>
          )}
          
          {model ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-muted-foreground text-sm mb-1">Training Samples</p>
                <p className="text-2xl font-bold text-foreground">{model.training_samples}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-muted-foreground text-sm mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-green-400">{model.accuracy_score?.toFixed(1)}%</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-muted-foreground text-sm mb-1">MAE</p>
                <p className="text-2xl font-bold text-foreground">{model.mean_absolute_error?.toFixed(2)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-muted-foreground text-sm mb-1">Version</p>
                <p className="text-lg font-mono text-muted-foreground truncate">{model.model_version?.slice(0, 12)}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No ML Model Yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                Train a machine learning model to get AI-powered posting time predictions based on your historical performance.
              </p>
              
              {postCount !== null && postCount < 30 ? (
                <Alert variant="destructive" className="max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Need 30+ published posts with engagement data to train model. You have {postCount}.
                  </AlertDescription>
                </Alert>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Requires at least 30 published posts with engagement data
                </p>
              )}
              
              {postCount !== null && postCount >= 30 && (
                <Button onClick={trainNewModel} disabled={training} className="mt-4 gap-2">
                  {training ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Training...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Train Model
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {model && model.feature_importance && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Feature Importance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(model.feature_importance)
              .sort((a, b) => (b[1] as number) - (a[1] as number))
              .slice(0, 5)
              .map(([feature, importance], idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground capitalize">{feature.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{((importance as number) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(importance as number) * 100} className="h-2" />
                </div>
              ))}
          </CardContent>
        </Card>
      )}
      
      {predictions && predictions.optimalTimes && predictions.optimalTimes.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Top 10 ML-Predicted Optimal Times
              </CardTitle>
              <Badge variant="outline">Next 7 days</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {predictions.optimalTimes.slice(0, 10).map((time, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(time.datetime).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(time.datetime).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-400">
                      {time.predictedEngagement.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {time.confidence.toFixed(0)}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {model && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <Button 
              onClick={trainNewModel} 
              disabled={training} 
              variant="outline" 
              className="w-full gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${training ? 'animate-spin' : ''}`} />
              Retrain Model with Latest Data
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Retrain to incorporate your latest posts and improve accuracy
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}