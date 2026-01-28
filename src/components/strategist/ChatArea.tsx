import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Bot, User, Loader2, ImagePlus, Globe, Lightbulb, 
  Sparkles, MessageSquare 
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
import { useWebsiteAnalysis, BusinessProfile } from '@/hooks/useWebsiteAnalysis';
import { ChatMessageList } from './ChatMessageList';
import { QuickActions } from './QuickActions';
import { StrategyDialog } from './StrategyDialog';
import { Message, BusinessContext, AnalyticsUpload } from '@/pages/AIStrategist';
import { useStrategyGeneration } from '@/hooks/useStrategyGeneration';
import { useNavigate } from 'react-router-dom';

interface ChatAreaProps {
  conversationId?: string;
  businessContext: BusinessContext | null | undefined;
  recentAnalytics: AnalyticsUpload[];
  onConversationCreated: (id: string) => void;
  onContextUpdate: () => void;
  className?: string;
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { uploadScreenshot, isProcessing } = useScreenshotAnalysis();
  const { isAnalyzing } = useWebsiteAnalysis();
  const { generateStrategy, isGenerating, progress } = useStrategyGeneration();
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

      const profile = businessContext?.business_profile;
      const contextData = {
        businessProfile: profile ? {
          businessName: profile.businessName,
          industry: profile.industry,
          businessType: profile.businessType,
          targetAudience: profile.targetAudience,
          brandIdentity: profile.brandIdentity,
          productsServices: profile.productsServices,
        } : null,
        recentAnalytics: recentAnalytics.map(a => ({
          platform: a.platform,
          metrics: a.extracted_data,
          insights: a.ai_insights,
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
            conversationId: convId,
            businessContext: contextData,
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

  const handleUpload = async (file: File): Promise<string> => {
    return await uploadScreenshot(file);
  };

  const handleAnalyze = async (imageUrl: string) => {
    setShowUploader(false);
    
    await sendMessage(
      'Please analyze this analytics screenshot and provide insights.',
      [{ type: 'image', url: imageUrl, name: 'Analytics Screenshot' }]
    );

    try {
      const { data, error } = await supabase.functions.invoke('analyze-screenshot', {
        body: { imageUrl },
      });

      if (error) throw error;

      if (data?.analysis) {
        const convId = currentConversationId;
        if (convId) {
          await saveMessage(convId, 'assistant', data.analysis);
          setMessages(prev => [...prev, {
            id: `analysis-${Date.now()}`,
            role: 'assistant',
            content: data.analysis,
            createdAt: new Date(),
          }]);
        }
      }
      onContextUpdate();
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Failed to analyze screenshot',
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isDisabled = isLoading || isProcessing || isAnalyzing || isGenerating;

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
            <p className="text-muted-foreground max-w-md mb-8">
              Get personalized marketing strategies, content ideas, and data-driven insights for your business.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full">
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

            <div className="mt-8 flex flex-wrap gap-2 justify-center">
              {[
                "What content should I post this week?",
                "Analyze my engagement trends",
                "Best times to post on Instagram",
                "How can I increase my reach?",
              ].map((suggestion, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setInput(suggestion);
                    setTimeout(() => sendMessage(suggestion), 100);
                  }}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <ChatMessageList 
            messages={messages} 
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
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
            onUpload={handleUpload}
            onAnalyze={handleAnalyze}
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
        <QuickActions
          onUploadClick={() => setShowUploader(!showUploader)}
          onWebsiteClick={() => setShowWebsiteAnalyzer(!showWebsiteAnalyzer)}
          onStrategyClick={() => setShowStrategyDialog(true)}
          disabled={isDisabled}
        />
        
        <div className="flex gap-2 mt-3">
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
