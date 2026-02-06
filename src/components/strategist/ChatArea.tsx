import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Bot, Loader2, ImagePlus, Globe, Lightbulb, 
  Sparkles, Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScreenshotUploader } from '@/components/chat/ScreenshotUploader';
import { WebsiteAnalyzer } from '@/components/chat/WebsiteAnalyzer';
import { useScreenshotAnalysis } from '@/hooks/useScreenshotAnalysis';
import { BusinessProfile } from '@/hooks/useWebsiteAnalysis';
import { ChatMessageList } from './ChatMessageList';
import { QuickActions } from './QuickActions';
import { StrategyDialog } from './StrategyDialog';
import { SmartSuggestions, SmartSuggestion } from './SmartSuggestions';
import { ConversationStarters } from './ConversationStarters';
import { Message, BusinessContext, AnalyticsUpload } from '@/pages/AIStrategist';
import { useStrategyGeneration } from '@/hooks/useStrategyGeneration';
import { useNavigate } from 'react-router-dom';
import { detectUserIntent, getIntentSuggestion } from '@/lib/intentDetection';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';

interface ChatAreaProps {
  conversationId?: string;
  businessContext: BusinessContext | null | undefined;
  recentAnalytics: AnalyticsUpload[];
  onConversationCreated: (id: string) => void;
  onContextUpdate: () => void;
  className?: string;
}

interface ContextPreferences {
  response_style: 'concise' | 'detailed' | 'balanced';
  tone_preference: 'formal' | 'casual' | 'balanced';
  include_examples: boolean;
}

export function ChatArea({
  conversationId,
  businessContext,
  recentAnalytics,
  onConversationCreated,
  onContextUpdate,
  className,
}: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showWebsiteAnalyzer, setShowWebsiteAnalyzer] = useState(false);
  const [showStrategyDialog, setShowStrategyDialog] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId);
  const [hasStrategies, setHasStrategies] = useState(false);
  const [preferences, setPreferences] = useState<ContextPreferences>({
    response_style: 'balanced',
    tone_preference: 'balanced',
    include_examples: true,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { uploadScreenshot, analyzeFile, isProcessing } = useScreenshotAnalysis();
  const { generateStrategy, isGenerating } = useStrategyGeneration();
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Update local conversation ID when prop changes
  useEffect(() => {
    setCurrentConversationId(conversationId);
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  // Check if user has strategies
  useEffect(() => {
    const checkStrategies = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('content_strategies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setHasStrategies((count || 0) > 0);
    };
    checkStrategies();
  }, []);

  const loadMessages = async (convId: string) => {
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load messages:', error);
      return;
    }

    setMessages(data.map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      attachments: msg.attachments as any,
      createdAt: new Date(msg.created_at || new Date()),
    })));
  };

  const createConversation = async (): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        title: 'New Conversation',
      })
      .select()
      .single();

    if (error) throw error;
    
    setCurrentConversationId(data.id);
    onConversationCreated(data.id);
    return data.id;
  };

  const saveMessage = async (
    convId: string, 
    role: 'user' | 'assistant', 
    content: string,
    attachments?: any[]
  ) => {
    const { data, error } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: convId,
        role,
        content,
        attachments: attachments || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save message:', error);
      throw error;
    }

    return data;
  };

  const sendMessage = async (messageContent?: string, attachments?: any[]) => {
    const content = messageContent || input.trim();
    if (!content && !attachments?.length) return;

    setIsLoading(true);
    setInput('');

    try {
      let convId = currentConversationId;
      if (!convId) {
        convId = await createConversation();
      }

      // Detect intent and check for suggestions
      const intent = detectUserIntent(content);
      const hasAnalytics = recentAnalytics.length > 0;
      const hasProfile = !!businessContext?.business_profile;
      const suggestion = getIntentSuggestion(intent, hasAnalytics, hasProfile);

      // Add user message to UI
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        attachments,
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Save user message
      await saveMessage(convId, 'user', content, attachments);

      // Update conversation title with first message
      if (messages.length === 0) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await supabase
          .from('ai_conversations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', convId);
      }

      // Prepare context for AI
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data: { user } } = await supabase.auth.getUser();

      const profile = businessContext?.business_profile;
      const contextData = {
        businessProfile: profile ? {
          businessName: profile.businessName,
          industry: profile.industry,
          businessType: profile.businessType,
          summary: profile.summary,
          targetAudience: profile.targetAudience,
          brandIdentity: profile.brandIdentity,
          productsServices: profile.productsServices,
          marketingMaturity: profile.marketingMaturity,
          priceRange: profile.priceRange,
          geographicFocus: profile.geographicFocus,
        } : null,
        recentAnalytics: recentAnalytics.map(a => ({
          platform: a.platform,
          metrics: a.extracted_data,
          insights: a.ai_insights,
          healthScore: a.extracted_data?.overall_health_score,
          performanceRating: a.extracted_data?.performance_rating,
          trendAnalysis: a.extracted_data?.trend_analysis,
          recommendations: a.extracted_data?.recommendations,
        })),
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            messages: allMessages,
            userId: user?.id,
            conversationId: convId,
            businessContext: contextData,
            context_preferences: preferences,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted. Please add credits to continue.');
        }
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMessageId = `assistant-${Date.now()}`;

      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date(),
      }]);

      let textBuffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content;
            if (deltaContent) {
              assistantContent += deltaContent;
              setMessages(prev => prev.map(m => 
                m.id === assistantMessageId 
                  ? { ...m, content: assistantContent }
                  : m
              ));
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save assistant message
      if (assistantContent) {
        await saveMessage(convId, 'assistant', assistantContent);
        await supabase
          .from('ai_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', convId);
      }

    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileAnalyze = async (file: File) => {
    setShowUploader(false);
    
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const label = ['csv', 'xlsx', 'xls'].includes(ext) ? 'spreadsheet' : ext === 'pdf' ? 'PDF' : 'screenshot';
    
    await sendMessage(
      `Please analyze this analytics ${label} and provide insights.`,
      [{ type: file.type.startsWith('image/') ? 'image' : 'file', url: '', name: file.name }]
    );

    try {
      const result = await analyzeFile(file);

      if (result?.analysis) {
        const convId = currentConversationId;
        if (convId) {
          await saveMessage(convId, 'assistant', result.analysis);
          setMessages(prev => [...prev, {
            id: `analysis-${Date.now()}`,
            role: 'assistant',
            content: result.analysis,
            createdAt: new Date(),
          }]);
        }
      }
      onContextUpdate();
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze file',
        variant: 'destructive',
      });
    }
  };

  const handleWebsiteAnalysisComplete = async (profile: BusinessProfile) => {
    setShowWebsiteAnalyzer(false);
    onContextUpdate();

    const summaryMessage = `I've analyzed your website and here's what I found:

**${profile.businessName}** - ${profile.industry}

${profile.summary || ''}

**Target Audience:** ${profile.targetAudience?.ageRange || 'N/A'} | ${profile.targetAudience?.customerType || 'N/A'}

**Brand Voice:** ${profile.brandIdentity?.toneCharacteristics?.join(', ') || 'N/A'}

**Value Proposition:** ${profile.brandIdentity?.valueProposition || 'N/A'}

**Marketing Maturity:** Website Quality ${profile.marketingMaturity?.websiteQuality || 'N/A'}/10 | SEO: ${profile.marketingMaturity?.seoLevel || 'N/A'}

I'll use this context to provide personalized marketing recommendations. You can ask me anything about your marketing strategy!`;

    let convId = currentConversationId;
    if (!convId) {
      convId = await createConversation();
    }

    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: '🌐 Analyzed my website',
      createdAt: new Date(),
    }]);
    await saveMessage(convId, 'user', '🌐 Analyzed my website');

    setMessages(prev => [...prev, {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: summaryMessage,
      createdAt: new Date(),
    }]);
    await saveMessage(convId, 'assistant', summaryMessage);
  };

  const handleStrategyRequest = async (platform: string, duration: number) => {
    setShowStrategyDialog(false);
    
    const userMessage = `Generate a ${duration}-day content strategy for ${platform}.`;
    await sendMessage(userMessage);
    
    const result = await generateStrategy(platform, duration, undefined, undefined, currentConversationId);
    if (result) {
      setHasStrategies(true);
      const assistantMessage = `✨ **Strategy Generated!**\n\nI've created your ${duration}-day ${platform} content strategy with ${result.postsCount} posts.\n\n**Predicted Results:**\n- Total Reach: ${result.strategy.predicted_metrics?.total_reach?.toLocaleString() || 'N/A'}\n- Avg Engagement: ${result.strategy.predicted_metrics?.avg_engagement_rate || 'N/A'}%\n- Follower Growth: +${result.strategy.predicted_metrics?.expected_follower_growth || 'N/A'}\n\n[View Full Strategy](/strategies/${result.strategyId})`;
      
      if (currentConversationId) {
        await saveMessage(currentConversationId, 'assistant', assistantMessage);
        setMessages(prev => [...prev, {
          id: `strategy-${Date.now()}`,
          role: 'assistant',
          content: assistantMessage,
          createdAt: new Date(),
        }]);
      }
    }
  };

  const handleSmartSuggestion = (suggestion: SmartSuggestion) => {
    switch (suggestion.action) {
      case 'upload_analytics':
        setShowUploader(true);
        break;
      case 'analyze_website':
        setShowWebsiteAnalyzer(true);
        break;
      case 'create_strategy':
        setShowStrategyDialog(true);
        break;
      case 'ask_question':
        sendMessage(suggestion.prompt);
        break;
    }
  };

  const handleAction = (action: string, data?: any) => {
    switch (action) {
      case 'create_strategy':
        setShowStrategyDialog(true);
        break;
      case 'upload_analytics':
        setShowUploader(true);
        break;
      case 'analyze_website':
        setShowWebsiteAnalyzer(true);
        break;
      case 'save_content':
        toast({
          title: 'Content Saved',
          description: 'Content has been saved to your library',
        });
        break;
      case 'request_revision':
        setInput('Can you revise that? ');
        textareaRef.current?.focus();
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isDisabled = isLoading || isProcessing || isGenerating;

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Messages area */}
      <ScrollArea className="flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">AI Marketing Strategist</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              Get personalized marketing strategies, content ideas, and data-driven insights for your business.
            </p>

            {/* Smart Suggestions */}
            <div className="w-full max-w-2xl mb-6">
              <SmartSuggestions
                businessContext={businessContext}
                recentAnalytics={recentAnalytics}
                hasStrategies={hasStrategies}
                onSuggestionClick={handleSmartSuggestion}
              />
            </div>
            
            {/* Quick action cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full mb-8">
              <button
                className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors text-left"
                onClick={() => setShowWebsiteAnalyzer(true)}
              >
                <Globe className="w-6 h-6 text-primary mb-2" />
                <h3 className="font-medium text-sm">Analyze Website</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Let AI understand your business
                </p>
              </button>
              
              <button
                className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors text-left"
                onClick={() => setShowUploader(true)}
              >
                <ImagePlus className="w-6 h-6 text-primary mb-2" />
                <h3 className="font-medium text-sm">Upload Analytics</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Extract insights from screenshots
                </p>
              </button>
              
              <button
                className="p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors text-left"
                onClick={() => setShowStrategyDialog(true)}
              >
                <Lightbulb className="w-6 h-6 text-primary mb-2" />
                <h3 className="font-medium text-sm">Generate Strategy</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Get a custom content plan
                </p>
              </button>
            </div>

            {/* Conversation Starters */}
            <div className="w-full max-w-2xl">
              <ConversationStarters
                onStarterClick={(prompt) => {
                  setInput(prompt);
                  setTimeout(() => sendMessage(prompt), 100);
                }}
                businessName={businessContext?.business_profile?.businessName}
                platform={recentAnalytics[0]?.platform}
              />
            </div>
          </div>
        ) : (
          <ChatMessageList 
            messages={messages} 
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            onAction={handleAction}
            onQuickSuggestion={(prompt) => sendMessage(prompt)}
          />
        )}
      </ScrollArea>

      {/* Website analyzer panel */}
      {showWebsiteAnalyzer && (
        <div className="p-4 border-t bg-muted/50">
          <WebsiteAnalyzer
            onAnalysisComplete={handleWebsiteAnalysisComplete}
            onCancel={() => setShowWebsiteAnalyzer(false)}
            disabled={isDisabled}
          />
        </div>
      )}

      {/* Upload panel */}
      {showUploader && (
        <div className="p-4 border-t bg-muted/50">
          <ScreenshotUploader
            onFileAnalyze={handleFileAnalyze}
            disabled={isDisabled}
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setShowUploader(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Strategy dialog */}
      <StrategyDialog
        open={showStrategyDialog}
        onOpenChange={setShowStrategyDialog}
        onSubmit={handleStrategyRequest}
      />

      {/* Input area */}
      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between mb-3">
          <QuickActions
            onUploadClick={() => setShowUploader(!showUploader)}
            onWebsiteClick={() => setShowWebsiteAnalyzer(!showWebsiteAnalyzer)}
            onStrategyClick={() => setShowStrategyDialog(true)}
            disabled={isDisabled}
          />
          
          {/* Preferences popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings2 className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Response Preferences</h4>
                
                <div className="space-y-2">
                  <Label className="text-xs">Response Style</Label>
                  <Select
                    value={preferences.response_style}
                    onValueChange={(v) => setPreferences(p => ({ ...p, response_style: v as any }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Tone</Label>
                  <Select
                    value={preferences.tone_preference}
                    onValueChange={(v) => setPreferences(p => ({ ...p, tone_preference: v as any }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Include Examples</Label>
                  <Switch
                    checked={preferences.include_examples}
                    onCheckedChange={(v) => setPreferences(p => ({ ...p, include_examples: v }))}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your marketing strategy..."
            disabled={isDisabled}
            className="min-h-[52px] max-h-40 resize-none"
            rows={1}
          />
          
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isDisabled}
            size="icon"
            className="h-[52px] w-[52px] flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
