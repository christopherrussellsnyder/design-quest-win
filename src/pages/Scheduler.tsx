import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, List, Plus, ChevronLeft, ChevronRight, LayoutDashboard, Facebook, Instagram, Twitter, Linkedin, Clock, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

// Platform icons mapping
const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4 text-blue-500" />,
  instagram: <Instagram className="w-4 h-4 text-pink-500" />,
  twitter: <Twitter className="w-4 h-4 text-sky-500" />,
  linkedin: <Linkedin className="w-4 h-4 text-blue-600" />,
};

// Mock scheduled posts data
const mockPosts = [
  {
    id: '1',
    platform: 'facebook',
    content: 'Excited to announce our new product launch! Stay tuned for more details. 🚀',
    scheduled_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    title: 'Product Launch Announcement',
  },
  {
    id: '2',
    platform: 'instagram',
    content: 'Behind the scenes look at our creative process. #behindthescenes #creative',
    scheduled_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    title: 'BTS Content',
  },
  {
    id: '3',
    platform: 'twitter',
    content: 'Quick tip: Always test your ads before scaling! 💡',
    scheduled_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    title: 'Marketing Tip',
  },
  {
    id: '4',
    platform: 'linkedin',
    content: 'We are hiring! Join our growing team and make an impact.',
    scheduled_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'draft',
    title: 'Hiring Announcement',
  },
  {
    id: '5',
    platform: 'facebook',
    content: 'Thank you for 10,000 followers! We appreciate your support. 🎉',
    scheduled_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'scheduled',
    title: 'Milestone Celebration',
  },
];

type ViewMode = 'calendar' | 'list';
type DateFilter = 'week' | 'month' | 'all';

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduled_time: string;
  status: string;
  title: string;
}

export default function Scheduler() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>(mockPosts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDatePosts, setSelectedDatePosts] = useState<ScheduledPost[] | null>(null);
  
  // Form state for new post
  const [formData, setFormData] = useState({
    platform: '',
    content: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    status: 'scheduled',
    title: '',
  });

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding days for start of week
    const startDay = start.getDay();
    const paddingStart = Array(startDay).fill(null);
    
    return [...paddingStart, ...days];
  }, [currentMonth]);

  // Get posts for a specific day
  const getPostsForDay = (day: Date) => {
    return posts.filter(post => isSameDay(new Date(post.scheduled_time), day));
  };

  // Filter posts based on platform
  const filteredPosts = useMemo(() => {
    if (platformFilter === 'all') return posts;
    return posts.filter(post => post.platform === platformFilter);
  }, [posts, platformFilter]);

  // Handle create post
  const handleCreatePost = () => {
    if (!formData.platform || !formData.content || !formData.title) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      platform: formData.platform,
      content: formData.content,
      scheduled_time: new Date(`${formData.date}T${formData.time}`).toISOString(),
      status: formData.status,
      title: formData.title,
    };

    setPosts([...posts, newPost]);
    setShowCreateModal(false);
    setFormData({
      platform: '',
      content: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      status: 'scheduled',
      title: '',
    });

    toast({
      title: 'Post Created',
      description: 'Your post has been scheduled successfully!',
    });
  };

  // Handle delete post
  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(post => post.id !== id));
    toast({
      title: 'Post Deleted',
      description: 'The scheduled post has been removed.',
    });
  };

  // Status badge styles
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return styles[status] || styles.draft;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-muted-foreground hover:text-foreground"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Content Scheduler</h1>
                <p className="text-sm text-muted-foreground">Schedule and manage your posts</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'calendar'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Calendar
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>

              {/* New Post Button */}
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            {/* Platform Filter */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  platformFilter === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                All
              </button>
              {Object.entries(platformIcons).map(([platform, icon]) => (
                <button
                  key={platform}
                  onClick={() => setPlatformFilter(platform)}
                  className={`p-2 rounded-full transition-colors ${
                    platformFilter === platform
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {viewMode === 'calendar' ? (
          /* Calendar View */
          <div className="bg-card rounded-xl border border-border p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const dayPosts = getPostsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isCurrentDay = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => dayPosts.length > 0 && setSelectedDatePosts(dayPosts)}
                    className={`aspect-square p-2 rounded-lg border transition-colors text-left flex flex-col ${
                      isCurrentMonth
                        ? 'bg-muted/30 border-border hover:bg-muted/50'
                        : 'bg-transparent border-transparent text-muted-foreground/50'
                    } ${isCurrentDay ? 'ring-2 ring-primary' : ''} ${
                      dayPosts.length > 0 ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isCurrentDay ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    {dayPosts.length > 0 && (
                      <div className="mt-auto">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          {dayPosts.length}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Platform</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Content</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Scheduled</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No scheduled posts found
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map(post => (
                    <tr key={post.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {platformIcons[post.platform]}
                          <span className="text-sm capitalize text-foreground">{post.platform}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{post.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-md">
                            {post.content.slice(0, 50)}...
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{format(new Date(post.scheduled_time), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(post.status)}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Create Post Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule New Post</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
              <Input
                placeholder="Post title..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Platform */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Platform</label>
              <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">
                    <div className="flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-500" /> Facebook
                    </div>
                  </SelectItem>
                  <SelectItem value="instagram">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-500" /> Instagram
                    </div>
                  </SelectItem>
                  <SelectItem value="twitter">
                    <div className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-sky-500" /> Twitter
                    </div>
                  </SelectItem>
                  <SelectItem value="linkedin">
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-600" /> LinkedIn
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Content</label>
              <Textarea
                placeholder="Write your post content..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">{formData.content.length} characters</p>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Time</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost}>
                Schedule Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Day Posts Modal */}
      <Dialog open={!!selectedDatePosts} onOpenChange={() => setSelectedDatePosts(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Scheduled Posts</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedDatePosts?.map(post => (
              <div key={post.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {platformIcons[post.platform]}
                    <span className="font-medium text-foreground">{post.title}</span>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(post.status)}`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{post.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(post.scheduled_time), 'h:mm a')}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
