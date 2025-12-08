import { format, isToday, isSameMonth, isPast, isFuture } from 'date-fns';
import { Plus, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduled_time: string;
  status: string;
  title: string;
}

interface CalendarDateCellProps {
  day: Date;
  currentMonth: Date;
  posts: ScheduledPost[];
  isSelected: boolean;
  onSelect: (date: Date) => void;
  onQuickAdd: (date: Date) => void;
  onDragOver: (e: React.DragEvent, date: Date) => void;
  onDrop: (e: React.DragEvent, date: Date) => void;
  isDragOver: boolean;
}

const platformIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-3 h-3 text-blue-500" />,
  instagram: <Instagram className="w-3 h-3 text-pink-500" />,
  twitter: <Twitter className="w-3 h-3 text-sky-500" />,
  linkedin: <Linkedin className="w-3 h-3 text-blue-600" />,
};

export function CalendarDateCell({
  day,
  currentMonth,
  posts,
  isSelected,
  onSelect,
  onQuickAdd,
  onDragOver,
  onDrop,
  isDragOver,
}: CalendarDateCellProps) {
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isCurrentDay = isToday(day);
  const isPastDate = isPast(day) && !isCurrentDay;
  const isFutureDate = isFuture(day) || isCurrentDay;

  // Get status counts
  const statusCounts = posts.reduce((acc, post) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get unique platforms
  const platforms = [...new Set(posts.map(p => p.platform))].slice(0, 3);

  // Calculate density for heatmap effect
  const getDensityClass = () => {
    if (posts.length === 0) return '';
    if (posts.length <= 2) return 'bg-primary/10';
    if (posts.length <= 5) return 'bg-primary/20';
    return 'bg-primary/30';
  };

  return (
    <button
      onClick={() => onSelect(day)}
      onDragOver={(e) => onDragOver(e, day)}
      onDrop={(e) => onDrop(e, day)}
      className={`
        relative min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 rounded-lg border transition-all text-left flex flex-col group
        ${isCurrentMonth ? 'hover:bg-muted/50' : 'opacity-40'}
        ${isCurrentDay ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
        ${isSelected ? 'bg-primary/20 border-primary' : 'border-border'}
        ${isDragOver ? 'border-primary border-2 bg-primary/10' : ''}
        ${getDensityClass()}
        ${isPastDate ? 'opacity-60' : ''}
      `}
    >
      {/* Quick Add Button - visible on hover for future dates */}
      {isFutureDate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd(day);
          }}
          className="absolute top-1 right-1 w-5 h-5 rounded bg-primary text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <Plus className="w-3 h-3" />
        </button>
      )}

      {/* Day Number */}
      <span className={`text-sm font-semibold ${
        isCurrentDay ? 'text-primary' : 
        isPastDate ? 'text-muted-foreground' : 
        'text-foreground'
      }`}>
        {format(day, 'd')}
      </span>

      {/* Post Count Badge */}
      {posts.length > 0 && (
        <div className="flex items-center gap-1 mt-1">
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {posts.length}
          </span>
        </div>
      )}

      {/* Status Indicators */}
      {posts.length > 0 && (
        <div className="flex gap-1 mt-auto">
          {statusCounts.published && (
            <div className="w-2 h-2 rounded-full bg-emerald-500" title={`${statusCounts.published} published`} />
          )}
          {statusCounts.scheduled && (
            <div className="w-2 h-2 rounded-full bg-primary" title={`${statusCounts.scheduled} scheduled`} />
          )}
          {statusCounts.draft && (
            <div className="w-2 h-2 rounded-full bg-amber-500" title={`${statusCounts.draft} drafts`} />
          )}
          {statusCounts.failed && (
            <div className="w-2 h-2 rounded-full bg-destructive" title={`${statusCounts.failed} failed`} />
          )}
        </div>
      )}

      {/* Platform Icons */}
      {platforms.length > 0 && (
        <div className="hidden sm:flex items-center gap-0.5 mt-1">
          {platforms.map(platform => (
            <span key={platform}>{platformIcons[platform]}</span>
          ))}
          {posts.length > 3 && (
            <span className="text-xs text-muted-foreground">+{posts.length - 3}</span>
          )}
        </div>
      )}

      {/* Mini Post Cards - desktop only */}
      <div className="hidden lg:block mt-1 space-y-0.5 overflow-hidden">
        {posts.slice(0, 2).map(post => (
          <div
            key={post.id}
            className="text-[10px] leading-tight truncate py-0.5 px-1 rounded bg-muted/50 text-muted-foreground flex items-center gap-1"
          >
            {platformIcons[post.platform]}
            <span>{format(new Date(post.scheduled_time), 'h:mm a')}</span>
          </div>
        ))}
        {posts.length > 2 && (
          <span className="text-[10px] text-muted-foreground">+{posts.length - 2} more</span>
        )}
      </div>
    </button>
  );
}
