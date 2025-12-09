import { useState } from 'react';
import { X, Smartphone, Monitor, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, Repeat2, Send, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostPreviewPanelProps {
  platform: string;
  content: string;
  mediaUrl?: string;
  onClose: () => void;
}

type DeviceMode = 'mobile' | 'desktop';

const platformLimits: Record<string, { limit: number; optimal: number }> = {
  facebook: { limit: 63206, optimal: 80 },
  instagram: { limit: 2200, optimal: 150 },
  twitter: { limit: 280, optimal: 240 },
  linkedin: { limit: 3000, optimal: 200 },
  tiktok: { limit: 2200, optimal: 100 },
};

const platformBestPractices: Record<string, string[]> = {
  facebook: [
    'Ideal length: 40-80 characters',
    'Include image for 2.3x more engagement',
    'Post between 1-4 PM for best reach',
    'Use questions to increase comments',
  ],
  instagram: [
    'Optimal caption: 138-150 characters',
    'Use 3-5 relevant hashtags in caption',
    'Post between 5-8 PM for best engagement',
    'Square images (1:1) perform best',
  ],
  twitter: [
    'Tweets with images get 150% more retweets',
    'Use 1-2 hashtags maximum',
    'Post 8-10 AM or 12-2 PM',
    'Keep under 240 chars for better engagement',
  ],
  linkedin: [
    'Optimal length: 150-300 characters',
    'Post 7-9 AM or 12-1 PM on weekdays',
    'Use line breaks for readability',
    'Add 3-5 relevant hashtags at end',
  ],
  tiktok: [
    'Hook viewers in first 3 seconds',
    'Use trending hashtags',
    'Post 7-10 PM for best reach',
    'Short captions (< 100 chars)',
  ],
};

export function PostPreviewPanel({ platform, content, mediaUrl, onClose }: PostPreviewPanelProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  
  const limits = platformLimits[platform] || { limit: 1000, optimal: 150 };
  const practices = platformBestPractices[platform] || [];
  const charCount = content.length;
  
  const getCharCountColor = () => {
    if (platform === 'twitter') {
      if (charCount > limits.limit) return 'text-destructive';
      if (charCount > 270) return 'text-amber-400';
      if (charCount > 240) return 'text-yellow-400';
      return 'text-emerald-400';
    }
    if (charCount > limits.limit) return 'text-destructive';
    if (charCount > limits.optimal * 2) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const renderFacebookPreview = () => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${deviceMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[500px]'}`}>
      {/* Header */}
      <div className="p-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/60 to-primary" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Your Business Name</p>
          <p className="text-xs text-slate-500">Just now · 🌐</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-slate-500" />
      </div>
      
      {/* Content */}
      <div className="px-3 pb-2">
        <p className="text-sm text-slate-900 whitespace-pre-wrap">
          {content.length > 250 ? (
            <>
              {content.slice(0, 250)}...
              <span className="text-blue-600 cursor-pointer"> See more</span>
            </>
          ) : content || 'Your post content will appear here...'}
        </p>
      </div>
      
      {/* Media */}
      <div className="aspect-video bg-slate-200 flex items-center justify-center">
        {mediaUrl ? (
          <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-400 text-sm">Image Preview</div>
        )}
      </div>
      
      {/* Reactions */}
      <div className="px-3 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-200">
        <div className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px]">👍</span>
            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px]">❤️</span>
          </span>
          <span>125</span>
        </div>
        <div className="flex gap-3">
          <span>12 Comments</span>
          <span>5 Shares</span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="px-3 py-2 flex justify-around">
        <button className="flex items-center gap-2 text-slate-600 text-sm font-medium hover:bg-slate-100 px-4 py-2 rounded-md">
          <ThumbsUp className="w-5 h-5" /> Like
        </button>
        <button className="flex items-center gap-2 text-slate-600 text-sm font-medium hover:bg-slate-100 px-4 py-2 rounded-md">
          <MessageCircle className="w-5 h-5" /> Comment
        </button>
        <button className="flex items-center gap-2 text-slate-600 text-sm font-medium hover:bg-slate-100 px-4 py-2 rounded-md">
          <Share2 className="w-5 h-5" /> Share
        </button>
      </div>
    </div>
  );

  const renderInstagramPreview = () => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${deviceMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[470px]'}`}>
      {/* Header */}
      <div className="p-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 p-[2px]">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/60 to-primary" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">yourbusiness</p>
          <p className="text-xs text-slate-500">Location</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-slate-900" />
      </div>
      
      {/* Media */}
      <div className="aspect-square bg-slate-200 flex items-center justify-center">
        {mediaUrl ? (
          <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-400 text-sm">Square Image (1:1)</div>
        )}
      </div>
      
      {/* Actions */}
      <div className="px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Heart className="w-6 h-6 text-slate-900" />
          <MessageCircle className="w-6 h-6 text-slate-900" />
          <Send className="w-6 h-6 text-slate-900" />
        </div>
        <Bookmark className="w-6 h-6 text-slate-900" />
      </div>
      
      {/* Likes */}
      <div className="px-3">
        <p className="text-sm font-semibold text-slate-900">234 likes</p>
      </div>
      
      {/* Caption */}
      <div className="px-3 py-2">
        <p className="text-sm text-slate-900">
          <span className="font-semibold">yourbusiness </span>
          {content.length > 125 ? (
            <>
              {content.slice(0, 125)}...
              <span className="text-slate-500 cursor-pointer"> more</span>
            </>
          ) : content || 'Your caption will appear here...'}
        </p>
      </div>
      
      {/* Comments */}
      <div className="px-3 pb-3">
        <p className="text-sm text-slate-500">View all 23 comments</p>
        <p className="text-[10px] text-slate-400 uppercase mt-1">2 hours ago</p>
      </div>
    </div>
  );

  const renderTwitterPreview = () => (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${deviceMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[500px]'}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/60 to-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-900 text-[15px]">Your Business</span>
              <span className="text-sky-500">✓</span>
              <span className="text-slate-500 text-[15px]">@yourbusiness</span>
              <span className="text-slate-500 text-[15px]">· Just now</span>
            </div>
            
            {/* Content */}
            <p className="text-[15px] text-slate-900 mt-1 whitespace-pre-wrap">
              {content.split(' ').map((word, i) => {
                if (word.startsWith('#') || word.startsWith('@')) {
                  return <span key={i} className="text-sky-500">{word} </span>;
                }
                return word + ' ';
              }) || 'Your tweet will appear here...'}
            </p>
            
            {/* Media */}
            {(mediaUrl || !content) && (
              <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
                <div className="aspect-video bg-slate-200 flex items-center justify-center">
                  {mediaUrl ? (
                    <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-400 text-sm">Image Preview</div>
                  )}
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between mt-3 text-slate-500 max-w-md">
              <button className="flex items-center gap-2 hover:text-sky-500 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">12</span>
              </button>
              <button className="flex items-center gap-2 hover:text-emerald-500 transition-colors">
                <Repeat2 className="w-5 h-5" />
                <span className="text-sm">45</span>
              </button>
              <button className="flex items-center gap-2 hover:text-pink-500 transition-colors">
                <Heart className="w-5 h-5" />
                <span className="text-sm">234</span>
              </button>
              <button className="flex items-center gap-2 hover:text-sky-500 transition-colors">
                <Eye className="w-5 h-5" />
                <span className="text-sm">1.2K</span>
              </button>
              <button className="flex items-center gap-2 hover:text-sky-500 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLinkedInPreview = () => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${deviceMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[550px]'}`}>
      {/* Header */}
      <div className="p-4 flex gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/60 to-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Your Name</p>
          <p className="text-xs text-slate-500">Position at Company</p>
          <p className="text-xs text-slate-500">Just now · 🌐</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-slate-500" />
      </div>
      
      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-900 whitespace-pre-wrap">
          {content.length > 300 ? (
            <>
              {content.slice(0, 300)}...
              <span className="text-blue-600 cursor-pointer"> see more</span>
            </>
          ) : content || 'Your post content will appear here...'}
        </p>
      </div>
      
      {/* Media */}
      <div className="aspect-video bg-slate-200 flex items-center justify-center border-y border-slate-100">
        {mediaUrl ? (
          <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-400 text-sm">Image or Document Preview</div>
        )}
      </div>
      
      {/* Reactions */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-b border-slate-200">
        <div className="flex items-center gap-1">
          <span className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px]">👍</span>
            <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px]">👏</span>
          </span>
          <span className="ml-1">You and 47 others</span>
        </div>
        <span>12 comments</span>
      </div>
      
      {/* Actions */}
      <div className="px-4 py-2 flex justify-between">
        <button className="flex items-center gap-2 text-slate-600 text-sm font-medium hover:bg-slate-100 px-3 py-2 rounded-md">
          <ThumbsUp className="w-5 h-5" /> Like
        </button>
        <button className="flex items-center gap-2 text-slate-600 text-sm font-medium hover:bg-slate-100 px-3 py-2 rounded-md">
          <MessageCircle className="w-5 h-5" /> Comment
        </button>
        <button className="flex items-center gap-2 text-slate-600 text-sm font-medium hover:bg-slate-100 px-3 py-2 rounded-md">
          <Repeat2 className="w-5 h-5" /> Repost
        </button>
        <button className="flex items-center gap-2 text-slate-600 text-sm font-medium hover:bg-slate-100 px-3 py-2 rounded-md">
          <Send className="w-5 h-5" /> Send
        </button>
      </div>
    </div>
  );

  const renderTikTokPreview = () => (
    <div className={`bg-black rounded-lg shadow-md overflow-hidden ${deviceMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[400px]'}`}>
      <div className="relative aspect-[9/16]">
        {/* Video placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          {mediaUrl ? (
            <img src={mediaUrl} alt="Post media" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                <div className="w-0 h-0 border-l-8 border-l-white border-y-4 border-y-transparent ml-1" />
              </div>
              <p className="text-white/60 text-sm">Video Preview</p>
            </div>
          )}
        </div>
        
        {/* Right side actions */}
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-xs mt-1">12.5K</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-xs mt-1">234</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <Share2 className="w-7 h-7 text-white" />
            </div>
            <span className="text-white text-xs mt-1">456</span>
          </div>
        </div>
        
        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary" />
            <p className="text-white font-semibold text-sm">@yourbusiness</p>
          </div>
          <p className="text-white text-sm mb-2">
            {content.length > 100 ? content.slice(0, 100) + '...' : content || 'Your caption here...'}
          </p>
          <p className="text-white/70 text-xs">♪ Original sound - Your Business</p>
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (platform) {
      case 'facebook':
        return renderFacebookPreview();
      case 'instagram':
        return renderInstagramPreview();
      case 'twitter':
        return renderTwitterPreview();
      case 'linkedin':
        return renderLinkedInPreview();
      case 'tiktok':
        return renderTikTokPreview();
      default:
        return (
          <div className="text-center text-muted-foreground py-12">
            <p>Select a platform to see preview</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-card border-l border-border z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">Post Preview</h3>
          <p className="text-sm text-muted-foreground capitalize">{platform || 'No platform selected'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`p-2 rounded-md transition-colors ${deviceMode === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`p-2 rounded-md transition-colors ${deviceMode === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-4 bg-muted/30">
        <div className="flex justify-center">
          {renderPreview()}
        </div>
      </div>
      
      {/* Character Count & Best Practices */}
      <div className="border-t border-border p-4 space-y-4">
        {/* Character Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Character count</span>
          <span className={`text-sm font-medium ${getCharCountColor()}`}>
            {charCount} / {limits.limit.toLocaleString()}
            {charCount > limits.limit && <span className="ml-2 text-destructive">Exceeds limit!</span>}
          </span>
        </div>
        
        {/* Optimal length indicator */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${charCount > limits.limit ? 'bg-destructive' : charCount > limits.optimal ? 'bg-amber-400' : 'bg-emerald-400'}`}
            style={{ width: `${Math.min((charCount / limits.limit) * 100, 100)}%` }}
          />
        </div>
        
        {/* Best Practices */}
        {platform && practices.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Best Practices</p>
            <ul className="space-y-1">
              {practices.map((practice, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  {practice}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
