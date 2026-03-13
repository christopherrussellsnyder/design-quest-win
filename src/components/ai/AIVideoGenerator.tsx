import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Video, Play, Download, RefreshCw, Loader2, Sparkles, 
  User, Music, Type, Clock, Monitor, Zap, ChevronRight, 
  ChevronLeft, Check, AlertCircle, Trash2, Eye, Save
} from 'lucide-react';

// Avatar options
const AVATAR_OPTIONS = [
  { id: 'female_professional', name: 'Sarah', description: 'Professional female, 30s', gender: 'female', style: 'professional' },
  { id: 'male_professional', name: 'James', description: 'Professional male, 40s', gender: 'male', style: 'professional' },
  { id: 'female_casual', name: 'Emma', description: 'Casual female, 25s', gender: 'female', style: 'casual' },
  { id: 'male_casual', name: 'Alex', description: 'Casual male, 28s', gender: 'male', style: 'casual' },
  { id: 'female_energetic', name: 'Mia', description: 'Energetic female, 22s', gender: 'female', style: 'energetic' },
  { id: 'male_energetic', name: 'Chris', description: 'Energetic male, 24s', gender: 'male', style: 'energetic' },
];

// Background music options
const MUSIC_OPTIONS = [
  { id: 'none', name: 'No Music', icon: '🔇' },
  { id: 'upbeat', name: 'Upbeat', icon: '🎵' },
  { id: 'calm', name: 'Calm', icon: '🎹' },
  { id: 'corporate', name: 'Corporate', icon: '💼' },
  { id: 'inspiring', name: 'Inspiring', icon: '✨' },
  { id: 'dramatic', name: 'Dramatic', icon: '🎬' },
];

// Video style options
const STYLE_OPTIONS = [
  { id: 'professional', name: 'Professional', description: 'Clean, corporate look', icon: '💼' },
  { id: 'casual', name: 'Casual', description: 'Relaxed, friendly vibe', icon: '😊' },
  { id: 'energetic', name: 'Energetic', description: 'High energy, dynamic', icon: '⚡' },
  { id: 'minimalist', name: 'Minimalist', description: 'Simple, elegant design', icon: '🎯' },
  { id: 'bold', name: 'Bold', description: 'Eye-catching, vibrant', icon: '🔥' },
];

// Pricing tiers
const PRICING_TIERS = {
  starter: { name: 'Starter', videosPerMonth: 5, costPerVideo: 3.00 },
  pro: { name: 'Pro', videosPerMonth: 20, costPerVideo: 2.50 },
  business: { name: 'Business', videosPerMonth: -1, costPerVideo: 2.00 }, // -1 = unlimited
};

interface GeneratedVideo {
  id: string;
  title: string;
  script: string;
  video_url: string | null;
  thumbnail_url: string | null;
  status: string;
  duration: number;
  aspect_ratio: string;
  video_style: string;
  created_at: string;
  generation_cost: number;
}

export function AIVideoGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Form state
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [videoStyle, setVideoStyle] = useState('professional');
  const [duration, setDuration] = useState('30');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [selectedAvatar, setSelectedAvatar] = useState('female_professional');
  const [backgroundMusic, setBackgroundMusic] = useState('none');
  const [enableCaptions, setEnableCaptions] = useState(true);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  
  // History state
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  
  // Usage state
  const [usageThisMonth, setUsageThisMonth] = useState(0);
  const [userTier] = useState<keyof typeof PRICING_TIERS>('starter');
  
  // Load generated videos
  useEffect(() => {
    if (user?.id) {
      loadGeneratedVideos();
      loadUsageStats();
    }
  }, [user?.id]);
  
  const loadGeneratedVideos = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_generated_videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setGeneratedVideos((data as GeneratedVideo[]) || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };
  
  const loadUsageStats = async () => {
    if (!user?.id) return;
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    try {
      const { count, error } = await supabase
        .from('ai_generated_videos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString())
        .eq('status', 'completed');
      
      if (error) throw error;
      setUsageThisMonth(count || 0);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };
  
  // Simulate progress during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isGenerating && generationProgress < 95) {
      interval = setInterval(() => {
        setGenerationProgress(prev => {
          const increment = Math.random() * 5 + 1;
          return Math.min(prev + increment, 95);
        });
        setEstimatedTime(prev => Math.max(prev - 5, 0));
      }, 3000);
    }
    
    return () => clearInterval(interval);
  }, [isGenerating, generationProgress]);
  
  const checkUsageLimit = (): boolean => {
    const tier = PRICING_TIERS[userTier];
    if (tier.videosPerMonth === -1) return true; // Unlimited
    return usageThisMonth < tier.videosPerMonth;
  };
  
  const getEstimatedCost = (): string => {
    const tier = PRICING_TIERS[userTier];
    const durationMultiplier = parseInt(duration) === 60 ? 2 : parseInt(duration) === 15 ? 0.5 : 1;
    return (tier.costPerVideo * durationMultiplier).toFixed(2);
  };
  
  const generateVideo = async () => {
    if (!user?.id) {
      toast({ title: 'Please log in to generate videos', variant: 'destructive' });
      return;
    }
    
    if (!script.trim()) {
      toast({ title: 'Please enter a video script', variant: 'destructive' });
      return;
    }
    
    if (!checkUsageLimit()) {
      toast({ 
        title: 'Monthly limit reached', 
        description: `You've used all ${PRICING_TIERS[userTier].videosPerMonth} videos this month. Upgrade for more.`,
        variant: 'destructive' 
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(5);
    setEstimatedTime(parseInt(duration) * 4); // Rough estimate: 4 seconds per second of video
    
    try {
      // Create video record in database
      const { data: videoRecord, error: insertError } = await supabase
        .from('ai_generated_videos')
        .insert({
          user_id: user.id,
          title: title || `Video - ${new Date().toLocaleDateString()}`,
          script,
          target_audience: targetAudience,
          video_style: videoStyle,
          duration: parseInt(duration),
          aspect_ratio: aspectRatio,
          avatar_type: selectedAvatar,
          background_music: backgroundMusic,
          text_overlay_enabled: enableCaptions,
          status: 'processing',
          generation_cost: parseFloat(getEstimatedCost()),
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      setCurrentVideoId(videoRecord.id);
      setGenerationProgress(15);
      
      // Call edge function to generate video
      const { data, error } = await supabase.functions.invoke('generate-ai-video', {
        body: {
          videoId: videoRecord.id,
          script,
          targetAudience,
          videoStyle,
          duration: parseInt(duration),
          aspectRatio,
          avatarType: selectedAvatar,
          backgroundMusic,
          enableCaptions,
        }
      });
      
      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setGenerationProgress(100);
      setGeneratedVideoUrl(data.videoUrl || null);
      
      // Reload videos list
      await loadGeneratedVideos();
      await loadUsageStats();
      
      toast({ title: 'Video generated successfully!', description: 'Your video is ready for preview.' });
    } catch (error: any) {
      console.error('Video generation error:', error);
      
      // Update video record with error
      if (currentVideoId) {
        await supabase
          .from('ai_generated_videos')
          .update({ status: 'failed', error_message: error.message })
          .eq('id', currentVideoId);
      }
      
      toast({ 
        title: 'Failed to generate video', 
        description: error.message || 'Please try again later.',
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };
  
  const deleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from('ai_generated_videos')
        .delete()
        .eq('id', videoId);
      
      if (error) throw error;
      
      setGeneratedVideos(prev => prev.filter(v => v.id !== videoId));
      toast({ title: 'Video deleted' });
    } catch (error: any) {
      toast({ title: 'Failed to delete video', variant: 'destructive' });
    }
  };
  
  const resetForm = () => {
    setCurrentStep(1);
    setTitle('');
    setScript('');
    setTargetAudience('');
    setVideoStyle('professional');
    setDuration('30');
    setAspectRatio('16:9');
    setSelectedAvatar('female_professional');
    setBackgroundMusic('none');
    setEnableCaptions(true);
    setGeneratedVideoUrl(null);
    setCurrentVideoId(null);
  };
  
  const tierInfo = PRICING_TIERS[userTier];
  const remainingVideos = tierInfo.videosPerMonth === -1 
    ? 'Unlimited' 
    : `${tierInfo.videosPerMonth - usageThisMonth} of ${tierInfo.videosPerMonth}`;
  
  return (
    <div className="space-y-6">
      {/* Header with Usage Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Video Generator
          </h2>
          <p className="text-muted-foreground">Create professional video ads with intelligence avatars</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Videos remaining</div>
            <div className="font-semibold">{remainingVideos}</div>
          </div>
          <Badge variant={userTier === 'business' ? 'default' : 'secondary'}>
            {tierInfo.name}
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Create Video
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Video className="h-4 w-4" />
            My Videos ({generatedVideos.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step === currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : step < currentStep 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step < currentStep ? <Check className="h-5 w-5" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-16 sm:w-24 h-1 mx-2 ${step < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Step Labels */}
          <div className="flex justify-between text-sm text-muted-foreground mb-6">
            <span className={currentStep === 1 ? 'text-primary font-medium' : ''}>Script</span>
            <span className={currentStep === 2 ? 'text-primary font-medium' : ''}>Style</span>
            <span className={currentStep === 3 ? 'text-primary font-medium' : ''}>Avatar</span>
            <span className={currentStep === 4 ? 'text-primary font-medium' : ''}>Preview</span>
          </div>
          
          {/* Step 1: Script & Basics */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Video Script & Details
                </CardTitle>
                <CardDescription>
                  Write your video script and define your target audience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Video Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Summer Sale Announcement"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="script">Video Script *</Label>
                  <Textarea
                    id="script"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Write your video script here. The AI avatar will speak this text..."
                    className="min-h-[150px]"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{script.length} characters</span>
                    <span>Recommended: 100-300 characters for 30s video</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Input
                    id="audience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Young professionals aged 25-35 interested in fitness"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">60 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Aspect Ratio</Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait/Stories)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 2: Video Style */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Video Style & Music
                </CardTitle>
                <CardDescription>
                  Choose the overall look and feel of your video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Video Style</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {STYLE_OPTIONS.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setVideoStyle(style.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          videoStyle === style.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{style.icon}</div>
                        <div className="font-medium">{style.name}</div>
                        <div className="text-xs text-muted-foreground">{style.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <Label>Background Music</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {MUSIC_OPTIONS.map((music) => (
                      <button
                        key={music.id}
                        onClick={() => setBackgroundMusic(music.id)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          backgroundMusic === music.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-xl mb-1">{music.icon}</div>
                        <div className="text-xs font-medium">{music.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Text Captions</Label>
                    <div className="text-sm text-muted-foreground">
                      Show captions on the video
                    </div>
                  </div>
                  <Switch 
                    checked={enableCaptions} 
                    onCheckedChange={setEnableCaptions}
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Avatar Selection */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Choose AI Avatar
                </CardTitle>
                <CardDescription>
                  Select the AI presenter for your video
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        selectedAvatar === avatar.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary/60" />
                      </div>
                      <div className="font-medium">{avatar.name}</div>
                      <div className="text-xs text-muted-foreground">{avatar.description}</div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {avatar.style}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 4: Preview & Generate */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Review & Generate
                </CardTitle>
                <CardDescription>
                  Review your settings and generate your video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium">{duration} seconds</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Aspect Ratio</div>
                    <div className="font-medium">{aspectRatio}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Style</div>
                    <div className="font-medium capitalize">{videoStyle}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Avatar</div>
                    <div className="font-medium">{AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Music</div>
                    <div className="font-medium capitalize">{backgroundMusic}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Captions</div>
                    <div className="font-medium">{enableCaptions ? 'Enabled' : 'Disabled'}</div>
                  </div>
                </div>
                
                {/* Script Preview */}
                <div>
                  <Label className="mb-2 block">Script Preview</Label>
                  <div className="p-4 bg-muted rounded-lg text-sm">
                    {script || 'No script entered'}
                  </div>
                </div>
                
                {/* Cost Estimate */}
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div>
                    <div className="font-medium">Estimated Cost</div>
                    <div className="text-sm text-muted-foreground">
                      {remainingVideos} videos remaining this month
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ${getEstimatedCost()}
                  </div>
                </div>
                
                {/* Generation Progress */}
                {isGenerating && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Generating video...</span>
                      <span className="text-sm text-muted-foreground">
                        ~{Math.ceil(estimatedTime)}s remaining
                      </span>
                    </div>
                    <Progress value={generationProgress} className="h-2" />
                    <div className="text-xs text-muted-foreground text-center">
                      {generationProgress < 30 && 'Preparing script...'}
                      {generationProgress >= 30 && generationProgress < 60 && 'Generating avatar animation...'}
                      {generationProgress >= 60 && generationProgress < 90 && 'Rendering video...'}
                      {generationProgress >= 90 && 'Finalizing...'}
                    </div>
                  </div>
                )}
                
                {/* Generated Video Preview */}
                {generatedVideoUrl && (
                  <div className="space-y-3">
                    <Label>Generated Video</Label>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video 
                        src={generatedVideoUrl} 
                        controls 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <a href={generatedVideoUrl} download>
                          <Download className="mr-2 h-4 w-4" />
                          Download Video
                        </a>
                      </Button>
                      <Button variant="outline" onClick={resetForm}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Create Another
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1 || isGenerating}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {currentStep < 4 ? (
              <Button 
                onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                disabled={currentStep === 1 && !script.trim()}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={generateVideo}
                disabled={isGenerating || !script.trim() || !!generatedVideoUrl}
                className="min-w-[150px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Video
                  </>
                )}
              </Button>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Generated Videos</CardTitle>
              <CardDescription>
                Your previously generated videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingVideos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : generatedVideos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No videos generated yet</p>
                  <p className="text-sm">Create your first AI video above!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {generatedVideos.map((video) => (
                    <div 
                      key={video.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="w-24 h-16 bg-muted rounded flex items-center justify-center shrink-0">
                        {video.video_url ? (
                          <Play className="h-6 w-6 text-muted-foreground" />
                        ) : (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{video.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {video.duration}s • {video.aspect_ratio} • {video.video_style}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(video.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <Badge 
                        variant={
                          video.status === 'completed' ? 'default' : 
                          video.status === 'failed' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {video.status}
                      </Badge>
                      
                      <div className="flex gap-2">
                        {video.video_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={video.video_url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => deleteVideo(video.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
