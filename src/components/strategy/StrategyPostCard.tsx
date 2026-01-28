import React, { useState } from 'react';
import { 
  Copy, Edit, Sparkles, Clock, Eye, Heart, Hash, 
  ChevronDown, ChevronUp, Check, Image, Video, 
  FileText, Layout, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { StrategyPost } from '@/hooks/useStrategyGeneration';
import { format } from 'date-fns';

interface StrategyPostCardProps {
  post: StrategyPost;
  onEdit?: (post: StrategyPost) => void;
  onAskAI?: (post: StrategyPost) => void;
}

const postTypeIcons: Record<string, React.ReactNode> = {
  carousel: <Layout className="w-4 h-4" />,
  reel: <Video className="w-4 h-4" />,
  single_image: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  story: <MessageCircle className="w-4 h-4" />,
  text: <FileText className="w-4 h-4" />,
};

const themeColors: Record<string, string> = {
  educational: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  promotional: 'bg-green-500/20 text-green-400 border-green-500/30',
  engagement: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  social_proof: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  behind_scenes: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

export function StrategyPostCard({ post, onEdit, onAskAI }: StrategyPostCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: 'Copied to clipboard!' });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEE, MMM d');
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const hashtagsString = post.hashtags?.join(' ') || '';

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardContent className="p-4">
          {/* Header - Always visible */}
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                {post.day_number}
              </div>
              <span className="text-xs text-muted-foreground mt-1">Day</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">
                  {formatDate(post.post_date)}
                </span>
                {post.post_time && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(post.post_time)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                {post.post_type && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    {postTypeIcons[post.post_type] || <FileText className="w-3 h-3" />}
                    {post.post_type.replace('_', ' ')}
                  </Badge>
                )}
                {post.theme && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${themeColors[post.theme] || ''}`}
                  >
                    {post.theme.replace('_', ' ')}
                  </Badge>
                )}
              </div>

              {/* Hook - Always visible */}
              {post.hook && (
                <p className="font-semibold text-foreground text-lg leading-tight">
                  "{post.hook}"
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {post.predicted_reach && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {post.predicted_reach.toLocaleString()}
                  </span>
                )}
                {post.predicted_engagement && (
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {post.predicted_engagement}%
                  </span>
                )}
              </div>
              
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>

          {/* Expanded content */}
          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t border-border space-y-4">
              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">Caption</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(post.caption, 'caption')}
                  >
                    {copiedField === 'caption' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-line bg-muted/50 p-3 rounded-lg">
                  {post.caption}
                </p>
              </div>

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                      <Hash className="w-4 h-4" /> Hashtags
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(hashtagsString, 'hashtags')}
                    >
                      {copiedField === 'hashtags' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              {post.cta && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Call to Action</h4>
                  <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg inline-block">
                    {post.cta}
                  </p>
                </div>
              )}

              {/* Rationale */}
              {post.rationale && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Why This Post?</h4>
                  <p className="text-sm text-muted-foreground italic">
                    {post.rationale}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(
                    `${post.hook}\n\n${post.caption}\n\n${hashtagsString}`,
                    'all'
                  )}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All
                </Button>
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(post)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {onAskAI && (
                  <Button variant="outline" size="sm" onClick={() => onAskAI(post)}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Ask AI to Revise
                  </Button>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
