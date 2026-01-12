import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  Eye,
  Heart,
  Settings,
  Copy,
  Trash2,
  MoreVertical,
  Calendar,
  Sparkles,
  Target,
  Activity,
  Globe,
  Zap,
  PieChart,
  BarChart3,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Mock data
const mockSegment = {
  id: "1",
  name: "Young Urban Professionals",
  type: "demographic",
  description: "Professionals in major cities aged 25-35 with interest in career growth and lifestyle",
  size: 45230,
  engagementRate: 5.2,
  growth: 5.2,
  platforms: ["facebook", "instagram", "linkedin"],
  color: "#8B5CF6",
  icon: "👔",
  criteria: {
    age: { min: 25, max: 35 },
    locations: ["New York", "Los Angeles", "Chicago", "San Francisco"],
    gender: ["all"],
    interests: ["Career", "Technology", "Finance", "Fitness"],
  },
  isActive: true,
  createdAt: "2024-11-15",
  stats: {
    totalReach: 890000,
    uniqueReach: 450000,
    impressions: 2400000,
    clicks: 45000,
    conversions: 1200,
    postsTargeted: 24,
  },
};

const growthData = [
  { date: "Nov 1", size: 42000, engagement: 4.8 },
  { date: "Nov 8", size: 43200, engagement: 5.0 },
  { date: "Nov 15", size: 44100, engagement: 5.1 },
  { date: "Nov 22", size: 44800, engagement: 5.3 },
  { date: "Nov 29", size: 45230, engagement: 5.2 },
];

const ageData = [
  { range: "18-24", percentage: 15 },
  { range: "25-34", percentage: 45 },
  { range: "35-44", percentage: 28 },
  { range: "45-54", percentage: 10 },
  { range: "55+", percentage: 2 },
];

const genderData = [
  { name: "Male", value: 48, color: "#3B82F6" },
  { name: "Female", value: 50, color: "#EC4899" },
  { name: "Other", value: 2, color: "#10B981" },
];

const locationData = [
  { city: "New York", percentage: 28 },
  { city: "Los Angeles", percentage: 22 },
  { city: "Chicago", percentage: 18 },
  { city: "San Francisco", percentage: 15 },
  { city: "Other", percentage: 17 },
];

const deviceData = [
  { device: "Mobile", percentage: 68, icon: Smartphone },
  { device: "Desktop", percentage: 25, icon: Monitor },
  { device: "Tablet", percentage: 7, icon: Tablet },
];

const contentPerformance = [
  { id: 1, content: "5 Career Tips for Young Professionals...", platform: "LinkedIn", engagement: 2450, reach: 45000, date: "Nov 28" },
  { id: 2, content: "New workout routine for busy professionals...", platform: "Instagram", engagement: 1890, reach: 32000, date: "Nov 25" },
  { id: 3, content: "Financial planning tips for your 30s...", platform: "Facebook", engagement: 1650, reach: 28000, date: "Nov 22" },
  { id: 4, content: "Remote work productivity hacks...", platform: "Twitter", engagement: 1420, reach: 25000, date: "Nov 20" },
];

const insights = [
  { icon: Zap, text: "This segment is 40% more likely to share content", type: "opportunity" },
  { icon: Calendar, text: "Best time to post: Tuesday 3 PM EST", type: "timing" },
  { icon: Activity, text: "Video content gets 65% more engagement", type: "content" },
  { icon: TrendingUp, text: "Segment growing 5.2% month-over-month", type: "growth" },
];

export default function AudienceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/audience")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: mockSegment.color + "20" }}
              >
                {mockSegment.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{mockSegment.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">{mockSegment.type}</Badge>
                  <Badge variant={mockSegment.isActive ? "default" : "secondary"}>
                    {mockSegment.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Settings className="h-4 w-4 mr-2" /> Edit Segment</DropdownMenuItem>
                <DropdownMenuItem><Copy className="h-4 w-4 mr-2" /> Duplicate</DropdownMenuItem>
                <DropdownMenuItem><Target className="h-4 w-4 mr-2" /> Create Lookalike</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Segment Size</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(mockSegment.size)}</p>
                </div>
                <div className="p-3 rounded-lg bg-violet-500/20">
                  <Users className="h-6 w-6 text-violet-400" />
                </div>
              </div>
              <p className="text-xs text-green-400 mt-2">+{mockSegment.growth}% this month</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Rate</p>
                  <p className="text-2xl font-bold text-foreground">{mockSegment.engagementRate}%</p>
                </div>
                <div className="p-3 rounded-lg bg-pink-500/20">
                  <Heart className="h-6 w-6 text-pink-400" />
                </div>
              </div>
              <p className="text-xs text-green-400 mt-2">+23% vs. overall</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reach</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(mockSegment.stats.totalReach)}</p>
                </div>
                <div className="p-3 rounded-lg bg-cyan-500/20">
                  <Eye className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
              <p className="text-xs text-green-400 mt-2">+15% this month</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Posts Targeted</p>
                  <p className="text-2xl font-bold text-foreground">{mockSegment.stats.postsTargeted}</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/20">
                  <Activity className="h-6 w-6 text-orange-400" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Avg. 1.2K engagement/post</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Criteria Summary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Segment Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">Age Range</p>
                    <p className="font-medium text-foreground">
                      {mockSegment.criteria.age.min} - {mockSegment.criteria.age.max} years
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">Locations</p>
                    <div className="flex flex-wrap gap-1">
                      {mockSegment.criteria.locations.slice(0, 3).map((loc) => (
                        <Badge key={loc} variant="secondary" className="text-xs">{loc}</Badge>
                      ))}
                      {mockSegment.criteria.locations.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{mockSegment.criteria.locations.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">Gender</p>
                    <p className="font-medium text-foreground capitalize">
                      {mockSegment.criteria.gender[0]}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">Interests</p>
                    <div className="flex flex-wrap gap-1">
                      {mockSegment.criteria.interests.slice(0, 2).map((int) => (
                        <Badge key={int} variant="secondary" className="text-xs">{int}</Badge>
                      ))}
                      {mockSegment.criteria.interests.length > 2 && (
                        <Badge variant="secondary" className="text-xs">+{mockSegment.criteria.interests.length - 2}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Segment Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="size"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ fill: "#8B5CF6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Insights Preview */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <insight.icon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm text-foreground">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis dataKey="range" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="percentage" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Gender Distribution */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Location Distribution */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Top Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locationData.map((loc) => (
                      <div key={loc.city}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground">{loc.city}</span>
                          <span className="text-muted-foreground">{loc.percentage}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${loc.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Usage */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Device Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deviceData.map((device) => (
                      <div key={device.device} className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <device.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-foreground">{device.device}</span>
                            <span className="text-muted-foreground">{device.percentage}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${device.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 mt-6">
            {/* Content Performance */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Content Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Content</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Platform</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Engagement</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Reach</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contentPerformance.map((content) => (
                        <tr key={content.id} className="border-b border-border hover:bg-muted/50">
                          <td className="p-3">
                            <p className="text-sm text-foreground line-clamp-1">{content.content}</p>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{content.platform}</Badge>
                          </td>
                          <td className="p-3 text-foreground">{formatNumber(content.engagement)}</td>
                          <td className="p-3 text-foreground">{formatNumber(content.reach)}</td>
                          <td className="p-3 text-muted-foreground">{content.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Engagement Trend */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Engagement Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="engagement"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: "#10B981", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Recommendations */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="font-medium text-green-400 mb-1">Content Strategy</p>
                    <p className="text-sm text-muted-foreground">
                      Post 3x per week for optimal reach. This segment engages best with video content (65% higher engagement).
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="font-medium text-blue-400 mb-1">Best Posting Times</p>
                    <p className="text-sm text-muted-foreground">
                      Tuesday 3 PM and Thursday 12 PM EST show highest engagement for this audience.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <p className="font-medium text-violet-400 mb-1">Growth Opportunity</p>
                    <p className="text-sm text-muted-foreground">
                      Consider creating a lookalike audience to reach 150K+ similar users.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Patterns */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Activity Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-foreground">Most Active Day</span>
                      <Badge>Thursday</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-foreground">Peak Hours</span>
                      <Badge>2 PM - 5 PM EST</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-foreground">Low Activity</span>
                      <Badge variant="secondary">Weekends</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="text-sm text-foreground">Preferred Content</span>
                      <Badge>Video (65%)</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
