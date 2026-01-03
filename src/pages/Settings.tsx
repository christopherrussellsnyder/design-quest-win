import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, Palette, Link2, Bell, Settings as SettingsIcon, Shield, 
  CreditCard, Database, Info, Check, X, Loader2, Save, ArrowLeft,
  Upload, Trash2, RefreshCw, ExternalLink, Download, AlertTriangle, Users, Zap
} from 'lucide-react';
import { TeamManagement } from '@/components/auth/TeamManagement';
import { ActivityLog } from '@/components/auth/ActivityLog';
import { SessionManagement } from '@/components/auth/SessionManagement';
import { DynamicOptimizationDashboard } from '@/components/DynamicOptimizationDashboard';

type SettingsTab = 'profile' | 'brand' | 'connections' | 'notifications' | 'preferences' | 'security' | 'team' | 'optimization' | 'billing' | 'data' | 'about';

interface UserProfile {
  fullName: string;
  email: string;
  username: string;
  bio: string;
  businessName: string;
  businessType: string;
  industry: string;
  companySize: string;
  phone: string;
  website: string;
  location: string;
}

interface BrandSettings {
  businessName: string;
  tagline: string;
  bio: string;
  websiteUrl: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tone: string;
  keyMessages: string[];
  brandHashtags: string[];
}

interface UserPreferences {
  emailNotifications: boolean;
  postPublishedNotification: boolean;
  highEngagementNotification: boolean;
  campaignMilestoneNotification: boolean;
  weeklyReportNotification: boolean;
  errorNotification: boolean;
  theme: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  language: string;
  defaultPostStatus: string;
  autoSaveDrafts: boolean;
  autoHashtagSuggestions: boolean;
  showBestTimeSuggestions: boolean;
  makeProfilePublic: boolean;
  shareAnalytics: boolean;
}

interface SocialConnection {
  id: string;
  platform: string;
  platformUsername: string;
  accountName: string;
  followerCount: number;
  isActive: boolean;
  lastUsedAt: string;
  createdAt: string;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'Christopher Anderson',
    email: user?.email || 'chrissnyder5678@gmail.com',
    username: 'chrismarkets',
    bio: 'Digital marketing specialist helping brands grow their social presence',
    businessName: 'Anderson Marketing Solutions',
    businessType: 'Agency',
    industry: 'Marketing & Advertising',
    companySize: '1-10',
    phone: '+1 (555) 123-4567',
    website: 'https://andersonmarketing.com',
    location: 'Bradenton, Florida, US'
  });
  
  // Brand settings state
  const [brand, setBrand] = useState<BrandSettings>({
    businessName: 'Anderson Marketing Solutions',
    tagline: 'Growing brands through strategic social media',
    bio: '',
    websiteUrl: 'https://andersonmarketing.com',
    logoUrl: '',
    primaryColor: '#8B5CF6',
    secondaryColor: '#3B82F6',
    accentColor: '#10B981',
    tone: 'professional',
    keyMessages: ['Results-driven', 'Data-backed strategies', 'Creative solutions'],
    brandHashtags: ['#AMSolutions', '#GrowWithAMS']
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    postPublishedNotification: true,
    highEngagementNotification: true,
    campaignMilestoneNotification: true,
    weeklyReportNotification: true,
    errorNotification: true,
    theme: 'dark',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    language: 'en',
    defaultPostStatus: 'scheduled',
    autoSaveDrafts: true,
    autoHashtagSuggestions: true,
    showBestTimeSuggestions: true,
    makeProfilePublic: false,
    shareAnalytics: false
  });
  
  // Social connections state
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  
  // Fetch social connections
  useEffect(() => {
    if (user && activeTab === 'connections') {
      fetchConnections();
    }
  }, [user, activeTab]);
  
  const fetchConnections = async () => {
    if (!user) return;
    setLoadingConnections(true);
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setConnections(data?.map(conn => ({
        id: conn.id,
        platform: conn.platform,
        platformUsername: conn.platform_username || '',
        accountName: conn.account_name || '',
        followerCount: conn.follower_count || 0,
        isActive: conn.is_active || false,
        lastUsedAt: conn.last_used_at || '',
        createdAt: conn.created_at
      })) || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoadingConnections(false);
    }
  };
  
  // Auto-save with debounce
  const autoSave = useCallback(async () => {
    setSaveStatus('saving');
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 2000);
  }, []);
  
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      // In production, save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully."
      });
    } catch (error) {
      setSaveStatus('error');
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'brand' as const, label: 'Brand & Appearance', icon: Palette },
    { id: 'connections' as const, label: 'Connected Accounts', icon: Link2 },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'preferences' as const, label: 'Preferences', icon: SettingsIcon },
    { id: 'security' as const, label: 'Security & Privacy', icon: Shield },
    { id: 'team' as const, label: 'Team', icon: Users },
    { id: 'optimization' as const, label: 'Optimization', icon: Zap },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
    { id: 'data' as const, label: 'Data & Export', icon: Database },
    { id: 'about' as const, label: 'About', icon: Info },
  ];

  const platformIcons: Record<string, string> = {
    facebook: '📘',
    instagram: '📸',
    twitter: '🐦',
    linkedin: '💼',
    tiktok: '🎵',
    youtube: '🎬'
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account information and business details</p>
      </div>
      
      {/* Profile Picture */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-bold text-white">
            {profile.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Change Photo
            </Button>
            <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 5MB.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Account Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="relative">
                <Input 
                  value={profile.email}
                  disabled
                  className="pr-20"
                />
                <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <Check className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input 
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="@username"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input 
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea 
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="resize-none"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground text-right">{profile.bio.length}/160</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Business Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Business Information</CardTitle>
          <CardDescription>Optional details about your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input 
                value={profile.businessName}
                onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                placeholder="Your company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select value={profile.businessType} onValueChange={(v) => setProfile({ ...profile, businessType: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agency">Agency</SelectItem>
                  <SelectItem value="Brand">Brand</SelectItem>
                  <SelectItem value="Freelancer">Freelancer</SelectItem>
                  <SelectItem value="Small Business">Small Business</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Select value={profile.industry} onValueChange={(v) => setProfile({ ...profile, industry: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Marketing & Advertising">Marketing & Advertising</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Company Size</Label>
              <Select value={profile.companySize} onValueChange={(v) => setProfile({ ...profile, companySize: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10</SelectItem>
                  <SelectItem value="11-50">11-50</SelectItem>
                  <SelectItem value="51-200">51-200</SelectItem>
                  <SelectItem value="201-500">201-500</SelectItem>
                  <SelectItem value="500+">500+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input 
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input 
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="City, State, Country"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBrandTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Brand & Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize your brand identity and visual preferences</p>
      </div>
      
      {/* Logo Upload */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Brand Logo</CardTitle>
          <CardDescription>Your logo will appear in reports and exports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground">Recommended: 512x512px, PNG with transparency</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Brand Colors */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Brand Colors</CardTitle>
          <CardDescription>Choose colors that represent your brand</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <div 
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  style={{ backgroundColor: brand.primaryColor }}
                />
                <Input 
                  value={brand.primaryColor}
                  onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })}
                  placeholder="#8B5CF6"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <div 
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  style={{ backgroundColor: brand.secondaryColor }}
                />
                <Input 
                  value={brand.secondaryColor}
                  onChange={(e) => setBrand({ ...brand, secondaryColor: e.target.value })}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Accent Color</Label>
              <div className="flex gap-2">
                <div 
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                  style={{ backgroundColor: brand.accentColor }}
                />
                <Input 
                  value={brand.accentColor}
                  onChange={(e) => setBrand({ ...brand, accentColor: e.target.value })}
                  placeholder="#10B981"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Color Presets</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Violet', primary: '#8B5CF6', secondary: '#A78BFA', accent: '#C4B5FD' },
                { name: 'Blue', primary: '#3B82F6', secondary: '#60A5FA', accent: '#93C5FD' },
                { name: 'Green', primary: '#10B981', secondary: '#34D399', accent: '#6EE7B7' },
                { name: 'Orange', primary: '#F59E0B', secondary: '#FBBF24', accent: '#FCD34D' },
                { name: 'Red', primary: '#EF4444', secondary: '#F87171', accent: '#FCA5A5' },
                { name: 'Pink', primary: '#EC4899', secondary: '#F472B6', accent: '#F9A8D4' },
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => setBrand({ 
                    ...brand, 
                    primaryColor: preset.primary, 
                    secondaryColor: preset.secondary, 
                    accentColor: preset.accent 
                  })}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                  <span className="text-sm">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Brand Voice */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Brand Voice</CardTitle>
          <CardDescription>Define your brand's communication style</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tone</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['Professional', 'Casual', 'Friendly', 'Bold', 'Humorous', 'Inspirational'].map((tone) => (
                <button
                  key={tone}
                  onClick={() => setBrand({ ...brand, tone: tone.toLowerCase() })}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    brand.tone === tone.toLowerCase() 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Key Messages</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {brand.keyMessages.map((msg, idx) => (
                <Badge key={idx} variant="secondary" className="px-3 py-1">
                  {msg}
                  <button 
                    onClick={() => setBrand({ 
                      ...brand, 
                      keyMessages: brand.keyMessages.filter((_, i) => i !== idx) 
                    })}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input 
              placeholder="Add a key message and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  setBrand({ 
                    ...brand, 
                    keyMessages: [...brand.keyMessages, e.currentTarget.value] 
                  });
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Brand Hashtags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {brand.brandHashtags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="px-3 py-1 border-primary/50 text-primary">
                  {tag}
                  <button 
                    onClick={() => setBrand({ 
                      ...brand, 
                      brandHashtags: brand.brandHashtags.filter((_, i) => i !== idx) 
                    })}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input 
              placeholder="Add a hashtag and press Enter (e.g., #YourBrand)"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  const hashtag = e.currentTarget.value.startsWith('#') 
                    ? e.currentTarget.value 
                    : `#${e.currentTarget.value}`;
                  setBrand({ 
                    ...brand, 
                    brandHashtags: [...brand.brandHashtags, hashtag] 
                  });
                  e.currentTarget.value = '';
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Display Preferences */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Display Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={preferences.theme} onValueChange={(v) => setPreferences({ ...preferences, theme: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">🌙 Dark Mode</SelectItem>
                  <SelectItem value="light">☀️ Light Mode</SelectItem>
                  <SelectItem value="auto">🔄 Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={preferences.timezone} onValueChange={(v) => setPreferences({ ...preferences, timezone: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select value={preferences.dateFormat} onValueChange={(v) => setPreferences({ ...preferences, dateFormat: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (International)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Format</Label>
              <Select value={preferences.timeFormat} onValueChange={(v) => setPreferences({ ...preferences, timeFormat: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConnectionsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Connected Accounts</h2>
        <p className="text-sm text-muted-foreground">Manage your social media platform connections</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'youtube'].map((platform) => {
          const connection = connections.find(c => c.platform === platform);
          const isConnected = !!connection && connection.isActive;
          
          return (
            <Card key={platform} className={`bg-card border-border ${isConnected ? 'border-l-4 border-l-emerald-500' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platformIcons[platform]}</span>
                    <div>
                      <h3 className="font-medium capitalize">{platform}</h3>
                      {isConnected ? (
                        <div className="text-sm text-muted-foreground">
                          <p className="text-emerald-400">@{connection.platformUsername || connection.accountName}</p>
                          <p>{connection.followerCount.toLocaleString()} followers</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not connected</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={isConnected ? 'default' : 'secondary'} className={isConnected ? 'bg-emerald-500/20 text-emerald-400' : ''}>
                    {isConnected ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      'Disconnected'
                    )}
                  </Badge>
                </div>
                
                <div className="mt-4 flex gap-2">
                  {isConnected ? (
                    <>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Sync
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <Link2 className="w-3 h-3 mr-1" />
                      Connect {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4" />
            Connection Help
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>Token expired?</strong> Click "Sync" to refresh your connection.</p>
          <p>• <strong>Permission issues?</strong> Disconnect and reconnect with full permissions.</p>
          <p>• <strong>Instagram</strong> requires a connected Facebook page for business features.</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Notification Settings</h2>
        <p className="text-sm text-muted-foreground">Control how and when you receive notifications</p>
      </div>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Master toggle for all email notifications</p>
            </div>
            <Switch 
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase">Activity Notifications</h4>
            
            <div className="flex items-center justify-between">
              <Label>Post published successfully</Label>
              <Switch 
                checked={preferences.postPublishedNotification}
                onCheckedChange={(checked) => setPreferences({ ...preferences, postPublishedNotification: checked })}
                disabled={!preferences.emailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>High engagement alert</Label>
              <Switch 
                checked={preferences.highEngagementNotification}
                onCheckedChange={(checked) => setPreferences({ ...preferences, highEngagementNotification: checked })}
                disabled={!preferences.emailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Campaign milestone reached</Label>
              <Switch 
                checked={preferences.campaignMilestoneNotification}
                onCheckedChange={(checked) => setPreferences({ ...preferences, campaignMilestoneNotification: checked })}
                disabled={!preferences.emailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Error notifications</Label>
              <Switch 
                checked={preferences.errorNotification}
                onCheckedChange={(checked) => setPreferences({ ...preferences, errorNotification: checked })}
                disabled={!preferences.emailNotifications}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase">Scheduled Reports</h4>
            
            <div className="flex items-center justify-between">
              <Label>Weekly performance report</Label>
              <Switch 
                checked={preferences.weeklyReportNotification}
                onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReportNotification: checked })}
                disabled={!preferences.emailNotifications}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Preferences</h2>
        <p className="text-sm text-muted-foreground">Customize your MarketAI experience</p>
      </div>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Content Creation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default post status when creating</Label>
            <Select value={preferences.defaultPostStatus} onValueChange={(v) => setPreferences({ ...preferences, defaultPostStatus: v })}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="publish">Publish Immediately</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-suggest hashtags</Label>
                <p className="text-sm text-muted-foreground">Get AI-powered hashtag suggestions</p>
              </div>
              <Switch 
                checked={preferences.autoHashtagSuggestions}
                onCheckedChange={(checked) => setPreferences({ ...preferences, autoHashtagSuggestions: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Show best time suggestions</Label>
                <p className="text-sm text-muted-foreground">See optimal posting times in scheduler</p>
              </div>
              <Switch 
                checked={preferences.showBestTimeSuggestions}
                onCheckedChange={(checked) => setPreferences({ ...preferences, showBestTimeSuggestions: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-save drafts</Label>
                <p className="text-sm text-muted-foreground">Automatically save drafts every 30 seconds</p>
              </div>
              <Switch 
                checked={preferences.autoSaveDrafts}
                onCheckedChange={(checked) => setPreferences({ ...preferences, autoSaveDrafts: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Reduce animations</Label>
              <p className="text-sm text-muted-foreground">Minimize motion effects</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>High contrast mode</Label>
              <p className="text-sm text-muted-foreground">Increase visual contrast</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Security & Privacy</h2>
        <p className="text-sm text-muted-foreground">Manage your account security and privacy settings</p>
      </div>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => navigate('/forgot-password')}>
            <Shield className="w-4 h-4 mr-2" />
            Change Password
          </Button>
        </CardContent>
      </Card>
      
      <SessionManagement />
      
      <ActivityLog />
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Make profile public</Label>
              <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
            </div>
            <Switch 
              checked={preferences.makeProfilePublic}
              onCheckedChange={(checked) => setPreferences({ ...preferences, makeProfilePublic: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Share anonymous usage data</Label>
              <p className="text-sm text-muted-foreground">Help us improve the product</p>
            </div>
            <Switch 
              checked={preferences.shareAnalytics}
              onCheckedChange={(checked) => setPreferences({ ...preferences, shareAnalytics: checked })}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Billing</h2>
        <p className="text-sm text-muted-foreground">Manage your subscription and billing information</p>
      </div>
      
      <Card className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border-violet-500/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <Badge className="bg-violet-500 text-white mb-2">PRO</Badge>
              <h3 className="text-2xl font-bold">$29/month</h3>
              <p className="text-sm text-muted-foreground">Next billing: Jan 15, 2025</p>
            </div>
            <Button variant="outline">Change Plan</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              Unlimited posts per month
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              10 connected social accounts
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              12 months analytics history
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              1,000 AI content credits/month
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-emerald-400" />
              Priority support
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Usage This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>AI Credits</span>
              <span>750 / 1,000</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Storage</span>
              <span>2.4 GB / 10 GB</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '24%' }} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="font-medium">•••• •••• •••• 4242</p>
              <p className="text-sm text-muted-foreground">Expires 12/26</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Update</Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Data & Export</h2>
        <p className="text-sm text-muted-foreground">Export your data and manage storage</p>
      </div>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Quick Exports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Export Posts</p>
              <p className="text-sm text-muted-foreground">All your scheduled and published posts</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Export Analytics</p>
              <p className="text-sm text-muted-foreground">Performance data and metrics</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Export Content Library</p>
              <p className="text-sm text-muted-foreground">All saved content and templates</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Complete Data Export</CardTitle>
          <CardDescription>Download all your data in one package</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-primary hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" />
            Request Full Data Export
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            We'll prepare your data and email you when it's ready (usually within 24 hours).
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Storage Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Total Storage</span>
              <span>2.4 GB / 10 GB</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" style={{ width: '24%' }} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">1.8 GB</p>
              <p className="text-xs text-muted-foreground">Images</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">0.5 GB</p>
              <p className="text-xs text-muted-foreground">Videos</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-lg font-bold">0.1 GB</p>
              <p className="text-xs text-muted-foreground">Documents</p>
            </div>
          </div>
          
          <Button variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderAboutTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">About MarketAI</h2>
        <p className="text-sm text-muted-foreground">Application information and resources</p>
      </div>
      
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl font-bold text-white">
              M
            </div>
            <div>
              <h3 className="text-xl font-bold">MarketAI</h3>
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered social media management platform for modern marketers.
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">API Status</span>
            <Badge className="bg-emerald-500/20 text-emerald-400">
              <Check className="w-3 h-3 mr-1" />
              Operational
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Database</span>
            <Badge className="bg-emerald-500/20 text-emerald-400">
              <Check className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Analytics Sync</span>
            <Badge className="bg-emerald-500/20 text-emerald-400">
              <Check className="w-3 h-3 mr-1" />
              Up to date
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { icon: '📖', label: 'Documentation', url: '#' },
            { icon: '🎥', label: 'Video Tutorials', url: '#' },
            { icon: '💡', label: 'Feature Requests', url: '#' },
            { icon: '🐛', label: 'Report a Bug', url: '#' },
            { icon: '💬', label: 'Support Chat', url: '#' },
          ].map((item) => (
            <a 
              key={item.label}
              href={item.url}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm">
                <span>{item.icon}</span>
                {item.label}
              </span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          ))}
        </CardContent>
      </Card>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Legal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <a href="#" className="block text-sm text-primary hover:underline">Terms of Service</a>
          <a href="#" className="block text-sm text-primary hover:underline">Privacy Policy</a>
          <a href="#" className="block text-sm text-primary hover:underline">Cookie Policy</a>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>Built with ❤️ by MarketAI Team</p>
        <p className="mt-1">Powered by Supabase • OpenAI • Lovable</p>
      </div>
    </div>
  );

  const renderTeamTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Team Management</h2>
        <p className="text-sm text-muted-foreground">Invite and manage team members</p>
      </div>
      <TeamManagement />
    </div>
  );

  const renderOptimizationTab = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Dynamic Optimization</h2>
        <p className="text-sm text-muted-foreground">Configure automatic performance optimization rules</p>
      </div>
      <DynamicOptimizationDashboard />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab();
      case 'brand': return renderBrandTab();
      case 'connections': return renderConnectionsTab();
      case 'notifications': return renderNotificationsTab();
      case 'preferences': return renderPreferencesTab();
      case 'security': return renderSecurityTab();
      case 'team': return renderTeamTab();
      case 'optimization': return renderOptimizationTab();
      case 'billing': return renderBillingTab();
      case 'data': return renderDataTab();
      case 'about': return renderAboutTab();
      default: return renderProfileTab();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
            <div className="flex items-center gap-3">
              {saveStatus === 'saving' && (
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="text-sm text-emerald-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  All changes saved
                </span>
              )}
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-full lg:w-60 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
          
          {/* Content Area */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Settings;
