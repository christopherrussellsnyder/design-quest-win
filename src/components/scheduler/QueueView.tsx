import { useState } from 'react';
import { Pause, Play, Trash2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QueueColumn } from './QueueColumn';
import { QueueSettingsModal } from './QueueSettingsModal';
import { useToast } from '@/hooks/use-toast';

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduled_time: string;
  status: string;
  title: string;
  queue_position?: number;
}

interface QueueSettings {
  scheduleType: 'fixed_intervals' | 'specific_times' | 'best_times';
  intervalHours: number;
  startTime: string;
  endTime: string;
  specificTimes: string[];
  minTimeBetween: number;
  maxPostsPerDay: number;
  skipWeekends: boolean;
  randomizeTime: boolean;
  isActive: boolean;
}

interface QueueViewProps {
  posts: ScheduledPost[];
  onAddPost: (platform: string) => void;
  onEditPost: (post: ScheduledPost) => void;
  onDeletePost: (id: string) => void;
  onUpdatePost: (id: string, updates: Partial<ScheduledPost>) => void;
}

const defaultSettings: QueueSettings = {
  scheduleType: 'best_times',
  intervalHours: 4,
  startTime: '09:00',
  endTime: '18:00',
  specificTimes: ['09:00', '14:00', '18:00'],
  minTimeBetween: 60,
  maxPostsPerDay: 5,
  skipWeekends: false,
  randomizeTime: true,
  isActive: true,
};

const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'];

export function QueueView({
  posts,
  onAddPost,
  onEditPost,
  onDeletePost,
  onUpdatePost,
}: QueueViewProps) {
  const { toast } = useToast();
  const [queueSettings, setQueueSettings] = useState<Record<string, QueueSettings>>(
    platforms.reduce((acc, p) => ({ ...acc, [p]: { ...defaultSettings } }), {})
  );
  const [settingsModalPlatform, setSettingsModalPlatform] = useState<string | null>(null);
  const [showEmptyPlatforms, setShowEmptyPlatforms] = useState(true);
  const [draggedPost, setDraggedPost] = useState<ScheduledPost | null>(null);
  const [dragOverPlatform, setDragOverPlatform] = useState<string | null>(null);

  // Group posts by platform
  const postsByPlatform = platforms.reduce((acc, platform) => {
    acc[platform] = posts.filter(p => p.platform === platform);
    return acc;
  }, {} as Record<string, ScheduledPost[]>);

  // Filter platforms to show
  const visiblePlatforms = showEmptyPlatforms
    ? platforms
    : platforms.filter(p => postsByPlatform[p].length > 0);

  const handleToggleActive = (platform: string) => {
    const newSettings = {
      ...queueSettings[platform],
      isActive: !queueSettings[platform].isActive,
    };
    setQueueSettings({ ...queueSettings, [platform]: newSettings });
    toast({
      title: newSettings.isActive ? 'Queue Resumed' : 'Queue Paused',
      description: `${platform} queue is now ${newSettings.isActive ? 'active' : 'paused'}`,
    });
  };

  const handleSaveSettings = (platform: string, settings: QueueSettings) => {
    setQueueSettings({ ...queueSettings, [platform]: settings });
    toast({
      title: 'Settings Saved',
      description: `${platform} queue settings updated`,
    });
  };

  const handlePauseAll = () => {
    const allPaused = Object.values(queueSettings).every(s => !s.isActive);
    const newSettings = { ...queueSettings };
    platforms.forEach(p => {
      newSettings[p] = { ...newSettings[p], isActive: allPaused };
    });
    setQueueSettings(newSettings);
    toast({
      title: allPaused ? 'All Queues Resumed' : 'All Queues Paused',
      description: allPaused ? 'All platform queues are now active' : 'All platform queues are now paused',
    });
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all posts from all queues?')) {
      posts.forEach(post => onDeletePost(post.id));
      toast({
        title: 'Queues Cleared',
        description: 'All posts have been removed from queues',
      });
    }
  };

  const handleDragStart = (post: ScheduledPost) => {
    setDraggedPost(post);
  };

  const handleDragEnd = () => {
    setDraggedPost(null);
    setDragOverPlatform(null);
  };

  const handleDragOver = (e: React.DragEvent, platform: string) => {
    e.preventDefault();
    setDragOverPlatform(platform);
  };

  const handleDrop = (targetPlatform: string, position: number) => {
    if (!draggedPost) return;

    if (draggedPost.platform !== targetPlatform) {
      // Moving to different platform
      onUpdatePost(draggedPost.id, { 
        platform: targetPlatform,
        queue_position: position,
      });
      toast({
        title: 'Post Moved',
        description: `Moved to ${targetPlatform} queue`,
      });
    } else {
      // Reordering within same platform
      onUpdatePost(draggedPost.id, { queue_position: position });
      toast({
        title: 'Queue Reordered',
        description: `Post moved to position #${position + 1}`,
      });
    }

    setDraggedPost(null);
    setDragOverPlatform(null);
  };

  const handleReorder = (postId: string, newPosition: number) => {
    onUpdatePost(postId, { queue_position: newPosition });
  };

  const allPaused = Object.values(queueSettings).every(s => !s.isActive);
  const totalPosts = posts.length;

  return (
    <div className="space-y-4">
      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handlePauseAll}
          >
            {allPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {allPaused ? 'Resume All' : 'Pause All'}
          </Button>
          <Button
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleClearAll}
            disabled={totalPosts === 0}
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            disabled
            title="Coming soon"
          >
            <Sparkles className="w-4 h-4" />
            Auto-Fill
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setShowEmptyPlatforms(!showEmptyPlatforms)}
          >
            {showEmptyPlatforms ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showEmptyPlatforms ? 'Hide Empty' : 'Show All'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {totalPosts} posts across {platforms.filter(p => postsByPlatform[p].length > 0).length} platforms
          </span>
        </div>
      </div>

      {/* Queue Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {visiblePlatforms.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-16 text-center">
            <div className="text-5xl mb-4">🗂️</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Your queues are empty</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start adding posts to automate your social media. Content will be published automatically at optimal times.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {platforms.slice(0, 4).map(platform => (
                <Button
                  key={platform}
                  variant="outline"
                  onClick={() => onAddPost(platform)}
                  className="capitalize"
                >
                  Add to {platform}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          visiblePlatforms.map(platform => (
            <QueueColumn
              key={platform}
              platform={platform}
              posts={postsByPlatform[platform]}
              isActive={queueSettings[platform].isActive}
              onToggleActive={() => handleToggleActive(platform)}
              onOpenSettings={() => setSettingsModalPlatform(platform)}
              onAddPost={onAddPost}
              onEditPost={onEditPost}
              onRemoveFromQueue={onDeletePost}
              onReorder={handleReorder}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              isDragOver={dragOverPlatform === platform}
              onDragOver={(e) => handleDragOver(e, platform)}
            />
          ))
        )}
      </div>

      {/* Settings Modal */}
      {settingsModalPlatform && (
        <QueueSettingsModal
          platform={settingsModalPlatform}
          isOpen={!!settingsModalPlatform}
          onClose={() => setSettingsModalPlatform(null)}
          settings={queueSettings[settingsModalPlatform]}
          onSave={(settings) => handleSaveSettings(settingsModalPlatform, settings)}
          postCount={postsByPlatform[settingsModalPlatform]?.length || 0}
        />
      )}
    </div>
  );
}
