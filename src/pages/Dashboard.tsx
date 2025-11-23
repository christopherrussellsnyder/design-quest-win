import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, TrendingUp, Users, Mail, Target, Zap, ChevronDown, Play, Pause, Settings, Bell, Search, Plus, ArrowUpRight, ArrowDownRight, LayoutDashboard, FileText, Send, Megaphone, Calendar, ChevronRight, Image, Type, Video, Wand2, Copy, RefreshCw, Check, Filter, Download, Eye, MousePointer, DollarSign, ChevronLeft, BarChart3, LogOut } from 'lucide-react';

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
    } catch (err: any) {
      console.error('Failed to load campaigns:', err);
      setCampaignsError(err.message || 'Failed to load campaigns');
    } finally {
      setCampaignsLoading(false);
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

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'campaigns', icon: Megaphone, label: 'Campaign Builder' },
    { id: 'content', icon: FileText, label: 'Content AI' },
    { id: 'audience', icon: Users, label: 'Audience' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'scheduler', icon: Calendar, label: 'Scheduler' },
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
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
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeTab === item.id 
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
                        {campaigns.map(c => (
                          <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <td className="py-4">
                              <span className="font-medium">{c.name}</span>
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
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <button className="p-1.5 rounded hover:bg-slate-700 transition-colors">
                                  {c.status === 'active' ? <Pause className="w-4 h-4 text-slate-400" /> : <Play className="w-4 h-4 text-slate-400" />}
                                </button>
                                <button className="p-1.5 rounded hover:bg-slate-700 transition-colors">
                                  <Settings className="w-4 h-4 text-slate-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
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
              <div className="flex items-center gap-4 mb-6">
                <button onClick={() => setActiveTab('dashboard')} className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold">Campaign Builder</h1>
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
                      <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" placeholder="e.g., Summer Sale 2024" defaultValue="Summer Sale 2024" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Objective</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { icon: Eye, label: 'Awareness', desc: 'Reach new audiences' },
                          { icon: MousePointer, label: 'Traffic', desc: 'Drive website visits' },
                          { icon: Target, label: 'Conversions', desc: 'Increase sales' }
                        ].map((obj, i) => {
                          const ObjIcon = obj.icon;
                          return (
                            <button key={i} className={`p-4 rounded-lg border text-left transition-all ${i === 0 ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
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
                        <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" defaultValue="2024-07-01" />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 block mb-2">End Date</label>
                        <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" defaultValue="2024-07-28" />
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
                      <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500">
                        <option>Young Professionals (25-34)</option>
                        <option>Parents (30-45)</option>
                        <option>Students (18-24)</option>
                        <option>Custom audience...</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Locations</label>
                      <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" placeholder="United States, Canada..." defaultValue="United States, United Kingdom" />
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
                        {['Facebook', 'Instagram', 'Google', 'Email'].map(p => (
                          <button key={p} className="px-4 py-2 rounded-lg border border-slate-700 hover:border-violet-500 text-sm">{p}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Primary Message</label>
                      <textarea className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm h-20 resize-none focus:outline-none focus:border-violet-500" placeholder="What's the main message?" defaultValue="Get 50% off all summer essentials! Limited time offer." />
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
                        <input className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" placeholder="5,000" defaultValue="5,000" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">Daily Spend Limit</label>
                      <div className="relative">
                        <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" placeholder="200" defaultValue="180" />
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
                        { label: 'Campaign', value: 'Summer Sale 2024' },
                        { label: 'Objective', value: 'Awareness' },
                        { label: 'Audience', value: 'Young Professionals • 1.2M-1.8M reach' },
                        { label: 'Platforms', value: 'Facebook, Instagram, Google' },
                        { label: 'Budget', value: '$5,000 total • $180/day' },
                        { label: 'Duration', value: 'Jul 1 - Jul 28, 2024' }
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
                  <button 
                    onClick={() => setCampaignStep(Math.max(1, campaignStep - 1))} 
                    className={`px-4 py-2 rounded-lg text-sm ${campaignStep === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'}`} 
                    disabled={campaignStep === 1}
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => {
                      if (campaignStep < 5) {
                        setCampaignStep(campaignStep + 1);
                      } else {
                        setActiveTab('dashboard');
                        setCampaignStep(1);
                      }
                    }} 
                    className="px-6 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg text-sm font-medium"
                  >
                    {campaignStep === 5 ? 'Launch Campaign' : 'Continue'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CONTENT AI */}
          {activeTab === 'content' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                  <h2 className="font-semibold mb-4">AI Content Generator</h2>
                  <div className="flex gap-2 mb-6">
                    {[
                      { id: 'text', icon: Type, label: 'Text' },
                      { id: 'image', icon: Image, label: 'Image' },
                      { id: 'video', icon: Video, label: 'Video' }
                    ].map(t => {
                      const TypeIcon = t.icon;
                      return (
                        <button 
                          key={t.id} 
                          onClick={() => { setContentType(t.id); setGenerated(false); }} 
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${contentType === t.id ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'text-slate-400 hover:bg-slate-800 border border-transparent'}`}
                        >
                          <TypeIcon className="w-4 h-4" />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Content Goal</label>
                      <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500">
                        <option>Increase brand awareness</option>
                        <option>Drive conversions</option>
                        <option>Boost engagement</option>
                        <option>Product launch</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Target Audience</label>
                      <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500">
                        <option>Young Professionals (25-34)</option>
                        <option>Parents (30-45)</option>
                        <option>Students (18-24)</option>
                        <option>All segments</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Tone & Style</label>
                      <div className="flex flex-wrap gap-2">
                        {['Professional', 'Casual', 'Humorous', 'Inspiring', 'Urgent'].map(tone => (
                          <button key={tone} className="px-3 py-1.5 text-xs rounded-full border border-slate-700 hover:border-violet-500 hover:text-violet-400 transition-colors">
                            {tone}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-2 block">Brief / Prompt</label>
                      <textarea 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm h-24 resize-none focus:outline-none focus:border-violet-500" 
                        placeholder="Describe what you want to create..."
                        defaultValue="Create engaging social media posts for our summer product launch targeting young professionals."
                      />
                    </div>
                    <button 
                      onClick={handleGenerate} 
                      disabled={generating} 
                      className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {generating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Generate Content
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {generated && (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Generated Content</h3>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                          <Copy className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                          <RefreshCw className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                    
                    {contentType === 'text' && (
                      <div className="space-y-4">
                        {[
                          '🚀 Ready to level up your productivity? Our new app helps you accomplish more in less time. Join 50,000+ professionals who\'ve already made the switch. Try it free today!',
                          '💡 Work smarter, not harder. Discover the tool that\'s revolutionizing how teams collaborate. Your future self will thank you. Link in bio!',
                          '⚡ Big news! We just launched something incredible. If you\'ve ever wished for more hours in your day, this is for you. Limited spots available — don\'t miss out!'
                        ].map((text, i) => (
                          <div key={i} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-sm leading-relaxed">{text}</p>
                              <button className="p-1.5 rounded hover:bg-slate-700 shrink-0 transition-colors">
                                <Check className="w-4 h-4 text-emerald-400" />
                              </button>
                            </div>
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700">
                              <span className="text-xs text-slate-500">Variation {i + 1}</span>
                              <span className="text-xs text-violet-400">AI Score: {92 - i * 3}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {contentType === 'image' && (
                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="aspect-square bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-lg border border-slate-700 flex items-center justify-center relative group">
                            <div className="text-center">
                              <Image className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                              <span className="text-xs text-slate-500">Generated Image {i}</span>
                            </div>
                            <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button className="p-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 transition-colors">
                                <Download className="w-4 h-4" />
                              </button>
                              <button className="p-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 transition-colors">
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {contentType === 'video' && (
                      <div className="aspect-video bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-lg border border-slate-700 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-3">
                            <Play className="w-6 h-6 text-violet-400" />
                          </div>
                          <span className="text-sm text-slate-400">Video preview ready</span>
                          <p className="text-xs text-slate-500 mt-1">0:30 duration • 1080p</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Content Templates</h3>
                  <div className="space-y-2">
                    {[
                      'Product Launch',
                      'Sale Announcement',
                      'Behind the Scenes',
                      'Customer Testimonial',
                      'How-To Guide',
                      'Industry News'
                    ].map(t => (
                      <button key={t} className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-sm flex items-center justify-between group">
                        {t}
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4">Recent Generations</h3>
                  <div className="space-y-3">
                    {[
                      { type: 'text', title: 'Summer promo copy', time: '2h ago' },
                      { type: 'image', title: 'Product banner', time: '5h ago' },
                      { type: 'text', title: 'Email subject lines', time: '1d ago' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                          {item.type === 'text' ? (
                            <Type className="w-4 h-4 text-slate-400" />
                          ) : (
                            <Image className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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

          {/* SCHEDULER */}
          {activeTab === 'scheduler' && (
            <div className="grid grid-cols-3 gap-6">
              {/* Left Panel - Calendar & Scheduled Posts */}
              <div className="col-span-2 space-y-6">
                {/* Calendar View */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold">Content Calendar</h2>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                      </button>
                      <span className="text-sm font-medium px-3">November 2024</span>
                      <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs text-slate-500 font-medium py-2">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar Days */}
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 2; // Start from day -2 to show previous month
                      const isCurrentMonth = day > 0 && day <= 30;
                      const hasPost = [5, 8, 12, 15, 19, 22, 26].includes(day);
                      const isToday = day === 21;
                      
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-lg border p-2 text-xs transition-all cursor-pointer ${
                            isToday
                              ? 'border-violet-500 bg-violet-500/10'
                              : isCurrentMonth
                              ? 'border-slate-700 hover:border-slate-600 bg-slate-800/30'
                              : 'border-slate-800 bg-slate-900/30 text-slate-600'
                          }`}
                        >
                          <div className="flex flex-col h-full">
                            <span className={isToday ? 'text-violet-400 font-bold' : ''}>
                              {day > 0 ? day : ''}
                            </span>
                            {hasPost && isCurrentMonth && (
                              <div className="flex-1 flex items-end">
                                <div className="flex gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                      <span className="text-xs text-slate-400">Scheduled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      <span className="text-xs text-slate-400">Published</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <span className="text-xs text-slate-400">Draft</span>
                    </div>
                  </div>
                </div>

                {/* Scheduled Posts List */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Upcoming Posts</h3>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 text-violet-400 rounded-lg text-sm border border-violet-500/30">
                      <Plus className="w-4 h-4" />
                      Schedule Post
                    </button>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: 1,
                        title: 'Summer Sale Announcement',
                        platform: ['Facebook', 'Instagram'],
                        time: 'Nov 22, 2024 • 9:00 AM',
                        status: 'scheduled',
                        preview: 'Get ready for our biggest sale of the year! 50% off...'
                      },
                      {
                        id: 2,
                        title: 'Product Feature Highlight',
                        platform: ['Instagram', 'Twitter'],
                        time: 'Nov 23, 2024 • 2:00 PM',
                        status: 'scheduled',
                        preview: 'Discover the amazing features that make our product stand out...'
                      },
                      {
                        id: 3,
                        title: 'Customer Testimonial',
                        platform: ['Facebook', 'LinkedIn'],
                        time: 'Nov 25, 2024 • 11:00 AM',
                        status: 'scheduled',
                        preview: 'Hear what our customers are saying about their experience...'
                      },
                      {
                        id: 4,
                        title: 'Behind the Scenes',
                        platform: ['Instagram'],
                        time: 'Nov 26, 2024 • 4:00 PM',
                        status: 'draft',
                        preview: 'Take a look at how we create our amazing products...'
                      }
                    ].map(post => (
                      <div
                        key={post.id}
                        className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{post.title}</h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  post.status === 'scheduled'
                                    ? 'bg-violet-500/20 text-violet-400'
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}
                              >
                                {post.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mb-2">{post.preview}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {post.time}
                              </div>
                              <div className="flex items-center gap-1">
                                {post.platform.map((p, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 bg-slate-700 rounded text-xs"
                                  >
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button className="p-1.5 rounded hover:bg-slate-700 transition-colors">
                              <Settings className="w-4 h-4 text-slate-400" />
                            </button>
                            <button className="p-1.5 rounded hover:bg-slate-700 transition-colors">
                              <Copy className="w-4 h-4 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel - Quick Actions & Analytics */}
              <div className="space-y-6">
                {/* Best Times to Post */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-fuchsia-400" />
                    <h3 className="font-semibold text-sm">AI Recommendations</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-violet-500/10 rounded-lg border border-violet-500/20">
                      <div className="text-xs font-medium text-violet-400 mb-1">
                        Best Time to Post
                      </div>
                      <div className="text-sm">Weekdays 7-9 PM EST</div>
                      <div className="text-xs text-slate-400 mt-1">
                        23% higher engagement
                      </div>
                    </div>
                    <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                      <div className="text-xs font-medium text-cyan-400 mb-1">
                        Optimal Frequency
                      </div>
                      <div className="text-sm">3-4 posts per week</div>
                      <div className="text-xs text-slate-400 mt-1">
                        Based on your audience
                      </div>
                    </div>
                  </div>
                </div>

                {/* Post Performance */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4 text-sm">Scheduled Content</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">This Week</span>
                        <span className="text-slate-300 font-medium">12 posts</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-violet-500 h-1.5 rounded-full"
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">Next Week</span>
                        <span className="text-slate-300 font-medium">8 posts</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-cyan-500 h-1.5 rounded-full"
                          style={{ width: '50%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">This Month</span>
                        <span className="text-slate-300 font-medium">45 posts</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: '90%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Distribution */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4 text-sm">Platform Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { platform: 'Instagram', count: 18, color: 'bg-pink-500' },
                      { platform: 'Facebook', count: 15, color: 'bg-blue-500' },
                      { platform: 'Twitter', count: 8, color: 'bg-sky-500' },
                      { platform: 'LinkedIn', count: 4, color: 'bg-indigo-500' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                          <span className="text-sm text-slate-300">{item.platform}</span>
                        </div>
                        <span className="text-sm text-slate-400">{item.count} posts</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                  <h3 className="font-semibold mb-4 text-sm">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2.5 bg-violet-500/20 text-violet-400 rounded-lg text-sm border border-violet-500/30 hover:bg-violet-500/30 transition-colors text-left flex items-center justify-between">
                      <span>Schedule Post</span>
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="w-full px-4 py-2.5 text-slate-400 hover:bg-slate-800 rounded-lg text-sm transition-colors text-left flex items-center justify-between">
                      <span>Bulk Upload</span>
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="w-full px-4 py-2.5 text-slate-400 hover:bg-slate-800 rounded-lg text-sm transition-colors text-left flex items-center justify-between">
                      <span>Export Calendar</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}