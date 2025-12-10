import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  ArrowLeft, Settings, Plus, BarChart3, Calendar, Target, DollarSign,
  TrendingUp, TrendingDown, Eye, MousePointer, Heart, MessageCircle,
  Share2, Clock, Download, Users, MoreVertical, Play, Pause, Edit2, Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// Mock campaign data
const mockCampaign = {
  id: '1',
  name: 'Summer Product Launch',
  description: 'Launch new summer collection with maximum impact across all channels',
  objective: 'awareness',
  status: 'active',
  start_date: '2025-06-01',
  end_date: '2025-06-30',
  total_budget: 5000,
  spend: 3250,
  platforms: ['facebook', 'instagram', 'twitter'],
  color: '#8B5CF6',
  kpis: {
    target_impressions: 200000,
    target_reach: 150000,
    target_engagement: 20000,
    target_clicks: 5000
  }
};

// Mock performance data over campaign duration
const mockPerformanceData = Array.from({ length: 20 }, (_, i) => ({
  date: `Jun ${i + 1}`,
  impressions: Math.floor(4000 + Math.random() * 3000),
  reach: Math.floor(3000 + Math.random() * 2000),
  engagement: Math.floor(400 + Math.random() * 300),
  clicks: Math.floor(150 + Math.random() * 100)
}));

// Mock posts data
const mockPosts = [
  { id: '1', content: 'Introducing our new summer collection! 🌞', platform: 'instagram', status: 'published', scheduled_time: '2025-06-01T10:00:00', impressions: 12500, engagement: 850, clicks: 234 },
  { id: '2', content: 'Summer vibes are here. Check out the latest...', platform: 'facebook', status: 'published', scheduled_time: '2025-06-02T14:00:00', impressions: 8900, engagement: 620, clicks: 189 },
  { id: '3', content: 'Hot deals for hot days! Limited time offer', platform: 'twitter', status: 'published', scheduled_time: '2025-06-03T09:00:00', impressions: 5600, engagement: 380, clicks: 145 },
  { id: '4', content: 'Behind the scenes of our summer shoot 📸', platform: 'instagram', status: 'scheduled', scheduled_time: '2025-06-15T11:00:00', impressions: 0, engagement: 0, clicks: 0 },
  { id: '5', content: 'Summer essentials guide - everything you need', platform: 'linkedin', status: 'draft', scheduled_time: null, impressions: 0, engagement: 0, clicks: 0 },
];

const platformColors: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  tiktok: '#000000'
};

const platformIcons: Record<string, string> = {
  facebook: '📘',
  instagram: '📸',
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵'
};

const objectiveLabels: Record<string, { label: string; icon: string }> = {
  awareness: { label: 'Brand Awareness', icon: '✨' },
  engagement: { label: 'Engagement', icon: '💬' },
  conversions: { label: 'Conversions', icon: '🛒' },
  traffic: { label: 'Traffic', icon: '🚗' },
  leads: { label: 'Lead Generation', icon: '📈' },
  sales: { label: 'Sales', icon: '💰' },
  event: { label: 'Event Promotion', icon: '🎉' }
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
};

export default function CampaignDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState(mockCampaign);
  const [performanceData, setPerformanceData] = useState(mockPerformanceData);
  const [posts, setPosts] = useState(mockPosts);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetrics, setSelectedMetrics] = useState(['impressions', 'engagement']);

  // Calculate totals and progress
  const totals = {
    impressions: performanceData.reduce((sum, d) => sum + d.impressions, 0),
    reach: performanceData.reduce((sum, d) => sum + d.reach, 0),
    engagement: performanceData.reduce((sum, d) => sum + d.engagement, 0),
    clicks: performanceData.reduce((sum, d) => sum + d.clicks, 0)
  };

  const kpiProgress = {
    impressions: Math.round((totals.impressions / campaign.kpis.target_impressions) * 100),
    reach: Math.round((totals.reach / campaign.kpis.target_reach) * 100),
    engagement: Math.round((totals.engagement / campaign.kpis.target_engagement) * 100),
    clicks: Math.round((totals.clicks / campaign.kpis.target_clicks) * 100)
  };

  const getProgressPercent = () => {
    const start = new Date(campaign.start_date).getTime();
    const end = new Date(campaign.end_date).getTime();
    const now = Date.now();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const getDaysRemaining = () => {
    const end = new Date(campaign.end_date).getTime();
    const now = Date.now();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleStatusChange = (newStatus: string) => {
    setCampaign(prev => ({ ...prev, status: newStatus }));
    toast({
      title: 'Campaign Updated',
      description: `Campaign status changed to ${newStatus}`
    });
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
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: campaign.color }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-foreground">{campaign.name}</h1>
                  <Badge variant="outline" className={statusColors[campaign.status]}>
                    {campaign.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {objectiveLabels[campaign.objective]?.icon} {objectiveLabels[campaign.objective]?.label} • 
                  {campaign.start_date} - {campaign.end_date}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/scheduler?campaign=${id}`)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem onClick={() => navigate(`/campaign-builder?edit=${id}`)}>
                  <Settings className="h-4 w-4 mr-2" /> Edit Campaign
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" /> Export Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {campaign.status === 'active' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('paused')}>
                    <Pause className="h-4 w-4 mr-2" /> Pause Campaign
                  </DropdownMenuItem>
                )}
                {campaign.status === 'paused' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                    <Play className="h-4 w-4 mr-2" /> Resume Campaign
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        {/* Campaign Progress Card */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Campaign Progress</span>
                  <span className="text-sm font-medium text-foreground">{getProgressPercent()}%</span>
                </div>
                <Progress value={getProgressPercent()} className="h-2" />
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{campaign.start_date}</span>
                  <span>{getDaysRemaining()} days remaining</span>
                  <span>{campaign.end_date}</span>
                </div>
              </div>
              {campaign.total_budget > 0 && (
                <div className="md:w-48 p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Budget</span>
                    <span className="text-sm font-medium text-foreground">
                      {Math.round((campaign.spend / campaign.total_budget) * 100)}%
                    </span>
                  </div>
                  <Progress value={(campaign.spend / campaign.total_budget) * 100} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">
                    ${formatNumber(campaign.spend)} / ${formatNumber(campaign.total_budget)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Eye className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(totals.impressions)}</p>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <Users className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(totals.reach)}</p>
                      <p className="text-sm text-muted-foreground">Reach</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Heart className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(totals.engagement)}</p>
                      <p className="text-sm text-muted-foreground">Engagement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-fuchsia-500/10">
                      <MousePointer className="h-5 w-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(totals.clicks)}</p>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* KPI Progress */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Goal Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">Impressions</span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(totals.impressions)} / {formatNumber(campaign.kpis.target_impressions)}
                      </span>
                    </div>
                    <Progress value={Math.min(kpiProgress.impressions, 100)} className="h-2" />
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs ${kpiProgress.impressions >= 100 ? 'text-emerald-400' : kpiProgress.impressions >= 50 ? 'text-foreground' : 'text-amber-400'}`}>
                        {kpiProgress.impressions}%
                      </span>
                      {kpiProgress.impressions >= 100 && <span className="text-xs text-emerald-400">✓ Goal met!</span>}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">Reach</span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(totals.reach)} / {formatNumber(campaign.kpis.target_reach)}
                      </span>
                    </div>
                    <Progress value={Math.min(kpiProgress.reach, 100)} className="h-2" />
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs ${kpiProgress.reach >= 100 ? 'text-emerald-400' : kpiProgress.reach >= 50 ? 'text-foreground' : 'text-amber-400'}`}>
                        {kpiProgress.reach}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">Engagement</span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(totals.engagement)} / {formatNumber(campaign.kpis.target_engagement)}
                      </span>
                    </div>
                    <Progress value={Math.min(kpiProgress.engagement, 100)} className="h-2" />
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs ${kpiProgress.engagement >= 100 ? 'text-emerald-400' : kpiProgress.engagement >= 50 ? 'text-foreground' : 'text-amber-400'}`}>
                        {kpiProgress.engagement}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground">Clicks</span>
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(totals.clicks)} / {formatNumber(campaign.kpis.target_clicks)}
                      </span>
                    </div>
                    <Progress value={Math.min(kpiProgress.clicks, 100)} className="h-2" />
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`text-xs ${kpiProgress.clicks >= 100 ? 'text-emerald-400' : kpiProgress.clicks >= 50 ? 'text-foreground' : 'text-amber-400'}`}>
                        {kpiProgress.clicks}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="impressions" 
                        stroke="hsl(var(--primary))" 
                        fill="url(#impressionsGradient)" 
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="engagement" 
                        stroke="#10B981" 
                        fill="url(#engagementGradient)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="outline">All ({posts.length})</Badge>
                <Badge variant="outline" className="text-emerald-400">Published ({posts.filter(p => p.status === 'published').length})</Badge>
                <Badge variant="outline" className="text-blue-400">Scheduled ({posts.filter(p => p.status === 'scheduled').length})</Badge>
                <Badge variant="outline" className="text-slate-400">Drafts ({posts.filter(p => p.status === 'draft').length})</Badge>
              </div>
              <Button onClick={() => navigate(`/scheduler?campaign=${id}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Post
              </Button>
            </div>

            <div className="space-y-3">
              {posts.map(post => (
                <Card key={post.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{platformIcons[post.platform]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate">{post.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={
                              post.status === 'published' ? 'text-emerald-400 border-emerald-500/30' :
                              post.status === 'scheduled' ? 'text-blue-400 border-blue-500/30' :
                              'text-slate-400 border-slate-500/30'
                            }
                          >
                            {post.status}
                          </Badge>
                          {post.scheduled_time && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(post.scheduled_time).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {post.status === 'published' && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" /> {formatNumber(post.impressions)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" /> {formatNumber(post.engagement)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointer className="h-4 w-4" /> {formatNumber(post.clicks)}
                          </span>
                        </div>
                      )}
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Platform Breakdown */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {campaign.platforms.map(platform => (
                    <div key={platform} className="p-4 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{platformIcons[platform]}</span>
                        <span className="font-medium text-foreground capitalize">{platform}</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Posts</span>
                          <span className="text-foreground">{posts.filter(p => p.platform === platform).length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Impressions</span>
                          <span className="text-foreground">{formatNumber(Math.floor(totals.impressions / campaign.platforms.length))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Engagement</span>
                          <span className="text-foreground">{formatNumber(Math.floor(totals.engagement / campaign.platforms.length))}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Posts */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {posts
                    .filter(p => p.status === 'published')
                    .sort((a, b) => b.engagement - a.engagement)
                    .slice(0, 3)
                    .map((post, index) => (
                      <div key={post.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                        <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                        <span className="text-xl">{platformIcons[post.platform]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{post.content}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Heart className="h-4 w-4" /> {formatNumber(post.engagement)}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Eye className="h-4 w-4" /> {formatNumber(post.impressions)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Button */}
            <div className="flex justify-end">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Campaign Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
