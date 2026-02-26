import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Brain, TrendingUp, Target, Zap, BarChart3, Loader2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts';

interface BehaviorPattern {
  id: string;
  platform: string;
  behavior_data: any;
  learning_confidence: number;
  last_analyzed: string;
}

interface LearningMetric {
  id: string;
  prediction_type: string;
  predicted_value: number;
  actual_value: number;
  variance: number;
  accuracy_score: number;
  created_at: string;
}

interface ContentTrend {
  id: string;
  platform: string;
  trend_type: string;
  content_category: string;
  trend_data: any;
  confidence_score: number;
  is_active: boolean;
  first_detected: string;
}

const ConfidenceBadge = ({ score }: { score: number }) => {
  const level = score >= 0.85 ? 'High' : score >= 0.7 ? 'Medium' : 'Low';
  const color = score >= 0.85 
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
    : score >= 0.7 
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
    : 'bg-red-500/20 text-red-400 border-red-500/30';
  const Icon = score >= 0.85 ? CheckCircle2 : score >= 0.7 ? Info : AlertTriangle;
  
  return (
    <Badge variant="outline" className={`${color} gap-1`}>
      <Icon className="w-3 h-3" />
      {level} ({Math.round(score * 100)}%)
    </Badge>
  );
};

export default function AudienceIntelligence() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [platform, setPlatform] = useState('instagram');
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [metrics, setMetrics] = useState<LearningMetric[]>([]);
  const [trends, setTrends] = useState<ContentTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadAll();
  }, [user, platform]);

  const loadAll = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [pRes, mRes, tRes] = await Promise.all([
        supabase.from('user_behavior_patterns').select('*').eq('user_id', user.id),
        supabase.from('ai_learning_metrics').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('content_trends').select('*').eq('is_active', true).order('last_updated', { ascending: false }).limit(20),
      ]);
      setPatterns(pRes.data || []);
      setMetrics(mRes.data || []);
      setTrends(tRes.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load intelligence data');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPattern = patterns.find(p => p.platform === platform);
  const behaviorData = currentPattern?.behavior_data || {};

  // Build radar chart data from content type preferences
  const contentPrefs = behaviorData.content_type_preferences || {};
  const radarData = Object.entries(contentPrefs).map(([key, val]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    score: Math.round((val as number) * 100),
    fullMark: 100,
  }));

  // Build topic bar chart
  const topicPrefs = behaviorData.topic_preferences || {};
  const topicData = Object.entries(topicPrefs).map(([key, val]) => ({
    topic: key.charAt(0).toUpperCase() + key.slice(1),
    preference: Math.round((val as number) * 100),
  }));

  // Accuracy over time line chart
  const accuracyData = metrics
    .filter(m => m.accuracy_score != null)
    .slice(0, 20)
    .reverse()
    .map((m, i) => ({
      index: i + 1,
      accuracy: Math.round((m.accuracy_score || 0) * 100),
      type: m.prediction_type,
    }));

  // Engagement pattern data
  const engPatterns = behaviorData.engagement_patterns || {};
  const engData = Object.entries(engPatterns).map(([key, val]) => ({
    type: key.replace('_ratio', '').charAt(0).toUpperCase() + key.replace('_ratio', '').slice(1),
    ratio: Math.round((val as number) * 100),
  }));

  // Hook effectiveness
  const hookData = Object.entries(behaviorData.hook_effectiveness || {}).map(([key, val]) => ({
    hook: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    effectiveness: Math.round((val as number) * 100),
  }));

  const avgAccuracy = metrics.length > 0 
    ? metrics.reduce((s, m) => s + (m.accuracy_score || 0), 0) / metrics.length 
    : 0;

  const platformTrends = trends.filter(t => t.platform === platform || !t.platform);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/ai-strategist')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Brain className="w-6 h-6 text-primary" />
                  Audience Intelligence
                </h1>
                <p className="text-sm text-muted-foreground">
                  Behavior patterns, predictions & AI learning progress
                </p>
              </div>
            </div>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Learning Confidence</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold">{Math.round((currentPattern?.learning_confidence || 0) * 100)}%</p>
                      <ConfidenceBadge score={currentPattern?.learning_confidence || 0} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Prediction Accuracy</p>
                    <p className="text-lg font-bold">{Math.round(avgAccuracy * 100)}%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Trends</p>
                    <p className="text-lg font-bold">{platformTrends.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Predictions Made</p>
                    <p className="text-lg font-bold">{metrics.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="behavior" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="behavior">Behavior Patterns</TabsTrigger>
                <TabsTrigger value="accuracy">Prediction Accuracy</TabsTrigger>
                <TabsTrigger value="trends">Trend Alerts</TabsTrigger>
                <TabsTrigger value="evolution">Behavior Evolution</TabsTrigger>
              </TabsList>

              {/* BEHAVIOR PATTERNS TAB */}
              <TabsContent value="behavior" className="space-y-6">
                {!currentPattern ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No behavior data for {platform} yet</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Upload analytics screenshots or generate strategies to start building audience behavior profiles.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Content Type Preferences Radar */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Content Type Preferences</CardTitle>
                        <CardDescription>Which formats your audience engages with most</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {radarData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={radarData}>
                              <PolarGrid stroke="hsl(var(--border))" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                              <Radar name="Preference" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                            </RadarChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-muted-foreground text-sm text-center py-10">No content type data yet</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Topic Preferences Bar Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Topic Preferences</CardTitle>
                        <CardDescription>Which themes resonate with your audience</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {topicData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={topicData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                              <YAxis type="category" dataKey="topic" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={100} />
                              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                              <Bar dataKey="preference" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-muted-foreground text-sm text-center py-10">No topic data yet</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Engagement Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Engagement Distribution</CardTitle>
                        <CardDescription>How your audience interacts with content</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {engData.length > 0 ? (
                          <div className="space-y-4">
                            {engData.map(d => (
                              <div key={d.type}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{d.type}</span>
                                  <span className="text-sm text-muted-foreground">{d.ratio}%</span>
                                </div>
                                <Progress value={d.ratio} className="h-2" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm text-center py-10">No engagement data yet</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Hook Effectiveness */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Hook Effectiveness</CardTitle>
                        <CardDescription>Which psychological triggers work best</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {hookData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={hookData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="hook" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                              <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                              <Bar dataKey="effectiveness" fill="hsl(350, 73%, 56%)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="text-muted-foreground text-sm text-center py-10">No hook data yet</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Additional Insights Cards */}
                    {behaviorData.time_preferences && (
                      <Card className="lg:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-base">Optimal Posting Times</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-3">
                            {(behaviorData.time_preferences.peak_hours || []).map((h: string) => (
                              <Badge key={h} variant="outline" className="text-sm py-1 px-3">{h}</Badge>
                            ))}
                            {(behaviorData.time_preferences.peak_days || []).map((d: string) => (
                              <Badge key={d} className="bg-primary/20 text-primary text-sm py-1 px-3">{d}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* PREDICTION ACCURACY TAB */}
              <TabsContent value="accuracy" className="space-y-6">
                {metrics.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No predictions tracked yet</h3>
                      <p className="text-muted-foreground">AI learning metrics will appear as predictions are made and compared to actual results.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Prediction Accuracy Over Time</CardTitle>
                        <CardDescription>
                          Tracking how the AI improves its predictions
                          <span className="ml-2"><ConfidenceBadge score={avgAccuracy} /></span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={accuracyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="index" label={{ value: 'Prediction #', position: 'insideBottom', offset: -5, fill: 'hsl(var(--muted-foreground))' }} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <YAxis domain={[0, 100]} label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                            <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--primary))' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Recent predictions table */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Recent Predictions vs Actual</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-2 text-muted-foreground font-medium">Type</th>
                                <th className="text-right py-2 text-muted-foreground font-medium">Predicted</th>
                                <th className="text-right py-2 text-muted-foreground font-medium">Actual</th>
                                <th className="text-right py-2 text-muted-foreground font-medium">Variance</th>
                                <th className="text-right py-2 text-muted-foreground font-medium">Accuracy</th>
                              </tr>
                            </thead>
                            <tbody>
                              {metrics.slice(0, 10).map(m => (
                                <tr key={m.id} className="border-b border-border/50">
                                  <td className="py-2 capitalize">{m.prediction_type?.replace('_', ' ')}</td>
                                  <td className="py-2 text-right">{m.predicted_value?.toFixed(2) ?? '-'}</td>
                                  <td className="py-2 text-right">{m.actual_value?.toFixed(2) ?? '-'}</td>
                                  <td className={`py-2 text-right ${(m.variance || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {m.variance != null ? `${(m.variance * 100).toFixed(1)}%` : '-'}
                                  </td>
                                  <td className="py-2 text-right">
                                    <ConfidenceBadge score={m.accuracy_score || 0} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* TREND ALERTS TAB */}
              <TabsContent value="trends" className="space-y-4">
                {platformTrends.length === 0 ? (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No active trends detected</h3>
                      <p className="text-muted-foreground">Trends will appear as the AI analyzes content patterns across the platform.</p>
                    </CardContent>
                  </Card>
                ) : (
                  platformTrends.map(trend => (
                    <Card key={trend.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              trend.trend_type === 'rising' ? 'bg-emerald-500/10' :
                              trend.trend_type === 'viral' ? 'bg-primary/10' :
                              trend.trend_type === 'declining' ? 'bg-red-500/10' :
                              'bg-muted'
                            }`}>
                              <TrendingUp className={`w-5 h-5 ${
                                trend.trend_type === 'rising' ? 'text-emerald-400' :
                                trend.trend_type === 'viral' ? 'text-primary' :
                                trend.trend_type === 'declining' ? 'text-red-400 rotate-180' :
                                'text-muted-foreground'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold capitalize">{trend.content_category || 'General'}</h4>
                                <Badge variant="outline" className={`text-xs capitalize ${
                                  trend.trend_type === 'rising' ? 'border-emerald-500/30 text-emerald-400' :
                                  trend.trend_type === 'viral' ? 'border-primary/30 text-primary' :
                                  trend.trend_type === 'declining' ? 'border-red-500/30 text-red-400' :
                                  ''
                                }`}>
                                  {trend.trend_type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">{trend.platform}</Badge>
                              </div>
                              {trend.trend_data && (
                                <div className="text-sm text-muted-foreground space-y-1">
                                  {trend.trend_data.format_trends && (
                                    <p>Formats: {(trend.trend_data.format_trends as string[]).join(', ')}</p>
                                  )}
                                  {trend.trend_data.hashtag_trends && (
                                    <p>Hashtags: {(trend.trend_data.hashtag_trends as string[]).join(', ')}</p>
                                  )}
                                  {trend.trend_data.hook_patterns && (
                                    <p>Hook patterns: {(trend.trend_data.hook_patterns as string[]).join(', ')}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <ConfidenceBadge score={trend.confidence_score || 0} />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* BEHAVIOR EVOLUTION TAB */}
              <TabsContent value="evolution" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Behavior Evolution Timeline</CardTitle>
                    <CardDescription>How your audience preferences shift over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentPattern ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">Learning Progress</p>
                            <Progress value={(currentPattern.learning_confidence || 0) * 100} className="h-3" />
                          </div>
                          <ConfidenceBadge score={currentPattern.learning_confidence || 0} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="border border-border rounded-lg p-4">
                            <h4 className="font-medium mb-2 text-sm">Personalization Level</h4>
                            <p className="text-2xl font-bold text-primary">
                              {currentPattern.learning_confidence >= 0.8 ? 'Highly Personalized' :
                               currentPattern.learning_confidence >= 0.5 ? 'Balanced' :
                               currentPattern.learning_confidence >= 0.3 ? 'Learning' : 'Initial'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {currentPattern.learning_confidence >= 0.8 ? '80% user-specific + 20% benchmarks' :
                               currentPattern.learning_confidence >= 0.5 ? '50% user-specific + 50% benchmarks' :
                               currentPattern.learning_confidence >= 0.3 ? '30% user-specific + 70% benchmarks' :
                               '100% industry benchmarks'}
                            </p>
                          </div>

                          <div className="border border-border rounded-lg p-4">
                            <h4 className="font-medium mb-2 text-sm">Last Analyzed</h4>
                            <p className="text-2xl font-bold">
                              {currentPattern.last_analyzed 
                                ? new Date(currentPattern.last_analyzed).toLocaleDateString() 
                                : 'Never'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {currentPattern.learning_confidence < 0.5 
                                ? 'Upload more screenshots to improve accuracy'
                                : 'Keep analyzing for deeper insights'}
                            </p>
                          </div>
                        </div>

                        {/* CTA Response Rates */}
                        {behaviorData.cta_response_rates && (
                          <div>
                            <h4 className="font-medium mb-3 text-sm">CTA Response Rates</h4>
                            <div className="space-y-3">
                              {Object.entries(behaviorData.cta_response_rates).map(([cta, rate]) => (
                                <div key={cta}>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm capitalize">{cta.replace('_', ' ')}</span>
                                    <span className="text-sm text-muted-foreground">{Math.round((rate as number) * 100)}%</span>
                                  </div>
                                  <Progress value={(rate as number) * 100} className="h-2" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Completion Rates */}
                        {behaviorData.completion_rates && (
                          <div>
                            <h4 className="font-medium mb-3 text-sm">Content Completion Rates</h4>
                            <div className="flex items-center gap-4">
                              <div className="border border-border rounded-lg p-3 flex-1 text-center">
                                <p className="text-2xl font-bold">{Math.round((behaviorData.completion_rates.avg || 0) * 100)}%</p>
                                <p className="text-xs text-muted-foreground">Average</p>
                              </div>
                              {behaviorData.completion_rates.by_type && Object.entries(behaviorData.completion_rates.by_type).map(([type, rate]) => (
                                <div key={type} className="border border-border rounded-lg p-3 flex-1 text-center">
                                  <p className="text-2xl font-bold">{Math.round((rate as number) * 100)}%</p>
                                  <p className="text-xs text-muted-foreground capitalize">{type}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground">No evolution data available for {platform} yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
