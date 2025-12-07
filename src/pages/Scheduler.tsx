import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Calendar, List, LayoutGrid, Clock, Plus, Upload, Sparkles, 
  ChevronLeft, ChevronRight, Filter, Search, MoreHorizontal,
  Edit2, Trash2, Copy, Send, Pause, Play, Eye, CheckCircle,
  AlertCircle, XCircle, FileText, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Platform data
const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', color: '#1877F2', icon: '📘' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F', icon: '📸' },
  { id: 'twitter', name: 'Twitter/X', color: '#1DA1F2', icon: '🐦' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', icon: '💼' },
  { id: 'tiktok', name: 'TikTok', color: '#000000', icon: '🎵' },
];

// Best time recommendations per platform
const BEST_TIMES = {
  facebook: [
    { day: 'Wednesday', time: '11:00', score: 95 },
    { day: 'Thursday', time: '13:00', score: 90 },
    { day: 'Tuesday', time: '09:00', score: 85 },
  ],
  instagram: [
    { day: 'Wednesday', time: '18:00', score: 95 },
    { day: 'Friday', time: '17:00', score: 92 },
    { day: 'Saturday', time: '19:00', score: 88 },
  ],
  twitter: [
    { day: 'Monday', time: '09:00', score: 94 },
    { day: 'Wednesday', time: '12:00', score: 91 },
    { day: 'Friday', time: '08:00', score: 87 },
  ],
  linkedin: [
    { day: 'Tuesday', time: '08:00', score: 96 },
    { day: 'Wednesday', time: '09:00', score: 93 },
    { day: 'Thursday', time: '07:00', score: 89 },
  ],
  tiktok: [
    { day: 'Friday', time: '19:00', score: 95 },
    { day: 'Saturday', time: '20:00', score: 93 },
    { day: 'Sunday', time: '18:00', score: 90 },
  ],
};

type ViewMode = 'calendar' | 'list' | 'queue' | 'timeline';
type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed' | 'cancelled';

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  scheduled_time: string;
  status: string;
  post_type: string;
  recurrence?: string;
  campaign_id?: string;
  approval_status?: string;
  queue_position?: number;
  is_recurring?: boolean;
}

export default function Scheduler() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPostModal, setShowPostModal] = useState(false);
  const [showBestTimesModal, setShowBestTimesModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);

  // Form state for new/edit post
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    platforms: [] as string[],
    scheduled_date: '',
    scheduled_time: '',
    post_type: 'social',
    recurrence: 'once',
    campaign_id: '',
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const scheduledTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);
      
      if (scheduledTime <= new Date()) {
        toast.error('Scheduled time must be in the future');
        return;
      }

      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          platforms: formData.platforms,
          scheduled_time: scheduledTime.toISOString(),
          post_type: formData.post_type,
          recurrence: formData.recurrence,
          status: 'scheduled',
          campaign_id: formData.campaign_id || null,
        });

      if (error) throw error;

      toast.success('Post scheduled successfully!');
      setShowPostModal(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to schedule post');
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    
    try {
      const scheduledTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);

      const { error } = await supabase
        .from('scheduled_posts')
        .update({
          title: formData.title,
          content: formData.content,
          platforms: formData.platforms,
          scheduled_time: scheduledTime.toISOString(),
          post_type: formData.post_type,
          recurrence: formData.recurrence,
        })
        .eq('id', editingPost.id);

      if (error) throw error;

      toast.success('Post updated successfully!');
      setShowPostModal(false);
      setEditingPost(null);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post deleted');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleDuplicatePost = async (post: ScheduledPost) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newScheduledTime = new Date();
      newScheduledTime.setDate(newScheduledTime.getDate() + 1);
      newScheduledTime.setHours(12, 0, 0, 0);

      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          title: `${post.title} (Copy)`,
          content: post.content,
          platforms: post.platforms,
          scheduled_time: newScheduledTime.toISOString(),
          post_type: post.post_type,
          status: 'draft',
        });

      if (error) throw error;

      toast.success('Post duplicated');
      fetchPosts();
    } catch (error) {
      console.error('Error duplicating post:', error);
      toast.error('Failed to duplicate post');
    }
  };

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ status: newStatus })
        .eq('id', postId);

      if (error) throw error;

      toast.success(`Post status updated to ${newStatus}`);
      fetchPosts();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      platforms: [],
      scheduled_date: '',
      scheduled_time: '',
      post_type: 'social',
      recurrence: 'once',
      campaign_id: '',
    });
  };

  const openEditModal = (post: ScheduledPost) => {
    const scheduledDate = new Date(post.scheduled_time);
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      platforms: post.platforms,
      scheduled_date: scheduledDate.toISOString().split('T')[0],
      scheduled_time: scheduledDate.toTimeString().slice(0, 5),
      post_type: post.post_type,
      recurrence: post.recurrence || 'once',
      campaign_id: post.campaign_id || '',
    });
    setShowPostModal(true);
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter.length === 0 || 
                           post.platforms.some(p => platformFilter.includes(p));
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month to fill first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push(d);
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month to fill last week
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getPostsForDate = (date: Date) => {
    return filteredPosts.filter(post => {
      const postDate = new Date(post.scheduled_time);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-600 text-slate-100',
      scheduled: 'bg-blue-600 text-blue-100',
      published: 'bg-emerald-600 text-emerald-100',
      failed: 'bg-rose-600 text-rose-100',
      cancelled: 'bg-amber-600 text-amber-100',
    };
    return <Badge className={styles[status] || styles.draft}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'failed': return <XCircle className="h-4 w-4 text-rose-400" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-400" />;
      default: return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  // Stats calculations
  const stats = {
    drafts: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    published: posts.filter(p => p.status === 'published').length,
    failed: posts.filter(p => p.status === 'failed').length,
  };

  const nextPost = posts.find(p => p.status === 'scheduled' && new Date(p.scheduled_time) > new Date());

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-foreground">Content Scheduler</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                {[
                  { mode: 'calendar' as ViewMode, icon: Calendar, label: 'Calendar' },
                  { mode: 'list' as ViewMode, icon: List, label: 'List' },
                  { mode: 'queue' as ViewMode, icon: LayoutGrid, label: 'Queue' },
                  { mode: 'timeline' as ViewMode, icon: Clock, label: 'Timeline' },
                ].map(({ mode, icon: Icon, label }) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="gap-1"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </Button>
                ))}
              </div>
              <Button variant="outline" onClick={() => setShowBestTimesModal(true)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Best Times
              </Button>
              <Button onClick={() => { resetForm(); setEditingPost(null); setShowPostModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Drafts</p>
                <p className="text-2xl font-bold text-foreground">{stats.drafts}</p>
              </div>
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-foreground">{stats.scheduled}</p>
                {nextPost && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Next: {new Date(nextPost.scheduled_time).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Published</p>
                <p className="text-2xl font-bold text-foreground">{stats.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-foreground">{stats.failed}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-rose-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {PLATFORMS.map(platform => (
              <Button
                key={platform.id}
                variant={platformFilter.includes(platform.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setPlatformFilter(prev => 
                    prev.includes(platform.id) 
                      ? prev.filter(p => p !== platform.id)
                      : [...prev, platform.id]
                  );
                }}
              >
                {platform.icon}
              </Button>
            ))}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Calendar Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-foreground">
                      {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                      Today
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 border-b border-border">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {getDaysInMonth(currentDate).map((date, i) => {
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dayPosts = getPostsForDate(date);

                    return (
                      <div
                        key={i}
                        className={`min-h-[120px] p-2 border-b border-r border-border ${
                          !isCurrentMonth ? 'bg-muted/30' : ''
                        } ${isToday ? 'bg-primary/5' : ''}`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? 'text-primary' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayPosts.slice(0, 3).map(post => (
                            <div
                              key={post.id}
                              onClick={() => openEditModal(post)}
                              className="text-xs p-1.5 rounded bg-primary/10 hover:bg-primary/20 cursor-pointer truncate flex items-center gap-1"
                            >
                              {getStatusIcon(post.status)}
                              <span className="truncate">{post.title}</span>
                            </div>
                          ))}
                          {dayPosts.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{dayPosts.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Content</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Platform</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Scheduled</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPosts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No posts found. Create your first post!
                          </td>
                        </tr>
                      ) : (
                        filteredPosts.map(post => (
                          <tr key={post.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-foreground">{post.title}</p>
                                <p className="text-sm text-muted-foreground truncate max-w-[300px]">{post.content}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                {post.platforms.map(p => {
                                  const platform = PLATFORMS.find(pl => pl.id === p);
                                  return platform ? (
                                    <span key={p} title={platform.name}>{platform.icon}</span>
                                  ) : null;
                                })}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">
                                <p className="text-foreground">{new Date(post.scheduled_time).toLocaleDateString()}</p>
                                <p className="text-muted-foreground">{new Date(post.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </td>
                            <td className="p-4">{getStatusBadge(post.status)}</td>
                            <td className="p-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openEditModal(post)}>
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicatePost(post)}>
                                    <Copy className="h-4 w-4 mr-2" /> Duplicate
                                  </DropdownMenuItem>
                                  {post.status === 'scheduled' && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'cancelled')}>
                                      <Pause className="h-4 w-4 mr-2" /> Cancel
                                    </DropdownMenuItem>
                                  )}
                                  {post.status === 'draft' && (
                                    <DropdownMenuItem onClick={() => handleStatusChange(post.id, 'scheduled')}>
                                      <Play className="h-4 w-4 mr-2" /> Schedule
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeletePost(post.id)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Queue View */}
            {viewMode === 'queue' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {PLATFORMS.map(platform => {
                  const platformPosts = filteredPosts
                    .filter(p => p.platforms.includes(platform.id) && p.status === 'scheduled')
                    .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

                  return (
                    <div key={platform.id} className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-border flex items-center justify-between" style={{ backgroundColor: `${platform.color}20` }}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{platform.icon}</span>
                          <span className="font-medium text-foreground">{platform.name}</span>
                        </div>
                        <Badge variant="secondary">{platformPosts.length}</Badge>
                      </div>
                      <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                        {platformPosts.length === 0 ? (
                          <p className="text-center text-sm text-muted-foreground py-4">No posts in queue</p>
                        ) : (
                          platformPosts.map((post, index) => (
                            <div
                              key={post.id}
                              className="bg-muted/50 rounded-lg p-3 cursor-pointer hover:bg-muted transition-colors"
                              onClick={() => openEditModal(post)}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(post.scheduled_time).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                              <p className="text-xs text-muted-foreground truncate">{post.content}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>

                  {filteredPosts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8 ml-8">No posts scheduled</p>
                  ) : (
                    <div className="space-y-6">
                      {filteredPosts.map(post => (
                        <div key={post.id} className="relative flex gap-4 ml-4">
                          {/* Timeline dot */}
                          <div className={`absolute -left-4 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center ${
                            post.status === 'published' ? 'bg-emerald-500' :
                            post.status === 'scheduled' ? 'bg-blue-500' :
                            post.status === 'failed' ? 'bg-rose-500' : 'bg-slate-500'
                          }`}>
                            {getStatusIcon(post.status)}
                          </div>

                          {/* Content */}
                          <div 
                            className="flex-1 ml-6 bg-muted/50 rounded-lg p-4 cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => openEditModal(post)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {post.platforms.map(p => {
                                  const platform = PLATFORMS.find(pl => pl.id === p);
                                  return platform ? <span key={p}>{platform.icon}</span> : null;
                                })}
                                <span className="font-medium text-foreground">{post.title}</span>
                              </div>
                              {getStatusBadge(post.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{post.content}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(post.scheduled_time).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Post Modal */}
      <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Post' : 'Schedule New Post'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Post title..."
              />
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your post content..."
                rows={4}
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {formData.content.length} characters
              </div>
            </div>

            <div>
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PLATFORMS.map(platform => (
                  <Button
                    key={platform.id}
                    type="button"
                    variant={formData.platforms.includes(platform.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        platforms: formData.platforms.includes(platform.id)
                          ? formData.platforms.filter(p => p !== platform.id)
                          : [...formData.platforms, platform.id]
                      });
                    }}
                  >
                    {platform.icon} {platform.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Post Type</Label>
                <Select value={formData.post_type} onValueChange={(v) => setFormData({ ...formData, post_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social Post</SelectItem>
                    <SelectItem value="ad">Advertisement</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="reel">Reel/Short</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Recurrence</Label>
                <Select value={formData.recurrence} onValueChange={(v) => setFormData({ ...formData, recurrence: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPostModal(false); setEditingPost(null); resetForm(); }}>
              Cancel
            </Button>
            <Button 
              onClick={editingPost ? handleUpdatePost : handleCreatePost}
              disabled={!formData.title || !formData.content || formData.platforms.length === 0 || !formData.scheduled_date || !formData.scheduled_time}
            >
              {editingPost ? 'Update Post' : 'Schedule Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Best Times Modal */}
      <Dialog open={showBestTimesModal} onOpenChange={setShowBestTimesModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Best Times to Post
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {Object.entries(BEST_TIMES).map(([platformId, times]) => {
              const platform = PLATFORMS.find(p => p.id === platformId);
              if (!platform) return null;

              return (
                <div key={platformId} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{platform.icon}</span>
                    <span className="font-medium text-foreground">{platform.name}</span>
                  </div>
                  <div className="space-y-2">
                    {times.map((time, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{time.day} at {time.time}</span>
                        <Badge 
                          variant="outline" 
                          className={
                            time.score >= 90 ? 'border-emerald-500 text-emerald-400' :
                            time.score >= 80 ? 'border-blue-500 text-blue-400' :
                            'border-amber-500 text-amber-400'
                          }
                        >
                          {time.score}% engagement
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-primary/10 rounded-lg p-4 mt-4">
            <p className="text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 inline mr-1 text-primary" />
              These recommendations are based on industry benchmarks and engagement patterns. 
              Your actual best times may vary based on your specific audience.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}