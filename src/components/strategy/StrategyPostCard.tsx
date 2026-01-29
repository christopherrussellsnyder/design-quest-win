import React, { useState } from 'react';
import { 
  Copy, Edit, Sparkles, Clock, Eye, Heart, Hash, 
  ChevronDown, ChevronUp, Check, Image, Video, 
  FileText, Layout, MessageCircle, Share2, Bookmark,
  Lightbulb, Target, Palette, AlertCircle, Zap, ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const confidenceColors: Record<string, string> = {
  High: 'text-green-400',
  Medium: 'text-amber-400',
  Low: 'text-red-400',
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
  const visualGuidance = post.visual_guidance || {};
  const hashtagMix = post.hashtag_mix || {};
  const strategicRationale = post.strategic_rationale || {};
  const optimizationTips = post.optimization_tips || {};

  const CopyButton = ({ text, field, label }: { text: string; field: string; label: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(text, field)}
      className="gap-1"
    >
      {copiedField === field ? (
        <Check className="w-3 h-3 text-green-500" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {label}
    </Button>
  );

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
              {post.week_number && (
                <span className="text-[10px] text-muted-foreground">W{post.week_number}</span>
              )}
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
                {post.is_edited && (
                  <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-400/30">
                    Edited
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {post.post_type && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    {postTypeIcons[post.post_type] || <FileText className="w-3 h-3" />}
                    {post.post_type.replace('_', ' ')}
                  </Badge>
                )}
                {(post.content_category || post.theme) && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${themeColors[post.content_category || post.theme || ''] || ''}`}
                  >
                    {(post.content_category || post.theme || '').replace('_', ' ')}
                  </Badge>
                )}
                {post.primary_emotion && (
                  <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/30">
                    {post.primary_emotion}
                  </Badge>
                )}
              </div>

              {/* Hook - Always visible */}
              {post.hook && (
                <div className="mb-2">
                  <p className="font-semibold text-foreground text-lg leading-tight">
                    "{post.hook}"
                  </p>
                  {post.hook_technique && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="text-primary">{post.hook_technique.replace('_', ' ')}</span>
                      {post.hook_principle && ` — ${post.hook_principle}`}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              {/* Performance Predictions */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {post.predicted_reach && (
                  <span className="flex items-center gap-1" title="Predicted Reach">
                    <Eye className="w-3 h-3" />
                    {post.predicted_reach.toLocaleString()}
                  </span>
                )}
                {post.predicted_engagement && (
                  <span className="flex items-center gap-1" title="Predicted Engagement">
                    <Heart className="w-3 h-3" />
                    {post.predicted_engagement}%
                  </span>
                )}
              </div>
              
              {/* Confidence Badge */}
              {post.performance_confidence && (
                <Badge 
                  variant="outline" 
                  className={`text-[10px] ${confidenceColors[post.performance_confidence] || ''}`}
                >
                  {post.performance_confidence} confidence
                </Badge>
              )}
              
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
            <div className="mt-4 pt-4 border-t border-border">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="visual">Visual</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="strategy">Strategy</TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4">
                  {/* Opening */}
                  {post.opening_text && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Opening</h4>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {post.opening_text}
                      </p>
                    </div>
                  )}

                  {/* Caption */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-foreground">Full Caption</h4>
                      <CopyButton text={post.caption} field="caption" label="Copy" />
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-line bg-muted/50 p-3 rounded-lg max-h-48 overflow-y-auto">
                      {post.caption}
                    </p>
                  </div>

                  {/* Hashtags with breakdown */}
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1">
                          <Hash className="w-4 h-4" /> Hashtags
                        </h4>
                        <CopyButton text={hashtagsString} field="hashtags" label="Copy All" />
                      </div>
                      
                      {/* Hashtag mix breakdown */}
                      {hashtagMix && Object.keys(hashtagMix).length > 0 ? (
                        <div className="space-y-2">
                          {hashtagMix.high_volume && hashtagMix.high_volume.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">High Volume (100K+):</p>
                              <div className="flex flex-wrap gap-1">
                                {hashtagMix.high_volume.map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-green-500/10 text-green-400">
                                    {tag.startsWith('#') ? tag : `#${tag}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {hashtagMix.medium_volume && hashtagMix.medium_volume.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Medium Volume (10K-100K):</p>
                              <div className="flex flex-wrap gap-1">
                                {hashtagMix.medium_volume.map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-blue-500/10 text-blue-400">
                                    {tag.startsWith('#') ? tag : `#${tag}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {hashtagMix.niche && hashtagMix.niche.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Niche (1K-10K):</p>
                              <div className="flex flex-wrap gap-1">
                                {hashtagMix.niche.map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-purple-500/10 text-purple-400">
                                    {tag.startsWith('#') ? tag : `#${tag}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {hashtagMix.branded && hashtagMix.branded.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Branded:</p>
                              <div className="flex flex-wrap gap-1">
                                {hashtagMix.branded.map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-amber-500/10 text-amber-400">
                                    {tag.startsWith('#') ? tag : `#${tag}`}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {post.hashtags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag.startsWith('#') ? tag : `#${tag}`}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  {post.cta && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        Call to Action
                        {post.cta_type && (
                          <Badge variant="outline" className="text-xs">{post.cta_type}</Badge>
                        )}
                        {post.cta_strength && (
                          <Badge variant="outline" className="text-xs">{post.cta_strength}</Badge>
                        )}
                      </h4>
                      <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg inline-block">
                        {post.cta}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Visual Tab */}
                <TabsContent value="visual" className="space-y-4">
                  {visualGuidance && Object.keys(visualGuidance).length > 0 ? (
                    <>
                      {visualGuidance.description && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <Image className="w-4 h-4" /> Visual Description
                          </h4>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            {visualGuidance.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        {visualGuidance.visual_type && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Type</p>
                            <Badge variant="secondary">{visualGuidance.visual_type}</Badge>
                          </div>
                        )}
                        {visualGuidance.color_palette && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Palette className="w-3 h-3" /> Colors
                            </p>
                            <p className="text-sm text-foreground">{visualGuidance.color_palette}</p>
                          </div>
                        )}
                      </div>

                      {visualGuidance.text_overlay && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Text Overlay</p>
                          <p className="text-sm text-foreground">{visualGuidance.text_overlay}</p>
                        </div>
                      )}

                      {visualGuidance.attention_hook && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Attention Hook
                          </p>
                          <p className="text-sm text-foreground">{visualGuidance.attention_hook}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No visual guidance available for this post.
                    </p>
                  )}
                </TabsContent>

                {/* Metrics Tab */}
                <TabsContent value="metrics" className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Eye className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold text-foreground">
                        {(post.predicted_reach || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Reach</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <Heart className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold text-foreground">
                        {post.predicted_engagement || 0}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">Engagement</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <ThumbsUp className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <p className="text-lg font-bold text-foreground">
                        {(post.predicted_likes || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Likes</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <p className="text-sm font-semibold text-foreground">{post.predicted_comments || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Comments</p>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <p className="text-sm font-semibold text-foreground">{post.predicted_shares || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Shares</p>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <p className="text-sm font-semibold text-foreground">{post.predicted_saves || 0}</p>
                      <p className="text-[10px] text-muted-foreground">Saves</p>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded-lg">
                      <p className="text-sm font-semibold text-foreground">
                        {(post.predicted_impressions || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Impressions</p>
                    </div>
                  </div>

                  {post.prediction_basis && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Prediction basis:</strong> {post.prediction_basis}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Strategy Tab */}
                <TabsContent value="strategy" className="space-y-4">
                  {/* Strategic Rationale */}
                  {strategicRationale && Object.keys(strategicRationale).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Target className="w-4 h-4" /> Strategic Rationale
                      </h4>
                      {strategicRationale.why_this_day && (
                        <div>
                          <p className="text-xs text-muted-foreground">Why This Day:</p>
                          <p className="text-sm text-foreground">{strategicRationale.why_this_day}</p>
                        </div>
                      )}
                      {strategicRationale.arc_positioning && (
                        <div>
                          <p className="text-xs text-muted-foreground">Arc Positioning:</p>
                          <p className="text-sm text-foreground">{strategicRationale.arc_positioning}</p>
                        </div>
                      )}
                      {strategicRationale.builds_toward && (
                        <div>
                          <p className="text-xs text-muted-foreground">Builds Toward:</p>
                          <p className="text-sm text-foreground">{strategicRationale.builds_toward}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Optimization Tips */}
                  {optimizationTips && Object.keys(optimizationTips).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" /> Optimization Tips
                      </h4>
                      {optimizationTips.engagement_boosters && optimizationTips.engagement_boosters.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Engagement Boosters:</p>
                          <ul className="text-sm text-foreground space-y-1">
                            {optimizationTips.engagement_boosters.map((tip: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <Zap className="w-3 h-3 mt-1 text-green-500 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {optimizationTips.a_b_test_ideas && optimizationTips.a_b_test_ideas.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">A/B Test Ideas:</p>
                          <ul className="text-sm text-foreground space-y-1">
                            {optimizationTips.a_b_test_ideas.map((idea: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <Sparkles className="w-3 h-3 mt-1 text-purple-500 flex-shrink-0" />
                                {idea}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {optimizationTips.potential_issues && optimizationTips.potential_issues.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Potential Issues:</p>
                          <ul className="text-sm text-foreground space-y-1">
                            {optimizationTips.potential_issues.map((issue: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <AlertCircle className="w-3 h-3 mt-1 text-orange-500 flex-shrink-0" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legacy Rationale fallback */}
                  {post.rationale && !strategicRationale.why_this_day && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Why This Post?</h4>
                      <p className="text-sm text-muted-foreground italic">
                        {post.rationale}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-border">
                <CopyButton text={post.hook || ''} field="hook" label="Hook" />
                <CopyButton text={post.caption} field="caption" label="Caption" />
                <CopyButton text={hashtagsString} field="hashtags" label="Hashtags" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(
                    `${post.hook}\n\n${post.caption}\n\n${hashtagsString}`,
                    'all'
                  )}
                  className="gap-1"
                >
                  {copiedField === 'all' ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  Copy All
                </Button>
                
                <div className="flex-1" />
                
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(post)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
                {onAskAI && (
                  <Button variant="outline" size="sm" onClick={() => onAskAI(post)}>
                    <Sparkles className="w-4 h-4 mr-1" />
                    Revise
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
