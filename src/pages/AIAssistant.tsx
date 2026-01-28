import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AIChatInterface } from '@/components/chat/AIChatInterface';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare, Trash2, ChevronLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export default function AIAssistant() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      if (selectedConversationId) {
        setSelectedConversationId(undefined);
      }
    },
  });

  const handleNewConversation = () => {
    setSelectedConversationId(undefined);
  };

  const handleConversationCreated = (id: string) => {
    setSelectedConversationId(id);
    queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
  };

  return (
    <>
      <Helmet>
        <title>AI Assistant | MarketAI</title>
        <meta name="description" content="Chat with your AI marketing assistant" />
      </Helmet>

      <div className="flex h-[calc(100vh-4rem)] bg-background">
        {/* Sidebar */}
        <div className={cn(
          'border-r bg-muted/30 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        )}>
          <div className="p-4 border-b">
            <Button 
              onClick={handleNewConversation}
              className="w-full"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100%-5rem)]">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Loading...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={cn(
                      'group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
                      'hover:bg-muted',
                      selectedConversationId === conv.id && 'bg-muted'
                    )}
                    onClick={() => setSelectedConversationId(conv.id)}
                  >
                    <MessageSquare className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conv.title || 'New Conversation'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(conv.updated_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation.mutate(conv.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8"
          style={{ left: sidebarOpen ? '240px' : '0' }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <ChevronLeft className={cn(
            'w-4 h-4 transition-transform',
            !sidebarOpen && 'rotate-180'
          )} />
        </Button>

        {/* Main chat area */}
        <div className="flex-1">
          <AIChatInterface
            conversationId={selectedConversationId}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>
    </>
  );
}
