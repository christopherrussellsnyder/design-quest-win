import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, TrendingUp, Users, Mail, Target, Zap, ChevronDown, Play, Pause, Settings, Bell, Search, Plus, ArrowUpRight, ArrowDownRight, LayoutDashboard, FileText, Send, Megaphone, Calendar, ChevronRight, Image, Type, Video, Wand2, Copy, RefreshCw, Check, Filter, Download, Eye, MousePointer, DollarSign, ChevronLeft, BarChart3, LogOut, X, Save, Star, Trash2, Globe, TrendingDown, AlertCircle, Lightbulb, Clock, Library } from 'lucide-react';

const performanceData = [
  { name: 'Mon', engagement: 4200, conversions: 240, reach: 18000 },
  { name: 'Tue', engagement: 3800, conversions: 198, reach: 16500 },
  { name: 'Wed', engagement: 5100, conversions: 320, reach: 22000 },
  { name: 'Thu', engagement: 4700, conversions: 280, reach: 19800 },
  { name: 'Fri', engagement: 5800, conversions: 410, reach: 25000 },
  { name: 'Sat', engagement: 4100, conversions: 195, reach: 17200 },
  { name: 'Sun', engagement: 3600, conversions: 165, reach: 15000 },
];

const campaigns = [
  { id: 1, name: 'Summer Sale Launch', status: 'active', platform: 'Multi-channel', spend: '$2,450', roi: '+187%', trend: 'up' },
  { id: 2, name: 'Product Awareness Q3', status: 'active', platform: 'Social', spend: '$1,820', roi: '+142%', trend: 'up' },
  { id: 3, name: 'Email Re-engagement', status: 'paused', platform: 'Email', spend: '$680', roi: '+89%', trend: 'down' },
  { id: 4, name: 'Influencer Collab', status: 'draft', platform: 'Instagram', spend: '$0', roi: '—', trend: 'neutral' },
];

const aiSuggestions = [
  { id: 1, type: 'optimize', title: 'Increase ad spend on Tuesdays', desc: 'Data shows 23% higher conversion rates', impact: 'High' },
  { id: 2, type: 'content', title: 'Generate video content for Gen Z', desc: 'Audience segment showing 4x engagement', impact: 'Medium' },
  { id: 3, type: 'timing', title: 'Schedule posts at 7-9 PM EST', desc: 'Peak activity window for your audience', impact: 'High' },
];

const audienceSegments = [
  { name: 'Young Professionals', value: 35, color: '#8b5cf6' },
  { name: 'Parents 30-45', value: 28, color: '#06b6d4' },
  { name: 'Students', value: 18, color: '#f59e0b' },
  { name: 'Retirees', value: 12, color: '#10b981' },
  { name: 'Other', value: 7, color: '#64748b' },
];

const demographicData = [
  { subject: 'Engagement', A: 120, B: 110, fullMark: 150 },
  { subject: 'Retention', A: 98, B: 130, fullMark: 150 },
  { subject: 'Conversion', A: 86, B: 130, fullMark: 150 },
  { subject: 'Reach', A: 99, B: 100, fullMark: 150 },
  { subject: 'Loyalty', A: 85, B: 90, fullMark: 150 },
];

const analyticsMetrics = [
  { date: 'Jan', impressions: 45, clicks: 32, conversions: 8.9, revenue: 124 },
  { date: 'Feb', impressions: 52, clicks: 38, conversions: 10.2, revenue: 142 },
  { date: 'Mar', impressions: 48, clicks: 35, conversions: 9.4, revenue: 131 },
  { date: 'Apr', impressions: 61, clicks: 42, conversions: 11.8, revenue: 168 },
  { date: 'May', impressions: 58, clicks: 40, conversions: 11, revenue: 156 },
  { date: 'Jun', impressions: 72, clicks: 51, conversions: 14.2, revenue: 198 },
];

const channelPerformance = [
  { name: 'Facebook', impressions: '245K', clicks: '12.4K', ctr: '5.1%', spend: '$3,200', cpc: '$0.26' },
  { name: 'Instagram', impressions: '189K', clicks: '15.2K', ctr: '8.0%', spend: '$2,800', cpc: '$0.18' },
  { name: 'Google Ads', impressions: '320K', clicks: '18.6K', ctr: '5.8%', spend: '$4,500', cpc: '$0.24' },
  { name: 'Email', impressions: '85K', clicks: '28.9K', ctr: '34.0%', spend: '$450', cpc: '$0.02' },
  { name: 'LinkedIn', impressions: '62K', clicks: '3.1K', ctr: '5.0%', spend: '$1,200', cpc: '$0.39' },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [contentType, setContentType] = useState('text');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [campaignStep, setCampaignStep] = useState(1);
  const [selectedMetric, setSelectedMetric] = useState('impressions');
  const [kpis, setKpis] = useState<any>(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [seeding, setSeeding] = useState(false);
  const [showSeedButton, setShowSeedButton] = useState(false);
  const [campaignDraftId, setCampaignDraftId] = useState<string | null>(null);
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [campaignFormData, setCampaignFormData] = useState({
    name: '',
    objective: 'awareness',
    start_date: '',
    end_date: '',
    audience_segment: 'Young Professionals (25-34)',
    locations: '',
    interests: [] as string[],
    platforms: [] as string[],
    primary_message: '',
    call_to_action: '',
    total_budget: '',
    daily_limit: '',
    bid_strategy: 'automatic'
  });
  
  // Campaign Management State
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  
  // Template Selection State
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  // Analytics State
  const [campaignMetrics, setCampaignMetrics] = useState<Record<string, any>>({});
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [selectedMetricCampaign, setSelectedMetricCampaign] = useState<string | null>(null);
  
  // Content AI State
  const [showContentAI, setShowContentAI] = useState(false);
  const [aiContentType, setAiContentType] = useState('headline');
  const [aiContentObjective, setAiContentObjective] = useState('awareness');
  const [aiContentPlatform, setAiContentPlatform] = useState('facebook');
  const [aiContentTone, setAiContentTone] = useState('professional');
  const [aiContentLength, setAiContentLength] = useState('medium');
  const [aiContentPrompt, setAiContentPrompt] = useState('');
  const [generatedAiContent, setGeneratedAiContent] = useState<any[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [contentLibrary, setContentLibrary] = useState<any[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [selectedAiContent, setSelectedAiContent] = useState<any>(null);

  // Audience Management State
  const [audiences, setAudiences] = useState<any[]>([]);
  const [loadingAudiences, setLoadingAudiences] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<any>(null);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [editingAudience, setEditingAudience] = useState<string | null>(null);
  const [audienceFormData, setAudienceFormData] = useState({
    name: '',
    description: '',
    age_min: 18,
    age_max: 65,
    gender: [] as string[],
    languages: [] as string[],
    countries: [] as string[],
    regions: [] as string[],
    cities: [] as string[],
    interests: [] as string[],
    behaviors: [] as string[],
    job_titles: [] as string[],
    industries: [] as string[],
    platforms: [] as string[],
    estimated_size_min: 0,
    estimated_size_max: 0
  });

  // Analytics State
  const [analyticsDateRange, setAnalyticsDateRange] = useState('30d'); // '7d', '30d', '90d', 'all'
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [selectedAnalyticsMetric, setSelectedAnalyticsMetric] = useState('impressions'); // 'impressions', 'clicks', 'conversions', 'spend'
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [platformBreakdown, setPlatformBreakdown] = useState<any[]>([]);

  // Scheduler State
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [calendarView, setCalendarView] = useState('month'); // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduleFormData, setScheduleFormData] = useState({
    title: '',
    content: '',
    post_type: 'social',
    platforms: [] as string[],
    scheduled_time: '',
    timezone: 'UTC',
    recurrence: 'once',
    recurrence_end_date: '',
    campaign_id: null as string | null
  });

  // Automation State
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [loadingAutomation, setLoadingAutomation] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [automationFormData, setAutomationFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    trigger_type: 'time',
    trigger_config: {},
    actions: []
  });

  // Social Connections State
  const [socialConnections, setSocialConnections] = useState<any[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Load dashboard data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = '/login';
        return;
      }

      // Load all data in parallel
      await Promise.all([
        fetchKpis(),
        fetchCampaigns(),
        fetchPerformanceData()
      ]);
    };

    loadDashboardData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        window.location.href = '/login';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refetch performance data when timeRange changes
  useEffect(() => {
    fetchPerformanceData();
  }, [timeRange]);
  
  // Fetch campaigns when dashboard tab is active
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchCampaigns();
    }
  }, [activeTab]);

  // Check if data exists to show/hide seed button
  useEffect(() => {
    const checkForData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      // Show seed button if no campaigns exist
      setShowSeedButton(!campaignsData || campaignsData.length === 0);
    };
    checkForData();
  }, [campaigns]);

  // Load draft and templates when Campaign Builder tab is opened
  useEffect(() => {
    if (activeTab === 'campaigns') {
      loadCampaignDraft();
      loadTemplates();
    }
  }, [activeTab]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (activeTab === 'campaigns' && campaignFormData.name) {
      const interval = setInterval(() => {
        saveCampaignDraft();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab, campaignFormData]);
  
  // Load content library when Content AI tab is opened
  useEffect(() => {
    if (activeTab === 'content') {
      loadContentLibrary();
    }
  }, [activeTab]);

  // Load audiences when Audience tab is opened
  useEffect(() => {
    if (activeTab === 'audience') {
      fetchAudiences();
    }
  }, [activeTab]);

  // Load analytics when tab is opened or date range changes
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab, analyticsDateRange]);

  // Load scheduler data when Scheduler tab is opened
  useEffect(() => {
    if (activeTab === 'scheduler') {
      fetchScheduledPosts();
      fetchAutomationRules();
    }
  }, [activeTab]);

  // Load social connections when Settings tab is opened
  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSocialConnections();
    }
  }, [activeTab]);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    const oauth = urlParams.get('oauth');
    
    if (tab) setActiveTab(tab);
    
    if (oauth === 'complete') {
      const code = sessionStorage.getItem('oauth_code');
      const platform = sessionStorage.getItem('oauth_platform');
      
      if (code && platform) {
        handleOAuthCallback(code, platform);
        sessionStorage.removeItem('oauth_code');
        sessionStorage.removeItem('oauth_platform');
        
        // Clean URL
        window.history.replaceState({}, '', '/dashboard?tab=settings');
      }
    } else if (oauth === 'error') {
      const errorMsg = sessionStorage.getItem('oauth_error');
      if (errorMsg) {
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Connection Failed',
            description: errorMsg,
            variant: 'destructive'
          });
        });
        sessionStorage.removeItem('oauth_error');
        window.history.replaceState({}, '', '/dashboard?tab=settings');
      }
    }
  }, []);

  const fetchKpis = async () => {
    setKpisLoading(true);
    setKpisError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Get latest metrics
      const { data: latestMetrics, error: latestError } = await supabase
        .from('metrics_daily')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // If no data exists, show placeholder instead of error
      if (latestError?.code === 'PGRST116' || !latestMetrics) {
        console.log('No metrics data found - user needs to seed data');
        // Set placeholder KPIs with zeros
        setKpis({
          reach: { value: '0', change: '+0%', up: true, benchmark: '-' },
          engagement_rate: { value: '0%', change: '+0%', up: true, benchmark: '-' },
          conversions: { value: '0', change: '+0%', up: true, benchmark: '-' },
          email_open_rate: { value: '0%', change: '+0%', up: true, benchmark: '-' }
        });
        setKpisLoading(false);
        return;
      }

      if (latestError) throw latestError;

      // Get metrics from 7 days ago for comparison
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: previousMetrics } = await supabase
        .from('metrics_daily')
        .select('*')
        .eq('user_id', user.id)
        .lte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Calculate changes
      const calculateChange = (current: number, previous: number | null) => {
        if (!previous || previous === 0) return '+0%';
        const change = ((current - previous) / previous) * 100;
        return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
      };

      // Format numbers
      const formatNumber = (num: number) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return num.toLocaleString();
        return num.toString();
      };

      const kpisData = {
        reach: {
          value: formatNumber(latestMetrics.reach ?? 0),
          change: calculateChange(latestMetrics.reach ?? 0, previousMetrics?.reach ?? null),
          up: (latestMetrics.reach ?? 0) >= (previousMetrics?.reach ?? 0),
          benchmark: 'Top 15%'
        },
        engagement_rate: {
          value: `${latestMetrics.engagement_rate ?? 0}%`,
          change: calculateChange(latestMetrics.engagement_rate ?? 0, previousMetrics?.engagement_rate ?? null),
          up: (latestMetrics.engagement_rate ?? 0) >= (previousMetrics?.engagement_rate ?? 0),
          benchmark: 'Top 20%'
        },
        conversions: {
          value: (latestMetrics.conversions ?? 0).toLocaleString(),
          change: calculateChange(latestMetrics.conversions ?? 0, previousMetrics?.conversions ?? null),
          up: (latestMetrics.conversions ?? 0) >= (previousMetrics?.conversions ?? 0),
          benchmark: 'Top 10%'
        },
        email_open_rate: {
          value: `${latestMetrics.email_open_rate ?? 0}%`,
          change: calculateChange(latestMetrics.email_open_rate ?? 0, previousMetrics?.email_open_rate ?? null),
          up: (latestMetrics.email_open_rate ?? 0) >= (previousMetrics?.email_open_rate ?? 0),
          benchmark: 'Average'
        }
      };

      setKpis(kpisData);
    } catch (err: any) {
      console.error('Failed to load KPIs:', err);
      setKpisError(err.message || 'Failed to load KPIs');
    } finally {
      setKpisLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    setCampaignsLoading(true);
    setCampaignsError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: campaignsData, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format spend values
      const formattedCampaigns = (campaignsData || []).map(campaign => ({
        ...campaign,
        spend: `$${campaign.spend.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      }));

      setCampaigns(formattedCampaigns);
      console.log('Campaigns loaded:', formattedCampaigns.length);
      
      // Auto-load metrics for active campaigns
      if (campaignsData) {
        campaignsData.forEach(campaign => {
          if (campaign.status === 'active') {
            const metrics = generateMockMetrics(campaign);
            setCampaignMetrics(prev => ({
              ...prev,
              [campaign.id]: metrics
            }));
          }
        });
      }
    } catch (err: any) {
      console.error('Failed to load campaigns:', err);
      setCampaignsError(err.message || 'Failed to load campaigns');
    } finally {
      setLoadingCampaigns(false);
      setCampaignsLoading(false);
    }
  };
  
  // Load templates from database
  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from('campaign_templates')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Load templates error:', error);
      } else {
        setTemplates(data || []);
        console.log('Templates loaded:', data?.length);
      }
    } catch (error) {
      console.error('Load templates error:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  // Apply template to campaign form
  const applyTemplate = (template: any) => {
    setCampaignFormData({
      ...campaignFormData,
      name: template.name + ' Campaign',
      objective: template.objective || 'awareness',
      platforms: template.default_platforms || [],
      primary_message: template.default_message || '',
      start_date: new Date().toISOString().split('T')[0]
    });
    
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
  };
  
  // Generate mock analytics data for campaigns
  const generateMockMetrics = (campaign: any) => {
    const daysSinceStart = campaign.start_date ? 
      Math.floor((new Date().getTime() - new Date(campaign.start_date).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const daysActive = Math.max(1, Math.min(daysSinceStart, 30));
    
    // Generate realistic mock data based on campaign objective
    const baseMetrics: Record<string, any> = {
      awareness: { impressions: 50000, clicks: 1500, ctr: 3.0, conversions: 45 },
      traffic: { impressions: 35000, clicks: 2800, ctr: 8.0, conversions: 140 },
      conversions: { impressions: 25000, clicks: 2000, ctr: 8.0, conversions: 320 }
    };
    
    const base = baseMetrics[campaign.objective] || baseMetrics.awareness;
    const multiplier = daysActive / 30;
    
    return {
      impressions: Math.floor(base.impressions * multiplier),
      clicks: Math.floor(base.clicks * multiplier),
      ctr: base.ctr + (Math.random() * 2 - 1),
      conversions: Math.floor(base.conversions * multiplier),
      spend: Math.floor((campaign.daily_limit || 0) * daysActive),
      cpc: ((campaign.daily_limit || 0) * daysActive) / (base.clicks * multiplier) || 0,
      cvr: ((base.conversions * multiplier) / (base.clicks * multiplier) * 100) || 0
    };
  };

  // Fetch or generate analytics for a campaign
  const fetchCampaignMetrics = async (campaignId: string) => {
    setLoadingMetrics(true);
    
    try {
      const campaign = campaigns.find((c: any) => c.id === campaignId);
      if (campaign) {
        const metrics = generateMockMetrics(campaign);
        setCampaignMetrics(prev => ({
          ...prev,
          [campaignId]: metrics
        }));
      }
    } catch (error) {
      console.error('Fetch metrics error:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };
  
  // Update campaign status (pause/resume)
  const updateCampaignStatus = async (campaignId: string, newStatus: 'active' | 'paused') => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaignId);
      
      if (error) {
        console.error('Update status error:', error);
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: 'Failed to update campaign status',
            variant: 'destructive'
          });
        });
      } else {
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Success',
            description: `Campaign ${newStatus === 'paused' ? 'paused' : 'resumed'} successfully`,
          });
        });
        fetchCampaigns(); // Refresh list
      }
    } catch (error) {
      console.error('Update status error:', error);
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Error',
          description: 'Failed to update campaign status',
          variant: 'destructive'
        });
      });
    }
  };

  // Delete campaign
  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);
      
      if (error) {
        console.error('Delete campaign error:', error);
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: 'Failed to delete campaign',
            variant: 'destructive'
          });
        });
      } else {
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Success',
            description: 'Campaign deleted successfully',
          });
        });
        fetchCampaigns(); // Refresh list
        setShowCampaignDetails(false);
        setSelectedCampaign(null);
      }
    } catch (error) {
      console.error('Delete campaign error:', error);
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Error',
          description: 'Failed to delete campaign',
          variant: 'destructive'
        });
      });
    }
  };

  // Load campaign into builder for editing
  const editCampaign = async (campaign: any) => {
    setEditingCampaignId(campaign.id);
    
    // Populate form with campaign data
    setCampaignFormData({
      name: campaign.name || '',
      objective: campaign.objective || 'awareness',
      start_date: campaign.start_date || '',
      end_date: campaign.end_date || '',
      audience_segment: campaign.target_audience?.segment || 'Young Professionals (25-34)',
      locations: campaign.target_audience?.locations || '',
      interests: campaign.target_audience?.interests || [],
      platforms: Array.isArray(campaign.platforms) ? campaign.platforms : campaign.platform?.split(', ') || [],
      primary_message: campaign.content?.message || '',
      call_to_action: campaign.content?.cta || '',
      total_budget: campaign.total_budget?.toString() || '',
      daily_limit: campaign.daily_limit?.toString() || '',
      bid_strategy: 'automatic'
    });
    
    // Switch to Campaign Builder tab
    setActiveTab('campaigns');
    setCampaignStep(1);
    setShowCampaignDetails(false);
  };

  // Save edited campaign
  const saveEditedCampaign = async () => {
    if (!editingCampaignId) {
      // This is a new campaign, use existing launch logic
      await launchCampaign();
      return;
    }
    
    // Validation
    if (!campaignFormData.name || campaignFormData.name.trim() === '') {
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Validation Error',
          description: 'Please enter a campaign name',
          variant: 'destructive'
        });
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          name: campaignFormData.name,
          objective: campaignFormData.objective,
          start_date: campaignFormData.start_date || null,
          end_date: campaignFormData.end_date || null,
          total_budget: campaignFormData.total_budget ? parseFloat(campaignFormData.total_budget) : null,
          daily_limit: campaignFormData.daily_limit ? parseFloat(campaignFormData.daily_limit) : null,
          platform: campaignFormData.platforms.join(', ') || 'Multi-channel',
        })
        .eq('id', editingCampaignId);
      
      if (error) {
        console.error('Update campaign error:', error);
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: 'Failed to update campaign: ' + error.message,
            variant: 'destructive'
          });
        });
        return;
      }
      
      // Reset form
      setCampaignFormData({
        name: '',
        objective: 'awareness',
        start_date: '',
        end_date: '',
        audience_segment: 'Young Professionals (25-34)',
        locations: '',
        interests: [],
        platforms: [],
        primary_message: '',
        call_to_action: '',
        total_budget: '',
        daily_limit: '',
        bid_strategy: 'automatic'
      });
      setEditingCampaignId(null);
      setCampaignStep(1);
      setSelectedTemplate(null);
      
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Success',
          description: 'Campaign updated successfully',
        });
      });
      
      setActiveTab('dashboard');
      fetchCampaigns();
      
    } catch (error) {
      console.error('Update campaign error:', error);
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Error',
          description: 'Failed to update campaign',
          variant: 'destructive'
        });
      });
    }
  };

  const fetchPerformanceData = async () => {
    setPerformanceLoading(true);
    setPerformanceError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Calculate date range based on timeRange state
      const endDate = new Date();
      const startDate = new Date();
      
      if (timeRange === '7d') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (timeRange === '30d') {
        startDate.setDate(endDate.getDate() - 30);
      } else if (timeRange === '90d') {
        startDate.setDate(endDate.getDate() - 90);
      }

      const { data: performanceData, error } = await supabase
        .from('performance_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      // Format for chart (use day_name from database)
      const chartData = (performanceData || []).map(item => ({
        name: item.day_name,
        engagement: item.engagement ?? 0,
        conversions: item.conversions ?? 0,
        reach: item.reach ?? 0
      }));

      setPerformanceData(chartData);
    } catch (err: any) {
      console.error('Failed to load performance data:', err);
      setPerformanceError(err.message || 'Failed to load performance data');
    } finally {
      setPerformanceLoading(false);
    }
  };

  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'campaigns', icon: Megaphone, label: 'Campaign Builder' },
    { id: 'content', icon: FileText, label: 'Content AI', href: '/content-ai' },
    { id: 'library', icon: Library, label: 'Content Library', href: '/content-library' },
    { id: 'audience', icon: Users, label: 'Audience' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'scheduler', icon: Calendar, label: 'Scheduler' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const loadCampaignDraft = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: drafts } = await supabase
        .from('campaign_drafts')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (drafts && drafts.length > 0) {
        const draft = drafts[0];
        setCampaignDraftId(draft.id);
        setCampaignFormData({
          name: draft.name || '',
          objective: draft.objective || 'awareness',
          start_date: draft.start_date || '',
          end_date: draft.end_date || '',
          audience_segment: draft.audience_segment || 'Young Professionals (25-34)',
          locations: draft.locations || '',
          interests: draft.interests || [],
          platforms: draft.platforms || [],
          primary_message: draft.primary_message || '',
          call_to_action: draft.call_to_action || '',
          total_budget: draft.total_budget?.toString() || '',
          daily_limit: draft.daily_limit?.toString() || '',
          bid_strategy: draft.bid_strategy || 'automatic'
        });
        setCampaignStep(draft.current_step || 1);
        setLastSaved(new Date(draft.updated_at));
        console.log('Draft loaded:', draft.name);
      }
    } catch (error) {
      console.error('Load draft error:', error);
    }
  };

  const saveCampaignDraft = async () => {
    if (!campaignFormData.name || campaignFormData.name.trim() === '') {
      return;
    }
    
    setIsSavingCampaign(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsSavingCampaign(false);
        return;
      }
      
      const draftData = {
        user_id: user.id,
        name: campaignFormData.name,
        objective: campaignFormData.objective,
        start_date: campaignFormData.start_date || null,
        end_date: campaignFormData.end_date || null,
        audience_segment: campaignFormData.audience_segment,
        locations: campaignFormData.locations,
        interests: campaignFormData.interests,
        platforms: campaignFormData.platforms,
        primary_message: campaignFormData.primary_message,
        call_to_action: campaignFormData.call_to_action,
        total_budget: campaignFormData.total_budget ? parseFloat(campaignFormData.total_budget) : null,
        daily_limit: campaignFormData.daily_limit ? parseFloat(campaignFormData.daily_limit) : null,
        bid_strategy: campaignFormData.bid_strategy,
        current_step: campaignStep,
        completed: false,
        updated_at: new Date().toISOString()
      };
      
      if (campaignDraftId) {
        const { error } = await supabase
          .from('campaign_drafts')
          .update(draftData)
          .eq('id', campaignDraftId);
        
        if (error) {
          console.error('Update draft error:', error);
        } else {
          setLastSaved(new Date());
          console.log('Draft updated');
        }
      } else {
        const { data, error } = await supabase
          .from('campaign_drafts')
          .insert(draftData)
          .select()
          .single();
        
        if (error) {
          console.error('Create draft error:', error);
        } else if (data) {
          setCampaignDraftId(data.id);
          setLastSaved(new Date());
          console.log('Draft created:', data.id);
        }
      }
    } catch (error) {
      console.error('Save draft error:', error);
    } finally {
      setIsSavingCampaign(false);
    }
  };

  const launchCampaign = async () => {
    // If editing existing campaign, use save function instead
    if (editingCampaignId) {
      await saveEditedCampaign();
      return;
    }
    
    // Validation
    if (!campaignFormData.name || campaignFormData.name.trim() === '') {
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Validation Error',
          description: 'Please enter a campaign name',
          variant: 'destructive'
        });
      });
      return;
    }
    
    if (!campaignFormData.start_date) {
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Validation Error',
          description: 'Please select a start date',
          variant: 'destructive'
        });
      });
      return;
    }
    
    if (!campaignFormData.end_date) {
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Validation Error',
          description: 'Please select an end date',
          variant: 'destructive'
        });
      });
      return;
    }
    
    if (new Date(campaignFormData.end_date) <= new Date(campaignFormData.start_date)) {
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Validation Error',
          description: 'End date must be after start date',
          variant: 'destructive'
        });
      });
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Authentication Error',
            description: 'You must be logged in to launch a campaign',
            variant: 'destructive'
          });
        });
        return;
      }
      
      await supabase
        .from('campaigns')
        .insert({
          user_id: user.id,
          name: campaignFormData.name,
          objective: campaignFormData.objective,
          start_date: campaignFormData.start_date || null,
          end_date: campaignFormData.end_date || null,
          total_budget: campaignFormData.total_budget ? parseFloat(campaignFormData.total_budget) : null,
          daily_limit: campaignFormData.daily_limit ? parseFloat(campaignFormData.daily_limit) : null,
          status: 'active',
          platform: campaignFormData.platforms.join(', ') || 'Multi-channel',
          spend: 0,
          roi: '—',
          trend: 'neutral'
        });
      
      if (campaignDraftId) {
        await supabase
          .from('campaign_drafts')
          .delete()
          .eq('id', campaignDraftId);
      }
      
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Campaign Launched!',
          description: 'Your campaign is now live and running.',
        });
      });

      // Reset form and go back to dashboard
      setSelectedTemplate(null);
      
      setCampaignFormData({
        name: '',
        objective: 'awareness',
        start_date: '',
        end_date: '',
        audience_segment: 'Young Professionals (25-34)',
        locations: '',
        interests: [],
        platforms: [],
        primary_message: '',
        call_to_action: '',
        total_budget: '',
        daily_limit: '',
        bid_strategy: 'automatic'
      });
      setCampaignDraftId(null);
      setCampaignStep(1);
      setSelectedTemplate(null);
      setActiveTab('dashboard');
      fetchCampaigns();
    } catch (error) {
      console.error('Launch error:', error);
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Error',
          description: 'Failed to launch campaign. Please try again.',
          variant: 'destructive'
        });
      });
    }
  };

  const seedSampleData = async () => {
    if (!user) return;
    
    console.log('Starting seed data process...');
    setSeeding(true);
    try {
      console.log('Current user:', user.id);
      
      const today = new Date();
      const getDate = (daysAgo: number) => {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
      };

      const getDayName = (daysAgo: number) => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        return days[date.getDay()];
      };

      // Insert campaigns
      console.log('Inserting campaigns...');
      const campaignsData = [
        { user_id: user.id, name: 'Summer Sale Launch', status: 'active' as const, platform: 'Multi-channel', spend: 2450.00, roi: '+187%', trend: 'up' as const },
        { user_id: user.id, name: 'Product Awareness Q3', status: 'active' as const, platform: 'Social', spend: 1820.00, roi: '+142%', trend: 'up' as const },
        { user_id: user.id, name: 'Email Re-engagement', status: 'paused' as const, platform: 'Email', spend: 680.00, roi: '+89%', trend: 'down' as const },
        { user_id: user.id, name: 'Influencer Collab', status: 'draft' as const, platform: 'Instagram', spend: 0.00, roi: '—', trend: 'neutral' as const }
      ];

      const { data: campaignsResult, error: campaignsError } = await supabase
        .from('campaigns')
        .insert(campaignsData)
        .select();

      if (campaignsError) {
        console.error('Error inserting campaigns:', campaignsError);
        throw campaignsError;
      }
      console.log('Campaigns inserted:', campaignsResult);

      // Insert today's metrics
      console.log('Inserting metrics...');
      const { data: metricsResult, error: metricsError } = await supabase
        .from('metrics_daily')
        .insert({
          user_id: user.id,
          date: getDate(0),
          reach: 2400000,
          engagement_rate: 4.8,
          conversions: 1847,
          email_open_rate: 32.4
        })
        .select();

      if (metricsError) {
        console.error('Error inserting metrics:', metricsError);
        throw metricsError;
      }
      console.log('Metrics inserted:', metricsResult);

      // Insert 7 days of performance data
      console.log('Inserting performance data...');
      const performanceDataArray = [
        { user_id: user.id, date: getDate(6), day_name: getDayName(6), engagement: 4200, conversions: 240, reach: 18000 },
        { user_id: user.id, date: getDate(5), day_name: getDayName(5), engagement: 3800, conversions: 198, reach: 16500 },
        { user_id: user.id, date: getDate(4), day_name: getDayName(4), engagement: 5100, conversions: 320, reach: 22000 },
        { user_id: user.id, date: getDate(3), day_name: getDayName(3), engagement: 4700, conversions: 280, reach: 19800 },
        { user_id: user.id, date: getDate(2), day_name: getDayName(2), engagement: 5800, conversions: 410, reach: 25000 },
        { user_id: user.id, date: getDate(1), day_name: getDayName(1), engagement: 4100, conversions: 195, reach: 17200 },
        { user_id: user.id, date: getDate(0), day_name: getDayName(0), engagement: 3600, conversions: 165, reach: 15000 }
      ];

      const { data: performanceResult, error: performanceError } = await supabase
        .from('performance_data')
        .insert(performanceDataArray)
        .select();

      if (performanceError) {
        console.error('Error inserting performance data:', performanceError);
        throw performanceError;
      }
      console.log('Performance data inserted:', performanceResult);

      console.log('All data seeded successfully!');

      // Hide seed button
      setShowSeedButton(false);

      // Show success and refresh
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Success!',
          description: 'Sample data added successfully!',
        });
      });

      // Refresh all data
      console.log('Reloading dashboard data...');
      await Promise.all([
        fetchKpis(),
        fetchCampaigns(),
        fetchPerformanceData()
      ]);
      console.log('Dashboard data reloaded!');
    } catch (error: any) {
      console.error('Error seeding data:', error);
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to add sample data',
          variant: 'destructive',
        });
      });
    } finally {
      setSeeding(false);
    }
  };

  // Content AI Functions - Real AI Generation via Lovable AI
  const generateAIContent = async () => {
    if (!aiContentPrompt.trim()) {
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Validation Error',
          description: 'Please enter a prompt or topic',
          variant: 'destructive'
        });
      });
      return;
    }
    
    setIsGeneratingAi(true);
    setGeneratedAiContent([]);
    
    try {
      // Call the edge function for real AI content generation
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          contentType: aiContentType,
          objective: aiContentObjective,
          platform: aiContentPlatform,
          tone: aiContentTone,
          length: aiContentLength,
          prompt: aiContentPrompt
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data || !data.variations) {
        throw new Error('No content generated');
      }
      
      setGeneratedAiContent(data.variations);
      console.log('Generated AI content:', data.variations.length, 'variations');
      
    } catch (error: any) {
      console.error('Generate content error:', error);
      
      // Handle specific error types
      let errorMessage = 'Error generating content. ';
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        errorMessage = 'Rate limit reached. Please try again in a few moments.';
      } else if (error.message?.includes('402')) {
        errorMessage = 'Usage limit reached. Please add credits to your workspace.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      });
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const generateMockContent = (type: string, objective: string, platform: string, tone: string, length: string, prompt: string) => {
    const templates: any = {
      headline: {
        awareness: [
          `Discover ${prompt}: The Future is Here`,
          `Why ${prompt} is Changing Everything`,
          `The Ultimate Guide to ${prompt}`
        ],
        traffic: [
          `Click to Learn More About ${prompt}`,
          `Visit Now: ${prompt} Explained`,
          `See How ${prompt} Can Help You`
        ],
        conversions: [
          `Get ${prompt} Today - Limited Offer`,
          `Buy ${prompt} Now and Save 20%`,
          `Try ${prompt} Risk-Free`
        ]
      },
      ad_copy: {
        awareness: [
          `Introducing ${prompt}. ${tone === 'professional' ? 'Transform your business' : 'Game-changing innovation'} with cutting-edge technology. Learn more about how we're revolutionizing the industry.`,
          `${prompt} is here. ${tone === 'urgent' ? "Don't miss out" : 'Discover'} the next generation of solutions designed for modern businesses. Join thousands of satisfied customers.`,
          `Experience ${prompt} like never before. Premium quality meets ${tone === 'friendly' ? 'friendly' : 'professional'} service. See what makes us different.`
        ],
        traffic: [
          `Want to learn more about ${prompt}? Visit our website for exclusive insights, case studies, and expert tips. Click the link to explore now!`,
          `${prompt} made simple. Head to our site for comprehensive guides, resources, and tutorials. Your journey starts with one click!`,
          `Curious about ${prompt}? Our website has everything you need to know. Free resources, detailed guides, and more. Check it out today!`
        ],
        conversions: [
          `Limited time offer on ${prompt}! Get 20% off your first purchase. Use code SAVE20 at checkout. Shop now before this deal expires!`,
          `Ready to try ${prompt}? Start your free trial today - no credit card required. Cancel anytime. Join over 10,000 happy customers!`,
          `${prompt} is on sale! Save big with our exclusive promotion. ${tone === 'urgent' ? 'Hurry, ends soon!' : 'Great value awaits'}. Order now!`
        ]
      },
      social_post: {
        awareness: [
          `🚀 Big news! We're excited to announce ${prompt}. This is going to change the game! What do you think? #Innovation #${prompt.replace(/\s+/g, '')}`,
          `✨ Say hello to ${prompt}! We've been working hard on this and can't wait to share it with you. Drop a 💙 if you're excited! #NewRelease`,
          `💡 Did you know? ${prompt} is transforming how businesses operate. Learn more in our latest blog post! [Link] #BusinessTips`
        ],
        traffic: [
          `Want to learn the secrets of ${prompt}? 🔥 We just published a comprehensive guide on our website. Check it out! Link in bio 👆 #Guide #LearnMore`,
          `📚 New blog post alert! Everything you need to know about ${prompt}. Click the link to read now: [URL] #BlogPost #${prompt.replace(/\s+/g, '')}`,
          `🎯 Curious about ${prompt}? Head over to our website for exclusive content, tips, and insights you won't find anywhere else! #ExclusiveContent`
        ],
        conversions: [
          `⚡ FLASH SALE ALERT! Get ${prompt} at 20% off for the next 24 hours only! Use code FLASH20 at checkout. Shop now 🛒 #Sale #LimitedOffer`,
          `🎁 Special offer just for you! Try ${prompt} risk-free with our 30-day money-back guarantee. What are you waiting for? Get started today! #SpecialOffer`,
          `💰 Best deal of the year on ${prompt}! Don't let this opportunity slip away. Click to shop now and save big! ⏰ #Deal #SaveNow`
        ]
      },
      email: {
        awareness: [
          `Subject: Introducing ${prompt} - You'll Love This\n\nHi there,\n\nWe're thrilled to introduce ${prompt}! After months of development, we're excited to share this innovation with you.\n\n${prompt} represents our commitment to excellence and innovation. We believe it will transform how you work.\n\nLearn more: [Link]\n\nBest regards,\nThe Team`,
          `Subject: Big News About ${prompt}!\n\nHello,\n\nWe have exciting news to share! ${prompt} is finally here, and we couldn't be more excited.\n\nThis represents a major milestone for us, and we wanted you to be among the first to know.\n\nDiscover more: [Link]\n\nCheers,\nYour Team`
        ],
        traffic: [
          `Subject: Your Complete Guide to ${prompt}\n\nHi there,\n\nWe just published an in-depth guide about ${prompt} on our blog.\n\nInside, you'll discover:\n• Key insights and tips\n• Expert recommendations\n• Real-world examples\n\nRead the full guide: [Link]\n\nHappy reading!\nThe Team`,
          `Subject: Must-Read: Everything About ${prompt}\n\nHello,\n\nCurious about ${prompt}? We've got you covered!\n\nOur latest article breaks down everything you need to know in plain English.\n\nCheck it out here: [Link]\n\nBest,\nYour Team`
        ],
        conversions: [
          `Subject: Exclusive 20% Off ${prompt} - Today Only!\n\nHi,\n\nWe're offering you an exclusive deal: 20% off ${prompt}!\n\nUse code SAVE20 at checkout. This offer expires at midnight, so don't wait!\n\nWhat you'll get:\n• Premium quality\n• 30-day guarantee\n• Free shipping\n\nShop now: [Link]\n\nCheers,\nThe Team`,
          `Subject: Last Chance: ${prompt} Special Offer\n\nHello,\n\nThis is your final reminder about our special ${prompt} promotion.\n\nFor a limited time, save big on your purchase. Don't miss out on this incredible deal!\n\nClaim your discount: [Link]\n\nBest regards,\nYour Team`
        ]
      },
      cta: {
        awareness: ['Learn More', 'Discover Now', 'See How It Works', 'Find Out More', 'Explore Features'],
        traffic: ['Read Full Article', 'Visit Our Website', 'Get Started', 'Click Here', 'Learn More Now'],
        conversions: ['Buy Now', 'Shop Today', 'Get Your Discount', 'Claim Offer', 'Start Free Trial', 'Add to Cart']
      }
    };
    
    const contentArray = templates[type]?.[objective] || templates[type]?.awareness || ['Content generated'];
    
    return contentArray.slice(0, 3).map((content: string, index: number) => ({
      id: `temp-${Date.now()}-${index}`,
      content,
      rating: 0,
      is_favorite: false
    }));
  };

  const saveToLibrary = async (content: string, rating: number = 0, isFavorite: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('content_library')
        .insert({
          user_id: user.id,
          content_type: aiContentType,
          objective: aiContentObjective,
          platform: aiContentPlatform,
          prompt: aiContentPrompt,
          generated_content: content,
          tone: aiContentTone,
          length: aiContentLength,
          rating: rating,
          is_favorite: isFavorite
        })
        .select()
        .single();
      
      if (error) {
        console.error('Save to library error:', error);
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: 'Error saving content',
            variant: 'destructive'
          });
        });
      } else {
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Success!',
            description: 'Content saved to library!',
          });
        });
        loadContentLibrary();
      }
    } catch (error) {
      console.error('Save to library error:', error);
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Error',
          description: 'Error saving content',
          variant: 'destructive'
        });
      });
    }
  };

  const loadContentLibrary = async () => {
    setLoadingLibrary(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingLibrary(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Load library error:', error);
      } else {
        setContentLibrary(data || []);
      }
    } catch (error) {
      console.error('Load library error:', error);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const updateContentRating = async (contentId: string, rating: number) => {
    try {
      const { error } = await supabase
        .from('content_library')
        .update({ rating })
        .eq('id', contentId);
      
      if (error) {
        console.error('Update rating error:', error);
      } else {
        loadContentLibrary();
      }
    } catch (error) {
      console.error('Update rating error:', error);
    }
  };

  const toggleFavorite = async (contentId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('content_library')
        .update({ is_favorite: !currentFavorite })
        .eq('id', contentId);
      
      if (error) {
        console.error('Toggle favorite error:', error);
      } else {
        loadContentLibrary();
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  const deleteContent = async (contentId: string) => {
    if (!confirm('Delete this content from your library?')) return;
    
    try {
      const { error } = await supabase
        .from('content_library')
        .delete()
        .eq('id', contentId);
      
      if (error) {
        console.error('Delete content error:', error);
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: 'Error deleting content',
            variant: 'destructive'
          });
        });
      } else {
        loadContentLibrary();
      }
    } catch (error) {
      console.error('Delete content error:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    import('@/hooks/use-toast').then(({ toast }) => {
      toast({
        title: 'Copied!',
        description: 'Content copied to clipboard',
      });
    });
  };

  // Audience Management Functions
  const fetchAudiences = async () => {
    setLoadingAudiences(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoadingAudiences(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('audiences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Fetch audiences error:', error);
      } else {
        setAudiences(data || []);
        console.log('Audiences loaded:', data?.length);
      }
    } catch (error) {
      console.error('Fetch audiences error:', error);
    } finally {
      setLoadingAudiences(false);
    }
  };

  const createAudience = async () => {
    if (!audienceFormData.name.trim()) {
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Required Field',
          description: 'Please enter an audience name',
          variant: 'destructive'
        });
      });
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: 'You must be logged in',
            variant: 'destructive'
          });
        });
        return;
      }
      
      const estimatedSize = calculateAudienceSize(audienceFormData);
      
      const { error } = await supabase
        .from('audiences')
        .insert({
          user_id: user.id,
          ...audienceFormData,
          estimated_size_min: estimatedSize.min,
          estimated_size_max: estimatedSize.max
        });
      
      if (error) {
        console.error('Create audience error:', error);
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: `Error creating audience: ${error.message}`,
            variant: 'destructive'
          });
        });
        return;
      }
      
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Success!',
          description: 'Audience created successfully!',
        });
      });
      resetAudienceForm();
      setShowAudienceModal(false);
      fetchAudiences();
      
    } catch (error) {
      console.error('Create audience error:', error);
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Error',
          description: 'Error creating audience',
          variant: 'destructive'
        });
      });
    }
  };

  const updateAudience = async () => {
    if (!editingAudience) return;
    
    if (!audienceFormData.name.trim()) {
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Required Field',
          description: 'Please enter an audience name',
          variant: 'destructive'
        });
      });
      return;
    }
    
    try {
      const estimatedSize = calculateAudienceSize(audienceFormData);
      
      const { error } = await supabase
        .from('audiences')
        .update({
          ...audienceFormData,
          estimated_size_min: estimatedSize.min,
          estimated_size_max: estimatedSize.max
        })
        .eq('id', editingAudience);
      
      if (error) {
        console.error('Update audience error:', error);
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: `Error updating audience: ${error.message}`,
            variant: 'destructive'
          });
        });
        return;
      }
      
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Success!',
          description: 'Audience updated successfully!',
        });
      });
      resetAudienceForm();
      setShowAudienceModal(false);
      setEditingAudience(null);
      fetchAudiences();
      
    } catch (error) {
      console.error('Update audience error:', error);
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Error',
          description: 'Error updating audience',
          variant: 'destructive'
        });
      });
    }
  };

  const deleteAudience = async (audienceId: string) => {
    if (!confirm('Are you sure you want to delete this audience?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('audiences')
        .delete()
        .eq('id', audienceId);
      
      if (error) {
        console.error('Delete audience error:', error);
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: 'Error deleting audience',
            variant: 'destructive'
          });
        });
      } else {
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Success!',
            description: 'Audience deleted successfully!',
          });
        });
        fetchAudiences();
        if (selectedAudience?.id === audienceId) {
          setSelectedAudience(null);
        }
      }
    } catch (error) {
      console.error('Delete audience error:', error);
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Error',
          description: 'Error deleting audience',
          variant: 'destructive'
        });
      });
    }
  };

  const toggleAudienceFavorite = async (audienceId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('audiences')
        .update({ is_favorite: !currentFavorite })
        .eq('id', audienceId);
      
      if (error) {
        console.error('Toggle favorite error:', error);
      } else {
        fetchAudiences();
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
    }
  };

  const calculateAudienceSize = (formData: typeof audienceFormData) => {
    let baseSize = 10000000;
    
    const ageRange = (formData.age_max - formData.age_min) / 100;
    baseSize *= ageRange;
    
    if (formData.gender.length > 0 && formData.gender.length < 3) {
      baseSize *= (formData.gender.length / 3);
    }
    
    if (formData.countries.length > 0) {
      baseSize *= Math.min(formData.countries.length / 5, 1);
    }
    
    if (formData.interests.length > 0) {
      baseSize *= Math.max(0.3, 1 - (formData.interests.length * 0.1));
    }
    
    if (formData.platforms.length > 0) {
      baseSize *= Math.min(formData.platforms.length / 3, 1);
    }
    
    const min = Math.floor(baseSize * 0.8);
    const max = Math.floor(baseSize * 1.2);
    
    return { min, max };
  };

  const resetAudienceForm = () => {
    setAudienceFormData({
      name: '',
      description: '',
      age_min: 18,
      age_max: 65,
      gender: [],
      languages: [],
      countries: [],
      regions: [],
      cities: [],
      interests: [],
      behaviors: [],
      job_titles: [],
      industries: [],
      platforms: [],
      estimated_size_min: 0,
      estimated_size_max: 0
    });
  };

  const openEditAudience = (audience: any) => {
    setEditingAudience(audience.id);
    setAudienceFormData({
      name: audience.name,
      description: audience.description || '',
      age_min: audience.age_min || 18,
      age_max: audience.age_max || 65,
      gender: audience.gender || [],
      languages: audience.languages || [],
      countries: audience.countries || [],
      regions: audience.regions || [],
      cities: audience.cities || [],
      interests: audience.interests || [],
      behaviors: audience.behaviors || [],
      job_titles: audience.job_titles || [],
      industries: audience.industries || [],
      platforms: audience.platforms || [],
      estimated_size_min: audience.estimated_size_min || 0,
      estimated_size_max: audience.estimated_size_max || 0
    });
    setShowAudienceModal(true);
  };

  const applyAudienceToCampaign = (audience: any) => {
    setCampaignFormData({
      ...campaignFormData,
      audience_segment: audience.name,
      locations: audience.countries?.join(', ') || '',
      interests: audience.interests || [],
      platforms: audience.platforms || []
    });
    setActiveTab('campaigns');
    import('@/hooks/use-toast').then(({ toast }) => {
      toast({
        title: 'Success!',
        description: 'Audience applied to campaign!',
      });
    });
  };

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  // Analytics Functions
  // Generate analytics data for date range
  const generateAnalyticsData = (campaigns: any[], dateRange: string) => {
    // Calculate days based on range
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    
    // Generate daily data points
    const dailyData = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Calculate metrics for this day (mock data)
      const baseImpressions = 5000 + Math.random() * 3000;
      const baseCTR = 3.5 + Math.random() * 2;
      const baseConversionRate = 2.5 + Math.random() * 1.5;
      
      const impressions = Math.floor(baseImpressions * campaigns.filter((c: any) => c.status === 'active').length);
      const clicks = Math.floor(impressions * (baseCTR / 100));
      const conversions = Math.floor(clicks * (baseConversionRate / 100));
      const spend = Math.floor(conversions * 25 + Math.random() * 500);
      
      dailyData.push({
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions,
        clicks,
        conversions,
        spend,
        ctr: (clicks / impressions * 100).toFixed(2),
        cvr: (conversions / clicks * 100).toFixed(2),
        cpc: (spend / clicks).toFixed(2),
        roas: ((conversions * 50) / spend).toFixed(2)
      });
    }
    
    // Calculate totals and averages
    const totals = dailyData.reduce((acc, day) => ({
      impressions: acc.impressions + day.impressions,
      clicks: acc.clicks + day.clicks,
      conversions: acc.conversions + day.conversions,
      spend: acc.spend + day.spend
    }), { impressions: 0, clicks: 0, conversions: 0, spend: 0 });
    
    const averages = {
      ctr: (totals.clicks / totals.impressions * 100).toFixed(2),
      cvr: (totals.conversions / totals.clicks * 100).toFixed(2),
      cpc: (totals.spend / totals.clicks).toFixed(2),
      roas: ((totals.conversions * 50) / totals.spend).toFixed(2)
    };
    
    return {
      dailyData,
      totals,
      averages
    };
  };

  // Generate platform breakdown
  const generatePlatformBreakdown = (campaigns: any[]) => {
    const platforms = ['Facebook', 'Instagram', 'Google', 'LinkedIn', 'Twitter'];
    
    return platforms.map(platform => {
      const campaignsOnPlatform = campaigns.filter((c: any) => 
        c.platforms?.includes(platform) && c.status === 'active'
      ).length;
      
      const baseImpressions = 20000 + Math.random() * 30000;
      const baseCTR = 2.5 + Math.random() * 3;
      
      const impressions = Math.floor(baseImpressions * Math.max(campaignsOnPlatform, 0.5));
      const clicks = Math.floor(impressions * (baseCTR / 100));
      const conversions = Math.floor(clicks * 0.03);
      const spend = Math.floor(clicks * 2.5);
      
      return {
        platform,
        impressions,
        clicks,
        conversions,
        spend,
        ctr: (clicks / impressions * 100).toFixed(2),
        cvr: (conversions / clicks * 100).toFixed(2),
        cpc: (spend / clicks).toFixed(2)
      };
    }).sort((a, b) => b.impressions - a.impressions);
  };

  // Load analytics data
  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    
    try {
      // Generate analytics data based on campaigns
      const analytics = generateAnalyticsData(campaigns, analyticsDateRange);
      const platformData = generatePlatformBreakdown(campaigns);
      
      setAnalyticsData(analytics);
      setPlatformBreakdown(platformData);
      
      // Generate comparison data (previous period)
      const comparisonPeriod = analyticsDateRange === '7d' ? '7d' : 
                              analyticsDateRange === '30d' ? '30d' : 
                              analyticsDateRange === '90d' ? '90d' : '365d';
      const comparison = generateAnalyticsData(campaigns, comparisonPeriod);
      setComparisonData(comparison);
      
    } catch (error) {
      console.error('Load analytics error:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Calculate percentage change
  const calculateChange = (current: number, previous: number) => {
    if (!previous || previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  // Export analytics data as CSV
  const exportAnalytics = () => {
    if (!analyticsData) return;
    
    // Create CSV content
    let csv = 'Date,Impressions,Clicks,CTR,Conversions,CVR,Spend,CPC,ROAS\n';
    
    analyticsData.dailyData.forEach((day: any) => {
      csv += `${day.date},${day.impressions},${day.clicks},${day.ctr}%,${day.conversions},${day.cvr}%,$${day.spend},$${day.cpc},${day.roas}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${analyticsDateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    import('@/hooks/use-toast').then(({ toast }) => {
      toast({
        title: 'Success!',
        description: 'Analytics exported successfully!',
      });
    });
  };

  // Scheduler Functions
  // Fetch scheduled posts
  const fetchScheduledPosts = async () => {
    setLoadingSchedule(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoadingSchedule(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_time', { ascending: true });
      
      if (error) {
        console.error('Fetch scheduled posts error:', error);
      } else {
        setScheduledPosts(data || []);
        console.log('Scheduled posts loaded:', data?.length);
      }
    } catch (error) {
      console.error('Fetch scheduled posts error:', error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Create scheduled post
  const createScheduledPost = async () => {
    if (!scheduleFormData.title.trim() || !scheduleFormData.content.trim()) {
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Validation Error',
          description: 'Please enter title and content',
          variant: 'destructive'
        });
      });
      return;
    }
    
    if (!scheduleFormData.scheduled_time) {
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Validation Error',
          description: 'Please select a date and time',
          variant: 'destructive'
        });
      });
      return;
    }
    
    if (scheduleFormData.platforms.length === 0) {
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Validation Error',
          description: 'Please select at least one platform',
          variant: 'destructive'
        });
      });
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: 'You must be logged in',
            variant: 'destructive'
          });
        });
        return;
      }
      
      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          ...scheduleFormData,
          status: 'scheduled'
        });
      
      if (error) {
        console.error('Create scheduled post error:', error);
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: 'Error scheduling post: ' + error.message,
            variant: 'destructive'
          });
        });
        return;
      }
      
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Success!',
          description: 'Post scheduled successfully!',
        });
      });
      resetScheduleForm();
      setShowScheduleModal(false);
      fetchScheduledPosts();
      
    } catch (error) {
      console.error('Create scheduled post error:', error);
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Error',
          description: 'Error scheduling post',
          variant: 'destructive'
        });
      });
    }
  };

  // Cancel scheduled post
  const cancelScheduledPost = async (postId: string) => {
    if (!confirm('Cancel this scheduled post?')) return;
    
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'cancelled' })
        .eq('id', postId);
      
      if (error) {
        console.error('Cancel post error:', error);
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: 'Error cancelling post',
            variant: 'destructive'
          });
        });
      } else {
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Success!',
            description: 'Post cancelled successfully!',
          });
        });
        fetchScheduledPosts();
      }
    } catch (error) {
      console.error('Cancel post error:', error);
    }
  };

  // Delete scheduled post
  const deleteScheduledPost = async (postId: string) => {
    if (!confirm('Delete this scheduled post?')) return;
    
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId);
      
      if (error) {
        console.error('Delete post error:', error);
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: 'Error deleting post',
            variant: 'destructive'
          });
        });
      } else {
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Success!',
            description: 'Post deleted successfully!',
          });
        });
        fetchScheduledPosts();
      }
    } catch (error) {
      console.error('Delete post error:', error);
    }
  };

  // Reset schedule form
  const resetScheduleForm = () => {
    setScheduleFormData({
      title: '',
      content: '',
      post_type: 'social',
      platforms: [],
      scheduled_time: '',
      timezone: 'UTC',
      recurrence: 'once',
      recurrence_end_date: '',
      campaign_id: null
    });
  };

  // Get posts for specific date
  const getPostsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduled_time).toISOString().split('T')[0];
      return postDate === dateStr;
    });
  };

  // Format time for display
  const formatScheduledTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Fetch automation rules
  const fetchAutomationRules = async () => {
    setLoadingAutomation(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoadingAutomation(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Fetch automation rules error:', error);
      } else {
        setAutomationRules(data || []);
      }
    } catch (error) {
      console.error('Fetch automation rules error:', error);
    } finally {
      setLoadingAutomation(false);
    }
  };

  // Toggle automation rule
  const toggleAutomationRule = async (ruleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active: !currentStatus })
        .eq('id', ruleId);
      
      if (error) {
        console.error('Toggle rule error:', error);
      } else {
        fetchAutomationRules();
      }
    } catch (error) {
      console.error('Toggle rule error:', error);
    }
  };

  // Delete automation rule
  const deleteAutomationRule = async (ruleId: string) => {
    if (!confirm('Delete this automation rule?')) return;
    
    try {
      const { error } = await supabase
        .from('automation_rules')
        .delete()
        .eq('id', ruleId);
      
      if (error) {
        console.error('Delete rule error:', error);
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Error',
            description: 'Error deleting rule',
            variant: 'destructive'
          });
        });
      } else {
        import('@/hooks/use-toast').then(({ toast }) => {
          toast({
            title: 'Success!',
            description: 'Rule deleted successfully!',
          });
        });
        fetchAutomationRules();
      }
    } catch (error) {
      console.error('Delete rule error:', error);
    }
  };

  // Fetch social connections
  const fetchSocialConnections = async () => {
    setLoadingConnections(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingConnections(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) {
        console.error('Fetch connections error:', error);
      } else {
        setSocialConnections(data || []);
        console.log('Social connections loaded:', data?.length);
      }
    } catch (error) {
      console.error('Fetch connections error:', error);
    } finally {
      setLoadingConnections(false);
    }
  };

  // Initiate Facebook OAuth
  const connectFacebook = () => {
    const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
    
    if (!appId) {
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Configuration Required',
          description: 'Facebook App ID not configured. Please add VITE_FACEBOOK_APP_ID to your environment variables.',
          variant: 'destructive'
        });
      });
      return;
    }
    
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish';
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${scope}&` +
      `response_type=code&` +
      `state=facebook`;
    
    window.location.href = authUrl;
  };

  // Handle OAuth callback
  const handleOAuthCallback = async (code: string, platform: string) => {
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      // Exchange code for token via Edge Function
      const { data, error } = await supabase.functions.invoke('facebook-auth', {
        body: { code, redirectUri }
      });
      
      if (error) throw error;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Save Facebook pages
      if (data.pages && data.pages.length > 0) {
        for (const page of data.pages) {
          await supabase.from('social_connections').upsert({
            user_id: user.id,
            platform: 'facebook',
            platform_user_id: page.id,
            platform_username: page.name,
            access_token: page.access_token,
            account_name: page.name,
            account_type: 'page',
            is_active: true
          }, { onConflict: 'user_id,platform,platform_user_id' });
        }
      }
      
      // Save Instagram accounts
      if (data.instagramAccounts && data.instagramAccounts.length > 0) {
        for (const igAccount of data.instagramAccounts) {
          await supabase.from('social_connections').upsert({
            user_id: user.id,
            platform: 'instagram',
            platform_user_id: igAccount.id,
            platform_username: igAccount.username,
            access_token: igAccount.page_access_token,
            account_name: igAccount.username,
            account_type: 'business',
            profile_picture_url: igAccount.profile_picture_url,
            follower_count: igAccount.followers_count,
            is_active: true
          }, { onConflict: 'user_id,platform,platform_user_id' });
        }
      }
      
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Success!',
          description: 'Accounts connected successfully!',
        });
      });
      fetchSocialConnections();
      
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Connection Failed',
          description: error.message || 'Failed to connect accounts',
          variant: 'destructive'
        });
      });
    }
  };

  // Disconnect social account
  const disconnectSocialAccount = async (connectionId: string) => {
    if (!confirm('Disconnect this account?')) return;
    
    try {
      const { error } = await supabase
        .from('social_connections')
        .update({ is_active: false })
        .eq('id', connectionId);
      
      if (error) throw error;
      
      import('@/hooks/use-toast').then(({ toast }) => {
        toast({
          title: 'Disconnected',
          description: 'Account disconnected successfully',
        });
      });
      fetchSocialConnections();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg">MarketAI</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = item.href ? false : activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => item.href ? navigate(item.href) : setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-white border border-violet-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-xl p-4 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium">AI Credits</span>
            </div>
            <div className="text-2xl font-bold mb-1">8,420</div>
            <div className="w-full bg-slate-700 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-1.5 rounded-full" style={{width: '68%'}}></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">68% of monthly quota</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search campaigns, content..." 
                className="bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm w-72 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors relative">
              <Bell className="w-5 h-5 text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-fuchsia-500 rounded-full"></span>
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-slate-700">
              <div className="text-right">
                <div className="text-sm text-slate-400">{user?.email}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={signOut}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-rose-400"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <>
              {/* Alert System - show if any campaign has low ROI */}
              {campaigns.some(c => c.roi && parseInt(c.roi) < -10) && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mb-6 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-rose-400 mb-1">Campaign Performance Alert</h3>
                      <p className="text-sm text-rose-400/90">
                        Email Re-engagement campaign is 15% below target. Consider increasing budget or refreshing creative.
                      </p>
                    </div>
                  </div>
                  <button className="text-rose-400 hover:text-rose-300 p-1">
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Seed Sample Data Button */}
              {showSeedButton && (
                <div className="mb-6 flex items-center justify-center">
                  <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 rounded-xl p-8 max-w-md text-center">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-xl font-bold mb-2">No Data Yet</h3>
                    <p className="text-slate-400 mb-4">Get started by adding sample data to see your dashboard in action.</p>
                    <button
                      onClick={seedSampleData}
                      disabled={seeding}
                      className="px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {seeding ? 'Adding Sample Data...' : '🚀 Seed Sample Data'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Overview Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-violet-500/20 rounded-lg">
                      <Megaphone className="w-5 h-5 text-violet-400" />
                    </div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +12%
                    </span>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {campaigns.filter((c: any) => c.status === 'active').length}
                  </div>
                  <div className="text-sm text-slate-400">Active Campaigns</div>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Eye className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +24%
                    </span>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {Object.values(campaignMetrics)
                      .reduce((sum: number, m: any) => sum + (m.impressions || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Total Impressions</div>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <MousePointer className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +8%
                    </span>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {Object.values(campaignMetrics)
                      .reduce((sum: number, m: any) => sum + (m.clicks || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Total Clicks</div>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-fuchsia-500/20 rounded-lg">
                      <Target className="w-5 h-5 text-fuchsia-400" />
                    </div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +16%
                    </span>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {Object.values(campaignMetrics)
                      .reduce((sum: number, m: any) => sum + (m.conversions || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Total Conversions</div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {kpisError ? (
                  // Error state
                  <div className="col-span-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-rose-400 font-semibold mb-1">Failed to load KPIs</h3>
                        <p className="text-sm text-rose-400/80">{kpisError}</p>
                      </div>
                      <button 
                        onClick={fetchKpis}
                        className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    </div>
                  </div>
                ) : kpisLoading ? (
                  // Loading state
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-slate-800 rounded w-24 mb-3"></div>
                      <div className="h-8 bg-slate-800 rounded w-20 mb-2"></div>
                      <div className="h-4 bg-slate-800 rounded w-16"></div>
                    </div>
                  ))
                ) : kpis ? (
                  // Real data from API
                  [
                    { key: 'reach', label: 'Total Reach', icon: Users, color: 'cyan' },
                    { key: 'engagement_rate', label: 'Engagement Rate', icon: TrendingUp, color: 'green' },
                    { key: 'conversions', label: 'Conversions', icon: Target, color: 'violet' },
                    { key: 'email_open_rate', label: 'Email Open Rate', icon: Mail, color: 'amber' },
                  ].map((stat) => {
                    const StatIcon = stat.icon;
                    const data = kpis[stat.key];
                    return (
                      <div key={stat.key} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-slate-400 text-sm">{stat.label}</span>
                          <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                            <StatIcon className={`w-4 h-4 text-${stat.color}-400`} />
                          </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">{data?.value || 'N/A'}</div>
                        <div className={`flex items-center gap-1 text-sm ${data?.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {data?.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {data?.change || '0%'} vs last week
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Error state - fallback to hardcoded data
                  [
                    { label: 'Total Reach', value: '2.4M', change: '+12.5%', up: true, icon: Users, color: 'cyan' },
                    { label: 'Engagement Rate', value: '4.8%', change: '+0.8%', up: true, icon: TrendingUp, color: 'green' },
                    { label: 'Conversions', value: '1,847', change: '+23.1%', up: true, icon: Target, color: 'violet' },
                    { label: 'Email Open Rate', value: '32.4%', change: '-2.1%', up: false, icon: Mail, color: 'amber' },
                  ].map((stat, i) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-slate-400 text-sm">{stat.label}</span>
                          <div className={`w-8 h-8 rounded-lg bg-${stat.color}-500/10 flex items-center justify-center`}>
                            <StatIcon className={`w-4 h-4 text-${stat.color}-400`} />
                          </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.value}</div>
                        <div className={`flex items-center gap-1 text-sm ${stat.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {stat.change} vs last week
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Goal Tracking & Budget Status Row */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Monthly Goals Card */}
                <div className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Monthly Goals</h2>
                    <span className="text-xs text-slate-400">Last updated: 2 min ago</span>
                  </div>
                  <div className="text-4xl font-bold mb-6 text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text">
                    73%
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Conversions</span>
                        <span className="text-sm font-medium">1,847 / 2,500</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full" style={{width: '74%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">Revenue</span>
                        <span className="text-sm font-medium">$91.9K / $120K</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full" style={{width: '77%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-300">New Leads</span>
                        <span className="text-sm font-medium">3,420 / 5,000</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full" style={{width: '68%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Status Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h2 className="font-semibold">Budget Status</h2>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Monthly Budget</span>
                      <span className="text-sm font-medium">$12,250 / $15,000</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full" style={{width: '82%'}}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">$2,750 remaining • 9 days left</p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <p className="text-sm text-slate-400 mb-2">Daily burn rate</p>
                    <div className="text-3xl font-bold text-emerald-400 mb-1">$306</div>
                    <p className="text-xs text-slate-500">Target: $300/day</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Performance Chart */}
                <div className="col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-semibold">Performance Overview</h2>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setTimeRange('7d')}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                            timeRange === '7d' 
                              ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' 
                              : 'text-slate-400 border-transparent hover:bg-slate-800'
                          }`}
                        >
                          7 Days
                        </button>
                        <button 
                          onClick={() => setTimeRange('30d')}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                            timeRange === '30d' 
                              ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' 
                              : 'text-slate-400 border-transparent hover:bg-slate-800'
                          }`}
                        >
                          30 Days
                        </button>
                        <button 
                          onClick={() => setTimeRange('90d')}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                            timeRange === '90d' 
                              ? 'bg-violet-500/20 text-violet-400 border-violet-500/30' 
                              : 'text-slate-400 border-transparent hover:bg-slate-800'
                          }`}
                        >
                          90 Days
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">Real-time data • Updates every 5 minutes</p>
                  </div>
                  {performanceError ? (
                    // Error state
                    <div className="h-[220px] flex items-center justify-center">
                      <div className="text-center max-w-md">
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6">
                          <h3 className="text-rose-400 font-semibold mb-2">Failed to load performance data</h3>
                          <p className="text-sm text-rose-400/80 mb-4">{performanceError}</p>
                          <button 
                            onClick={fetchPerformanceData}
                            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Retry
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : performanceLoading ? (
                    // Skeleton loading state for chart
                    <div className="h-[220px] space-y-3 animate-pulse">
                      <div className="flex justify-between items-end h-full px-4">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div key={i} className="flex flex-col justify-end items-center gap-2 flex-1">
                            <div 
                              className="bg-slate-800 rounded-t w-full" 
                              style={{ height: `${Math.random() * 60 + 40}%` }}
                            ></div>
                            <div className="h-2 bg-slate-800 rounded w-8"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : performanceData.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No performance data available</p>
                        <p className="text-sm text-slate-500 mt-1">Data will appear once you have campaigns running</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#f8fafc' }}
                        />
                        <Area type="monotone" dataKey="engagement" stroke="#8b5cf6" fill="url(#engGrad)" strokeWidth={2} />
                        <Area type="monotone" dataKey="conversions" stroke="#06b6d4" fill="url(#convGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                  <div className="flex items-center gap-6 mt-3 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                      <span className="text-sm text-slate-400">Engagement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      <span className="text-sm text-slate-400">Conversions</span>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-fuchsia-400" />
                    <h2 className="font-semibold">AI Recommendations</h2>
                  </div>
                  
                  {/* Executive Summary */}
                  <div className="mb-4 p-4 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-lg">
                    <div className="inline-block px-2 py-1 bg-violet-500/20 text-violet-400 rounded text-xs font-medium mb-2">
                      Executive Summary
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Campaigns performing 23% above target this month. Email channel showing exceptional ROI.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {aiSuggestions.map(s => (
                      <div key={s.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-violet-500/50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{s.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${s.impact === 'High' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                            {s.impact}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-3 py-2 text-sm text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors">
                    View all suggestions →
                  </button>
                </div>
              </div>

              {/* Campaigns Table */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Active Campaigns</h2>
                  <button onClick={() => setActiveTab('campaigns')} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    <Plus className="w-4 h-4" />
                    New Campaign
                  </button>
                </div>
                <div className="overflow-x-auto">
                  {campaignsError ? (
                    // Error state
                    <div className="py-8">
                      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 max-w-md mx-auto">
                        <div className="text-center">
                          <h3 className="text-rose-400 font-semibold mb-2">Failed to load campaigns</h3>
                          <p className="text-sm text-rose-400/80 mb-4">{campaignsError}</p>
                          <button 
                            onClick={fetchCampaigns}
                            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Retry
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : campaignsLoading ? (
                    // Skeleton loading state
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                          <div className="flex-1">
                            <div className="h-4 bg-slate-800 rounded w-48 mb-2"></div>
                            <div className="h-3 bg-slate-800 rounded w-24"></div>
                          </div>
                          <div className="h-6 bg-slate-800 rounded w-16"></div>
                          <div className="h-4 bg-slate-800 rounded w-20"></div>
                          <div className="h-4 bg-slate-800 rounded w-16"></div>
                          <div className="h-4 bg-slate-800 rounded w-12"></div>
                          <div className="flex gap-2">
                            <div className="h-8 w-8 bg-slate-800 rounded"></div>
                            <div className="h-8 w-8 bg-slate-800 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : campaigns.length === 0 ? (
                    // Empty state with seed button
                    <div className="py-12 text-center">
                      <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 mb-2">No campaigns yet</p>
                      <p className="text-sm text-slate-500 mb-4">Seed sample data or create your first campaign</p>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={seedSampleData}
                          disabled={seeding}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg text-sm font-medium hover:bg-violet-500/30 transition-colors disabled:opacity-50"
                        >
                          🎯 {seeding ? 'Seeding...' : 'Seed Sample Data'}
                        </button>
                        <button onClick={() => setActiveTab('campaigns')} className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                          <Plus className="w-4 h-4" />
                          Create Campaign
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Campaigns table
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-slate-400 border-b border-slate-800">
                          <th className="pb-3 font-medium">Campaign</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Platform</th>
                          <th className="pb-3 font-medium">Spend</th>
                          <th className="pb-3 font-medium">ROI</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                       <tbody>
                        {campaigns.map((c: any) => {
                          const metrics = campaignMetrics[c.id];
                          
                          return (
                          <tr 
                            key={c.id} 
                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedCampaign(c);
                              setShowCampaignDetails(true);
                              if (c.status === 'active' && !metrics) {
                                fetchCampaignMetrics(c.id);
                              }
                            }}
                          >
                            <td className="py-4">
                              <div>
                                <div className="font-medium mb-1">{c.name}</div>
                                {metrics && c.status === 'active' && (
                                  <div className="flex gap-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      {(metrics.impressions || 0).toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MousePointer className="w-3 h-3" />
                                      {(metrics.clicks || 0).toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1 text-emerald-400">
                                      <TrendingUp className="w-3 h-3" />
                                      {(metrics.ctr || 0).toFixed(2)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                c.status === 'paused' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-slate-500/20 text-slate-400'
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="py-4 text-slate-300">{c.platform}</td>
                            <td className="py-4 text-slate-300">{c.spend}</td>
                            <td className="py-4">
                              <span className={c.trend === 'up' ? 'text-emerald-400' : c.trend === 'down' ? 'text-rose-400' : 'text-slate-400'}>
                                {c.roi}
                              </span>
                            </td>
                            <td className="py-4" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateCampaignStatus(c.id, c.status === 'active' ? 'paused' : 'active');
                                  }}
                                  className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                                  title={c.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                                >
                                  {c.status === 'active' ? <Pause className="w-4 h-4 text-slate-400" /> : <Play className="w-4 h-4 text-slate-400" />}
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    editCampaign(c);
                                  }}
                                  className="p-1.5 rounded hover:bg-slate-700 transition-colors"
                                  title="Edit Campaign"
                                >
                                  <Settings className="w-4 h-4 text-slate-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Attribution Model & Team Performance Row */}
              <div className="grid grid-cols-2 gap-6">
                {/* Attribution Model Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h2 className="font-semibold mb-4">Attribution Model</h2>
                  <div className="space-y-3">
                    {[
                      { name: 'Email Campaign', value: 487, percent: 26, color: 'violet' },
                      { name: 'Facebook Ads', value: 345, percent: 19, color: 'blue' },
                      { name: 'Google Ads', value: 312, percent: 17, color: 'emerald' },
                      { name: 'Organic Social', value: 289, percent: 16, color: 'cyan' },
                      { name: 'Other', value: 414, percent: 22, color: 'slate' }
                    ].map((source, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-slate-300">{source.name}</span>
                          <span className="text-sm font-medium">{source.value} ({source.percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div className={`bg-${source.color}-500 h-1.5 rounded-full`} style={{width: `${source.percent}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Performance Card */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h2 className="font-semibold mb-4">Team Performance</h2>
                  <div className="space-y-4">
                    {[
                      { name: 'Sarah M.', campaigns: 8, roi: '+187%', gradient: 'from-pink-500 to-rose-500' },
                      { name: 'Mike T.', campaigns: 6, roi: '+142%', gradient: 'from-blue-500 to-cyan-500' },
                      { name: 'Lisa K.', campaigns: 5, roi: '+98%', gradient: 'from-violet-500 to-purple-500' }
                    ].map((member, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-sm font-semibold`}>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{member.name}</div>
                          <div className="text-xs text-slate-400">{member.campaigns} campaigns</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-emerald-400">{member.roi}</div>
                          <div className="text-xs text-slate-500">ROI</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CAMPAIGN BUILDER */}
          {activeTab === 'campaigns' && (
            <div className="max-w-5xl mx-auto">
              {/* Show template selector if no template selected and no existing draft */}
              {!selectedTemplate && !campaignDraftId && !campaignFormData.name && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Choose a Template</h2>
                      <p className="text-slate-400">Start with a proven campaign template or create from scratch</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {loadingTemplates ? (
                    <div className="text-center py-12 text-slate-400">
                      Loading templates...
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {/* Template Cards */}
                      {templates.map((template: any) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className="p-6 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-violet-500 hover:bg-slate-800/50 transition-all text-left group"
                        >
                          <div className="text-4xl mb-4">{template.icon}</div>
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-violet-400 transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-sm text-slate-400 mb-4">{template.description}</p>
                          
                          {/* Template Stats */}
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded">
                              {template.objective === 'awareness' ? 'Awareness' :
                               template.objective === 'traffic' ? 'Traffic' : 'Conversions'}
                            </span>
                          </div>
                        </button>
                      ))}
                      
                      {/* Start from Scratch Option */}
                      <button
                        onClick={() => {
                          setSelectedTemplate({ id: 'blank', name: 'Custom' });
                        }}
                        className="p-6 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-violet-500 hover:bg-slate-800/50 transition-all text-left group"
                      >
                        <div className="text-4xl mb-4">✨</div>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-violet-400 transition-colors">
                          Start from Scratch
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">Build your own custom campaign from the ground up</p>
                        <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded">
                          Custom
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Rest of Campaign Builder Form (only show if template selected or draft exists) */}
              {(selectedTemplate || campaignDraftId || campaignFormData.name) && (
                <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveTab('dashboard')} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-2xl font-bold">Campaign Builder</h1>
                  
                  {/* Auto-save indicator */}
                  {isSavingCampaign && (
                    <span className="text-sm text-slate-400 flex items-center gap-2">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                      Saving...
                    </span>
                  )}
                  {!isSavingCampaign && lastSaved && (
                    <span className="text-sm text-emerald-400 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Saved
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex gap-2 mb-8">
                {['Details', 'Audience', 'Content', 'Budget', 'Review'].map((step, i) => (
                  <div key={i} className="flex-1 relative">
                    <div className={`h-1 rounded-full ${i + 1 <= campaignStep ? 'bg-violet-500' : 'bg-slate-700'}`} />
                    <span className={`text-xs mt-2 block ${i + 1 <= campaignStep ? 'text-violet-400' : 'text-slate-500'}`}>{step}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                {/* Step 1: Details */}
                {campaignStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="font-semibold mb-4">Campaign Details</h2>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Campaign Name</label>
                      <input 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" 
                        placeholder="e.g., Summer Sale 2024" 
                        value={campaignFormData.name}
                        onChange={(e) => setCampaignFormData({...campaignFormData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Objective</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'awareness', icon: Eye, label: 'Awareness', desc: 'Reach new audiences' },
                          { id: 'traffic', icon: MousePointer, label: 'Traffic', desc: 'Drive website visits' },
                          { id: 'conversions', icon: Target, label: 'Conversions', desc: 'Increase sales' }
                        ].map((obj, i) => {
                          const ObjIcon = obj.icon;
                          return (
                            <button 
                              key={i} 
                              onClick={() => setCampaignFormData({...campaignFormData, objective: obj.id})}
                              className={`p-4 rounded-lg border text-left transition-all ${campaignFormData.objective === obj.id ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 hover:border-slate-600'}`}
                            >
                              <ObjIcon className="w-5 h-5 mb-2 text-violet-400" />
                              <div className="font-medium text-sm">{obj.label}</div>
                              <div className="text-xs text-slate-400">{obj.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-400 block mb-2">Start Date</label>
                        <input 
                          type="date" 
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" 
                          value={campaignFormData.start_date}
                          onChange={(e) => setCampaignFormData({...campaignFormData, start_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 block mb-2">End Date</label>
                        <input 
                          type="date" 
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" 
                          value={campaignFormData.end_date}
                          onChange={(e) => setCampaignFormData({...campaignFormData, end_date: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Audience */}
                {campaignStep === 2 && (
                  <div className="space-y-4">
                    <h2 className="font-semibold mb-4">Target Audience</h2>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Use Existing Segment</label>
                      <select 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                        value={campaignFormData.audience_segment}
                        onChange={(e) => setCampaignFormData({...campaignFormData, audience_segment: e.target.value})}
                      >
                        <option>Young Professionals (25-34)</option>
                        <option>Parents (30-45)</option>
                        <option>Students (18-24)</option>
                        <option>Custom audience...</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Locations</label>
                      <input 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" 
                        placeholder="United States, Canada..." 
                        value={campaignFormData.locations}
                        onChange={(e) => setCampaignFormData({...campaignFormData, locations: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Interests</label>
                      <div className="flex flex-wrap gap-2">
                        {['Technology', 'Fashion', 'Fitness', 'Travel', 'Food'].map(t => (
                          <span key={t} className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-xs">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="w-4 h-4 text-fuchsia-400" />
                        <span>AI estimates <strong>1.2M - 1.8M</strong> potential reach</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Content */}
                {campaignStep === 3 && (
                  <div className="space-y-4">
                    <h2 className="font-semibold mb-4">Campaign Content</h2>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Platforms</label>
                      <div className="flex gap-2">
                        {['Facebook', 'Instagram', 'Google', 'Email'].map(p => {
                          const isSelected = campaignFormData.platforms.includes(p);
                          return (
                            <button 
                              key={p} 
                              onClick={() => {
                                if (isSelected) {
                                  setCampaignFormData({
                                    ...campaignFormData, 
                                    platforms: campaignFormData.platforms.filter(platform => platform !== p)
                                  });
                                } else {
                                  setCampaignFormData({
                                    ...campaignFormData, 
                                    platforms: [...campaignFormData.platforms, p]
                                  });
                                }
                              }}
                              className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                                isSelected 
                                  ? 'border-violet-500 bg-violet-500/10 text-violet-400' 
                                  : 'border-slate-700 hover:border-violet-500'
                              }`}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Primary Message</label>
                      <textarea 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm h-20 resize-none focus:outline-none focus:border-violet-500" 
                        placeholder="What's the main message?" 
                        value={campaignFormData.primary_message}
                        onChange={(e) => setCampaignFormData({...campaignFormData, primary_message: e.target.value})}
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-400 rounded-lg text-sm border border-violet-500/30">
                      <Wand2 className="w-4 h-4" />Generate with AI
                    </button>
                  </div>
                )}

                {/* Step 4: Budget */}
                {campaignStep === 4 && (
                  <div className="space-y-4">
                    <h2 className="font-semibold mb-4">Budget & Schedule</h2>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Total Budget</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" 
                          placeholder="5,000" 
                          value={campaignFormData.total_budget}
                          onChange={(e) => setCampaignFormData({...campaignFormData, total_budget: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Daily Spend Limit</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" 
                          placeholder="200" 
                          value={campaignFormData.daily_limit}
                          onChange={(e) => setCampaignFormData({...campaignFormData, daily_limit: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <div className="text-sm text-emerald-400">💡 AI recommends $180/day for optimal results</div>
                    </div>
                  </div>
                )}

                {/* Step 5: Review */}
                {campaignStep === 5 && (
                  <div className="space-y-4">
                    <h2 className="font-semibold mb-4">Review & Launch</h2>
                    <div className="space-y-3">
                      {[
                        { label: 'Campaign', value: campaignFormData.name || 'Untitled' },
                        { label: 'Objective', value: campaignFormData.objective.charAt(0).toUpperCase() + campaignFormData.objective.slice(1) },
                        { label: 'Audience', value: campaignFormData.audience_segment },
                        { label: 'Platforms', value: campaignFormData.platforms.join(', ') || 'None selected' },
                        { label: 'Budget', value: `$${campaignFormData.total_budget || '0'} total${campaignFormData.daily_limit ? ` • $${campaignFormData.daily_limit}/day` : ''}` },
                        { label: 'Duration', value: `${campaignFormData.start_date || 'Not set'} - ${campaignFormData.end_date || 'Not set'}` }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between py-3 border-b border-slate-800">
                          <span className="text-slate-400">{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setCampaignStep(Math.max(1, campaignStep - 1))} 
                      className={`px-4 py-2 rounded-lg text-sm ${campaignStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'}`} 
                      disabled={campaignStep === 1}
                    >
                      Back
                    </button>
                    {campaignFormData.name && (
                      <button
                        onClick={async () => {
                          await saveCampaignDraft();
                          import('@/hooks/use-toast').then(({ toast }) => {
                            toast({
                              title: 'Draft saved!',
                              description: 'Your campaign progress has been saved.',
                            });
                          });
                        }}
                        className="px-6 py-2.5 border border-slate-700 rounded-lg hover:bg-slate-800 text-sm"
                      >
                        Save as Draft
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      if (campaignStep < 5) {
                        setCampaignStep(campaignStep + 1);
                      } else {
                        launchCampaign();
                      }
                    }} 
                    className="px-8 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    {campaignStep === 5 ? (editingCampaignId ? 'Update Campaign' : 'Launch Campaign') : 'Continue'}
                  </button>
                </div>
              </div>
                </>
              )}
            </div>
          )}

          {/* CONTENT AI */}
          {activeTab === 'content' && (
            <div className="max-w-7xl mx-auto p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Left Panel - Generator */}
                <div className="col-span-2 space-y-6">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Wand2 className="w-6 h-6 text-violet-400" />
                      <h2 className="text-2xl font-bold">AI Content Generator</h2>
                    </div>
                    
                    {/* Content Type Selector */}
                    <div className="mb-6">
                      <label className="text-sm text-slate-400 block mb-3 font-medium">Content Type</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { value: 'headline', label: 'Headline', icon: '📰' },
                          { value: 'ad_copy', label: 'Ad Copy', icon: '📝' },
                          { value: 'social_post', label: 'Social Post', icon: '📱' },
                          { value: 'email', label: 'Email', icon: '✉️' },
                          { value: 'cta', label: 'CTA', icon: '🎯' }
                        ].map(type => (
                          <button
                            key={type.value}
                            onClick={() => setAiContentType(type.value)}
                            className={`p-3 rounded-lg border transition-all text-center ${
                              aiContentType === type.value
                                ? 'border-violet-500 bg-violet-500/10'
                                : 'border-slate-700 hover:border-slate-600'
                            }`}
                          >
                            <div className="text-2xl mb-1">{type.icon}</div>
                            <div className="text-xs font-medium">{type.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Objective Selector */}
                    <div className="mb-6">
                      <label className="text-sm text-slate-400 block mb-3 font-medium">Campaign Objective</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'awareness', label: 'Awareness', icon: Eye },
                          { value: 'traffic', label: 'Traffic', icon: MousePointer },
                          { value: 'conversions', label: 'Conversions', icon: Target }
                        ].map(obj => {
                          const Icon = obj.icon;
                          return (
                            <button
                              key={obj.value}
                              onClick={() => setAiContentObjective(obj.value)}
                              className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${
                                aiContentObjective === obj.value
                                  ? 'border-violet-500 bg-violet-500/10'
                                  : 'border-slate-700 hover:border-slate-600'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="text-sm font-medium">{obj.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Platform Selector */}
                    <div className="mb-6">
                      <label className="text-sm text-slate-400 block mb-3 font-medium">Platform</label>
                      <select
                        value={aiContentPlatform}
                        onChange={(e) => setAiContentPlatform(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="google">Google Ads</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="twitter">Twitter/X</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                    
                    {/* Tone & Length */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="text-sm text-slate-400 block mb-2 font-medium">Tone</label>
                        <select
                          value={aiContentTone}
                          onChange={(e) => setAiContentTone(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                        >
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="friendly">Friendly</option>
                          <option value="urgent">Urgent</option>
                          <option value="playful">Playful</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 block mb-2 font-medium">Length</label>
                        <select
                          value={aiContentLength}
                          onChange={(e) => setAiContentLength(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                        >
                          <option value="short">Short</option>
                          <option value="medium">Medium</option>
                          <option value="long">Long</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Prompt Input */}
                    <div className="mb-6">
                      <label className="text-sm text-slate-400 block mb-2 font-medium">
                        Topic or Product Description
                      </label>
                      <textarea
                        value={aiContentPrompt}
                        onChange={(e) => setAiContentPrompt(e.target.value)}
                        placeholder="e.g., Summer fitness program for busy professionals..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 resize-none"
                        rows={4}
                      />
                    </div>
                    
                    {/* Generate Button */}
                    <button
                      onClick={generateAIContent}
                      disabled={isGeneratingAi || !aiContentPrompt.trim()}
                      className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGeneratingAi ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Content
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Generated Results */}
                  {generatedAiContent.length > 0 && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                      <h3 className="font-semibold mb-4">Generated Variations</h3>
                      <div className="space-y-3">
                        {generatedAiContent.map((item, index) => (
                          <div
                            key={item.id}
                            className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs text-slate-500">Variation {index + 1}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => copyToClipboard(item.content)}
                                  className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                                  title="Copy to clipboard"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => saveToLibrary(item.content)}
                                  className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                                  title="Save to library"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Right Panel - Content Library */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Content Library</h3>
                  
                  {loadingLibrary ? (
                    <div className="text-center py-8 text-slate-400">
                      Loading library...
                    </div>
                  ) : contentLibrary.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                      <p className="text-sm">No saved content yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                      {contentLibrary.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-violet-500/50 transition-all"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded">
                              {item.content_type}
                            </span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => toggleFavorite(item.id, item.is_favorite)}
                                className={`p-1 rounded transition-colors ${
                                  item.is_favorite ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-400'
                                }`}
                              >
                                <Star className="w-3.5 h-3.5" fill={item.is_favorite ? 'currentColor' : 'none'} />
                              </button>
                              <button
                                onClick={() => copyToClipboard(item.generated_content)}
                                className="p-1 text-slate-500 hover:text-white rounded transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteContent(item.id)}
                                className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-3 mb-2">
                            {item.generated_content}
                          </p>
                          <div className="text-xs text-slate-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AUDIENCE */}
          {activeTab === 'audience' && (
            <div className="space-y-6">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Audience', value: '847K', change: '+8.2%', up: true },
                  { label: 'Active Users (30d)', value: '235K', change: '+12.4%', up: true },
                  { label: 'Avg. Session Duration', value: '4m 32s', change: '+0.8%', up: true },
                  { label: 'Churn Rate', value: '2.1%', change: '-0.3%', up: true }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <span className="text-slate-400 text-sm">{stat.label}</span>
                    <div className="text-2xl font-bold mt-2 mb-1">{stat.value}</div>
                    <span className={`text-sm ${stat.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stat.change} vs last month
                    </span>
                  </div>
                ))}
              </div>

              {/* Main Charts Row */}
              <div className="grid grid-cols-3 gap-6">
                {/* Audience Segments Pie Chart */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Audience Segments</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={audienceSegments}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {audienceSegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {audienceSegments.map((seg, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                          <span className="text-slate-300">{seg.name}</span>
                        </div>
                        <span className="text-slate-400">{seg.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Segment Comparison Radar */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Segment Performance</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={demographicData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Radar
                        name="Young Professionals"
                        dataKey="A"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Parents 30-45"
                        dataKey="B"
                        stroke="#06b6d4"
                        fill="#06b6d4"
                        fillOpacity={0.3}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-violet-500" />
                      Young Prof.
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-cyan-500" />
                      Parents
                    </div>
                  </div>
                </div>

                {/* Demographics */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Demographics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-slate-400 mb-2">Age Distribution</div>
                      {[
                        { label: '18-24', value: 18 },
                        { label: '25-34', value: 35 },
                        { label: '35-44', value: 28 },
                        { label: '45-54', value: 12 },
                        { label: '55+', value: 7 }
                      ].map((age, i) => (
                        <div key={i} className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">{age.label}</span>
                            <span className="text-slate-300">{age.value}%</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5">
                            <div
                              className="bg-violet-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${age.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-slate-800">
                      <div className="text-xs text-slate-400 mb-2">Gender Split</div>
                      <div className="flex gap-2">
                        {[
                          { label: 'Female', value: 52 },
                          { label: 'Male', value: 46 },
                          { label: 'Other', value: 2 }
                        ].map((g, i) => (
                          <div key={i} className="flex-1 text-center">
                            <div className="text-xl font-bold">{g.value}%</div>
                            <div className="text-xs text-slate-400">{g.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="grid grid-cols-2 gap-6">
                {/* Top Locations */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Top Locations</h3>
                  <div className="space-y-3">
                    {[
                      { country: 'United States', value: 42, flag: '🇺🇸' },
                      { country: 'United Kingdom', value: 18, flag: '🇬🇧' },
                      { country: 'Canada', value: 12, flag: '🇨🇦' },
                      { country: 'Australia', value: 9, flag: '🇦🇺' },
                      { country: 'Germany', value: 7, flag: '🇩🇪' }
                    ].map((loc, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{loc.flag}</span>
                          <span className="text-sm">{loc.country}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-slate-700 rounded-full h-1.5">
                            <div
                              className="bg-cyan-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${loc.value}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-400 w-8 text-right">{loc.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Device Usage */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Device Usage</h3>
                  <div className="space-y-4">
                    {[
                      { type: 'Mobile', value: 68 },
                      { type: 'Desktop', value: 28 },
                      { type: 'Tablet', value: 4 }
                    ].map((dev, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">{dev.type}</span>
                          <span className="text-slate-400">{dev.value}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full transition-all"
                            style={{ width: `${dev.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <div className="text-xs text-slate-400 mb-3">Browser Distribution</div>
                    <div className="flex gap-2">
                      {[
                        { name: 'Chrome', value: 58 },
                        { name: 'Safari', value: 24 },
                        { name: 'Firefox', value: 12 },
                        { name: 'Other', value: 6 }
                      ].map((browser, i) => (
                        <div key={i} className="flex-1">
                          <div className="text-base font-bold">{browser.value}%</div>
                          <div className="text-xs text-slate-400">{browser.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AUDIENCE MANAGEMENT */}
          {activeTab === 'audience' && (
            <div className="max-w-7xl mx-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Audience Management</h2>
                  <p className="text-slate-400">Create and manage target audiences for your campaigns</p>
                </div>
                <button
                  onClick={() => {
                    resetAudienceForm();
                    setEditingAudience(null);
                    setShowAudienceModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg font-medium hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  Create Audience
                </button>
              </div>
              
              {loadingAudiences ? (
                <div className="text-center py-12 text-slate-400">
                  Loading audiences...
                </div>
              ) : audiences.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400 mb-4">No audiences yet. Create your first audience to get started!</p>
                  <button
                    onClick={() => setShowAudienceModal(true)}
                    className="px-6 py-2 bg-violet-500 hover:bg-violet-600 rounded-lg transition-colors"
                  >
                    Create First Audience
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {audiences.map((audience: any) => (
                    <div
                      key={audience.id}
                      className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-violet-500/50 transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedAudience(audience);
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{audience.name}</h3>
                          {audience.description && (
                            <p className="text-sm text-slate-400 line-clamp-2">{audience.description}</p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAudienceFavorite(audience.id, audience.is_favorite);
                          }}
                          className={`p-1 rounded transition-colors ${
                            audience.is_favorite ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-400'
                          }`}
                        >
                          <Star className="w-4 h-4" fill={audience.is_favorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Users className="w-4 h-4" />
                          <span>Age {audience.age_min}-{audience.age_max}</span>
                        </div>
                        
                        {audience.countries && audience.countries.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Globe className="w-4 h-4" />
                            <span>{audience.countries.slice(0, 2).join(', ')}{audience.countries.length > 2 ? '...' : ''}</span>
                          </div>
                        )}
                        
                        {audience.interests && audience.interests.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {audience.interests.slice(0, 3).map((interest: string) => (
                              <span key={interest} className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded">
                                {interest}
                              </span>
                            ))}
                            {audience.interests.length > 3 && (
                              <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded">
                                +{audience.interests.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-3 border-t border-slate-700">
                        <div className="text-xs text-slate-500 mb-1">Estimated Reach</div>
                        <div className="text-sm font-semibold">
                          {(audience.estimated_size_min || 0).toLocaleString()} - {(audience.estimated_size_max || 0).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditAudience(audience);
                          }}
                          className="flex-1 px-3 py-1.5 text-sm border border-slate-700 hover:bg-slate-800 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            applyAudienceToCampaign(audience);
                          }}
                          className="flex-1 px-3 py-1.5 text-sm bg-violet-500 hover:bg-violet-600 rounded transition-colors"
                        >
                          Use in Campaign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Analytics Deep Dive</h1>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-sm transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 text-sm transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Impressions', value: '356K', icon: Eye },
                  { label: 'Click-Through Rate', value: '5.8%', icon: MousePointer },
                  { label: 'Total Conversions', value: '6.3K', icon: Target },
                  { label: 'Revenue Generated', value: '$91.9K', icon: DollarSign }
                ].map((stat, i) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-slate-400 text-xs">{stat.label}</span>
                        <StatIcon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                  );
                })}
              </div>

              {/* Performance Trends Chart */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Performance Trends</h2>
                  <div className="flex gap-2">
                    {['Impressions', 'Clicks', 'Conversions'].map(m => (
                      <button
                        key={m}
                        onClick={() => setSelectedMetric(m.toLowerCase())}
                        className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          selectedMetric === m.toLowerCase()
                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                            : 'text-slate-400 hover:bg-slate-800 border border-transparent'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={analyticsMetrics}>
                    <defs>
                      <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#8b5cf6"
                      fill="url(#metricGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Channel Performance & Conversion Funnel */}
              <div className="grid grid-cols-2 gap-6">
                {/* Channel Performance Table */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Channel Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-400 border-b border-slate-800">
                          <th className="pb-3 font-medium text-xs">Channel</th>
                          <th className="pb-3 font-medium text-xs">Impressions</th>
                          <th className="pb-3 font-medium text-xs">CTR</th>
                          <th className="pb-3 font-medium text-xs">Spend</th>
                        </tr>
                      </thead>
                      <tbody>
                        {channelPerformance.map((ch, i) => (
                          <tr key={i} className="border-b border-slate-800/50">
                            <td className="py-3">{ch.name}</td>
                            <td className="py-3 text-slate-400">{ch.impressions}</td>
                            <td className="py-3">
                              <span
                                className={
                                  parseFloat(ch.ctr) > 7
                                    ? 'text-emerald-400'
                                    : 'text-slate-400'
                                }
                              >
                                {ch.ctr}
                              </span>
                            </td>
                            <td className="py-3 text-slate-400">{ch.spend}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Best Performing</span>
                      <span className="text-emerald-400 font-medium">Email (34% CTR)</span>
                    </div>
                  </div>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Conversion Funnel</h3>
                  <div className="space-y-3">
                    {[
                      { stage: 'Impressions', value: 356000, percent: 100 },
                      { stage: 'Clicks', value: 20700, percent: 5.8 },
                      { stage: 'Landing Page', value: 18200, percent: 5.1 },
                      { stage: 'Add to Cart', value: 9800, percent: 2.8 },
                      { stage: 'Checkout', value: 7100, percent: 2.0 },
                      { stage: 'Purchase', value: 6300, percent: 1.8 }
                    ].map((stage, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-300">{stage.stage}</span>
                          <span className="text-slate-400">
                            {stage.value.toLocaleString()} ({stage.percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full transition-all"
                            style={{ width: `${stage.percent * 10}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="text-xs text-emerald-400">
                      💡 Conversion rate improved 18% vs last month
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI & Cost Analysis */}
              <div className="grid grid-cols-3 gap-6">
                {/* ROI by Channel */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4">ROI by Channel</h3>
                  <div className="space-y-3">
                    {[
                      { channel: 'Email', roi: 425, trend: 'up' },
                      { channel: 'Facebook', roi: 187, trend: 'up' },
                      { channel: 'Instagram', roi: 142, trend: 'up' },
                      { channel: 'Google Ads', roi: 89, trend: 'down' },
                      { channel: 'LinkedIn', roi: 56, trend: 'down' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">{item.channel}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              item.trend === 'up' ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {item.roi}%
                          </span>
                          {item.trend === 'up' ? (
                            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-amber-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Per Conversion */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Cost Per Conversion</h3>
                  <div className="space-y-3">
                    {[
                      { channel: 'Email', cpc: '$0.16' },
                      { channel: 'Instagram', cpc: '$0.18' },
                      { channel: 'Facebook', cpc: '$0.26' },
                      { channel: 'Google Ads', cpc: '$0.38' },
                      { channel: 'LinkedIn', cpc: '$0.97' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">{item.channel}</span>
                        <span className="text-sm font-mono text-slate-400">{item.cpc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-fuchsia-400" />
                    AI Insights
                  </h3>
                  <div className="space-y-3">
                    {[
                      { text: 'Email campaigns show 425% ROI - increase budget allocation', type: 'success' },
                      { text: 'LinkedIn CPC is 5x higher than other channels', type: 'warning' },
                      { text: 'Instagram engagement peaks on weekends', type: 'info' }
                    ].map((insight, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg text-xs leading-relaxed ${
                          insight.type === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : insight.type === 'warning'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                        }`}
                      >
                        {insight.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="max-w-7xl mx-auto p-6 space-y-6">
              {/* Header with Date Range Selector */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
                  <p className="text-slate-400">Performance metrics and insights across all campaigns</p>
                </div>
                
                <div className="flex gap-3">
                  {/* Date Range Selector */}
                  <div className="flex gap-2 bg-slate-900/50 border border-slate-800 rounded-lg p-1">
                    {[
                      { value: '7d', label: '7 Days' },
                      { value: '30d', label: '30 Days' },
                      { value: '90d', label: '90 Days' },
                      { value: 'all', label: 'All Time' }
                    ].map(range => (
                      <button
                        key={range.value}
                        onClick={() => {
                          setAnalyticsDateRange(range.value);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          analyticsDateRange === range.value
                            ? 'bg-violet-500 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Export Button */}
                  <button
                    onClick={exportAnalytics}
                    disabled={!analyticsData}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
              
              {loadingAnalytics ? (
                <div className="text-center py-12 text-slate-400">
                  Loading analytics...
                </div>
              ) : !analyticsData ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-400">No analytics data available</p>
                </div>
              ) : (
                <>
                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    {/* Impressions */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <Eye className="w-5 h-5 text-cyan-400" />
                        </div>
                        {comparisonData && (
                          <span className={`text-xs flex items-center gap-1 ${
                            Number(calculateChange(analyticsData.totals.impressions, comparisonData.totals.impressions)) >= 0
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}>
                            {Number(calculateChange(analyticsData.totals.impressions, comparisonData.totals.impressions)) >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {Math.abs(Number(calculateChange(analyticsData.totals.impressions, comparisonData.totals.impressions)))}%
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {analyticsData.totals.impressions.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-400">Total Impressions</div>
                    </div>
                    
                    {/* Clicks */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                          <MousePointer className="w-5 h-5 text-emerald-400" />
                        </div>
                        {comparisonData && (
                          <span className={`text-xs flex items-center gap-1 ${
                            Number(calculateChange(analyticsData.totals.clicks, comparisonData.totals.clicks)) >= 0
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}>
                            {Number(calculateChange(analyticsData.totals.clicks, comparisonData.totals.clicks)) >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {Math.abs(Number(calculateChange(analyticsData.totals.clicks, comparisonData.totals.clicks)))}%
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {analyticsData.totals.clicks.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-400">Total Clicks</div>
                      <div className="text-xs text-emerald-400 mt-1">
                        {analyticsData.averages.ctr}% CTR
                      </div>
                    </div>
                    
                    {/* Conversions */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-violet-500/20 rounded-lg">
                          <Target className="w-5 h-5 text-violet-400" />
                        </div>
                        {comparisonData && (
                          <span className={`text-xs flex items-center gap-1 ${
                            Number(calculateChange(analyticsData.totals.conversions, comparisonData.totals.conversions)) >= 0
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}>
                            {Number(calculateChange(analyticsData.totals.conversions, comparisonData.totals.conversions)) >= 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {Math.abs(Number(calculateChange(analyticsData.totals.conversions, comparisonData.totals.conversions)))}%
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {analyticsData.totals.conversions.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-400">Total Conversions</div>
                      <div className="text-xs text-violet-400 mt-1">
                        {analyticsData.averages.cvr}% CVR
                      </div>
                    </div>
                    
                    {/* Spend */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-fuchsia-500/20 rounded-lg">
                          <DollarSign className="w-5 h-5 text-fuchsia-400" />
                        </div>
                        {comparisonData && (
                          <span className={`text-xs flex items-center gap-1 ${
                            Number(calculateChange(analyticsData.totals.spend, comparisonData.totals.spend)) <= 0
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}>
                            {Number(calculateChange(analyticsData.totals.spend, comparisonData.totals.spend)) <= 0 ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : (
                              <TrendingUp className="w-3 h-3" />
                            )}
                            {Math.abs(Number(calculateChange(analyticsData.totals.spend, comparisonData.totals.spend)))}%
                          </span>
                        )}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        ${analyticsData.totals.spend.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-400">Total Spend</div>
                      <div className="text-xs text-fuchsia-400 mt-1">
                        ${analyticsData.averages.cpc} CPC
                      </div>
                    </div>
                  </div>
                  
                  {/* Performance Chart */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">Performance Trends</h3>
                      
                      {/* Metric Selector */}
                      <div className="flex gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
                        {[
                          { value: 'impressions', label: 'Impressions', color: 'text-cyan-400' },
                          { value: 'clicks', label: 'Clicks', color: 'text-emerald-400' },
                          { value: 'conversions', label: 'Conversions', color: 'text-violet-400' },
                          { value: 'spend', label: 'Spend', color: 'text-fuchsia-400' }
                        ].map(metric => (
                          <button
                            key={metric.value}
                            onClick={() => setSelectedAnalyticsMetric(metric.value)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                              selectedAnalyticsMetric === metric.value
                                ? 'bg-slate-700 ' + metric.color
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {metric.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Simple Line Chart using Recharts */}
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analyticsData.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="dateLabel" 
                          stroke="#94a3b8"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#94a3b8"
                          style={{ fontSize: '12px' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey={selectedAnalyticsMetric}
                          stroke={
                            selectedAnalyticsMetric === 'impressions' ? '#22d3ee' :
                            selectedAnalyticsMetric === 'clicks' ? '#10b981' :
                            selectedAnalyticsMetric === 'conversions' ? '#a855f7' :
                            '#ec4899'
                          }
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Platform Performance */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-6">Platform Performance</h3>
                    
                    <div className="space-y-4">
                      {platformBreakdown.map((platform, index) => (
                        <div key={platform.platform}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{platform.platform}</span>
                            <span className="text-sm text-slate-400">
                              {platform.impressions.toLocaleString()} impressions
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                              style={{ 
                                width: `${(platform.impressions / platformBreakdown[0].impressions) * 100}%` 
                              }}
                            />
                          </div>
                          
                          {/* Metrics */}
                          <div className="flex gap-6 mt-2 text-sm">
                            <span className="text-slate-400">
                              <span className="text-emerald-400 font-medium">{platform.ctr}%</span> CTR
                            </span>
                            <span className="text-slate-400">
                              <span className="text-violet-400 font-medium">{platform.conversions}</span> conversions
                            </span>
                            <span className="text-slate-400">
                              <span className="text-fuchsia-400 font-medium">${platform.cpc}</span> CPC
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* AI Insights */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-6 h-6 text-violet-400" />
                      <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Dynamic insights based on data */}
                      {parseFloat(analyticsData.averages.ctr) > 4 && (
                        <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                          <div className="flex items-start gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-sm font-semibold text-emerald-300 mb-1">High Performance Alert</div>
                              <p className="text-sm text-emerald-200/80">
                                Your CTR of {analyticsData.averages.ctr}% is significantly above industry average. Consider increasing budget allocation to capitalize on this strong engagement.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {platformBreakdown[0] && (
                        <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                          <div className="flex items-start gap-2">
                            <Target className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-sm font-semibold text-cyan-300 mb-1">Platform Opportunity</div>
                              <p className="text-sm text-cyan-200/80">
                                {platformBreakdown[0].platform} is your top performing platform with {platformBreakdown[0].impressions.toLocaleString()} impressions. Consider expanding your presence here.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {parseFloat(analyticsData.averages.cvr) < 2 && (
                        <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-sm font-semibold text-amber-300 mb-1">Conversion Optimization</div>
                              <p className="text-sm text-amber-200/80">
                                Your conversion rate of {analyticsData.averages.cvr}% could be improved. Review your landing pages and consider A/B testing different CTAs.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-4 bg-violet-500/10 rounded-lg border border-violet-500/20">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-5 h-5 text-violet-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-violet-300 mb-1">Recommendation</div>
                            <p className="text-sm text-violet-200/80">
                              Based on your current ROAS of {analyticsData.averages.roas}x, your campaigns are profitable. Consider scaling up investment in your top-performing campaigns.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* SCHEDULER */}
          {activeTab === 'scheduler' && (
            <div className="max-w-7xl mx-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Content Scheduler</h2>
                  <p className="text-slate-400">Schedule posts and automate your marketing campaigns</p>
                </div>
                <button
                  onClick={() => {
                    resetScheduleForm();
                    setShowScheduleModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg font-medium hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  Schedule Post
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Scheduled Posts Queue */}
                <div className="col-span-2 space-y-6">
                  {/* Upcoming Posts */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Upcoming Posts</h3>
                    
                    {loadingSchedule ? (
                      <div className="text-center py-8 text-slate-400">
                        Loading schedule...
                      </div>
                    ) : scheduledPosts.filter(p => p.status === 'scheduled').length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p className="text-slate-400 mb-4">No scheduled posts yet</p>
                        <button
                          onClick={() => setShowScheduleModal(true)}
                          className="px-4 py-2 bg-violet-500 hover:bg-violet-600 rounded-lg text-sm"
                        >
                          Schedule First Post
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {scheduledPosts
                          .filter(post => post.status === 'scheduled')
                          .slice(0, 10)
                          .map((post) => (
                            <div
                              key={post.id}
                              className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-violet-500/50 transition-all"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold mb-1">{post.title}</h4>
                                  <p className="text-sm text-slate-400 line-clamp-2">{post.content}</p>
                                </div>
                                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded ml-2 shrink-0">
                                  {post.post_type}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatScheduledTime(post.scheduled_time)}
                                  </span>
                                  <span className="flex gap-1">
                                    {post.platforms.slice(0, 3).map((p: string) => (
                                      <span key={p} className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded">
                                        {p}
                                      </span>
                                    ))}
                                  </span>
                                </div>
                                
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => cancelScheduledPost(post.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteScheduledPost(post.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Published Posts History */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Recently Published</h3>
                    
                    {scheduledPosts.filter(p => p.status === 'published').length === 0 ? (
                      <div className="text-center py-6 text-slate-400">
                        <p className="text-sm">No published posts yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {scheduledPosts
                          .filter(post => post.status === 'published')
                          .slice(0, 5)
                          .map((post) => (
                            <div
                              key={post.id}
                              className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/50"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-sm">{post.title}</h4>
                                <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                                  Published
                                </span>
                              </div>
                              <div className="text-xs text-slate-400">
                                {formatScheduledTime(post.published_at)}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Column - Automation Rules & Stats */}
                <div className="space-y-6">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Automation Rules</h3>
                      <button
                        onClick={() => setShowAutomationModal(true)}
                        className="p-1.5 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {loadingAutomation ? (
                      <div className="text-center py-6 text-slate-400">
                        Loading rules...
                      </div>
                    ) : automationRules.length === 0 ? (
                      <div className="text-center py-6">
                        <Zap className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                        <p className="text-sm text-slate-400 mb-3">No automation rules</p>
                        <button
                          onClick={() => setShowAutomationModal(true)}
                          className="text-sm text-violet-400 hover:text-violet-300"
                        >
                          Create first rule
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {automationRules.map((rule) => (
                          <div
                            key={rule.id}
                            className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1">{rule.name}</h4>
                                {rule.description && (
                                  <p className="text-xs text-slate-400 line-clamp-2">{rule.description}</p>
                                )}
                              </div>
                              <button
                                onClick={() => toggleAutomationRule(rule.id, rule.is_active)}
                                className={`p-1 rounded transition-colors ${
                                  rule.is_active ? 'text-emerald-400' : 'text-slate-500'
                                }`}
                              >
                                <Zap className="w-4 h-4" fill={rule.is_active ? 'currentColor' : 'none'} />
                              </button>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
                              <span className="text-xs text-slate-500">
                                {rule.trigger_type.replace('_', ' ')}
                              </span>
                              <button
                                onClick={() => deleteAutomationRule(rule.id)}
                                className="text-xs text-slate-500 hover:text-red-400"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-slate-400 mb-4">Schedule Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">Scheduled</span>
                        <span className="font-semibold">
                          {scheduledPosts.filter(p => p.status === 'scheduled').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">Published</span>
                        <span className="font-semibold text-emerald-400">
                          {scheduledPosts.filter(p => p.status === 'published').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-400">Active Rules</span>
                        <span className="font-semibold text-violet-400">
                          {automationRules.filter(r => r.is_active).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-5xl mx-auto p-6">
              <h2 className="text-2xl font-bold mb-6">Connected Accounts</h2>
              
              {/* Social Connections */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Social Media Accounts</h3>
                
                <div className="space-y-4">
                  {/* Facebook */}
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">f</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Facebook</h4>
                        <p className="text-sm text-slate-400">
                          {socialConnections.filter(c => c.platform === 'facebook').length} page(s) connected
                        </p>
                      </div>
                    </div>
                    
                    {socialConnections.some(c => c.platform === 'facebook') ? (
                      <div className="flex gap-2 items-center">
                        <span className="text-sm text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Connected
                        </span>
                        <button
                          onClick={connectFacebook}
                          className="text-sm text-violet-400 hover:text-violet-300 ml-2"
                        >
                          Add More
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={connectFacebook}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm"
                      >
                        Connect Facebook
                      </button>
                    )}
                  </div>
                  
                  {/* Instagram */}
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg"></div>
                      <div>
                        <h4 className="font-semibold">Instagram</h4>
                        <p className="text-sm text-slate-400">
                          {socialConnections.filter(c => c.platform === 'instagram').length} account(s) connected
                        </p>
                      </div>
                    </div>
                    
                    {socialConnections.some(c => c.platform === 'instagram') ? (
                      <span className="text-sm text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Connected
                      </span>
                    ) : (
                      <button
                        onClick={connectFacebook}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-lg text-sm"
                      >
                        Connect Instagram
                      </button>
                    )}
                  </div>
                  
                  {/* Twitter - Coming Soon */}
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">𝕏</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Twitter / X</h4>
                        <p className="text-sm text-slate-400">Coming soon</p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">Coming Soon</span>
                  </div>
                  
                  {/* LinkedIn - Coming Soon */}
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">in</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">LinkedIn</h4>
                        <p className="text-sm text-slate-400">Coming soon</p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">Coming Soon</span>
                  </div>
                </div>
              </div>
              
              {/* Connected Accounts List */}
              {socialConnections.length > 0 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Active Connections</h3>
                  
                  {loadingConnections ? (
                    <div className="text-center py-6 text-slate-400">
                      Loading connections...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {socialConnections.map(connection => (
                        <div 
                          key={connection.id}
                          className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                        >
                          <div className="flex items-center gap-3">
                            {connection.profile_picture_url ? (
                              <img 
                                src={connection.profile_picture_url} 
                                alt={connection.account_name}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                connection.platform === 'facebook' ? 'bg-blue-500' :
                                connection.platform === 'instagram' ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500' :
                                'bg-slate-600'
                              }`}>
                                <span className="text-white font-semibold text-sm">
                                  {connection.account_name?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium">{connection.account_name}</h4>
                              <p className="text-sm text-slate-400">
                                {connection.platform} • {connection.account_type}
                                {connection.follower_count > 0 && ` • ${connection.follower_count.toLocaleString()} followers`}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => disconnectSocialAccount(connection.id)}
                            className="text-sm text-red-400 hover:text-red-300"
                          >
                            Disconnect
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* Campaign Details Modal */}
      {showCampaignDetails && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedCampaign.name}</h2>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  selectedCampaign.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                  selectedCampaign.status === 'paused' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {selectedCampaign.status}
                </span>
              </div>
              <button
                onClick={() => {
                  setShowCampaignDetails(false);
                  setSelectedCampaign(null);
                }}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Campaign Details */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Campaign Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-500">Objective</label>
                    <p className="text-sm">
                      {selectedCampaign.objective === 'awareness' ? 'Brand Awareness' :
                       selectedCampaign.objective === 'traffic' ? 'Website Traffic' : 'Conversions'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Budget</label>
                    <p className="text-sm">${selectedCampaign.total_budget?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Start Date</label>
                    <p className="text-sm">{selectedCampaign.start_date ? new Date(selectedCampaign.start_date).toLocaleDateString() : 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">End Date</label>
                    <p className="text-sm">{selectedCampaign.end_date ? new Date(selectedCampaign.end_date).toLocaleDateString() : 'Not set'}</p>
                  </div>
                </div>
              </div>
              
              {/* Platform */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Platform</h3>
                <p className="text-sm">{selectedCampaign.platform}</p>
              </div>
              
              {/* Campaign Analytics Section */}
              {selectedCampaign.status === 'active' && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-4">Performance Metrics</h3>
                  
                  {loadingMetrics ? (
                    <div className="text-center py-6 text-slate-400">
                      Loading metrics...
                    </div>
                  ) : campaignMetrics[selectedCampaign.id] ? (
                    <>
                      {/* Key Metrics Grid */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-500 mb-1">Impressions</div>
                          <div className="text-lg font-semibold">
                            {(campaignMetrics[selectedCampaign.id].impressions || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-500 mb-1">Clicks</div>
                          <div className="text-lg font-semibold">
                            {(campaignMetrics[selectedCampaign.id].clicks || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-500 mb-1">CTR</div>
                          <div className="text-lg font-semibold text-emerald-400">
                            {(campaignMetrics[selectedCampaign.id].ctr || 0).toFixed(2)}%
                          </div>
                        </div>
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-500 mb-1">Conversions</div>
                          <div className="text-lg font-semibold text-violet-400">
                            {(campaignMetrics[selectedCampaign.id].conversions || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Metrics */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 bg-slate-800/30 rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Total Spend</div>
                          <div className="font-semibold">
                            ${(campaignMetrics[selectedCampaign.id].spend || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-800/30 rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Cost per Click</div>
                          <div className="font-semibold">
                            ${(campaignMetrics[selectedCampaign.id].cpc || 0).toFixed(2)}
                          </div>
                        </div>
                        <div className="p-3 bg-slate-800/30 rounded-lg">
                          <div className="text-xs text-slate-500 mb-1">Conversion Rate</div>
                          <div className="font-semibold text-emerald-400">
                            {(campaignMetrics[selectedCampaign.id].cvr || 0).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* AI Insights */}
                      <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-cyan-300 mb-1">AI Insight</div>
                            <p className="text-sm text-cyan-200/80">
                              {campaignMetrics[selectedCampaign.id].ctr > 5 
                                ? "Your CTR is performing above average! Consider increasing your daily budget to capitalize on this high engagement."
                                : campaignMetrics[selectedCampaign.id].ctr > 2
                                ? "Your campaign is performing well. Try A/B testing different ad creatives to further improve CTR."
                                : "Your CTR could be improved. Consider refining your targeting or updating your ad creative to better resonate with your audience."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => fetchCampaignMetrics(selectedCampaign.id)}
                      className="w-full py-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-sm"
                    >
                      Load Performance Data
                    </button>
                  )}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => editCampaign(selectedCampaign)}
                  className="flex-1 px-4 py-2.5 bg-violet-500 hover:bg-violet-600 rounded-lg transition-colors"
                >
                  Edit Campaign
                </button>
                <button
                  onClick={() => updateCampaignStatus(selectedCampaign.id, selectedCampaign.status === 'active' ? 'paused' : 'active')}
                  className="flex-1 px-4 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {selectedCampaign.status === 'active' ? 'Pause' : 'Resume'} Campaign
                </button>
                <button
                  onClick={() => deleteCampaign(selectedCampaign.id)}
                  className="px-4 py-2.5 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audience Builder Modal */}
      {showAudienceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-2xl font-bold">
                {editingAudience ? 'Edit Audience' : 'Create New Audience'}
              </h2>
              <button
                onClick={() => {
                  setShowAudienceModal(false);
                  setEditingAudience(null);
                  resetAudienceForm();
                }}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Audience Name *</label>
                    <input
                      type="text"
                      value={audienceFormData.name}
                      onChange={(e) => setAudienceFormData({...audienceFormData, name: e.target.value})}
                      placeholder="e.g., Young Professionals"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Description</label>
                    <textarea
                      value={audienceFormData.description}
                      onChange={(e) => setAudienceFormData({...audienceFormData, description: e.target.value})}
                      placeholder="Describe this audience..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              
              {/* Demographics */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-4">Demographics</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Min Age</label>
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={audienceFormData.age_min}
                      onChange={(e) => setAudienceFormData({...audienceFormData, age_min: parseInt(e.target.value)})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Max Age</label>
                    <input
                      type="number"
                      min="13"
                      max="100"
                      value={audienceFormData.age_max}
                      onChange={(e) => setAudienceFormData({...audienceFormData, age_max: parseInt(e.target.value)})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Gender</label>
                  <div className="flex gap-2">
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        onClick={() => setAudienceFormData({
                          ...audienceFormData,
                          gender: toggleArrayItem(audienceFormData.gender, g.toLowerCase())
                        })}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          audienceFormData.gender.includes(g.toLowerCase())
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Geographic */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-4">Geographic Targeting</h3>
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Countries</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'].map((country) => (
                      <button
                        key={country}
                        onClick={() => setAudienceFormData({
                          ...audienceFormData,
                          countries: toggleArrayItem(audienceFormData.countries, country)
                        })}
                        className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                          audienceFormData.countries.includes(country)
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Interests */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-4">Interests</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    'Technology', 'Business', 'Fitness', 'Travel',
                    'Fashion', 'Food', 'Sports', 'Gaming',
                    'Music', 'Art', 'Health', 'Education'
                  ].map((interest) => (
                    <button
                      key={interest}
                      onClick={() => setAudienceFormData({
                        ...audienceFormData,
                        interests: toggleArrayItem(audienceFormData.interests, interest)
                      })}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                        audienceFormData.interests.includes(interest)
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Platforms */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-4">Target Platforms</h3>
                <div className="grid grid-cols-4 gap-2">
                  {['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube', 'Google Ads', 'Email'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setAudienceFormData({
                        ...audienceFormData,
                        platforms: toggleArrayItem(audienceFormData.platforms, platform)
                      })}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                        audienceFormData.platforms.includes(platform)
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Estimated Reach */}
              <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold text-cyan-300">Estimated Reach</span>
                </div>
                <p className="text-2xl font-bold text-cyan-200">
                  {(() => {
                    const size = calculateAudienceSize(audienceFormData);
                    return `${size.min.toLocaleString()} - ${size.max.toLocaleString()}`;
                  })()}
                </p>
                <p className="text-sm text-cyan-300/70 mt-1">potential audience members</p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowAudienceModal(false);
                  setEditingAudience(null);
                  resetAudienceForm();
                }}
                className="flex-1 px-6 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              {editingAudience && (
                <button
                  onClick={() => deleteAudience(editingAudience)}
                  className="px-6 py-2.5 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => editingAudience ? updateAudience() : createAudience()}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90 rounded-lg transition-opacity"
              >
                {editingAudience ? 'Update Audience' : 'Create Audience'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Post Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-2xl font-bold">Schedule Post</h2>
              <button onClick={() => { setShowScheduleModal(false); resetScheduleForm(); }} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="text-sm text-slate-400 block mb-3 font-medium">Post Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'social', label: 'Social Post' },
                    { value: 'ad', label: 'Advertisement' },
                    { value: 'email', label: 'Email' },
                    { value: 'blog', label: 'Blog Post' }
                  ].map(type => (
                    <button key={type.value} onClick={() => setScheduleFormData({...scheduleFormData, post_type: type.value})} className={`p-3 rounded-lg border text-sm transition-all ${scheduleFormData.post_type === type.value ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-slate-400 block mb-2 font-medium">Title *</label>
                <input type="text" value={scheduleFormData.title} onChange={(e) => setScheduleFormData({...scheduleFormData, title: e.target.value})} placeholder="Post title..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500" />
              </div>
              
              <div>
                <label className="text-sm text-slate-400 block mb-2 font-medium">Content *</label>
                <textarea value={scheduleFormData.content} onChange={(e) => setScheduleFormData({...scheduleFormData, content: e.target.value})} placeholder="Write your post content here..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 resize-none" rows={6} />
              </div>
              
              <div>
                <label className="text-sm text-slate-400 block mb-3 font-medium">Platforms *</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube'].map(platform => (
                    <button key={platform} onClick={() => setScheduleFormData({ ...scheduleFormData, platforms: scheduleFormData.platforms.includes(platform) ? scheduleFormData.platforms.filter(p => p !== platform) : [...scheduleFormData.platforms, platform] })} className={`p-2 rounded-lg border text-sm transition-all ${scheduleFormData.platforms.includes(platform) ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2 font-medium">Date & Time *</label>
                  <input type="datetime-local" value={scheduleFormData.scheduled_time} onChange={(e) => setScheduleFormData({...scheduleFormData, scheduled_time: e.target.value})} min={new Date().toISOString().slice(0, 16)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500" />
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 block mb-2 font-medium">Recurrence</label>
                  <select value={scheduleFormData.recurrence} onChange={(e) => setScheduleFormData({...scheduleFormData, recurrence: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500">
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              
              {campaigns.length > 0 && (
                <div>
                  <label className="text-sm text-slate-400 block mb-2 font-medium">Link to Campaign (Optional)</label>
                  <select value={scheduleFormData.campaign_id || ''} onChange={(e) => setScheduleFormData({...scheduleFormData, campaign_id: e.target.value || null})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-violet-500">
                    <option value="">No campaign</option>
                    {campaigns.map((campaign: any) => (
                      <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 p-6 border-t border-slate-800">
              <button onClick={() => { setShowScheduleModal(false); resetScheduleForm(); }} className="flex-1 px-6 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={createScheduledPost} className="flex-1 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:opacity-90 rounded-lg transition-opacity">
                Schedule Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automation Rule Modal */}
      {showAutomationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold">Automation Rules</h2>
              <button onClick={() => setShowAutomationModal(false)} className="p-2 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center py-8">
                <Zap className="w-16 h-16 mx-auto mb-4 text-violet-400" />
                <h3 className="text-lg font-semibold mb-2">Automation Coming Soon</h3>
                <p className="text-slate-400 mb-4">
                  Advanced automation rules will be available in the next update. You'll be able to create triggers and actions to automate your marketing workflows.
                </p>
                <button onClick={() => setShowAutomationModal(false)} className="px-6 py-2 bg-violet-500 hover:bg-violet-600 rounded-lg">
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}