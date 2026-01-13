import { useState, useEffect } from 'react';
import { 
  Building2, Users, Target, Megaphone, Palette, 
  ChevronRight, ChevronLeft, Check, Loader2, Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const INDUSTRY_OPTIONS = [
  'SaaS', 'E-commerce', 'Local Business', 'Consulting', 'Healthcare', 'Finance',
  'Fitness', 'Real Estate', 'Education', 'Travel', 'Food & Beverage', 'Fashion',
  'Technology', 'Marketing Agency', 'Legal Services', 'Non-Profit', 'Manufacturing',
  'Entertainment', 'Sports', 'Beauty & Wellness', 'Home Services', 'Automotive',
  'Insurance', 'Retail', 'B2B Services', 'Media & Publishing', 'Architecture',
  'Photography', 'Event Planning', 'Pet Services', 'Agriculture', 'Energy',
  'Transportation', 'Construction', 'Telecommunications', 'Gaming', 'Art & Design',
  'Music', 'Coaching', 'HR & Recruiting', 'Cybersecurity', 'IoT', 'AI & ML',
  'Blockchain', 'Sustainability', 'Luxury Goods', 'Children & Family', 'Senior Care',
  'Mental Health', 'Dental', 'Veterinary'
];

const BUSINESS_GOALS = [
  { id: 'brand_awareness', label: 'Brand Awareness', icon: '✨' },
  { id: 'lead_generation', label: 'Lead Generation', icon: '📈' },
  { id: 'sales', label: 'Direct Sales', icon: '💰' },
  { id: 'engagement', label: 'Community Engagement', icon: '💬' },
  { id: 'traffic', label: 'Website Traffic', icon: '🌐' },
  { id: 'app_installs', label: 'App Installs', icon: '📱' },
  { id: 'retention', label: 'Customer Retention', icon: '🔄' },
  { id: 'thought_leadership', label: 'Thought Leadership', icon: '💡' }
];

const MARKETING_CHANNELS = [
  'Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube',
  'Pinterest', 'Email Marketing', 'SEO', 'Google Ads', 'Influencer Marketing',
  'Content Marketing', 'Podcast', 'Webinars', 'Events', 'PR'
];

const BRAND_TONES = [
  { value: 'professional', label: 'Professional', desc: 'Formal, authoritative, expert' },
  { value: 'casual', label: 'Casual', desc: 'Relaxed, conversational, approachable' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm, welcoming, personable' },
  { value: 'authoritative', label: 'Authoritative', desc: 'Expert, confident, commanding' },
  { value: 'playful', label: 'Playful', desc: 'Fun, witty, entertaining' },
  { value: 'educational', label: 'Educational', desc: 'Informative, helpful, teaching' },
  { value: 'inspirational', label: 'Inspirational', desc: 'Motivating, uplifting, empowering' },
  { value: 'luxury', label: 'Luxury', desc: 'Elegant, exclusive, sophisticated' }
];

const PRICE_POINTS = [
  { value: 'budget', label: 'Budget', desc: 'Affordable, value-focused' },
  { value: 'mid-range', label: 'Mid-Range', desc: 'Quality at fair prices' },
  { value: 'premium', label: 'Premium', desc: 'Higher-end, quality-focused' },
  { value: 'luxury', label: 'Luxury', desc: 'Exclusive, top-tier pricing' }
];

interface BusinessProfile {
  business_name: string;
  industry_niche: string;
  business_description: string;
  products_services: string;
  unique_value_proposition: string;
  target_age_min: number;
  target_age_max: number;
  target_genders: string[];
  target_locations: string[];
  target_interests: string[];
  average_order_value: number;
  business_goals: string[];
  current_marketing_channels: string[];
  monthly_marketing_budget: number;
  competitor_names: string[];
  pain_points_challenges: string;
  brand_voice_tone: string;
  content_themes: string[];
  price_point: string;
  past_successful_campaigns: string;
}

interface BusinessProfileWizardProps {
  onComplete: () => void;
  onClose: () => void;
}

const STEPS = [
  { id: 1, title: 'Business Info', icon: Building2, desc: 'Tell us about your business' },
  { id: 2, title: 'Target Audience', icon: Users, desc: 'Define your ideal customers' },
  { id: 3, title: 'Goals & Metrics', icon: Target, desc: 'Set your objectives' },
  { id: 4, title: 'Marketing', icon: Megaphone, desc: 'Your marketing experience' },
  { id: 5, title: 'Brand Voice', icon: Palette, desc: 'Define your style' }
];

export function BusinessProfileWizard({ onComplete, onClose }: BusinessProfileWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  
  const [profile, setProfile] = useState<BusinessProfile>({
    business_name: '',
    industry_niche: '',
    business_description: '',
    products_services: '',
    unique_value_proposition: '',
    target_age_min: 18,
    target_age_max: 65,
    target_genders: ['all'],
    target_locations: [],
    target_interests: [],
    average_order_value: 0,
    business_goals: [],
    current_marketing_channels: [],
    monthly_marketing_budget: 0,
    competitor_names: [],
    pain_points_challenges: '',
    brand_voice_tone: 'professional',
    content_themes: [],
    price_point: 'mid-range',
    past_successful_campaigns: ''
  });

  const [locationInput, setLocationInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [competitorInput, setCompetitorInput] = useState('');
  const [themeInput, setThemeInput] = useState('');

  useEffect(() => {
    loadExistingProfile();
  }, [user]);

  const loadExistingProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setExistingProfile(data);
      const d = data as any;
      setProfile({
        business_name: d.business_name || '',
        industry_niche: d.industry_niche || d.niche || '',
        business_description: d.business_description || '',
        products_services: d.products_services || '',
        unique_value_proposition: d.unique_value_proposition || '',
        target_age_min: d.target_age_min || 18,
        target_age_max: d.target_age_max || 65,
        target_genders: d.target_genders || ['all'],
        target_locations: d.target_locations || [],
        target_interests: d.target_interests || [],
        average_order_value: d.average_order_value || 0,
        business_goals: d.business_goals || [],
        current_marketing_channels: d.current_marketing_channels || [],
        monthly_marketing_budget: d.monthly_marketing_budget || 0,
        competitor_names: d.competitor_names || [],
        pain_points_challenges: d.pain_points_challenges || '',
        brand_voice_tone: d.brand_voice_tone || 'professional',
        content_themes: d.content_themes || [],
        price_point: d.price_point || 'mid-range',
        past_successful_campaigns: d.past_successful_campaigns || ''
      });
    }
  };

  const updateProfile = (field: keyof BusinessProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: keyof BusinessProfile, value: string, inputSetter: (v: string) => void) => {
    if (!value.trim()) return;
    const current = profile[field] as string[];
    if (!current.includes(value.trim())) {
      updateProfile(field, [...current, value.trim()]);
    }
    inputSetter('');
  };

  const removeFromArray = (field: keyof BusinessProfile, value: string) => {
    const current = profile[field] as string[];
    updateProfile(field, current.filter(item => item !== value));
  };

  const toggleArrayItem = (field: keyof BusinessProfile, value: string) => {
    const current = profile[field] as string[];
    if (current.includes(value)) {
      updateProfile(field, current.filter(item => item !== value));
    } else {
      updateProfile(field, [...current, value]);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const profileData = {
        user_id: user.id,
        ...profile,
        target_customer_demographics: {
          age_range: [profile.target_age_min, profile.target_age_max],
          genders: profile.target_genders,
          locations: profile.target_locations,
          interests: profile.target_interests
        }
      };

      if (existingProfile) {
        const { error } = await supabase
          .from('business_profiles')
          .update(profileData)
          .eq('id', existingProfile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_profiles')
          .insert(profileData);
        if (error) throw error;
      }

      toast.success('Business profile saved successfully!');
      onComplete();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return profile.business_name && profile.industry_niche;
      case 2:
        return true;
      case 3:
        return profile.business_goals.length > 0;
      case 4:
        return true;
      case 5:
        return profile.brand_voice_tone;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                placeholder="Enter your business name"
                value={profile.business_name}
                onChange={(e) => updateProfile('business_name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industry / Niche *</Label>
              <Select value={profile.industry_niche} onValueChange={(v) => updateProfile('industry_niche', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {INDUSTRY_OPTIONS.map(ind => (
                    <SelectItem key={ind} value={ind.toLowerCase().replace(/ /g, '_')}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what your business does, who you serve, and what makes you unique..."
                value={profile.business_description}
                onChange={(e) => updateProfile('business_description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="products">Main Products / Services</Label>
              <Textarea
                id="products"
                placeholder="List your main products or services..."
                value={profile.products_services}
                onChange={(e) => updateProfile('products_services', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uvp">Unique Value Proposition</Label>
              <Textarea
                id="uvp"
                placeholder="What makes your business different from competitors?"
                value={profile.unique_value_proposition}
                onChange={(e) => updateProfile('unique_value_proposition', e.target.value)}
                rows={2}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Target Age Range</Label>
              <div className="px-2">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>{profile.target_age_min} years</span>
                  <span>{profile.target_age_max} years</span>
                </div>
                <Slider
                  value={[profile.target_age_min, profile.target_age_max]}
                  min={13}
                  max={80}
                  step={1}
                  onValueChange={([min, max]) => {
                    updateProfile('target_age_min', min);
                    updateProfile('target_age_max', max);
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Genders</Label>
              <div className="flex flex-wrap gap-2">
                {['all', 'male', 'female', 'non-binary'].map(gender => (
                  <Button
                    key={gender}
                    variant={profile.target_genders.includes(gender) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (gender === 'all') {
                        updateProfile('target_genders', ['all']);
                      } else {
                        const newGenders = profile.target_genders.filter(g => g !== 'all');
                        if (newGenders.includes(gender)) {
                          updateProfile('target_genders', newGenders.filter(g => g !== gender));
                        } else {
                          updateProfile('target_genders', [...newGenders, gender]);
                        }
                      }
                    }}
                  >
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Locations</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a location (city, country, region)"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('target_locations', locationInput, setLocationInput))}
                />
                <Button variant="outline" onClick={() => addToArray('target_locations', locationInput, setLocationInput)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.target_locations.map(loc => (
                  <Badge key={loc} variant="secondary" className="cursor-pointer" onClick={() => removeFromArray('target_locations', loc)}>
                    {loc} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Interests</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an interest (e.g., fitness, technology)"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('target_interests', interestInput, setInterestInput))}
                />
                <Button variant="outline" onClick={() => addToArray('target_interests', interestInput, setInterestInput)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.target_interests.map(int => (
                  <Badge key={int} variant="secondary" className="cursor-pointer" onClick={() => removeFromArray('target_interests', int)}>
                    {int} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Business Goals *</Label>
              <p className="text-sm text-muted-foreground">Select all that apply</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {BUSINESS_GOALS.map(goal => (
                  <Button
                    key={goal.id}
                    variant={profile.business_goals.includes(goal.id) ? 'default' : 'outline'}
                    className="justify-start h-auto py-3"
                    onClick={() => toggleArrayItem('business_goals', goal.id)}
                  >
                    <span className="mr-2">{goal.icon}</span>
                    {goal.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aov">Average Order Value ($)</Label>
              <Input
                id="aov"
                type="number"
                placeholder="e.g., 50"
                value={profile.average_order_value || ''}
                onChange={(e) => updateProfile('average_order_value', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Monthly Marketing Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="e.g., 1000"
                value={profile.monthly_marketing_budget || ''}
                onChange={(e) => updateProfile('monthly_marketing_budget', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Price Point</Label>
              <div className="grid grid-cols-2 gap-2">
                {PRICE_POINTS.map(pp => (
                  <Button
                    key={pp.value}
                    variant={profile.price_point === pp.value ? 'default' : 'outline'}
                    className="flex-col h-auto py-3"
                    onClick={() => updateProfile('price_point', pp.value)}
                  >
                    <span className="font-medium">{pp.label}</span>
                    <span className="text-xs opacity-70">{pp.desc}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Current Marketing Channels</Label>
              <p className="text-sm text-muted-foreground">Select the channels you're currently using</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {MARKETING_CHANNELS.map(channel => (
                  <Button
                    key={channel}
                    variant={profile.current_marketing_channels.includes(channel) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleArrayItem('current_marketing_channels', channel)}
                  >
                    {channel}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Main Competitors</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add competitor name"
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('competitor_names', competitorInput, setCompetitorInput))}
                />
                <Button variant="outline" onClick={() => addToArray('competitor_names', competitorInput, setCompetitorInput)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.competitor_names.map(comp => (
                  <Badge key={comp} variant="secondary" className="cursor-pointer" onClick={() => removeFromArray('competitor_names', comp)}>
                    {comp} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenges">Pain Points & Challenges</Label>
              <Textarea
                id="challenges"
                placeholder="What are your biggest marketing challenges?"
                value={profile.pain_points_challenges}
                onChange={(e) => updateProfile('pain_points_challenges', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="success">Past Successful Campaigns</Label>
              <Textarea
                id="success"
                placeholder="Describe any campaigns that worked well for you..."
                value={profile.past_successful_campaigns}
                onChange={(e) => updateProfile('past_successful_campaigns', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Brand Voice & Tone *</Label>
              <p className="text-sm text-muted-foreground">How do you want your brand to sound?</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {BRAND_TONES.map(tone => (
                  <Button
                    key={tone.value}
                    variant={profile.brand_voice_tone === tone.value ? 'default' : 'outline'}
                    className="flex-col h-auto py-3"
                    onClick={() => updateProfile('brand_voice_tone', tone.value)}
                  >
                    <span className="font-medium">{tone.label}</span>
                    <span className="text-xs opacity-70">{tone.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content Themes</Label>
              <p className="text-sm text-muted-foreground">Add topics you want to cover in your content</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a content theme (e.g., tutorials, behind-the-scenes)"
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('content_themes', themeInput, setThemeInput))}
                />
                <Button variant="outline" onClick={() => addToArray('content_themes', themeInput, setThemeInput)}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.content_themes.map(theme => (
                  <Badge key={theme} variant="secondary" className="cursor-pointer" onClick={() => removeFromArray('content_themes', theme)}>
                    {theme} ×
                  </Badge>
                ))}
              </div>
            </div>

            <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Profile Complete!</p>
                    <p className="text-sm text-muted-foreground">
                      Once you save, our AI will use this information to generate personalized 30-day campaign strategies tailored to your business.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Business Profile Setup</CardTitle>
              <CardDescription>Help us understand your business to create personalized strategies</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-4">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep > step.id 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : currentStep === step.id 
                        ? 'border-primary text-primary' 
                        : 'border-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm font-medium">{STEPS[currentStep - 1].title}</p>
            <p className="text-xs text-muted-foreground">{STEPS[currentStep - 1].desc}</p>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto py-6">
          {renderStepContent()}
        </CardContent>
        
        <div className="border-t p-4 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button
              onClick={() => setCurrentStep(prev => Math.min(STEPS.length, prev + 1))}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving || !canProceed()}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}