import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Calendar, List, Layers, Plus, ChevronLeft, ChevronRight, LayoutDashboard, Facebook, Instagram, Twitter, Linkedin, Clock, Edit2, Trash2, Lightbulb, Eye, RefreshCw, Zap, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { DayDetailPanel } from '@/components/scheduler/DayDetailPanel';
import { CalendarDateCell } from '@/components/scheduler/CalendarDateCell';
import { QueueView } from '@/components/scheduler/QueueView';
import { BestTimesPanel } from '@/components/scheduler/BestTimesPanel';
import { PostPreviewPanel } from '@/components/scheduler/PostPreviewPanel';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PredictionScore } from '@/components/PredictionScore';
import { AutoScheduleSettings } from '@/components/scheduler/AutoScheduleSettings';
import { WeeklySchedulePreview } from '@/components/scheduler/WeeklySchedulePreview';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';
import { useScheduledPosts, ScheduledPost } from '@/hooks/useScheduledPosts';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

// Platform icons mapping
const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4 text-blue-500" />,
  instagram: <Instagram className="w-4 h-4 text-pink-500" />,
  twitter: <Twitter className="w-4 h-4 text-sky-500" />,
  linkedin: <Linkedin className="w-4 h-4 text-blue-600" />,
};

type ViewMode = 'calendar' | 'list' | 'queue';
type DateFilter = 'week' | 'month' | 'all';

// Local interface for form/UI that maps to DB structure
interface LocalScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduled_time: string;
  status: string;
  title: string;
  queue_position?: number;
  is_recurring?: boolean;
  recurrence?: 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrence_days?: string[];
  recurrence_end_date?: string;
}

export default function Scheduler() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Use database-backed posts hook
  const { posts: dbPosts, loading, error, createPost, updatePost, deletePost, fetchPosts } = useScheduledPosts();
  
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingPost, setEditingPost] = useState<LocalScheduledPost | null>(null);
  const [draggedPost, setDraggedPost] = useState<LocalScheduledPost | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [showBestTimesPanel, setShowBestTimesPanel] = useState(false);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [showAutoScheduleSettings, setShowAutoScheduleSettings] = useState(false);
  const [optimizingTime, setOptimizingTime] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  // Transform DB posts to local format for UI compatibility
  const posts: LocalScheduledPost[] = useMemo(() => {
    return dbPosts.map(post => ({
      id: post.id,
      platform: post.platforms?.[0] || 'twitter',
      content: post.content,
      scheduled_time: post.scheduled_time,
      status: post.status,
      title: post.title,
      queue_position: post.queue_position ?? undefined,
      is_recurring: post.is_recurring ?? false,
      recurrence: post.recurrence as 'daily' | 'weekly' | 'monthly' | 'custom' | undefined,
      recurrence_end_date: post.recurrence_end_date ?? undefined,
    }));
  }, [dbPosts]);
  
  // Form state for new/edit post
  const [formData, setFormData] = useState({
    platform: '',
    content: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    status: 'scheduled',
    title: '',
    isRecurring: false,
    recurrence: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'custom',
    recurrenceDays: [] as string[],
    recurrenceEndDate: '',
  });

  // Check for draft content from Content AI page on mount
  useEffect(() => {
    const draftContent = localStorage.getItem('draft_content');
    if (draftContent) {
      setFormData(prev => ({
        ...prev,
        content: draftContent,
        title: draftContent.slice(0, 50) + (draftContent.length > 50 ? '...' : ''),
      }));
      setShowCreateModal(true);
      localStorage.removeItem('draft_content');
      toast({
        title: "Content imported",
        description: "Your AI-generated content has been loaded. Select a platform and schedule time.",
      });
    }
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (showCreateModal && !editingPost) {
      // Only reset if not coming from draft content
      const draftContent = localStorage.getItem('draft_content');
      if (!draftContent) {
        setFormData(prev => ({
          ...prev,
          platform: prev.platform || '',
          content: prev.content || '',
          date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          time: '09:00',
          status: 'scheduled',
          title: prev.title || '',
          isRecurring: false,
          recurrence: 'weekly',
          recurrenceDays: [],
          recurrenceEndDate: '',
        }));
      }
    } else if (editingPost) {
      const editDate = new Date(editingPost.scheduled_time);
      setFormData({
        platform: editingPost.platform,
        content: editingPost.content,
        date: format(editDate, 'yyyy-MM-dd'),
        time: format(editDate, 'HH:mm'),
        status: editingPost.status,
        title: editingPost.title,
        isRecurring: editingPost.is_recurring || false,
        recurrence: editingPost.recurrence || 'weekly',
        recurrenceDays: editingPost.recurrence_days || [],
        recurrenceEndDate: editingPost.recurrence_end_date || '',
      });
    }
  }, [showCreateModal, editingPost, selectedDate]);

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

  // Handle create/update post
  const handleSavePost = async () => {
    if (!formData.platform || !formData.content || !formData.title) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSavingPost(true);

    try {
      if (editingPost) {
        // Update existing post in database
        const success = await updatePost(editingPost.id, {
          platforms: [formData.platform],
          content: formData.content,
          scheduled_time: new Date(`${formData.date}T${formData.time}`).toISOString(),
          status: formData.status,
          title: formData.title,
          is_recurring: formData.isRecurring,
          recurrence: formData.isRecurring ? formData.recurrence : undefined,
          recurrence_end_date: formData.isRecurring ? formData.recurrenceEndDate : undefined,
        });
        
        if (success) {
          setEditingPost(null);
        }
      } else {
        // Create new post in database
        await createPost({
          platform: formData.platform,
          content: formData.content,
          scheduled_time: new Date(`${formData.date}T${formData.time}`).toISOString(),
          status: formData.status,
          title: formData.title,
          post_type: 'text',
          is_recurring: formData.isRecurring,
          recurrence: formData.isRecurring ? formData.recurrence : undefined,
          recurrence_end_date: formData.isRecurring ? formData.recurrenceEndDate : undefined,
        });
      }

      setShowCreateModal(false);
      setShowPreviewPanel(false);
      setFormData({
        platform: '',
        content: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '09:00',
        status: 'scheduled',
        title: '',
        isRecurring: false,
        recurrence: 'weekly',
        recurrenceDays: [],
        recurrenceEndDate: '',
      });
    } catch (err) {
      console.error('Error saving post:', err);
    } finally {
      setSavingPost(false);
    }
  };

  // Toggle recurrence day
  const toggleRecurrenceDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter(d => d !== day)
        : [...prev.recurrenceDays, day]
    }));
  };

  // Handle delete post
  const handleDeletePost = async (id: string) => {
    await deletePost(id);
  };

  // Handle duplicate post
  const handleDuplicatePost = async (post: LocalScheduledPost) => {
    await createPost({
      platform: post.platform,
      content: post.content,
      scheduled_time: post.scheduled_time,
      status: 'draft',
      title: `${post.title} (Copy)`,
      post_type: 'text',
    });
  };

  // Handle edit post
  const handleEditPost = (post: LocalScheduledPost) => {
    setEditingPost(post);
    setShowCreateModal(true);
  };

  // Drag and drop handlers
  const handleDragStart = (post: LocalScheduledPost) => {
    if (post.status === 'published') return;
    setDraggedPost(post);
  };

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    setDragOverDate(date);
  };

  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (!draggedPost) return;

    // Get the original time and apply it to the new date
    const originalTime = new Date(draggedPost.scheduled_time);
    const newScheduledTime = new Date(date);
    newScheduledTime.setHours(originalTime.getHours(), originalTime.getMinutes());

    await updatePost(draggedPost.id, {
      scheduled_time: newScheduledTime.toISOString(),
    });

    toast({
      title: 'Post Rescheduled',
      description: `Moved to ${format(date, 'MMMM d, yyyy')}`,
    });

    setDraggedPost(null);
    setDragOverDate(null);
  };

  const handleDragEnd = () => {
    setDraggedPost(null);
    setDragOverDate(null);
  };

  // Quick add post for a specific date
  const handleQuickAdd = (date: Date) => {
    setSelectedDate(date);
    setEditingPost(null);
    setShowCreateModal(true);
  };

  // Status badge styles
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-primary/20 text-primary border-primary/30',
      published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      draft: 'bg-muted text-muted-foreground border-border',
    };
    return styles[status] || styles.draft;
  };

  // Close modals on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedDate(null);
        setShowCreateModal(false);
        setEditingPost(null);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="min-h-screen bg-background" onDragEnd={handleDragEnd}>
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  <span className="hidden sm:inline">Calendar</span>
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
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode('queue')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'queue'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span className="hidden sm:inline">Queue</span>
                </button>
              </div>

              {/* Auto-Schedule Settings Button */}
              <Button 
                variant="outline" 
                onClick={() => setShowAutoScheduleSettings(true)}
                className="gap-2 border-primary/50 hover:bg-primary/10"
              >
                <Settings className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Auto-Schedule</span>
              </Button>

              {/* Best Times Button */}
              <Button 
                variant="outline" 
                onClick={() => setShowBestTimesPanel(true)}
                className="gap-2 border-primary/50 hover:bg-primary/10"
              >
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="hidden sm:inline">Best Times</span>
              </Button>

              {/* New Post Button */}
              <Button onClick={() => { setEditingPost(null); setSelectedDate(null); setShowCreateModal(true); }} className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Post</span>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger className="w-32 sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            {/* Platform Filter */}
            <div className="flex items-center gap-2 flex-wrap">
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
                  title={platform}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Loading State */}
        {loading ? (
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your posts...</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchPosts} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        ) : posts.length === 0 && platformFilter === 'all' ? (
          <div className="bg-card rounded-xl border border-border">
            <EmptyState
              icon={Calendar}
              title="No scheduled posts yet"
              description="Create your first post to start building your content calendar."
              action={() => { setEditingPost(null); setSelectedDate(null); setShowCreateModal(true); }}
              actionLabel="Create Your First Post"
            />
          </div>
        ) : viewMode === 'queue' ? (
          /* Queue View */
          <QueueView
            posts={filteredPosts}
            onAddPost={(platform) => {
              setFormData({ ...formData, platform });
              setEditingPost(null);
              setSelectedDate(null);
              setShowCreateModal(true);
            }}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onUpdatePost={async (id, updates) => {
              await updatePost(id, updates);
            }}
          />
        ) : viewMode === 'calendar' ? (
          /* Calendar View */
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
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
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day.charAt(0)}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="min-h-[80px] sm:min-h-[100px]" />;
                }

                const dayPosts = getPostsForDay(day);

                return (
                  <CalendarDateCell
                    key={day.toISOString()}
                    day={day}
                    currentMonth={currentMonth}
                    posts={dayPosts}
                    isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                    onSelect={(date) => {
                      if (getPostsForDay(date).length > 0 || isToday(date)) {
                        setSelectedDate(date);
                      }
                    }}
                    onQuickAdd={handleQuickAdd}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    isDragOver={dragOverDate ? isSameDay(day, dragOverDate) : false}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-muted-foreground">Platform</th>
                    <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-muted-foreground">Content</th>
                    <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Scheduled</th>
                    <th className="text-left px-4 sm:px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 sm:px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
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
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-2">
                            {platformIcons[post.platform]}
                            <span className="text-sm capitalize text-foreground hidden sm:inline">{post.platform}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{post.title}</p>
                            <p className="text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-md">
                              {post.content.slice(0, 50)}...
                            </p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{format(new Date(post.scheduled_time), 'MMM d, yyyy h:mm a')}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(post.status)}`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-muted-foreground hover:text-foreground"
                              onClick={() => handleEditPost(post)}
                            >
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
          </div>
        )}
      </main>

      {/* Day Detail Panel */}
      {selectedDate && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setSelectedDate(null)}
          />
          <DayDetailPanel
            date={selectedDate}
            posts={getPostsForDay(selectedDate)}
            onClose={() => setSelectedDate(null)}
            onAddPost={handleQuickAdd}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onDuplicatePost={handleDuplicatePost}
            onDragStart={handleDragStart}
          />
        </>
      )}

      {/* Create/Edit Post Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) setEditingPost(null);
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Scheduled Post' : 'Schedule New Post'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Left Column - Form */}
            <div className="space-y-4">
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
            <div className="space-y-2">
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
              
              {/* Auto-Optimize Button */}
              {user && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    setOptimizingTime(true);
                    try {
                      const { data, error } = await supabase.functions.invoke('auto-optimize-timing', {
                        body: { 
                          userId: user.id, 
                          action: 'find_optimal_slot',
                          platform: formData.platform || 'all',
                          afterTime: new Date().toISOString()
                        }
                      });
                      if (error) throw error;
                      
                      if (data?.slot) {
                        const optimalDate = new Date(data.slot.time);
                        setFormData({
                          ...formData,
                          date: format(optimalDate, 'yyyy-MM-dd'),
                          time: format(optimalDate, 'HH:mm')
                        });
                        sonnerToast.success(`Optimized! Expected ${data.slot.expectedEngagement?.toFixed(1)}% engagement`);
                      } else {
                        sonnerToast.info('No optimal slot found, using current time');
                      }
                    } catch (err) {
                      console.error('Auto-optimize failed:', err);
                      sonnerToast.error('Failed to find optimal time');
                    } finally {
                      setOptimizingTime(false);
                    }
                  }}
                  disabled={optimizingTime}
                  className="w-full gap-2"
                >
                  {optimizingTime ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      Finding optimal time...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-primary" />
                      Auto-Optimize Time
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Recurring Toggle */}
            <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                <Label htmlFor="recurring-toggle" className="text-sm font-medium">Make Recurring</Label>
              </div>
              <Switch
                id="recurring-toggle"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
              />
            </div>

            {/* Recurring Settings */}
            {formData.isRecurring && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Frequency</label>
                  <Select 
                    value={formData.recurrence} 
                    onValueChange={(v) => setFormData({ ...formData, recurrence: v as typeof formData.recurrence })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.recurrence === 'weekly' && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Repeat on</label>
                    <div className="flex flex-wrap gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleRecurrenceDay(day)}
                          className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                            formData.recurrenceDays.includes(day)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {day.charAt(0)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">End Date (optional)</label>
                  <Input
                    type="date"
                    value={formData.recurrenceEndDate}
                    onChange={(e) => setFormData({ ...formData, recurrenceEndDate: e.target.value })}
                    placeholder="Never"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty for no end date</p>
                </div>
              </div>
            )}

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
            <div className="flex justify-between pt-4">
              {editingPost && (
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleDeletePost(editingPost.id);
                    setShowCreateModal(false);
                    setEditingPost(null);
                  }}
                >
                  Delete Post
                </Button>
              )}
              <div className={`flex gap-2 ${editingPost ? '' : 'ml-auto'}`}>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreviewPanel(true)}
                  disabled={!formData.platform}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowCreateModal(false);
                  setEditingPost(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSavePost} disabled={savingPost}>
                  {savingPost ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingPost ? 'Update' : formData.isRecurring ? 'Create Series' : 'Schedule'
                  )}
                </Button>
              </div>
            </div>
            </div>
            
            {/* Right Column - Prediction Score */}
            <div className="hidden lg:block">
              {user && (
                <PredictionScore
                  userId={user.id}
                  content={formData.content}
                  platform={formData.platform || 'twitter'}
                  mediaUrls={[]}
                  scheduledTime={formData.date && formData.time ? `${formData.date}T${formData.time}` : undefined}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Post Preview Panel */}
      {showPreviewPanel && (
        <PostPreviewPanel
          platform={formData.platform}
          content={formData.content}
          onClose={() => setShowPreviewPanel(false)}
        />
      )}

      {/* Best Times Panel */}
      {showBestTimesPanel && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setShowBestTimesPanel(false)}
          />
          <BestTimesPanel
            onClose={() => setShowBestTimesPanel(false)}
            onScheduleAtTime={(platform, day, time) => {
              // Calculate the next occurrence of the specified day
              const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
              const today = new Date();
              const todayIndex = today.getDay();
              let daysToAdd = dayIndex - todayIndex;
              if (daysToAdd <= 0) daysToAdd += 7;
              
              const targetDate = new Date(today);
              targetDate.setDate(today.getDate() + daysToAdd);
              
              // Parse time (e.g., "2:00 PM" -> 14:00)
              const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
              let hours = 9;
              let minutes = 0;
              if (timeMatch) {
                hours = parseInt(timeMatch[1]);
                minutes = parseInt(timeMatch[2]);
                if (timeMatch[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
                if (timeMatch[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
              }
              
              setFormData({
                platform,
                content: '',
                date: format(targetDate, 'yyyy-MM-dd'),
                time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
                status: 'scheduled',
                title: '',
                isRecurring: false,
                recurrence: 'weekly',
                recurrenceDays: [],
                recurrenceEndDate: '',
              });
              setEditingPost(null);
              setShowBestTimesPanel(false);
              setShowCreateModal(true);
              
              toast({
                title: 'Best Time Selected',
                description: `Scheduling for ${day} at ${time}`,
              });
            }}
          />
        </>
      )}

      {/* Auto-Schedule Settings Modal */}
      <Dialog open={showAutoScheduleSettings} onOpenChange={setShowAutoScheduleSettings}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Auto-Schedule Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <AutoScheduleSettings />
            <WeeklySchedulePreview />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}