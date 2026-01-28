import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Upload, Camera, TrendingUp, TrendingDown, BarChart3, 
  Lightbulb, Calendar, Target, Sparkles, ChevronRight, Image,
  Eye, Heart, MessageCircle, Share2, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UploadedAnalytics {
  id: string;
  platform: string;
  extracted_data: any;
  ai_insights: any;
  time_period_start: string;
  time_period_end: string;
  uploaded_at: string;
  image_url: string;
}

export default function Insights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadedAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<UploadedAnalytics | null>(null);

  useEffect(() => {
    if (user) {
      loadUploads();
    }
  }, [user]);

  const loadUploads = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('uploaded_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setUploads(data || []);
    } catch (error) {
      console.error('Error loading uploads:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('analytics-screenshots')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('analytics-screenshots')
        .getPublicUrl(fileName);

      // Convert to base64 for AI analysis
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        // Call analyze-screenshot edge function
        const { data, error } = await supabase.functions.invoke('analyze-screenshot', {
          body: { 
            imageBase64: base64.split(',')[1],
            userId: user.id,
            screenshotUrl: publicUrl
          }
        });

        if (error) throw error;

        toast.success('Screenshot analyzed successfully!');
        loadUploads();
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload screenshot');
    } finally {
      setIsUploading(false);
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'bg-pink-500/20 text-pink-400',
      facebook: 'bg-blue-500/20 text-blue-400',
      twitter: 'bg-sky-500/20 text-sky-400',
      tiktok: 'bg-slate-500/20 text-slate-400',
      linkedin: 'bg-blue-600/20 text-blue-500',
      google: 'bg-green-500/20 text-green-400',
      shopify: 'bg-emerald-500/20 text-emerald-400',
    };
    return colors[platform?.toLowerCase()] || 'bg-primary/20 text-primary';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/ai-strategist')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Insights</h1>
                <p className="text-sm text-muted-foreground">Upload analytics screenshots for AI-powered insights</p>
              </div>
            </div>
            <div>
              <input
                type="file"
                id="screenshot-upload"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button 
                onClick={() => document.getElementById('screenshot-upload')?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Screenshot
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : uploads.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No analytics uploads yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upload screenshots from Instagram, Facebook, Google Analytics, or any other platform. 
              Our AI will extract metrics and provide actionable insights.
            </p>
            <Button onClick={() => document.getElementById('screenshot-upload')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Screenshot
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Uploads List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold">Recent Uploads</h2>
              <div className="space-y-3">
                {uploads.map((upload) => (
                  <Card 
                    key={upload.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${selectedUpload?.id === upload.id ? 'border-primary' : ''}`}
                    onClick={() => setSelectedUpload(upload)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {upload.image_url ? (
                          <img 
                            src={upload.image_url} 
                            alt="Screenshot" 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                            <Image className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Badge className={getPlatformColor(upload.platform)}>
                            {upload.platform || 'Unknown'}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(upload.uploaded_at), 'MMM d, yyyy')}
                          </p>
                          {upload.extracted_data?.total_engagement && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {upload.extracted_data.total_engagement.toLocaleString()} engagements
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Selected Upload Details */}
            <div className="lg:col-span-2 space-y-6">
              {selectedUpload ? (
                <>
                  {/* Metrics Overview */}
                  {selectedUpload.extracted_data && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-primary" />
                          Extracted Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {selectedUpload.extracted_data.impressions && (
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                              <Eye className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                              <p className="text-2xl font-bold">{selectedUpload.extracted_data.impressions.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Impressions</p>
                            </div>
                          )}
                          {selectedUpload.extracted_data.reach && (
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                              <Target className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                              <p className="text-2xl font-bold">{selectedUpload.extracted_data.reach.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Reach</p>
                            </div>
                          )}
                          {selectedUpload.extracted_data.engagement_rate && (
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                              <Heart className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                              <p className="text-2xl font-bold">{selectedUpload.extracted_data.engagement_rate}%</p>
                              <p className="text-xs text-muted-foreground">Engagement Rate</p>
                            </div>
                          )}
                          {selectedUpload.extracted_data.followers && (
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                              <Share2 className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                              <p className="text-2xl font-bold">{selectedUpload.extracted_data.followers.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Followers</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Insights */}
                  {selectedUpload.ai_insights && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          AI Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedUpload.ai_insights.key_insights?.map((insight: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                        
                        {selectedUpload.ai_insights.recommendations?.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-3">Recommendations</h4>
                            <ul className="space-y-2">
                              {selectedUpload.ai_insights.recommendations.map((rec: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <Target className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Screenshot Preview */}
                  {selectedUpload.image_url && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Original Screenshot</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <img 
                          src={selectedUpload.image_url} 
                          alt="Analytics Screenshot" 
                          className="w-full rounded-lg"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1"
                      onClick={() => navigate('/ai-strategist')}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Strategy Based on This Data
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an upload to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
