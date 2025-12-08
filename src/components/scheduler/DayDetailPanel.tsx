import { useState } from 'react';
import { format } from 'date-fns';
import { X, Plus, Clock, Edit2, Trash2, Copy, GripVertical, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduled_time: string;
  status: string;
  title: string;
}

interface DayDetailPanelProps {
  date: Date;
  posts: ScheduledPost[];
  onClose: () => void;
  onAddPost: (date: Date) => void;
  onEditPost: (post: ScheduledPost) => void;
  onDeletePost: (id: string) => void;
  onDuplicatePost: (post: ScheduledPost) => void;
  onDragStart: (post: ScheduledPost) => void;
}

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4 text-blue-500" />,
  instagram: <Instagram className="w-4 h-4 text-pink-500" />,
  twitter: <Twitter className="w-4 h-4 text-sky-500" />,
  linkedin: <Linkedin className="w-4 h-4 text-blue-600" />,
};

const getStatusStyles = (status: string) => {
  const styles: Record<string, string> = {
    scheduled: 'bg-primary/20 text-primary border-primary/30',
    published: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    draft: 'bg-muted text-muted-foreground border-border',
    failed: 'bg-destructive/20 text-destructive border-destructive/30',
  };
  return styles[status] || styles.draft;
};

export function DayDetailPanel({
  date,
  posts,
  onClose,
  onAddPost,
  onEditPost,
  onDeletePost,
  onDuplicatePost,
  onDragStart,
}: DayDetailPanelProps) {
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
  );

  const filteredPosts = sortedPosts.filter(post => {
    if (timeFilter === 'all') return true;
    const hour = new Date(post.scheduled_time).getHours();
    if (timeFilter === 'morning') return hour >= 6 && hour < 12;
    if (timeFilter === 'afternoon') return hour >= 12 && hour < 18;
    if (timeFilter === 'evening') return hour >= 18 || hour < 6;
    return true;
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPosts(newSelected);
  };

  const selectAll = () => {
    if (selectedPosts.size === filteredPosts.length) {
      setSelectedPosts(new Set());
    } else {
      setSelectedPosts(new Set(filteredPosts.map(p => p.id)));
    }
  };

  const handleBulkDelete = () => {
    selectedPosts.forEach(id => onDeletePost(id));
    setSelectedPosts(new Set());
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-card border-l border-border shadow-2xl z-50 animate-slide-in-right flex flex-col">
      {/* Panel Header */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-card">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Button onClick={() => onAddPost(date)} className="w-full gap-2">
          <Plus className="w-4 h-4" />
          Add Post to This Day
        </Button>

        {/* Time Filters */}
        <div className="flex gap-1 mt-3">
          {(['all', 'morning', 'afternoon', 'evening'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                timeFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter === 'all' ? 'All Day' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No posts scheduled</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {timeFilter !== 'all' 
                ? `No posts in the ${timeFilter} time range`
                : 'Schedule your first post for this day'
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Best times to post: 9 AM, 2 PM, 6 PM
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Checkbox
                checked={selectedPosts.size === filteredPosts.length && filteredPosts.length > 0}
                onCheckedChange={selectAll}
              />
              <span className="text-sm text-muted-foreground">Select all</span>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />
              
              {filteredPosts.map((post, index) => (
                <div
                  key={post.id}
                  draggable={post.status !== 'published'}
                  onDragStart={() => onDragStart(post)}
                  className={`relative pl-10 pb-4 group ${
                    post.status !== 'published' ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                >
                  {/* Time marker */}
                  <div className="absolute left-0 w-9 flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      post.status === 'published' ? 'bg-emerald-500 border-emerald-500' :
                      post.status === 'scheduled' ? 'bg-primary border-primary' :
                      post.status === 'failed' ? 'bg-destructive border-destructive' :
                      'bg-muted border-border'
                    }`} />
                  </div>

                  {/* Post Card */}
                  <div
                    className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                      selectedPosts.has(post.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedPosts.has(post.id)}
                        onCheckedChange={() => toggleSelect(post.id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(post.scheduled_time), 'h:mm a')}
                          </span>
                          {platformIcons[post.platform]}
                          <span className="text-xs capitalize text-muted-foreground">
                            {post.platform}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {post.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {post.content}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(post.status)}`}>
                            {post.status}
                          </span>
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => onEditPost(post)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => onDuplicatePost(post)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:text-destructive"
                              onClick={() => onDeletePost(post.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                            {post.status !== 'published' && (
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedPosts.size > 0 && (
        <div className="flex-shrink-0 p-4 border-t border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {selectedPosts.size} post{selectedPosts.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPosts(new Set())}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                Delete All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
