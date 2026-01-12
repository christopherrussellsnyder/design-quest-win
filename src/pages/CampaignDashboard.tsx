import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';
import { 
  ArrowLeft, Settings, Plus, Calendar, Target, DollarSign,
  Eye, MousePointer, Heart, Clock, Download, Users, MoreVertical, 
  Play, Pause, Edit2, Trash2, Loader2, ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

const platformIcons: Record<string, string> = {
  facebook: '📘',
  instagram: '📸',
  twitter: '🐦',
  linkedin: '💼',
  tiktok: '🎵',
  all: '🌐'
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
  const { user } = useAuth();
  
  const [campaign, setCampaign] = useState<any>(null);
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user && id) {
      fetchCampaignData();
      fetchAllCampaigns();
    }
  }, [user, id]);

  const fetchAllCampaigns = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('campaigns')
      .select('id, name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setAllCampaigns(data || []);
  };

  const fetchCampaignData = async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const { data: campaignData, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCampaign(campaignData);

      // Fetch posts for this campaign
      const { data: postsData } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('campaign_id', id)
        .order('scheduled_time', { ascending: false });

      setPosts(postsData || []);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast({ title: 'Error', description: 'Could not load campaign', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const totals = {
    impressions: posts.reduce((sum, p) => sum + (p.impressions || 0), 0),
    reach: posts.reduce((sum, p) => sum + Math.floor((p.impressions || 0) * 0.7), 0),
    engagement: posts.reduce((sum, p) => sum + (p.engagements || 0), 0),
    clicks: posts.reduce((sum, p) => sum + (p.clicks || 0), 0)
  };

  const goals = campaign?.goals || {};
  const kpiProgress = {
    impressions: goals.impressions ? Math.round((totals.impressions / goals.impressions) * 100) : 0,
    engagement: goals.engagement_rate ? Math.round((totals.engagement / 1000) * 100) : 0,
  };

  const getProgressPercent = () => {
    if (!campaign?.start_date || !campaign?.end_date) return 0;
    const start = new Date(campaign.start_date).getTime();
    const end = new Date(campaign.end_date).getTime();
    const now = Date.now();
    if (now < start) return 0;
    if (now > end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const getDaysRemaining = () => {
    if (!campaign?.end_date) return 0;
    const end = new Date(campaign.end_date).getTime();
    const days = Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!campaign) return;
    try {
      await supabase.from('campaigns').update({ status: newStatus as any }).eq('id', campaign.id);
      setCampaign((prev: any) => ({ ...prev, status: newStatus }));
      toast({ title: 'Campaign Updated', description: `Status changed to ${newStatus}` });
    } catch (error) {
      toast({ title: 'Error', description: 'Could not update status', variant: 'destructive' });
    }
  };

  const handleExportReport = async () => {
    setExporting(true);
    try {
      const reportData = {
        campaign: { name: campaign?.name, objective: campaign?.objective, status: campaign?.status },
        dateRange: { start: campaign?.start_date, end: campaign?.end_date },
        totals, posts: posts.map(p => ({ content: p.content, status: p.status, impressions: p.impressions, engagements: p.engagements }))
      };
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaign?.name?.replace(/\s+/g, '_')}_report.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Report Exported', description: 'Campaign report downloaded successfully' });
    } catch (error) {
      toast({ title: 'Export Failed', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await supabase.from('scheduled_posts').delete().eq('id', postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ title: 'Post Deleted' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleCampaignChange = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
          <Button onClick={() => navigate('/campaigns')}>Back to Campaigns</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/campaigns')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Select value={campaign.id} onValueChange={handleCampaignChange}>
                <SelectTrigger className="w-[250px] border-none bg-transparent">
                  <SelectValue>{campaign.name}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {allCampaigns.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="outline" className={statusColors[campaign.status] || ''}>{campaign.status}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/scheduler?campaign=${id}`)}>
              <Plus className="h-4 w-4 mr-2" /> Create Post
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/campaign-builder?edit=${id}`)}>
                  <Settings className="h-4 w-4 mr-2" /> Edit Campaign
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportReport} disabled={exporting}>
                  <Download className="h-4 w-4 mr-2" /> {exporting ? 'Exporting...' : 'Export Report'}
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
        {/* Progress Card */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Campaign Progress</span>
                  <span className="text-sm font-medium">{getProgressPercent()}%</span>
                </div>
                <Progress value={getProgressPercent()} className="h-2" />
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{campaign.start_date}</span>
                  <span>{getDaysRemaining()} days remaining</span>
                  <span>{campaign.end_date}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary/50 border border-border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10"><Eye className="h-5 w-5 text-primary" /></div>
                    <div><p className="text-2xl font-bold">{formatNumber(totals.impressions)}</p><p className="text-sm text-muted-foreground">Impressions</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10"><Users className="h-5 w-5 text-cyan-400" /></div>
                    <div><p className="text-2xl font-bold">{formatNumber(totals.reach)}</p><p className="text-sm text-muted-foreground">Reach</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10"><Heart className="h-5 w-5 text-emerald-400" /></div>
                    <div><p className="text-2xl font-bold">{formatNumber(totals.engagement)}</p><p className="text-sm text-muted-foreground">Engagement</p></div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-fuchsia-500/10"><MousePointer className="h-5 w-5 text-fuchsia-400" /></div>
                    <div><p className="text-2xl font-bold">{formatNumber(totals.clicks)}</p><p className="text-sm text-muted-foreground">Clicks</p></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant="outline">All ({posts.length})</Badge>
                <Badge variant="outline" className="text-emerald-400">Published ({posts.filter(p => p.status === 'published').length})</Badge>
                <Badge variant="outline" className="text-blue-400">Scheduled ({posts.filter(p => p.status === 'scheduled').length})</Badge>
              </div>
              <Button onClick={() => navigate(`/scheduler?campaign=${id}`)}><Plus className="h-4 w-4 mr-2" /> Add Post</Button>
            </div>

            <div className="space-y-3">
              {posts.map(post => (
                <Card key={post.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{platformIcons[post.platforms?.[0]] || '🌐'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate">{post.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={post.status === 'published' ? 'text-emerald-400' : post.status === 'scheduled' ? 'text-blue-400' : 'text-slate-400'}>
                            {post.status}
                          </Badge>
                          {post.scheduled_time && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {new Date(post.scheduled_time).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {post.status === 'published' && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {formatNumber(post.impressions || 0)}</span>
                          <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {formatNumber(post.engagements || 0)}</span>
                        </div>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/scheduler?edit=${post.id}`)}>
                            <Edit2 className="h-4 w-4 mr-2" /> Edit Post
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {posts.length === 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">No posts in this campaign yet</p>
                    <Button onClick={() => navigate(`/scheduler?campaign=${id}`)}><Plus className="h-4 w-4 mr-2" /> Create First Post</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
