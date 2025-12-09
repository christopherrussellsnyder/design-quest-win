import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft, Eye, Radio, MessageCircle, Heart, Users, TrendingUp, TrendingDown,
  Download, RefreshCw, Calendar, Filter, BarChart3, PieChart, Clock, Hash,
  Lightbulb, Trophy, Target, Zap, AlertTriangle, ChevronDown, ChevronUp,
  Facebook, Instagram, Twitter, Linkedin
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell, AreaChart, Area, Legend
} from "recharts";

// Mock data generation
const generateMockData = (days: number) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const baseImpressions = 3000 + Math.random() * 3000;
    data.push({
      date: date.toISOString().split('T')[0],
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      impressions: Math.floor(baseImpressions),
      reach: Math.floor(baseImpressions * 0.75),
      engagement: Math.floor(100 + Math.random() * 200),
      clicks: Math.floor(50 + Math.random() * 100),
    });
  }
  return data;
};

const platformData = [
  { name: 'Facebook', posts: 24, engagement: 5.8, reach: 45200, color: 'hsl(214 89% 52%)' },
  { name: 'Instagram', posts: 32, engagement: 6.2, reach: 62100, color: 'hsl(340 75% 54%)' },
  { name: 'Twitter', posts: 45, engagement: 3.1, reach: 28400, color: 'hsl(203 89% 53%)' },
  { name: 'LinkedIn', posts: 18, engagement: 4.5, reach: 31200, color: 'hsl(201 100% 35%)' },
  { name: 'TikTok', posts: 12, engagement: 8.4, reach: 89300, color: 'hsl(0 0% 0%)' },
];

const contentTypeData = [
  { name: 'Image', value: 45, fill: 'hsl(var(--chart-1))' },
  { name: 'Video', value: 25, fill: 'hsl(var(--chart-2))' },
  { name: 'Text', value: 15, fill: 'hsl(var(--chart-3))' },
  { name: 'Carousel', value: 10, fill: 'hsl(var(--chart-4))' },
  { name: 'Link', value: 5, fill: 'hsl(var(--chart-5))' },
];

const topPosts = [
  { id: 1, platform: 'Instagram', content: 'Excited to announce our new product launch! 🚀 #innovation', impressions: 12500, reach: 9800, engagement: 842, engRate: 8.6, date: '2025-12-05' },
  { id: 2, platform: 'Facebook', content: 'Behind the scenes of our latest photoshoot 📸', impressions: 9800, reach: 7200, engagement: 654, engRate: 6.7, date: '2025-12-04' },
  { id: 3, platform: 'TikTok', content: 'How we make our products (viral video)', impressions: 45000, reach: 38000, engagement: 3200, engRate: 7.1, date: '2025-12-03' },
  { id: 4, platform: 'LinkedIn', content: 'Industry insights: The future of marketing in 2025', impressions: 6500, reach: 5100, engagement: 312, engRate: 4.8, date: '2025-12-02' },
  { id: 5, platform: 'Twitter', content: 'Quick tip: Engagement matters more than reach 💡', impressions: 4200, reach: 3400, engagement: 189, engRate: 4.5, date: '2025-12-01' },
];

const hashtagData = [
  { tag: '#marketing', uses: 24, avgEngagement: 5.2, trend: 'up' },
  { tag: '#innovation', uses: 18, avgEngagement: 6.8, trend: 'up' },
  { tag: '#business', uses: 15, avgEngagement: 4.1, trend: 'stable' },
  { tag: '#tech', uses: 12, avgEngagement: 5.5, trend: 'up' },
  { tag: '#success', uses: 10, avgEngagement: 3.8, trend: 'down' },
];

const timeHeatmapData = [
  { day: 'Mon', slots: [2, 3, 4, 5, 6, 7, 8, 9, 8, 7, 6, 5] },
  { day: 'Tue', slots: [3, 4, 5, 7, 9, 10, 9, 8, 7, 6, 5, 4] },
  { day: 'Wed', slots: [4, 5, 6, 8, 10, 10, 9, 9, 8, 7, 6, 5] },
  { day: 'Thu', slots: [3, 4, 5, 7, 9, 9, 8, 8, 7, 6, 5, 4] },
  { day: 'Fri', slots: [4, 5, 6, 7, 8, 9, 9, 10, 9, 8, 7, 6] },
  { day: 'Sat', slots: [5, 6, 7, 7, 6, 5, 4, 5, 6, 8, 9, 8] },
  { day: 'Sun', slots: [4, 5, 6, 6, 5, 4, 3, 4, 5, 7, 8, 7] },
];

const Analytics = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('30');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [showImpressions, setShowImpressions] = useState(true);
  const [showReach, setShowReach] = useState(true);
  const [showEngagement, setShowEngagement] = useState(true);
  const [showClicks, setShowClicks] = useState(true);
  const [showBottomPosts, setShowBottomPosts] = useState(false);

  const chartData = useMemo(() => generateMockData(parseInt(dateRange)), [dateRange]);

  // Calculate totals
  const totals = useMemo(() => {
    const sum = chartData.reduce((acc, day) => ({
      impressions: acc.impressions + day.impressions,
      reach: acc.reach + day.reach,
      engagement: acc.engagement + day.engagement,
      clicks: acc.clicks + day.clicks,
    }), { impressions: 0, reach: 0, engagement: 0, clicks: 0 });
    
    return {
      ...sum,
      engagementRate: ((sum.engagement / sum.impressions) * 100).toFixed(2),
      followerGrowth: 1245,
      totalFollowers: 23456,
    };
  }, [chartData]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getHeatmapColor = (value: number) => {
    if (value >= 9) return 'bg-primary';
    if (value >= 7) return 'bg-primary/70';
    if (value >= 5) return 'bg-primary/40';
    if (value >= 3) return 'bg-primary/20';
    return 'bg-muted';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Analytics Dashboard</h1>
                <p className="text-sm text-muted-foreground">Track your social media performance</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-[140px] bg-secondary border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="border-border">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Eye className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5%
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{totals.impressions.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-cyan/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-cyan/20">
                  <Radio className="w-5 h-5 text-cyan-400" />
                </div>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.3%
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{totals.reach.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Reach</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-emerald/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +0.8%
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{totals.engagementRate}%</p>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Heart className="w-5 h-5 text-accent" />
                </div>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +15.2%
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{totals.engagement.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Engagement</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-amber/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5.3%
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">+{totals.followerGrowth.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Follower Growth</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Performance Over Time
              </CardTitle>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={showImpressions} onCheckedChange={(c) => setShowImpressions(!!c)} />
                  <span className="text-primary">Impressions</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={showReach} onCheckedChange={(c) => setShowReach(!!c)} />
                  <span className="text-cyan-400">Reach</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={showEngagement} onCheckedChange={(c) => setShowEngagement(!!c)} />
                  <span className="text-emerald-400">Engagement</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={showClicks} onCheckedChange={(c) => setShowClicks(!!c)} />
                  <span className="text-amber-400">Clicks</span>
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="impressionsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(189 94% 43%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(189 94% 43%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dateLabel" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  {showImpressions && (
                    <Area type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" fill="url(#impressionsGrad)" strokeWidth={2} />
                  )}
                  {showReach && (
                    <Area type="monotone" dataKey="reach" stroke="hsl(189 94% 43%)" fill="url(#reachGrad)" strokeWidth={2} />
                  )}
                  {showEngagement && (
                    <Line type="monotone" dataKey="engagement" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} />
                  )}
                  {showClicks && (
                    <Line type="monotone" dataKey="clicks" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Platform Comparison & Content Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Comparison */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Platform Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {platformData.slice(0, 3).map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {i === 0 && <span>🔥</span>}
                      <span className="text-muted-foreground">{p.name}</span>
                    </div>
                    <span className="text-foreground font-medium">{p.engagement}% engagement</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Type Analysis */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Content Type Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={contentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {contentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>🎥</span>
                  <span className="text-muted-foreground">Video gets 3x more engagement</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📸</span>
                  <span className="text-muted-foreground">Image is most frequent (45%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Posts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Top Performing Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Rank</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Post</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Published</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Impressions</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Reach</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Engagement</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Eng. Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {topPosts.map((post, index) => (
                    <tr key={post.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-secondary">
                            {getPlatformIcon(post.platform)}
                          </div>
                          <span className="text-foreground max-w-[200px] truncate">{post.content}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(post.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right text-foreground">{post.impressions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-foreground">{post.reach.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-foreground">{post.engagement.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="secondary" className={post.engRate > 6 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-primary/20 text-primary'}>
                          {post.engRate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <Button 
              variant="ghost" 
              className="mt-4 w-full text-muted-foreground"
              onClick={() => setShowBottomPosts(!showBottomPosts)}
            >
              {showBottomPosts ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
              {showBottomPosts ? 'Hide' : 'Show'} Bottom Performers
            </Button>
          </CardContent>
        </Card>

        {/* Posting Time & Hashtags */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Posting Time Heat Map */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Best Posting Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex gap-1 text-xs text-muted-foreground mb-2">
                  <div className="w-10"></div>
                  {['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM', '12AM'].map(h => (
                    <div key={h} className="flex-1 text-center">{h}</div>
                  ))}
                </div>
                {timeHeatmapData.map(row => (
                  <div key={row.day} className="flex gap-1 items-center">
                    <span className="w-10 text-xs text-muted-foreground">{row.day}</span>
                    {row.slots.map((val, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 h-6 rounded ${getHeatmapColor(val)} transition-colors hover:ring-1 hover:ring-primary cursor-pointer`}
                        title={`${row.day} - Score: ${val}/10`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary"></div>
                  <span className="text-muted-foreground">Peak</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary/40"></div>
                  <span className="text-muted-foreground">Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-muted"></div>
                  <span className="text-muted-foreground">Low</span>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-secondary/50">
                <p className="text-sm text-foreground">🥇 <strong>Best Time:</strong> Tuesday at 2 PM (9.2/10 engagement)</p>
              </div>
            </CardContent>
          </Card>

          {/* Hashtag Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" />
                Hashtag Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hashtagData.map((tag, i) => (
                  <div key={tag.tag} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-medium">{tag.tag}</span>
                      <Badge variant="outline" className="text-xs">{tag.uses} uses</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-foreground">{tag.avgEngagement}% avg</span>
                      {tag.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                      {tag.trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-400" />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm text-emerald-400">💡 Best performing: #innovation (+45% above average)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="font-medium text-foreground">Achievement</span>
                </div>
                <p className="text-sm text-muted-foreground">100K impressions milestone reached this month!</p>
              </div>
              
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Opportunity</span>
                </div>
                <p className="text-sm text-muted-foreground">Video content gets 200% more engagement - create more videos</p>
              </div>
              
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="font-medium text-foreground">Warning</span>
                </div>
                <p className="text-sm text-muted-foreground">Facebook reach declining - try new content formats</p>
              </div>
              
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium text-foreground">Trend</span>
                </div>
                <p className="text-sm text-muted-foreground">Engagement trending upward +25% over 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
