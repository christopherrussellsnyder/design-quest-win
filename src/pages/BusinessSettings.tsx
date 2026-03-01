import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface BusinessSettings {
  business_name: string;
  industry: string;
  business_type: string;
  target_audience: {
    age_range: string;
    demographics: string;
    psychographics: string;
    pain_points: string;
  };
  brand_voice: string;
  products_services: string[];
  geographic_focus: string;
  price_range: string;
  marketing_goals: string[];
  preferred_platforms: string[];
  posting_frequency: string;
  content_preferences: {
    educational: boolean;
    promotional: boolean;
    behind_scenes: boolean;
  };
  competitors: string[];
  unique_value_proposition: string;
  additional_context: string;
}

const defaultSettings: BusinessSettings = {
  business_name: '',
  industry: '',
  business_type: 'B2C',
  target_audience: { age_range: '', demographics: '', psychographics: '', pain_points: '' },
  brand_voice: '',
  products_services: [],
  geographic_focus: '',
  price_range: '',
  marketing_goals: [],
  preferred_platforms: [],
  posting_frequency: '',
  content_preferences: { educational: true, promotional: true, behind_scenes: false },
  competitors: [],
  unique_value_proposition: '',
  additional_context: '',
};

export default function BusinessSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<BusinessSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_business_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        const ta = (data.target_audience as any) || {};
        const cp = (data.content_preferences as any) || {};
        setSettings({
          business_name: data.business_name || '',
          industry: data.industry || '',
          business_type: data.business_type || 'B2C',
          target_audience: {
            age_range: ta.age_range || '',
            demographics: ta.demographics || '',
            psychographics: ta.psychographics || '',
            pain_points: ta.pain_points || '',
          },
          brand_voice: data.brand_voice || '',
          products_services: Array.isArray(data.products_services) ? (data.products_services as string[]) : [],
          geographic_focus: data.geographic_focus || '',
          price_range: data.price_range || '',
          marketing_goals: Array.isArray(data.marketing_goals) ? (data.marketing_goals as string[]) : [],
          preferred_platforms: Array.isArray(data.preferred_platforms) ? (data.preferred_platforms as string[]) : [],
          posting_frequency: data.posting_frequency || '',
          content_preferences: {
            educational: cp.educational ?? true,
            promotional: cp.promotional ?? true,
            behind_scenes: cp.behind_scenes ?? false,
          },
          competitors: Array.isArray(data.competitors) ? (data.competitors as string[]) : [],
          unique_value_proposition: data.unique_value_proposition || '',
          additional_context: data.additional_context || '',
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({ title: 'Error', description: 'Failed to load business settings', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleArrayChange = (value: string): string[] => {
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_business_settings')
        .upsert({
          user_id: user.id,
          business_name: settings.business_name || null,
          industry: settings.industry || null,
          business_type: settings.business_type,
          target_audience: settings.target_audience,
          brand_voice: settings.brand_voice || null,
          products_services: settings.products_services,
          geographic_focus: settings.geographic_focus || null,
          price_range: settings.price_range || null,
          marketing_goals: settings.marketing_goals,
          preferred_platforms: settings.preferred_platforms,
          posting_frequency: settings.posting_frequency || null,
          content_preferences: settings.content_preferences,
          competitors: settings.competitors,
          unique_value_proposition: settings.unique_value_proposition || null,
          additional_context: settings.additional_context || null,
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast({ title: 'Settings Saved', description: 'Your business settings have been updated successfully.' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ title: 'Error', description: 'Failed to save business settings', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "bg-[#0A0A0B] border-[#2A2B2E] text-white placeholder:text-muted-foreground/50";
  const sectionClass = "pt-6 border-t border-[#2A2B2E]";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">
        <div className="arasaka-spinner w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/ai-strategist')} className="text-[#A0A0A8] hover:text-white hover:bg-[#16171A]">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
            Business Settings
          </h1>
        </div>

        {/* Form */}
        <div className="bg-[#16171A] border border-[#2A2B2E] rounded-xl p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input className={inputClass} value={settings.business_name} onChange={e => setSettings(s => ({ ...s, business_name: e.target.value }))} placeholder="Your Business Name" />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input className={inputClass} value={settings.industry} onChange={e => setSettings(s => ({ ...s, industry: e.target.value }))} placeholder="e.g. Technology, Fashion, Food" />
              </div>
              <div className="space-y-2">
                <Label>Business Type</Label>
                <select className={`${inputClass} w-full h-10 rounded-md border px-3`} value={settings.business_type} onChange={e => setSettings(s => ({ ...s, business_type: e.target.value }))}>
                  <option value="B2C">B2C</option>
                  <option value="B2B">B2B</option>
                  <option value="D2C">D2C</option>
                  <option value="B2B2C">B2B2C</option>
                </select>
              </div>
            </div>
          </div>

          {/* Target Audience */}
          <div className={sectionClass}>
            <h2 className="text-lg font-semibold mb-4">Target Audience</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age Range</Label>
                <Input className={inputClass} value={settings.target_audience.age_range} onChange={e => setSettings(s => ({ ...s, target_audience: { ...s.target_audience, age_range: e.target.value } }))} placeholder="e.g. 25-45" />
              </div>
              <div className="space-y-2">
                <Label>Demographics</Label>
                <Input className={inputClass} value={settings.target_audience.demographics} onChange={e => setSettings(s => ({ ...s, target_audience: { ...s.target_audience, demographics: e.target.value } }))} placeholder="e.g. Urban professionals" />
              </div>
              <div className="space-y-2">
                <Label>Psychographics</Label>
                <Input className={inputClass} value={settings.target_audience.psychographics} onChange={e => setSettings(s => ({ ...s, target_audience: { ...s.target_audience, psychographics: e.target.value } }))} placeholder="e.g. Health-conscious, tech-savvy" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Pain Points</Label>
                <Textarea className={inputClass} value={settings.target_audience.pain_points} onChange={e => setSettings(s => ({ ...s, target_audience: { ...s.target_audience, pain_points: e.target.value } }))} placeholder="What problems does your audience face?" rows={3} />
              </div>
            </div>
          </div>

          {/* Brand & Positioning */}
          <div className={sectionClass}>
            <h2 className="text-lg font-semibold mb-4">Brand & Positioning</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Brand Voice</Label>
                <Input className={inputClass} value={settings.brand_voice} onChange={e => setSettings(s => ({ ...s, brand_voice: e.target.value }))} placeholder="e.g. Professional yet approachable" />
              </div>
              <div className="space-y-2">
                <Label>Unique Value Proposition</Label>
                <Textarea className={inputClass} value={settings.unique_value_proposition} onChange={e => setSettings(s => ({ ...s, unique_value_proposition: e.target.value }))} placeholder="What makes your business unique?" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Products / Services (comma-separated)</Label>
                <Input className={inputClass} value={settings.products_services.join(', ')} onChange={e => setSettings(s => ({ ...s, products_services: handleArrayChange(e.target.value) }))} placeholder="e.g. Web design, SEO, Social media management" />
              </div>
            </div>
          </div>

          {/* Marketing Details */}
          <div className={sectionClass}>
            <h2 className="text-lg font-semibold mb-4">Marketing Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Platforms (comma-separated)</Label>
                <Input className={inputClass} value={settings.preferred_platforms.join(', ')} onChange={e => setSettings(s => ({ ...s, preferred_platforms: handleArrayChange(e.target.value) }))} placeholder="e.g. Instagram, TikTok, LinkedIn" />
              </div>
              <div className="space-y-2">
                <Label>Marketing Goals (comma-separated)</Label>
                <Input className={inputClass} value={settings.marketing_goals.join(', ')} onChange={e => setSettings(s => ({ ...s, marketing_goals: handleArrayChange(e.target.value) }))} placeholder="e.g. Brand awareness, Lead generation" />
              </div>
              <div className="space-y-2">
                <Label>Posting Frequency</Label>
                <Input className={inputClass} value={settings.posting_frequency} onChange={e => setSettings(s => ({ ...s, posting_frequency: e.target.value }))} placeholder="e.g. 3-5 times per week" />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <Label>Content Preferences</Label>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox id="educational" checked={settings.content_preferences.educational} onCheckedChange={v => setSettings(s => ({ ...s, content_preferences: { ...s.content_preferences, educational: !!v } }))} />
                  <label htmlFor="educational" className="text-sm">Educational</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="promotional" checked={settings.content_preferences.promotional} onCheckedChange={v => setSettings(s => ({ ...s, content_preferences: { ...s.content_preferences, promotional: !!v } }))} />
                  <label htmlFor="promotional" className="text-sm">Promotional</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="behind_scenes" checked={settings.content_preferences.behind_scenes} onCheckedChange={v => setSettings(s => ({ ...s, content_preferences: { ...s.content_preferences, behind_scenes: !!v } }))} />
                  <label htmlFor="behind_scenes" className="text-sm">Behind the Scenes</label>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className={sectionClass}>
            <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Geographic Focus</Label>
                <Input className={inputClass} value={settings.geographic_focus} onChange={e => setSettings(s => ({ ...s, geographic_focus: e.target.value }))} placeholder="e.g. North America, Global" />
              </div>
              <div className="space-y-2">
                <Label>Price Range</Label>
                <Input className={inputClass} value={settings.price_range} onChange={e => setSettings(s => ({ ...s, price_range: e.target.value }))} placeholder="e.g. Mid-range, Premium" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Competitors (comma-separated)</Label>
                <Input className={inputClass} value={settings.competitors.join(', ')} onChange={e => setSettings(s => ({ ...s, competitors: handleArrayChange(e.target.value) }))} placeholder="e.g. Competitor A, Competitor B" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Additional Context</Label>
                <Textarea className={inputClass} value={settings.additional_context} onChange={e => setSettings(s => ({ ...s, additional_context: e.target.value }))} placeholder="Any additional information about your business that would help the AI..." rows={4} />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6">
            <Button
              onClick={saveSettings}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-[#C41E3A] to-[#8B1429] hover:from-[#D42040] hover:to-[#9B1639] text-white font-semibold py-3"
            >
              {isSaving ? 'Saving...' : 'Save Business Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
