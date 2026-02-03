import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Loader2, ImagePlus, Sparkles, MessageSquare, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScreenshotUploader } from './ScreenshotUploader';
import { WebsiteAnalyzer } from './WebsiteAnalyzer';
import { BusinessProfileCard } from './BusinessProfileCard';
import { useScreenshotAnalysis } from '@/hooks/useScreenshotAnalysis';
import { useWebsiteAnalysis, BusinessProfile } from '@/hooks/useWebsiteAnalysis';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: { type: string; url: string; name?: string }[];
  businessProfile?: BusinessProfile;
  createdAt: Date;
}

interface AIChatInterfaceProps {
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
  className?: string;
}

export function AIChatInterface({ 
  conversationId, 
  onConversationCreated,
  className 
}: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showWebsiteAnalyzer, setShowWebsiteAnalyzer] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId);
  const [activeBusinessProfile, setActiveBusinessProfile] = useState<BusinessProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { uploadScreenshot, isProcessing } = useScreenshotAnalysis();
  const { fetchActiveContext, isAnalyzing } = useWebsiteAnalysis();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load messages if conversation exists
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  // Load active business context on mount
  useEffect(() => {
    loadBusinessContext();
  }, []);

  const loadBusinessContext = async () => {
    const context = await fetchActiveContext();
    if (context) {
      setActiveBusinessProfile(context.business_profile);
    }
  };

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
    onConversationCreated?.(data.id);
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
      // Get or create conversation
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

      // Save user message to database
      await saveMessage(convId, 'user', content, attachments);

      // Update conversation title with first message
      if (messages.length === 0) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await supabase
          .from('ai_conversations')
          .update({ title })
          .eq('id', convId);
      }

      // Call AI for response (streaming)
      const allMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Include business context if available
      const businessContext = activeBusinessProfile ? {
        businessName: activeBusinessProfile.businessName,
        industry: activeBusinessProfile.industry,
        targetAudience: activeBusinessProfile.targetAudience,
        brandIdentity: activeBusinessProfile.brandIdentity,
      } : null;

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
            businessContext,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantMessageId = `assistant-${Date.now()}`;

      // Add empty assistant message
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
            // Incomplete JSON, put back
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save assistant message
      if (assistantContent) {
        await saveMessage(convId, 'assistant', assistantContent);
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
    const url = await uploadScreenshot(file);
    return url;
  };

  const handleAnalyze = async (imageUrl: string) => {
    setShowUploader(false);
    
    // Send message with screenshot attachment
    await sendMessage(
      'Please analyze this analytics screenshot and provide insights.',
      [{ type: 'image', url: imageUrl, name: 'Analytics Screenshot' }]
    );

    // Call the analyze endpoint
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('analyze-screenshot', {
        body: { imageUrl, userId: user.id },
      });

      if (error) throw error;

      if (data?.analysis) {
        // Add analysis as assistant message
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
    setActiveBusinessProfile(profile);

    // Add to chat as a message
    const summaryMessage = `I've analyzed your website and here's what I found:

**${profile.businessName}** - ${profile.industry}

${profile.summary || ''}

**Target Audience:** ${profile.targetAudience?.ageRange || 'N/A'} | ${profile.targetAudience?.customerType || 'N/A'}

**Brand Voice:** ${profile.brandIdentity?.toneCharacteristics?.join(', ') || 'N/A'}

**Value Proposition:** ${profile.brandIdentity?.valueProposition || 'N/A'}

**Marketing Maturity:** Website Quality ${profile.marketingMaturity?.websiteQuality || 'N/A'}/10 | SEO: ${profile.marketingMaturity?.seoLevel || 'N/A'}

I'll use this context to provide personalized marketing recommendations. You can ask me anything about your marketing strategy!`;

    // Get or create conversation
    let convId = currentConversationId;
    if (!convId) {
      convId = await createConversation();
    }

    // Add user action message
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: '🌐 Analyzed my website',
      createdAt: new Date(),
    }]);
    await saveMessage(convId, 'user', '🌐 Analyzed my website');

    // Add assistant response with profile
    setMessages(prev => [...prev, {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: summaryMessage,
      businessProfile: profile,
      createdAt: new Date(),
    }]);
    await saveMessage(convId, 'assistant', summaryMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isDisabled = isLoading || isProcessing || isAnalyzing;

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Business context indicator */}
      {activeBusinessProfile && (
        <div className="px-4 py-2 border-b bg-muted/30">
          <BusinessProfileCard profile={activeBusinessProfile} compact onReanalyze={() => setShowWebsiteAnalyzer(true)} />
        </div>
      )}

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Marketing Assistant</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Upload analytics screenshots, analyze your website, or ask questions about your marketing strategy.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowWebsiteAnalyzer(true)}
              >
                <Globe className="w-4 h-4 mr-2" />
                Analyze Website
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowUploader(true)}
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Upload Screenshot
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setInput('Create a 30-day content strategy for Instagram')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Content Strategy
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-fade-in',
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                )}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div className={cn(
                  'flex-1 max-w-[80%] rounded-lg p-4',
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                )}>
                  {/* Attachments */}
                  {message.attachments?.map((att, i) => (
                    <div key={i} className="mb-2">
                      {att.type === 'image' && (
                        <img 
                          src={att.url} 
                          alt={att.name || 'Attachment'} 
                          className="max-w-full rounded-md max-h-48 object-contain"
                        />
                      )}
                    </div>
                  ))}
                  
                  {/* Message content with markdown */}
                  <div className={cn(
                    'prose prose-sm max-w-none',
                    message.role === 'user' 
                      ? 'prose-invert' 
                      : 'dark:prose-invert'
                  )}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
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

      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowWebsiteAnalyzer(!showWebsiteAnalyzer)}
            disabled={isDisabled}
            className="flex-shrink-0"
            title="Analyze Website"
          >
            <Globe className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowUploader(!showUploader)}
            disabled={isDisabled}
            className="flex-shrink-0"
            title="Upload Screenshot"
          >
            <ImagePlus className="w-4 h-4" />
          </Button>
          
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your analytics or marketing strategy..."
            disabled={isDisabled}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isDisabled}
            size="icon"
            className="flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}