import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, Grid, List, ArrowLeft, Search, Filter, MoreVertical, 
  Pause, Play, Copy, Archive, Trash2, TrendingUp, TrendingDown,
  Calendar, Target, DollarSign, BarChart3, Eye, Settings, Loader2, Brain
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CampaignIntelligenceDashboard } from '@/components/CampaignIntelligenceDashboard';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  objective: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  total_budget: number | null;
  spend: number;
  platform: string;
  goals: any;
  created_at: string;
  // Computed fields
  posts_count: number;
  published_count: number;
  engagement: number;
  reach: number;
  impressions: number;
  color: string;
  platforms: string[];
}

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
  draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  archived: 'bg-slate-600/20 text-slate-500 border-slate-600/30'
};

const platformIcons: Record<string, string> = {
  facebook: '📘',
  instagram: '📸',
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵',
  all: '🌐'
};

const colorPalette = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

export default function Campaigns() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      // Fetch posts for each campaign to get stats
      const campaignsWithStats = await Promise.all(
        (campaignsData || []).map(async (campaign, index) => {
          // Get post counts and stats
          const { data: posts } = await supabase
            .from('scheduled_posts')
            .select('status, impressions, engagements')
            .eq('campaign_id', campaign.id);

          const postsArray = posts || [];
          const publishedPosts = postsArray.filter(p => p.status === 'published');
          
          return {
            ...campaign,
            posts_count: postsArray.length,
            published_count: publishedPosts.length,
            engagement: publishedPosts.reduce((sum, p) => sum + (p.engagements || 0), 0),
            reach: publishedPosts.reduce((sum, p) => sum + Math.floor((p.impressions || 0) * 0.7), 0),
            impressions: publishedPosts.reduce((sum, p) => sum + (p.impressions || 0), 0),
            color: colorPalette[index % colorPalette.length],
            platforms: campaign.platform ? [campaign.platform] : []
          };
        })
      );

      setCampaigns(campaignsWithStats);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Error',
        description: 'Could not load campaigns',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    active: campaigns.filter(c => c.status === 'active').length,
    totalPosts: campaigns.reduce((sum, c) => sum + c.posts_count, 0),
    totalEngagement: campaigns.reduce((sum, c) => sum + c.engagement, 0),
    totalSpend: campaigns.reduce((sum, c) => sum + c.spend, 0)
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getProgressPercent = (campaign: Campaign) => {
    if (!campaign.start_date || !campaign.end_date) return 0;
    const start = new Date(campaign.start_date).getTime();
    const end = new Date(campaign.end_date).getTime();
    const now = Date.now();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus as any })
        .eq('id', campaignId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setCampaigns(prev => prev.map(c => 
        c.id === campaignId ? { ...c, status: newStatus } : c
      ));
      toast({
        title: 'Campaign Updated',
        description: `Campaign status changed to ${newStatus}`
      });
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: 'Error',
        description: 'Could not update campaign status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      toast({
        title: 'Campaign Deleted',
        description: 'Campaign has been deleted successfully'
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Could not delete campaign',
        variant: 'destructive'
      });
    }
  };

  const handleDuplicateCampaign = async (campaign: Campaign) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .insert({
          user_id: user?.id,
          name: `${campaign.name} (Copy)`,
          description: campaign.description,
          objective: campaign.objective,
          platform: campaign.platform,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
          total_budget: campaign.total_budget,
          goals: campaign.goals,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: 'Campaign Duplicated',
        description: 'A copy of the campaign has been created as a draft'
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Duplicate error:', error);
      toast({
        title: 'Error',
        description: 'Could not duplicate campaign',
        variant: 'destructive'
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Campaigns</h1>
              <p className="text-sm text-muted-foreground">Manage your marketing campaigns</p>
            </div>
          </div>
          <Button onClick={() => navigate('/campaign-builder')} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6">
        {/* Main Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Target className="h-4 w-4 mr-2" />
              My Campaigns
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Brain className="h-4 w-4 mr-2" />
              AI Intelligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                      <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <Calendar className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalPosts)}</p>
                      <p className="text-sm text-muted-foreground">Total Posts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <BarChart3 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(stats.totalEngagement)}</p>
                      <p className="text-sm text-muted-foreground">Total Engagement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-fuchsia-500/10">
                      <DollarSign className="h-5 w-5 text-fuchsia-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">${formatNumber(stats.totalSpend)}</p>
                      <p className="text-sm text-muted-foreground">Total Spend</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="rounded-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="rounded-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Campaigns Grid/List */}
        {filteredCampaigns.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-4">Create your first campaign to organize your marketing</p>
              <Button onClick={() => navigate('/campaign-builder')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map(campaign => (
              <Card 
                key={campaign.id} 
                className={`bg-card border-border hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden ${
                  campaign.status === 'draft' ? 'border-dashed' : ''
                }`}
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
              >
                {/* Color stripe */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: campaign.color }}
                />
                
                <CardHeader className="pb-2 pl-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-foreground truncate">
                        {campaign.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={statusColors[campaign.status]}>
                          {campaign.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {objectiveLabels[campaign.objective]?.icon} {objectiveLabels[campaign.objective]?.label}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${campaign.id}`); }}>
                          <Eye className="h-4 w-4 mr-2" /> View Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/campaign-builder?edit=${campaign.id}`); }}>
                          <Settings className="h-4 w-4 mr-2" /> Edit Campaign
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {campaign.status === 'active' && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(campaign.id, 'paused'); }}>
                            <Pause className="h-4 w-4 mr-2" /> Pause
                          </DropdownMenuItem>
                        )}
                        {campaign.status === 'paused' && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(campaign.id, 'active'); }}>
                            <Play className="h-4 w-4 mr-2" /> Resume
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(campaign.id, 'archived'); }}>
                          <Archive className="h-4 w-4 mr-2" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(campaign.id); }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="pl-4">
                  {/* Date range & Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{campaign.start_date} - {campaign.end_date}</span>
                      <span>{getProgressPercent(campaign)}% complete</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${getProgressPercent(campaign)}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <p className="text-sm font-semibold text-foreground">{campaign.posts_count}</p>
                      <p className="text-[10px] text-muted-foreground">Posts</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <p className="text-sm font-semibold text-foreground">{formatNumber(campaign.engagement)}</p>
                      <p className="text-[10px] text-muted-foreground">Engagement</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <p className="text-sm font-semibold text-foreground">{formatNumber(campaign.reach)}</p>
                      <p className="text-[10px] text-muted-foreground">Reach</p>
                    </div>
                  </div>

                  {/* Platforms & Budget */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {campaign.platforms.slice(0, 4).map(platform => (
                        <span key={platform} className="text-sm" title={platform}>
                          {platformIcons[platform]}
                        </span>
                      ))}
                      {campaign.platforms.length > 4 && (
                        <span className="text-xs text-muted-foreground">+{campaign.platforms.length - 4}</span>
                      )}
                    </div>
                    {campaign.total_budget > 0 && (
                      <div className="text-xs text-muted-foreground">
                        ${formatNumber(campaign.spend)} / ${formatNumber(campaign.total_budget)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* List View */
          <Card className="bg-card border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Campaign</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Goal</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date Range</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Progress</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Posts</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Engagement</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Budget</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCampaigns.map(campaign => (
                    <tr 
                      key={campaign.id} 
                      className="hover:bg-secondary/30 cursor-pointer"
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: campaign.color }}
                          />
                          <div>
                            <p className="font-medium text-foreground">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">{campaign.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-foreground">
                          {objectiveLabels[campaign.objective]?.icon} {objectiveLabels[campaign.objective]?.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {campaign.start_date} - {campaign.end_date}
                      </td>
                      <td className="p-4">
                        <div className="w-24">
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary"
                              style={{ width: `${getProgressPercent(campaign)}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{getProgressPercent(campaign)}%</p>
                        </div>
                      </td>
                      <td className="p-4 text-right text-sm text-foreground">{campaign.posts_count}</td>
                      <td className="p-4 text-right text-sm text-foreground">{formatNumber(campaign.engagement)}</td>
                      <td className="p-4 text-right text-sm text-foreground">
                        {campaign.total_budget > 0 ? `$${formatNumber(campaign.spend)} / $${formatNumber(campaign.total_budget)}` : '—'}
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant="outline" className={statusColors[campaign.status]}>
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover border-border">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${campaign.id}`); }}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/campaign-builder?edit=${campaign.id}`); }}>
                              <Settings className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(campaign.id); }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
          </TabsContent>

          <TabsContent value="intelligence">
            <CampaignIntelligenceDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
