import { useState } from 'react';
import { format } from 'date-fns';
import { Settings, Play, Pause, Plus, GripVertical, Edit2, X, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduled_time: string;
  status: string;
  title: string;
  queue_position?: number;
}

interface QueueColumnProps {
  platform: string;
  posts: ScheduledPost[];
  isActive: boolean;
  onToggleActive: () => void;
  onOpenSettings: () => void;
  onAddPost: (platform: string) => void;
  onEditPost: (post: ScheduledPost) => void;
  onRemoveFromQueue: (id: string) => void;
  onReorder: (postId: string, newPosition: number) => void;
  onDragStart: (post: ScheduledPost) => void;
  onDragEnd: () => void;
  onDrop: (platform: string, position: number) => void;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
}

const platformConfig: Record<string, { icon: React.ReactNode; color: string; gradient?: string }> = {
  facebook: { icon: <Facebook className="w-6 h-6" />, color: 'text-blue-500', gradient: 'from-blue-600 to-blue-400' },
  instagram: { icon: <Instagram className="w-6 h-6" />, color: 'text-pink-500', gradient: 'from-pink-600 via-purple-600 to-orange-400' },
  twitter: { icon: <Twitter className="w-6 h-6" />, color: 'text-sky-500', gradient: 'from-sky-500 to-sky-400' },
  linkedin: { icon: <Linkedin className="w-6 h-6" />, color: 'text-blue-600', gradient: 'from-blue-700 to-blue-500' },
  tiktok: { icon: <span className="text-lg font-bold">TT</span>, color: 'text-foreground', gradient: 'from-gray-900 to-gray-700' },
};

const getStatusDot = (isActive: boolean, postCount: number) => {
  if (postCount === 0) return 'bg-destructive';
  if (!isActive) return 'bg-amber-500';
  return 'bg-emerald-500';
};

export function QueueColumn({
  platform,
  posts,
  isActive,
  onToggleActive,
  onOpenSettings,
  onAddPost,
  onEditPost,
  onRemoveFromQueue,
  onReorder,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragOver,
  onDragOver,
}: QueueColumnProps) {
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const config = platformConfig[platform] || platformConfig.facebook;

  const sortedPosts = [...posts].sort((a, b) => (a.queue_position || 0) - (b.queue_position || 0));

  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    setDragOverPosition(position);
    onDragOver(e);
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    setDragOverPosition(null);
    onDrop(platform, position);
  };

  const handleDragLeave = () => {
    setDragOverPosition(null);
  };

  // Queue fill percentage (arbitrary max of 10 for demo)
  const fillPercentage = Math.min((posts.length / 10) * 100, 100);
  const getFillColor = () => {
    if (fillPercentage >= 75) return 'bg-emerald-500';
    if (fillPercentage >= 25) return 'bg-amber-500';
    return 'bg-destructive';
  };

  return (
    <div
      className={`flex flex-col w-[300px] flex-shrink-0 bg-card rounded-xl border transition-all ${
        isDragOver ? 'border-primary shadow-lg' : 'border-border'
      } ${!isActive ? 'opacity-60' : ''}`}
      onDragLeave={handleDragLeave}
    >
      {/* Column Header */}
      <div className={`p-4 rounded-t-xl bg-gradient-to-r ${config.gradient} bg-opacity-10`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`${config.color}`}>{config.icon}</div>
            <div>
              <h3 className="font-semibold text-foreground capitalize">{platform}</h3>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${getStatusDot(isActive, posts.length)}`} />
                <span className="text-xs text-muted-foreground">
                  {posts.length} in queue
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onToggleActive}
              title={isActive ? 'Pause Queue' : 'Resume Queue'}
            >
              {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onOpenSettings}
              title="Queue Settings"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Queue Fill Indicator */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${getFillColor()} transition-all`}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {fillPercentage >= 75 ? '✅ Well stocked' : fillPercentage >= 25 ? '⚠️ Getting low' : '🔴 Needs content'}
        </p>
      </div>

      {/* Posts List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[400px]">
        {sortedPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-sm font-medium text-foreground mb-1">Queue is empty</p>
            <p className="text-xs text-muted-foreground">Add posts to start scheduling</p>
          </div>
        ) : (
          sortedPosts.map((post, index) => (
            <div
              key={post.id}
              draggable
              onDragStart={() => onDragStart(post)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className={`group relative p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                dragOverPosition === index
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-muted/30 hover:bg-muted/50 hover:shadow-sm'
              }`}
            >
              {/* Position Badge */}
              <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                #{index + 1}
              </div>

              {/* Drag Handle */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="ml-4">
                {/* Title */}
                <h4 className="font-medium text-foreground text-sm truncate pr-8">
                  {post.title}
                </h4>

                {/* Content Preview */}
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {post.content}
                </p>

                {/* Time & Status */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {index === 0 ? (
                      <span className="text-primary font-medium">📤 Next to post</span>
                    ) : (
                      format(new Date(post.scheduled_time), 'MMM d, h:mm a')
                    )}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    post.status === 'scheduled' ? 'bg-primary/20 text-primary' :
                    post.status === 'draft' ? 'bg-muted text-muted-foreground' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {post.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPost(post);
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromQueue(post.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add to Queue Button */}
      <div
        className={`p-3 border-t border-border ${
          isDragOver ? 'bg-primary/10' : ''
        }`}
        onDragOver={(e) => handleDragOver(e, sortedPosts.length)}
        onDrop={(e) => handleDrop(e, sortedPosts.length)}
      >
        <Button
          variant="outline"
          className="w-full border-dashed gap-2"
          onClick={() => onAddPost(platform)}
        >
          <Plus className="w-4 h-4" />
          Add to Queue
        </Button>
      </div>
    </div>
  );
}
