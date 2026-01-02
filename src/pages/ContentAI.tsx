import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getAIService } from '@/services/aiService';
import { UsageStatsBar } from '@/components/ai/UsageStatsBar';
import { EngagementScore } from '@/components/EngagementScore';
import { ViralityPredictor } from '@/components/ViralityPredictor';
import { TrendingTopics } from '@/components/TrendingTopics';
import { 
  Wand2, Sparkles, Copy, Save, RefreshCw, ChevronLeft, ChevronRight, 
  Eye, MousePointer, Target, Star, Trash2, Calendar, Edit2, Check, X,
  Hash, Smile, Clock, FileText, TrendingUp, Zap, BookOpen, Flame,
  MessageSquare, Heart, ThumbsUp, Share2, Facebook, Instagram, Linkedin, Twitter,
  BarChart3, Lightbulb, CheckCircle, Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Content Templates
const CONTENT_TEMPLATES = [
  { id: 'product_launch', icon: '🚀', name: 'Product Launch', description: 'Announce new products with excitement', goal: 'awareness', tone: 'urgent', keywords: ['new', 'launch', 'introducing', 'revolutionary'] },
  { id: 'event_promotion', icon: '🎉', name: 'Event Promotion', description: 'Drive registrations for events', goal: 'traffic', tone: 'enthusiastic', keywords: ['join us', 'save the date', 'limited spots'] },
  { id: 'educational_tip', icon: '💡', name: 'Educational Tip', description: 'Share valuable knowledge', goal: 'engagement', tone: 'educational', keywords: ['tip', 'learn', 'how to', 'guide'] },
  { id: 'behind_scenes', icon: '👀', name: 'Behind-the-Scenes', description: 'Show your authentic side', goal: 'engagement', tone: 'casual', keywords: ['behind the scenes', 'process', 'team'] },
  { id: 'testimonial', icon: '⭐', name: 'Customer Testimonial', description: 'Build trust with social proof', goal: 'conversions', tone: 'inspirational', keywords: ['testimonial', 'success', 'results'] },
  { id: 'sale_promotion', icon: '💰', name: 'Sale/Promotion', description: 'Drive urgent purchases', goal: 'conversions', tone: 'urgent', keywords: ['sale', 'discount', 'limited time', 'offer'] },
  { id: 'industry_news', icon: '📰', name: 'Industry News', description: 'Establish thought leadership', goal: 'awareness', tone: 'professional', keywords: ['industry', 'trends', 'insights'] },
  { id: 'ugc', icon: '📸', name: 'User-Generated Content', description: 'Feature your community', goal: 'engagement', tone: 'appreciative', keywords: ['thank you', 'community', 'feature'] },
  { id: 'contest', icon: '🎁', name: 'Contest/Giveaway', description: 'Boost engagement fast', goal: 'engagement', tone: 'exciting', keywords: ['win', 'giveaway', 'contest', 'enter'] },
  { id: 'milestone', icon: '🎊', name: 'Milestone Celebration', description: 'Celebrate achievements', goal: 'awareness', tone: 'grateful', keywords: ['milestone', 'thank you', 'celebrating'] },
];

// Tone Options
const TONE_OPTIONS = [
  { id: 'professional', icon: '💼', name: 'Professional', description: 'Formal, authoritative, corporate', example: 'We are pleased to announce...' },
  { id: 'casual', icon: '😊', name: 'Casual/Friendly', description: 'Relaxed, approachable, conversational', example: 'Hey there! Check this out...' },
  { id: 'humorous', icon: '😄', name: 'Humorous/Witty', description: 'Funny, clever, entertaining', example: 'Plot twist: Your life just got easier!' },
  { id: 'inspirational', icon: '✨', name: 'Inspirational', description: 'Motivating, uplifting, aspirational', example: 'Imagine a world where...' },
  { id: 'urgent', icon: '⚡', name: 'Urgent/FOMO', description: 'Time-sensitive, persuasive, action-driven', example: 'Only 24 hours left!' },
  { id: 'educational', icon: '📚', name: 'Educational', description: 'Informative, helpful, teaching-focused', example: 'Did you know that...' },
  { id: 'storytelling', icon: '📖', name: 'Storytelling', description: 'Narrative, emotional, engaging', example: 'It all started when...' },
  { id: 'bold', icon: '🔥', name: 'Bold/Edgy', description: 'Confident, provocative, attention-grabbing', example: 'Forget everything you know about...' },
];

// Platform limits and recommendations
const PLATFORM_CONFIG: Record<string, { maxChars: number; recommendedLength: string; emojiCount: string }> = {
  facebook: { maxChars: 500, recommendedLength: 'medium', emojiCount: '2-4' },
  instagram: { maxChars: 2200, recommendedLength: 'medium', emojiCount: '2-4' },
  twitter: { maxChars: 280, recommendedLength: 'short', emojiCount: '2-3' },
  linkedin: { maxChars: 3000, recommendedLength: 'long', emojiCount: '1-2' },
  google: { maxChars: 90, recommendedLength: 'short', emojiCount: '0-1' },
  email: { maxChars: 500, recommendedLength: 'medium', emojiCount: '1-2' },
  tiktok: { maxChars: 150, recommendedLength: 'short', emojiCount: '3-5' },
};

// Length configs
const LENGTH_CONFIG = {
  short: { min: 50, max: 100, label: 'Short', description: 'Quick & punchy' },
  medium: { min: 100, max: 200, label: 'Medium', description: 'Balanced detail' },
  long: { min: 200, max: 300, label: 'Long', description: 'Comprehensive' },
};

// Mock hashtags by platform/category
const MOCK_HASHTAGS: Record<string, string[]> = {
  marketing: ['#marketing', '#digitalmarketing', '#contentmarketing', '#socialmediamarketing', '#marketingtips'],
  business: ['#business', '#entrepreneur', '#startup', '#smallbusiness', '#success'],
  technology: ['#tech', '#innovation', '#technology', '#ai', '#digital'],
  lifestyle: ['#lifestyle', '#motivation', '#inspiration', '#mindset', '#growth'],
  trending: ['#trending', '#viral', '#fyp', '#explore', '#featured'],
};

export default function ContentAI() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form State
  const [selectedTemplate, setSelectedTemplate] = useState<typeof CONTENT_TEMPLATES[0] | null>(null);
  const [contentType, setContentType] = useState('social_post');
  const [objective, setObjective] = useState('awareness');
  const [platform, setPlatform] = useState('facebook');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [prompt, setPrompt] = useState('');
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<Array<{
    id: string;
    content: string;
    rating: number;
    isFavorite: boolean;
    isEditing: boolean;
    editedContent: string;
  }>>([]);
  
  // Hashtag State
  const [showHashtags, setShowHashtags] = useState(false);
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  
  // Template carousel state
  const [templateScrollIndex, setTemplateScrollIndex] = useState(0);
  
  // Save Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveData, setSaveData] = useState({ title: '', category: '', tags: '', isTemplate: false, isFavorite: false, folderId: '' });
  const [savingContentIndex, setSavingContentIndex] = useState<number | null>(null);
  
  // History State
  const [generationHistory, setGenerationHistory] = useState<Array<{
    id: string;
    timestamp: Date;
    platform: string;
    template: string;
    preview: string;
    params: any;
  }>>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Enhanced Generation State
  const [useEnhancedMode, setUseEnhancedMode] = useState(true);
  const [enhancedResult, setEnhancedResult] = useState<{
    recommended: {
      content: string;
      strategy: string;
      predictedEngagement: string;
      confidence: string;
      scoreBreakdown: Array<{ factor: string; impact: string }>;
    };
    alternatives: Array<{
      content: string;
      strategy: string;
      predictedEngagement: string;
      predictedScore: number;
    }>;
    suggestions: Array<{
      type: string;
      suggestion: string;
      expectedBoost: string;
      example?: string;
    }>;
    insights: {
      basedOnHistory: boolean;
      postsAnalyzed: number;
      yourAvgEngagement: string;
    };
  } | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('contentAI_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGenerationHistory(parsed.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  // Apply template
  const applyTemplate = (template: typeof CONTENT_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setTone(template.tone);
    setObjective(template.goal);
    if (template.keywords.length > 0) {
      setPrompt(prev => prev || template.keywords.join(', '));
    }
  };

  // Generate content
  const generateContent = async () => {
    if (!prompt.trim()) {
      toast({ title: 'Please enter a topic or description', variant: 'destructive' });
      return;
    }

    if (!user?.id) {
      toast({ title: 'Please log in to generate content', variant: 'destructive' });
      return;
    }

    const aiService = getAIService(user.id);
    const startTime = Date.now();

    // Check quota first
    const quota = await aiService.checkQuota();
    if (!quota.allowed) {
      toast({ 
        title: 'Monthly limit reached', 
        description: `You have ${quota.remaining} requests remaining. Upgrade for more.`,
        variant: 'destructive' 
      });
      return;
    }

    // Check rate limit
    const rateLimit = await aiService.checkRateLimit();
    if (!rateLimit.allowed) {
      toast({ 
        title: 'Rate limit exceeded', 
        description: 'Please wait a few minutes before generating more content.',
        variant: 'destructive' 
      });
      return;
    }

    setIsGenerating(true);
    setEnhancedResult(null);
    
    try {
      // Use enhanced generation if enabled
      if (useEnhancedMode) {
        const { data, error } = await supabase.functions.invoke('generate-content-enhanced', {
          body: {
            userId: user.id,
            prompt,
            tone,
            length,
            platform,
            includeHashtags: true,
          }
        });

        if (error) throw error;
        if (data.error) throw new Error(data.error);

        setEnhancedResult(data);
        
        // Also set the content for the standard display
        const allContent = [
          { content: data.recommended.content },
          ...(data.alternatives || []).map((alt: any) => ({ content: alt.content }))
        ];
        
        const newContent = allContent.map((item: any, idx: number) => ({
          id: `gen-${Date.now()}-${idx}`,
          content: item.content,
          rating: 0,
          isFavorite: false,
          isEditing: false,
          editedContent: '',
        }));
        
        setGeneratedContent(newContent);
        toast({ title: 'AI-optimized content generated with predictions!' });
      } else {
        // Standard generation
        const { data, error } = await supabase.functions.invoke('generate-content', {
          body: {
            contentType,
            objective,
            platform,
            tone,
            length,
            prompt,
          }
        });

        if (error) throw error;

        const variations = data.content || data.variations || [];
        const newContent = variations.map((content: any, idx: number) => ({
          id: `gen-${Date.now()}-${idx}`,
          content: typeof content === 'string' ? content : content.content,
          rating: 0,
          isFavorite: false,
          isEditing: false,
          editedContent: '',
        }));

        setGeneratedContent(newContent);
        toast({ title: 'Content generated!' });
      }

      // Save to history
      const historyEntry = {
        id: `hist-${Date.now()}`,
        timestamp: new Date(),
        platform,
        template: selectedTemplate?.name || 'Custom',
        preview: generatedContent[0]?.content?.slice(0, 50) || prompt.slice(0, 50),
        params: { contentType, objective, platform, tone, length, prompt },
      };
      
      const newHistory = [historyEntry, ...generationHistory].slice(0, 20);
      setGenerationHistory(newHistory);
      localStorage.setItem('contentAI_history', JSON.stringify(newHistory));
    } catch (error: any) {
      console.error('Generation error:', error);
      
      // Log error
      if (user?.id) {
        const aiService = getAIService(user.id);
        await aiService.logUsage({
          requestType: 'content_generation',
          model: 'google/gemini-2.5-flash',
          promptLength: prompt.length,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          cost: 0,
          responseLength: 0,
          responseTime: Date.now() - startTime,
          status: 'error',
          feature: 'content_ai',
          errorMessage: error.message,
        });
      }
      
      toast({ title: 'Failed to generate content', description: error.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate more variations
  const generateMore = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { contentType, objective, platform, tone, length, prompt }
      });
      if (error) throw error;
      
      const variations = data.content || data.variations || [];
      const newContent = variations.map((content: any, idx: number) => ({
        id: `gen-${Date.now()}-${idx}`,
        content: typeof content === 'string' ? content : content.content,
        rating: 0,
        isFavorite: false,
        isEditing: false,
        editedContent: '',
      }));
      
      setGeneratedContent(prev => [...prev, ...newContent]);
      toast({ title: '3 more variations generated!' });
    } catch (error: any) {
      toast({ title: 'Failed to generate more', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate single variation
  const regenerateSingle = async (index: number) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: { contentType, objective, platform, tone, length, prompt }
      });
      if (error) throw error;
      
      const variations = data.content || data.variations || [];
      if (variations.length > 0) {
        const newItem = {
          id: `gen-${Date.now()}`,
          content: typeof variations[0] === 'string' ? variations[0] : variations[0].content,
          rating: 0,
          isFavorite: false,
          isEditing: false,
          editedContent: '',
        };
        setGeneratedContent(prev => prev.map((item, i) => i === index ? newItem : item));
        toast({ title: 'Variation regenerated!' });
      }
    } catch (error: any) {
      toast({ title: 'Failed to regenerate', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  // Save to library
  const saveToLibrary = async (content: string, index: number) => {
    setSavingContentIndex(index);
    setSaveData({
      title: content.slice(0, 30) + '...',
      category: objective,
      tags: selectedTemplate?.keywords.join(', ') || '',
      isTemplate: false,
      isFavorite: false,
      folderId: '',
    });
    setShowSaveModal(true);
  };

  const confirmSaveToLibrary = async () => {
    if (savingContentIndex === null) return;
    
    const content = generatedContent[savingContentIndex];
    if (!content) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('content_library').insert({
        user_id: user.id,
        title: saveData.title,
        content_type: contentType,
        content_text: content.content,
        generated_content: content.content,
        platform,
        tone,
        length,
        objective,
        prompt,
        category: saveData.category,
        tags: saveData.tags.split(',').map(t => t.trim()).filter(Boolean),
        is_template: saveData.isTemplate,
        is_favorite: saveData.isFavorite,
        folder_id: saveData.folderId || null,
      });

      if (error) throw error;
      toast({ title: 'Saved to library!' });
      setShowSaveModal(false);
      setSavingContentIndex(null);
    } catch (error: any) {
      toast({ title: 'Failed to save', description: error.message, variant: 'destructive' });
    }
  };

  // Generate hashtags
  const generateHashtags = () => {
    const allHashtags = [
      ...MOCK_HASHTAGS.marketing,
      ...MOCK_HASHTAGS.business,
      ...MOCK_HASHTAGS.trending,
    ];
    const shuffled = allHashtags.sort(() => 0.5 - Math.random());
    setSuggestedHashtags(shuffled.slice(0, 12));
    setShowHashtags(true);
  };

  // Toggle edit mode
  const toggleEdit = (index: number) => {
    setGeneratedContent(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, isEditing: !item.isEditing, editedContent: item.content }
        : item
    ));
  };

  // Save edit
  const saveEdit = (index: number) => {
    setGeneratedContent(prev => prev.map((item, i) => 
      i === index 
        ? { ...item, content: item.editedContent, isEditing: false }
        : item
    ));
    toast({ title: 'Changes saved!' });
  };

  // Cancel edit
  const cancelEdit = (index: number) => {
    setGeneratedContent(prev => prev.map((item, i) => 
      i === index ? { ...item, isEditing: false, editedContent: '' } : item
    ));
  };

  // Get character count status
  const getCharStatus = (text: string) => {
    const max = PLATFORM_CONFIG[platform]?.maxChars || 500;
    const len = text.length;
    if (len <= max * 0.7) return 'text-emerald-400';
    if (len <= max) return 'text-amber-400';
    return 'text-rose-400';
  };

  // Load history params
  const loadFromHistory = (entry: typeof generationHistory[0]) => {
    const { params } = entry;
    setContentType(params.contentType);
    setObjective(params.objective);
    setPlatform(params.platform);
    setTone(params.tone);
    setLength(params.length);
    setPrompt(params.prompt);
    setShowHistory(false);
    toast({ title: 'Settings loaded from history' });
  };

  const platformConfig = PLATFORM_CONFIG[platform];
  const lengthConfig = LENGTH_CONFIG[length as keyof typeof LENGTH_CONFIG];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-violet-400" />
              <h1 className="text-xl font-bold">AI Content Generator</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/ai-analytics')}
              className="px-4 py-2 text-sm border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              AI Analytics
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 text-sm border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              History
            </button>
            <button
              onClick={() => navigate('/content-library')}
              className="px-4 py-2 text-sm bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-500/30 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Content Library
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* AI Usage Stats */}
        <UsageStatsBar />
        {/* Templates Carousel */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quick Templates</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTemplateScrollIndex(Math.max(0, templateScrollIndex - 1))}
                disabled={templateScrollIndex === 0}
                className="p-2 border border-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTemplateScrollIndex(Math.min(CONTENT_TEMPLATES.length - 5, templateScrollIndex + 1))}
                disabled={templateScrollIndex >= CONTENT_TEMPLATES.length - 5}
                className="p-2 border border-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {CONTENT_TEMPLATES.slice(templateScrollIndex, templateScrollIndex + 5).map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className={`flex-1 min-w-[180px] p-4 rounded-xl border transition-all text-left ${
                  selectedTemplate?.id === template.id
                    ? 'border-violet-500 bg-violet-500/10'
                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                }`}
              >
                <div className="text-3xl mb-2">{template.icon}</div>
                <div className="font-medium text-sm mb-1">{template.name}</div>
                <div className="text-xs text-slate-400 line-clamp-2">{template.description}</div>
              </button>
            ))}
          </div>
          {selectedTemplate && (
            <div className="mt-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedTemplate.icon}</span>
                <span className="text-sm text-violet-400">Using "{selectedTemplate.name}" template</span>
              </div>
              <button onClick={() => setSelectedTemplate(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Generator Form */}
          <div className="col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              {/* Content Type */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 block mb-3 font-medium">Content Type</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 'headline', label: 'Headline', icon: '📰' },
                    { value: 'ad_copy', label: 'Ad Copy', icon: '📝' },
                    { value: 'social_post', label: 'Social Post', icon: '📱' },
                    { value: 'email', label: 'Email', icon: '✉️' },
                    { value: 'cta', label: 'CTA', icon: '🎯' }
                  ].map(type => (
                    <button
                      key={type.value}
                      onClick={() => setContentType(type.value)}
                      className={`p-3 rounded-lg border transition-all text-center ${
                        contentType === type.value
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-xs font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Objective */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 block mb-3 font-medium">Campaign Objective</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'awareness', label: 'Awareness', icon: Eye },
                    { value: 'traffic', label: 'Traffic', icon: MousePointer },
                    { value: 'conversions', label: 'Conversions', icon: Target }
                  ].map(obj => {
                    const Icon = obj.icon;
                    return (
                      <button
                        key={obj.value}
                        onClick={() => setObjective(obj.value)}
                        className={`p-3 rounded-lg border transition-all flex items-center gap-2 ${
                          objective === obj.value
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{obj.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Platform */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 block mb-3 font-medium">Platform</label>
                <div className="grid grid-cols-7 gap-2">
                  {['facebook', 'instagram', 'twitter', 'linkedin', 'google', 'email', 'tiktok'].map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`p-3 rounded-lg border transition-all text-center ${
                        platform === p
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-xs font-medium capitalize">{p}</div>
                    </button>
                  ))}
                </div>
                {platformConfig && (
                  <div className="mt-2 text-xs text-slate-500">
                    Max: {platformConfig.maxChars} chars • Recommended: {platformConfig.recommendedLength} • Emojis: {platformConfig.emojiCount}
                  </div>
                )}
              </div>

              {/* Tone Cards */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 block mb-3 font-medium">Tone</label>
                <div className="grid grid-cols-4 gap-3">
                  {TONE_OPTIONS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`p-3 rounded-lg border transition-all text-left group ${
                        tone === t.id
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-xl mb-1">{t.icon}</div>
                      <div className="text-xs font-medium mb-0.5">{t.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Slider */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 block mb-3 font-medium">Content Length</label>
                <div className="flex gap-2">
                  {Object.entries(LENGTH_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setLength(key)}
                      className={`flex-1 p-3 rounded-lg border transition-all text-center ${
                        length === key
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-sm font-medium">{config.label}</div>
                      <div className="text-xs text-slate-500">{config.min}-{config.max} chars</div>
                      <div className="text-[10px] text-slate-400 mt-1">{config.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div className="mb-6">
                <label className="text-sm text-slate-400 block mb-2 font-medium">Topic or Product Description</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Summer fitness program for busy professionals..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-violet-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Enhanced Mode Toggle */}
              <div className="mb-6 flex items-center justify-between p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className={`w-5 h-5 ${useEnhancedMode ? 'text-violet-400' : 'text-slate-500'}`} />
                  <div>
                    <div className="text-sm font-medium">Enhanced AI Mode</div>
                    <div className="text-xs text-slate-400">Predictions, scoring & optimization tips</div>
                  </div>
                </div>
                <button
                  onClick={() => setUseEnhancedMode(!useEnhancedMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    useEnhancedMode ? 'bg-violet-500' : 'bg-slate-600'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    useEnhancedMode ? 'left-7' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateContent}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {useEnhancedMode ? 'Analyzing & Generating...' : 'Generating...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {useEnhancedMode ? 'Generate AI-Optimized Content' : 'Generate Content'}
                  </>
                )}
              </button>
            </div>

            {/* Enhanced Results - Recommended */}
            {enhancedResult && useEnhancedMode && (
              <div className="space-y-6">
                {/* Performance Insights */}
                {enhancedResult.insights && (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <h3 className="font-semibold">Your Performance Insights</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-white">{enhancedResult.insights.postsAnalyzed}</div>
                        <div className="text-xs text-slate-400">Posts Analyzed</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-emerald-400">{enhancedResult.insights.yourAvgEngagement}</div>
                        <div className="text-xs text-slate-400">Avg Engagement</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                        <div className={`text-2xl font-bold ${enhancedResult.recommended.confidence === 'high' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {enhancedResult.recommended.confidence.toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-400">Confidence</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommended Variation */}
                <div className="bg-slate-900/50 border-2 border-violet-500 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-violet-400" />
                      <h3 className="font-semibold">Recommended</h3>
                    </div>
                    <div className="flex items-center gap-2 bg-violet-900/30 px-3 py-1 rounded-full">
                      <BarChart3 className="w-4 h-4 text-violet-400" />
                      <span className="text-violet-300 font-semibold">{enhancedResult.recommended.predictedEngagement}</span>
                    </div>
                  </div>
                  
                  <div className="bg-slate-800 rounded-lg p-4 mb-4">
                    <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{enhancedResult.recommended.content}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-slate-400 mb-2">Strategy: <span className="text-white">{enhancedResult.recommended.strategy}</span></p>
                    <div className="flex flex-wrap gap-2">
                      {enhancedResult.recommended.scoreBreakdown?.map((item, idx) => (
                        <div key={idx} className="bg-slate-700 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span className="text-slate-300">{item.factor}</span>
                          <span className="text-emerald-400 font-semibold">{item.impact}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => copyToClipboard(enhancedResult.recommended.content)}
                      className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 flex items-center justify-center gap-2 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    <button
                      onClick={() => {
                        localStorage.setItem('draft_content', enhancedResult.recommended.content);
                        navigate('/scheduler');
                      }}
                      className="flex-1 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Use in Post
                    </button>
                  </div>
                </div>

                {/* Optimization Tips */}
                {enhancedResult.suggestions && enhancedResult.suggestions.length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                      <h3 className="font-semibold">Optimization Tips</h3>
                    </div>
                    <div className="space-y-3">
                      {enhancedResult.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="bg-slate-700/50 rounded-lg p-4 border-l-4 border-amber-400">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-white font-medium">{suggestion.suggestion}</p>
                            <span className="text-emerald-400 text-sm font-semibold whitespace-nowrap ml-2">{suggestion.expectedBoost}</span>
                          </div>
                          {suggestion.example && (
                            <p className="text-sm text-slate-400">💡 {suggestion.example}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alternative Variations */}
                {enhancedResult.alternatives && enhancedResult.alternatives.length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Alternative Variations</h3>
                    <div className="space-y-4">
                      {enhancedResult.alternatives.map((variant, idx) => (
                        <div key={idx} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600/70 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-slate-400">{variant.strategy}</span>
                            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full">
                              <BarChart3 className="w-3 h-3 text-violet-400" />
                              <span className="text-violet-300 text-sm font-semibold">{variant.predictedEngagement}%</span>
                            </div>
                          </div>
                          <p className="text-white mb-3 whitespace-pre-wrap">{variant.content}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => copyToClipboard(variant.content)}
                              className="px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg hover:bg-slate-700 flex items-center gap-1"
                            >
                              <Copy className="w-3 h-3" />
                              Copy
                            </button>
                            <button
                              onClick={() => {
                                localStorage.setItem('draft_content', variant.content);
                                navigate('/scheduler');
                              }}
                              className="px-3 py-1.5 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              Use
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Standard Generated Results - Only show when not using enhanced mode */}
            {generatedContent.length > 0 && !useEnhancedMode && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Generated Variations ({generatedContent.length})</h3>
                  <button
                    onClick={generateMore}
                    disabled={isGenerating}
                    className="px-4 py-2 text-sm border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    Generate 3 More
                  </button>
                </div>
                <div className="space-y-4">
                  {generatedContent.map((item, index) => (
                    <div key={item.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs text-slate-500">Variation {index + 1}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${getCharStatus(item.content)}`}>
                            {item.content.length} / {platformConfig?.maxChars || 500} chars
                          </span>
                        </div>
                      </div>
                      
                      {item.isEditing ? (
                        <div className="mb-3">
                          <textarea
                            value={item.editedContent}
                            onChange={(e) => setGeneratedContent(prev => 
                              prev.map((c, i) => i === index ? { ...c, editedContent: e.target.value } : c)
                            )}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-violet-500"
                            rows={4}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => saveEdit(index)}
                              className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Save
                            </button>
                            <button
                              onClick={() => cancelEdit(index)}
                              className="px-3 py-1.5 bg-slate-700 rounded-lg text-xs flex items-center gap-1"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap mb-3">{item.content}</p>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(item.content)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Copy"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => saveToLibrary(item.content, index)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Save to Library"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleEdit(index)}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => regenerateSingle(index)}
                            disabled={isGenerating}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white disabled:opacity-50"
                            title="Regenerate"
                          >
                            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                          </button>
                          <button
                            onClick={() => navigate('/dashboard?tab=scheduler')}
                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                            title="Schedule"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-xs text-slate-500">
                          {Math.ceil(item.content.split(' ').length / 200 * 60)}s read time
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hashtag Generator */}
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <button
                    onClick={generateHashtags}
                    className="px-4 py-2 text-sm border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <Hash className="w-4 h-4" />
                    Generate Hashtags
                  </button>
                  
                  {showHashtags && suggestedHashtags.length > 0 && (
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Suggested Hashtags</span>
                        <button
                          onClick={() => copyToClipboard(selectedHashtags.join(' '))}
                          className="text-xs text-violet-400 hover:text-violet-300"
                        >
                          Copy Selected
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestedHashtags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => {
                              setSelectedHashtags(prev => 
                                prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                              selectedHashtags.includes(tag)
                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Virality Predictor, Trending Topics & History */}
          <div className="space-y-6">
            {/* Virality Predictor */}
            <ViralityPredictor content={prompt} platform={platform} />
            
            {/* Trending Topics */}
            <TrendingTopics />
            
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                Recent Generations
              </h3>
              
              {generationHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm">No generation history yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {generationHistory.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => loadFromHistory(entry)}
                      className="w-full p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-violet-500/50 transition-all text-left"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded">
                          {entry.platform}
                        </span>
                        <span className="text-xs text-slate-500">
                          {entry.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mb-1">{entry.template}</div>
                      <p className="text-xs text-slate-300 line-clamp-2">{entry.preview}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Platform Preview */}
            {generatedContent.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Platform Preview</h3>
                <div className="p-4 bg-slate-800 rounded-lg">
                  {platform === 'facebook' && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full" />
                        <div>
                          <div className="text-sm font-medium">Your Brand</div>
                          <div className="text-xs text-slate-400">Just now · 🌍</div>
                        </div>
                      </div>
                      <p className="text-sm mb-3 whitespace-pre-wrap">{generatedContent[0]?.content}</p>
                      <div className="flex items-center gap-6 pt-3 border-t border-slate-700 text-slate-400">
                        <span className="flex items-center gap-1 text-xs"><ThumbsUp className="w-4 h-4" /> Like</span>
                        <span className="flex items-center gap-1 text-xs"><MessageSquare className="w-4 h-4" /> Comment</span>
                        <span className="flex items-center gap-1 text-xs"><Share2 className="w-4 h-4" /> Share</span>
                      </div>
                    </div>
                  )}
                  {platform === 'instagram' && (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full" />
                        <div className="text-sm font-medium">yourbrand</div>
                      </div>
                      <div className="w-full aspect-square bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-slate-500">Image</span>
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                        <Heart className="w-5 h-5" />
                        <MessageSquare className="w-5 h-5" />
                        <Share2 className="w-5 h-5" />
                      </div>
                      <p className="text-sm"><span className="font-medium">yourbrand</span> {generatedContent[0]?.content}</p>
                    </div>
                  )}
                  {platform === 'twitter' && (
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">Your Brand</span>
                            <span className="text-slate-400 text-sm">@yourbrand · 1m</span>
                          </div>
                          <p className="text-sm">{generatedContent[0]?.content}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {!['facebook', 'instagram', 'twitter'].includes(platform) && (
                    <div className="text-center text-sm text-slate-400 py-4">
                      Preview for {platform} coming soon
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Save to Library</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Title</label>
                <input
                  value={saveData.title}
                  onChange={(e) => setSaveData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Category</label>
                <select
                  value={saveData.category}
                  onChange={(e) => setSaveData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500"
                >
                  <option value="awareness">Awareness</option>
                  <option value="traffic">Traffic</option>
                  <option value="conversions">Conversions</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Tags (comma separated)</label>
                <input
                  value={saveData.tags}
                  onChange={(e) => setSaveData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="marketing, summer, promotion"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveData.isTemplate}
                    onChange={(e) => setSaveData(prev => ({ ...prev, isTemplate: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-600 text-violet-500 focus:ring-violet-500"
                  />
                  <span className="text-sm">Save as template</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveData.isFavorite}
                    onChange={(e) => setSaveData(prev => ({ ...prev, isFavorite: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-600 text-violet-500 focus:ring-violet-500"
                  />
                  <span className="text-sm">Add to favorites</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveToLibrary}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg hover:opacity-90 transition-opacity"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
