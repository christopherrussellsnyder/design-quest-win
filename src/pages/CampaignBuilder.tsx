import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, ArrowRight, Check, Rocket, Target, Users, FileText, 
  DollarSign, Calendar, Sparkles, ChevronRight, Save, Zap, TrendingUp, CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Campaign Templates
const templates = [
  {
    id: 'product-launch',
    name: 'Product Launch',
    icon: '🚀',
    description: 'Launch a new product with maximum impact',
    objective: 'awareness',
    duration: 14,
    platforms: ['facebook', 'instagram', 'twitter'],
    frequency: '2 posts/day',
    color: '#8B5CF6'
  },
  {
    id: 'holiday-sale',
    name: 'Holiday Sale',
    icon: '🎁',
    description: 'Drive sales during holiday season',
    objective: 'conversions',
    duration: 7,
    platforms: ['facebook', 'instagram', 'twitter'],
    frequency: '3 posts/day',
    color: '#EF4444'
  },
  {
    id: 'brand-awareness',
    name: 'Brand Awareness',
    icon: '✨',
    description: 'Build brand recognition and reach',
    objective: 'awareness',
    duration: 28,
    platforms: ['facebook', 'instagram', 'twitter', 'linkedin'],
    frequency: '1-2 posts/day',
    color: '#3B82F6'
  },
  {
    id: 'event-promotion',
    name: 'Event Promotion',
    icon: '🎉',
    description: 'Promote and drive attendance to events',
    objective: 'event',
    duration: 21,
    platforms: ['facebook', 'linkedin', 'twitter'],
    frequency: '2 posts/day',
    color: '#F59E0B'
  },
  {
    id: 'lead-generation',
    name: 'Lead Generation',
    icon: '📈',
    description: 'Capture quality leads',
    objective: 'leads',
    duration: 28,
    platforms: ['linkedin', 'twitter', 'facebook'],
    frequency: '1-2 posts/day',
    color: '#10B981'
  },
  {
    id: 'engagement-boost',
    name: 'Engagement Campaign',
    icon: '💬',
    description: 'Boost audience interaction',
    objective: 'engagement',
    duration: 14,
    platforms: ['instagram', 'facebook', 'tiktok'],
    frequency: '2-3 posts/day',
    color: '#EC4899'
  },
  {
    id: 'scratch',
    name: 'Start from Scratch',
    icon: '⚡',
    description: 'Custom campaign - define everything yourself',
    objective: '',
    duration: 0,
    platforms: [],
    frequency: '',
    color: '#64748B'
  }
];

const objectives = [
  { id: 'awareness', label: 'Brand Awareness', icon: '✨', description: 'Increase visibility and reach' },
  { id: 'engagement', label: 'Engagement', icon: '💬', description: 'Boost likes, comments, shares' },
  { id: 'conversions', label: 'Conversions', icon: '🛒', description: 'Drive purchases and sign-ups' },
  { id: 'traffic', label: 'Traffic', icon: '🚗', description: 'Drive website visits' },
  { id: 'leads', label: 'Lead Generation', icon: '📈', description: 'Capture leads and contacts' },
  { id: 'sales', label: 'Sales', icon: '💰', description: 'Increase direct sales' },
  { id: 'event', label: 'Event Promotion', icon: '🎉', description: 'Promote events and webinars' }
];

const platforms = [
  { id: 'facebook', label: 'Facebook', icon: '📘' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'twitter', label: 'Twitter', icon: '🐦' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' }
];

const campaignColors = [
  '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'
];

const steps = [
  { id: 1, name: 'Template', icon: Sparkles },
  { id: 2, name: 'Details', icon: FileText },
  { id: 3, name: 'Platforms', icon: Target },
  { id: 4, name: 'Goals', icon: Target },
  { id: 5, name: 'Content', icon: FileText },
  { id: 6, name: 'Strategy', icon: Zap },
  { id: 7, name: 'Review', icon: Check }
];

interface Strategy {
  overview: {
    campaignType: string;
    duration: number;
    totalPosts: number;
    postsPerWeek: number;
    platforms: string[];
  };
  contentStrategy: {
    recommendedType: string;
    recommendedLength: string;
    themes: string[];
    postingFrequency: string;
  };
  timingStrategy: {
    bestTimeOfDay: string;
    optimalDays: string[];
    avoidWeekends: boolean;
  };
  weeklyBreakdown: Array<{
    week: number;
    focus: string;
    postsPlanned: number;
    objectives: string[];
  }>;
  expectedResults: {
    estimatedImpressions: number;
    estimatedEngagement: number;
    projectedEngagementRate: number;
    confidence: string;
  };
  keyTactics: string[];
  milestones: Array<{
    day: number;
    label: string;
    targets: {
      impressions: number;
      engagement: number;
      conversions: number;
    };
  }>;
}

export default function CampaignBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const editId = searchParams.get('edit');
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [strategy, setStrategy] = useState<Strategy | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    objective: '',
    start_date: '',
    end_date: '',
    total_budget: '',
    color: '#8B5CF6',
    platforms: [] as string[],
    target_impressions: '',
    target_reach: '',
    target_engagement: '',
    target_clicks: '',
    posts_per_day: 2,
    content_types: ['images', 'text'] as string[],
    hashtags: '',
    autoGenerateContent: true
  });

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const twoWeeksLater = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    setFormData(prev => ({
      ...prev,
      start_date: today.toISOString().split('T')[0],
      end_date: twoWeeksLater.toISOString().split('T')[0]
    }));
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template && templateId !== 'scratch') {
      const today = new Date();
      const endDate = new Date(today.getTime() + template.duration * 24 * 60 * 60 * 1000);
      setFormData(prev => ({
        ...prev,
        name: template.name + ' Campaign',
        objective: template.objective,
        platforms: template.platforms,
        color: template.color,
        end_date: endDate.toISOString().split('T')[0]
      }));
    }
    setCurrentStep(2);
  };

  const handlePlatformToggle = (platformId: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const handleContentTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      content_types: prev.content_types.includes(type)
        ? prev.content_types.filter(t => t !== type)
        : [...prev.content_types, type]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedTemplate !== null;
      case 2: return formData.name && formData.objective && formData.start_date && formData.end_date;
      case 3: return formData.platforms.length > 0;
      case 4: return true;
      case 5: return true;
      case 6: return strategy !== null;
      case 7: return true;
      default: return false;
    }
  };

  const generateStrategy = async () => {
    if (!user) return;
    
    setGeneratingStrategy(true);
    try {
      const { data, error } = await supabase.functions.invoke('campaign-intelligence', {
        body: {
          userId: user.id,
          action: 'generate_strategy',
          campaignData: {
            name: formData.name,
            description: formData.description,
            startDate: formData.start_date,
            endDate: formData.end_date,
            platforms: formData.platforms,
            objective: formData.objective,
            goals: {
              impressions: parseInt(formData.target_impressions) || 10000,
              engagement_rate: parseFloat(formData.target_engagement) || 3.5,
              conversions: parseInt(formData.target_clicks) || 50
            }
          }
        }
      });

      if (error) throw error;

      if (data?.strategy) {
        setStrategy(data.strategy);
        toast({
          title: 'Strategy Generated',
          description: 'AI has created an optimized campaign strategy'
        });
      }
    } catch (error) {
      console.error('Strategy generation error:', error);
      toast({
        title: 'Strategy Generation Failed',
        description: 'Could not generate strategy. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGeneratingStrategy(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast({
      title: 'Draft Saved',
      description: 'Your campaign draft has been saved'
    });
  };

  const handleLaunchCampaign = async () => {
    if (!formData.name || !user) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a campaign name',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('campaign-intelligence', {
        body: {
          userId: user.id,
          action: 'create_campaign',
          campaignData: {
            name: formData.name,
            description: formData.description,
            startDate: formData.start_date,
            endDate: formData.end_date,
            platforms: formData.platforms,
            goals: {
              impressions: parseInt(formData.target_impressions) || 10000,
              engagement_rate: parseFloat(formData.target_engagement) || 3.5,
              conversions: parseInt(formData.target_clicks) || 50
            },
            budget: parseFloat(formData.total_budget) || 0,
            autoGenerateContent: formData.autoGenerateContent,
            totalPosts: strategy?.overview?.totalPosts || 20
          }
        }
      });

      if (error) throw error;

      toast({
        title: '🎉 Campaign Created!',
        description: data?.message || 'Your campaign has been launched successfully'
      });
      
      navigate('/campaigns');
    } catch (error) {
      console.error('Campaign creation error:', error);
      toast({
        title: 'Campaign Creation Failed',
        description: 'Could not create campaign. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Choose a Template</h2>
              <p className="text-muted-foreground">Start with a template or build from scratch</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <Card 
                  key={template.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    selectedTemplate === template.id ? 'border-primary ring-2 ring-primary/20' : 'bg-card border-border'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardContent className="p-6">
                    <div className="text-4xl mb-3">{template.icon}</div>
                    <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    {template.id !== 'scratch' && (
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.duration} days
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {template.frequency}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Campaign Details</h2>
              <p className="text-muted-foreground">Define your campaign basics</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Summer Product Launch 2025"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your campaign goals and strategy..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>Campaign Goal *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {objectives.map(obj => (
                    <Card
                      key={obj.id}
                      className={`cursor-pointer transition-all ${
                        formData.objective === obj.id 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, objective: obj.id }))}
                    >
                      <CardContent className="p-3 text-center">
                        <span className="text-2xl">{obj.icon}</span>
                        <p className="text-sm font-medium text-foreground mt-1">{obj.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="budget">Budget (Optional)</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="budget"
                    type="number"
                    value={formData.total_budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_budget: e.target.value }))}
                    placeholder="5000"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Campaign Color</Label>
                <div className="flex gap-2 mt-2">
                  {campaignColors.map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Target Platforms</h2>
              <p className="text-muted-foreground">Select where you want to publish</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {platforms.map(platform => (
                <Card
                  key={platform.id}
                  className={`cursor-pointer transition-all ${
                    formData.platforms.includes(platform.id)
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                  onClick={() => handlePlatformToggle(platform.id)}
                >
                  <CardContent className="p-4 text-center">
                    <span className="text-3xl">{platform.icon}</span>
                    <p className="font-medium text-foreground mt-2">{platform.label}</p>
                    {formData.platforms.includes(platform.id) && (
                      <Check className="h-4 w-4 text-primary mx-auto mt-2" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              Selected: {formData.platforms.length} platform{formData.platforms.length !== 1 ? 's' : ''}
            </p>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Set Goals & KPIs</h2>
              <p className="text-muted-foreground">Define success metrics for your campaign</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_impressions">Target Impressions</Label>
                <Input
                  id="target_impressions"
                  type="number"
                  value={formData.target_impressions}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_impressions: e.target.value }))}
                  placeholder="100000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="target_reach">Target Reach</Label>
                <Input
                  id="target_reach"
                  type="number"
                  value={formData.target_reach}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_reach: e.target.value }))}
                  placeholder="50000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="target_engagement">Target Engagement</Label>
                <Input
                  id="target_engagement"
                  type="number"
                  value={formData.target_engagement}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_engagement: e.target.value }))}
                  placeholder="10000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="target_clicks">Target Clicks</Label>
                <Input
                  id="target_clicks"
                  type="number"
                  value={formData.target_clicks}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_clicks: e.target.value }))}
                  placeholder="5000"
                  className="mt-1"
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              💡 Leave blank if you don't have specific targets. You can always update these later.
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Content Strategy</h2>
              <p className="text-muted-foreground">Plan your content approach</p>
            </div>

            <div>
              <Label>Posts per Day</Label>
              <div className="flex items-center gap-4 mt-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.posts_per_day}
                  onChange={(e) => setFormData(prev => ({ ...prev, posts_per_day: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-lg font-semibold text-foreground w-12 text-center">
                  {formData.posts_per_day}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ≈ {formData.posts_per_day * 7} posts/week
              </p>
            </div>

            <div>
              <Label>Content Types</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {['images', 'videos', 'text', 'links', 'carousels'].map(type => (
                  <Badge
                    key={type}
                    variant={formData.content_types.includes(type) ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => handleContentTypeToggle(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="hashtags">Campaign Hashtags</Label>
              <Input
                id="hashtags"
                value={formData.hashtags}
                onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                placeholder="#summersale #newproduct #launch2025"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separate hashtags with spaces
              </p>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">AI Campaign Strategy</h2>
                <p className="text-muted-foreground">Generate an optimized strategy based on your performance data</p>
              </div>
              <Button 
                onClick={generateStrategy} 
                disabled={generatingStrategy}
                className="gap-2"
              >
                {generatingStrategy ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    {strategy ? 'Regenerate Strategy' : 'Generate Strategy'}
                  </>
                )}
              </Button>
            </div>

            {!strategy && !generatingStrategy && (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <Zap className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to Generate Your Strategy</h3>
                  <p className="text-muted-foreground mb-4">
                    Our AI will analyze your past performance and create an optimized campaign strategy with timing recommendations, content tactics, and expected results.
                  </p>
                  <label className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Checkbox 
                      checked={formData.autoGenerateContent}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoGenerateContent: checked as boolean }))}
                    />
                    Auto-generate content calendar with optimized posting times
                  </label>
                </CardContent>
              </Card>
            )}

            {strategy && (
              <div className="space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-card border-border">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Duration</p>
                      <p className="text-2xl font-bold text-foreground">{strategy.overview.duration} days</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Total Posts</p>
                      <p className="text-2xl font-bold text-foreground">{strategy.overview.totalPosts}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Posts/Week</p>
                      <p className="text-2xl font-bold text-foreground">{strategy.overview.postsPerWeek}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card border-border">
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-1">Est. Engagement</p>
                      <p className="text-2xl font-bold text-primary">{strategy.expectedResults.projectedEngagementRate.toFixed(1)}%</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Key Tactics */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Key Tactics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {strategy.keyTactics.map((tactic, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{tactic}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Weekly Breakdown */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Weekly Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {strategy.weeklyBreakdown.map((week, idx) => (
                      <div key={idx} className="bg-secondary/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-foreground">Week {week.week}: {week.focus}</h4>
                          <Badge variant="secondary">{week.postsPlanned} posts</Badge>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {week.objectives.map((obj, oidx) => (
                            <li key={oidx}>• {obj}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Auto-generate toggle */}
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <Checkbox 
                    checked={formData.autoGenerateContent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoGenerateContent: checked as boolean }))}
                  />
                  Auto-generate {strategy.overview.totalPosts} draft posts scheduled to optimal times
                </label>
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Review & Launch</h2>
              <p className="text-muted-foreground">Confirm your campaign details</p>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  />
                  <h3 className="text-xl font-semibold text-foreground">{formData.name || 'Untitled Campaign'}</h3>
                </div>

                {formData.description && (
                  <p className="text-muted-foreground">{formData.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">Goal</p>
                    <p className="font-medium text-foreground">
                      {objectives.find(o => o.id === formData.objective)?.icon}{' '}
                      {objectives.find(o => o.id === formData.objective)?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium text-foreground">
                      {formData.start_date} - {formData.end_date}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Platforms</p>
                    <div className="flex gap-1">
                      {formData.platforms.map(p => (
                        <span key={p}>{platforms.find(pl => pl.id === p)?.icon}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium text-foreground">
                      {formData.total_budget ? `$${formData.total_budget}` : 'Not set'}
                    </p>
                  </div>
                </div>

                {strategy && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">AI Strategy Summary</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">{strategy.overview.totalPosts} posts planned</Badge>
                      <Badge variant="secondary">{strategy.expectedResults.projectedEngagementRate.toFixed(1)}% expected engagement</Badge>
                      <Badge variant="secondary">{strategy.expectedResults.confidence} confidence</Badge>
                    </div>
                    {formData.autoGenerateContent && (
                      <p className="text-sm text-primary mt-2">
                        ✓ {strategy.overview.totalPosts} draft posts will be auto-created
                      </p>
                    )}
                  </div>
                )}

                {(formData.target_impressions || formData.target_engagement) && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">Goals</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.target_impressions && (
                        <Badge variant="secondary">{parseInt(formData.target_impressions).toLocaleString()} impressions</Badge>
                      )}
                      {formData.target_reach && (
                        <Badge variant="secondary">{parseInt(formData.target_reach).toLocaleString()} reach</Badge>
                      )}
                      {formData.target_engagement && (
                        <Badge variant="secondary">{parseInt(formData.target_engagement).toLocaleString()} engagement</Badge>
                      )}
                      {formData.target_clicks && (
                        <Badge variant="secondary">{parseInt(formData.target_clicks).toLocaleString()} clicks</Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {editId ? 'Edit Campaign' : 'Create Campaign'}
              </h1>
              <p className="text-sm text-muted-foreground">Step {currentStep} of 7</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-border bg-background">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStep > step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${
                    currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 md:w-24 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-secondary'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 7) * 100} className="h-1" />
        </div>
      </div>

      {/* Main Content */}
      <main className="container px-4 py-8">
        {renderStepContent()}
      </main>

      {/* Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="container flex items-center justify-between px-4 py-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {currentStep < 7 ? (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
                Save as Draft
              </Button>
              <Button onClick={handleLaunchCampaign} disabled={saving}>
                <Rocket className="h-4 w-4 mr-2" />
                {saving ? 'Creating...' : 'Launch Campaign'}
              </Button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
