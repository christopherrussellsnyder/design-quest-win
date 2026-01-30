import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, Upload, Camera, ChevronRight, Image, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { HealthScoreBadge } from '@/components/insights/HealthScoreBadge';
import { AnalysisDetail } from '@/components/insights/AnalysisDetail';

interface UploadedAnalytics {
  id: string;
  platform: string;
  platform_confidence?: string | null;
  extracted_data: any;
  ai_insights: any;
  time_period_start: string | null;
  time_period_end: string | null;
  uploaded_at: string;
  image_url: string;
  trend_analysis?: any;
  benchmark_comparison?: any;
  pattern_recognition?: any;
  insights?: any;
  recommendations?: any;
  opportunities?: any;
  risks?: any;
  follow_up_questions?: string[] | null;
  summary?: any;
  overall_health_score?: number;
  performance_rating?: string;
}

export default function Insights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadedAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
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
      
      // Auto-select the first upload if available
      if (data && data.length > 0 && !selectedUpload) {
        setSelectedUpload(data[0]);
      }
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
    setUploadProgress('Uploading screenshot...');

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

      setUploadProgress('Extracting metrics...');

      // Convert to base64 for AI analysis
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        setUploadProgress('Analyzing trends...');
        
        // Call analyze-screenshot edge function
        const { data, error } = await supabase.functions.invoke('analyze-screenshot', {
          body: { 
            imageBase64: base64.split(',')[1],
            userId: user.id,
            screenshotUrl: publicUrl
          }
        });

        if (error) throw error;

        setUploadProgress('Generating insights...');

        toast.success('Screenshot analyzed successfully!');
        await loadUploads();
        
        // Select the newly uploaded analysis
        if (data?.analyticsId) {
          const { data: newUpload } = await supabase
            .from('uploaded_analytics')
            .select('*')
            .eq('id', data.analyticsId)
            .single();
          
          if (newUpload) {
            setSelectedUpload(newUpload);
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload screenshot');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      instagram: 'bg-pink-500/20 text-pink-400',
      facebook: 'bg-blue-500/20 text-blue-400',
      twitter: 'bg-sky-500/20 text-sky-400',
      tiktok: 'bg-slate-500/20 text-slate-300',
      linkedin: 'bg-blue-600/20 text-blue-500',
      google: 'bg-green-500/20 text-green-400',
      shopify: 'bg-emerald-500/20 text-emerald-400',
      youtube: 'bg-red-500/20 text-red-400',
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
                <p className="text-sm text-muted-foreground">
                  Upload analytics screenshots for AI-powered deep analysis
                </p>
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
                    {uploadProgress || 'Analyzing...'}
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
              Upload screenshots from Instagram, Facebook, TikTok, Google Analytics, or any other platform. 
              Our AI will extract metrics, analyze trends, benchmark against industry standards, 
              and provide actionable recommendations.
            </p>
            <Button onClick={() => document.getElementById('screenshot-upload')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Your First Screenshot
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Uploads List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Analytics History</h2>
                <Badge variant="outline">{uploads.length} uploads</Badge>
              </div>
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                {uploads.map((upload) => (
                  <Card 
                    key={upload.id}
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      selectedUpload?.id === upload.id ? 'border-primary ring-1 ring-primary/30' : ''
                    }`}
                    onClick={() => setSelectedUpload(upload)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Thumbnail or Health Score */}
                        <div className="flex-shrink-0">
                          {upload.overall_health_score ? (
                            <HealthScoreBadge score={upload.overall_health_score} size="sm" />
                          ) : upload.image_url ? (
                            <img 
                              src={upload.image_url} 
                              alt="Screenshot" 
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Image className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge className={getPlatformColor(upload.platform)}>
                              {upload.platform || 'Unknown'}
                            </Badge>
                            {upload.performance_rating && (
                              <Badge variant="outline" className="text-xs">
                                {upload.performance_rating}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(upload.uploaded_at), 'MMM d, yyyy')}
                          </p>
                          {upload.summary?.one_sentence_summary && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {upload.summary.one_sentence_summary}
                            </p>
                          )}
                        </div>
                        
                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Selected Upload Details */}
            <div className="lg:col-span-3">
              {selectedUpload ? (
                <AnalysisDetail upload={selectedUpload} />
              ) : (
                <div className="text-center py-20 text-muted-foreground">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an upload to view detailed analysis</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
