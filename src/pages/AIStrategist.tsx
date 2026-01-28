import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ConversationSidebar } from '@/components/strategist/ConversationSidebar';
import { ChatArea } from '@/components/strategist/ChatArea';
import { ContextSidebar } from '@/components/strategist/ContextSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BusinessProfile } from '@/hooks/useWebsiteAnalysis';
import { cn } from '@/lib/utils';

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: { type: string; url: string; name?: string }[];
  createdAt: Date;
}

export interface BusinessContext {
  id: string;
  website_url: string;
  business_profile: BusinessProfile | null;
  analyzed_at: string;
}

export interface AnalyticsUpload {
  id: string;
  platform: string;
  extracted_data: Record<string, any>;
  ai_insights: string;
  uploaded_at: string;
}

export default function AIStrategist() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['strategist-conversations'],
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

  // Fetch active business context
  const { data: businessContext } = useQuery({
    queryKey: ['business-context'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('business_context')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        website_url: data.website_url,
        business_profile: data.business_profile as unknown as BusinessProfile | null,
        analyzed_at: data.analyzed_at || data.last_updated || '',
      } as BusinessContext;
    },
  });

  // Fetch recent analytics
  const { data: recentAnalytics = [] } = useQuery({
    queryKey: ['recent-analytics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('uploaded_analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        platform: item.platform || 'unknown',
        extracted_data: (item.extracted_data as Record<string, any>) || {},
        ai_insights: item.ai_insights || '',
        uploaded_at: item.uploaded_at || '',
      })) as AnalyticsUpload[];
    },
  });

  const handleNewConversation = () => {
    setSelectedConversationId(undefined);
  };

  const handleConversationCreated = (id: string) => {
    setSelectedConversationId(id);
    queryClient.invalidateQueries({ queryKey: ['strategist-conversations'] });
  };

  const handleDeleteConversation = async (id: string) => {
    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', id);
    
    if (!error) {
      if (selectedConversationId === id) {
        setSelectedConversationId(undefined);
      }
      queryClient.invalidateQueries({ queryKey: ['strategist-conversations'] });
    }
  };

  const handleContextUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['business-context'] });
    queryClient.invalidateQueries({ queryKey: ['recent-analytics'] });
  };

  return (
    <>
      <Helmet>
        <title>AI Marketing Strategist | MarketAI</title>
        <meta name="description" content="Chat with your AI marketing strategist for personalized strategies and insights" />
      </Helmet>

      <div className="flex h-screen bg-background overflow-hidden">
        {/* Left Sidebar - Conversations */}
        <ConversationSidebar
          conversations={conversations}
          selectedId={selectedConversationId}
          isLoading={conversationsLoading}
          isOpen={leftSidebarOpen}
          onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
          onSelect={setSelectedConversationId}
          onNewChat={handleNewConversation}
          onDelete={handleDeleteConversation}
        />

        {/* Main Chat Area */}
        <ChatArea
          conversationId={selectedConversationId}
          businessContext={businessContext}
          recentAnalytics={recentAnalytics}
          onConversationCreated={handleConversationCreated}
          onContextUpdate={handleContextUpdate}
          className="flex-1"
        />

        {/* Right Sidebar - Context */}
        <ContextSidebar
          businessContext={businessContext}
          recentAnalytics={recentAnalytics}
          isOpen={rightSidebarOpen}
          onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
          onReanalyze={handleContextUpdate}
        />
      </div>
    </>
  );
}
