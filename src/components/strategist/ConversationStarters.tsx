import React from 'react';
import { 
  MessageSquare, Calendar, TrendingUp, HelpCircle, 
  Sparkles, Target, BarChart3, Clock, Hash, Lightbulb,
  Users, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StarterCategory {
  name: string;
  icon: React.ReactNode;
  prompts: string[];
}

interface ConversationStartersProps {
  onStarterClick: (prompt: string) => void;
  businessName?: string;
  platform?: string;
}

const starterCategories: StarterCategory[] = [
  {
    name: 'Quick Start',
    icon: <Zap className="w-4 h-4" />,
    prompts: [
      "What content should I post this week?",
      "Analyze my engagement trends",
      "How can I increase my reach?",
      "Best times to post on Instagram?",
    ],
  },
  {
    name: 'Strategy',
    icon: <Target className="w-4 h-4" />,
    prompts: [
      "Create a 30-day Instagram strategy",
      "Help me plan my content calendar",
      "What's my competitive advantage?",
      "How should I differentiate from competitors?",
    ],
  },
  {
    name: 'Analysis',
    icon: <BarChart3 className="w-4 h-4" />,
    prompts: [
      "Review my recent performance",
      "Why is my engagement declining?",
      "What content type works best for me?",
      "Compare my metrics to industry average",
    ],
  },
  {
    name: 'Learning',
    icon: <HelpCircle className="w-4 h-4" />,
    prompts: [
      "How does the Instagram algorithm work?",
      "What makes a good carousel post?",
      "Explain engagement rate vs reach",
      "Best practices for hashtags",
    ],
  },
];

export function ConversationStarters({ 
  onStarterClick,
  businessName,
  platform,
}: ConversationStartersProps) {
  // Get personalized prompts based on context
  const getPersonalizedPrompts = () => {
    const prompts: string[] = [];
    
    if (businessName) {
      prompts.push(`What content themes work best for ${businessName}?`);
    }
    
    if (platform) {
      prompts.push(`Create a ${platform} growth strategy for me`);
    }
    
    return prompts;
  };

  const personalizedPrompts = getPersonalizedPrompts();

  return (
    <div className="space-y-6">
      {/* Personalized prompts if available */}
      {personalizedPrompts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Personalized for you
          </h3>
          <div className="flex flex-wrap gap-2">
            {personalizedPrompts.map((prompt, i) => (
              <Button
                key={`personalized-${i}`}
                variant="outline"
                size="sm"
                className="text-xs gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10"
                onClick={() => onStarterClick(prompt)}
              >
                <Sparkles className="w-3 h-3 text-primary" />
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Category prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {starterCategories.map((category) => (
          <div key={category.name} className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              {category.icon}
              {category.name}
            </h3>
            <div className="flex flex-col gap-1.5">
              {category.prompts.slice(0, 2).map((prompt, i) => (
                <Button
                  key={`${category.name}-${i}`}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs h-auto py-2 px-3 text-left"
                  onClick={() => onStarterClick(prompt)}
                >
                  <MessageSquare className="w-3 h-3 mr-2 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate">{prompt}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Quick suggestion chips for active conversations
interface QuickSuggestionChipsProps {
  onChipClick: (prompt: string) => void;
  recentTopics?: string[];
}

const contextualSuggestions = [
  { prompt: "Tell me more", icon: <MessageSquare className="w-3 h-3" /> },
  { prompt: "Give me examples", icon: <Lightbulb className="w-3 h-3" /> },
  { prompt: "How do I implement this?", icon: <Target className="w-3 h-3" /> },
  { prompt: "What are the next steps?", icon: <Zap className="w-3 h-3" /> },
  { prompt: "Compare to best practices", icon: <TrendingUp className="w-3 h-3" /> },
];

export function QuickSuggestionChips({ 
  onChipClick,
  recentTopics = [],
}: QuickSuggestionChipsProps) {
  // Filter relevant suggestions based on recent topics
  const getSuggestions = () => {
    const suggestions = [...contextualSuggestions];
    
    // Add topic-specific suggestions
    if (recentTopics.includes('strategy')) {
      suggestions.unshift({
        prompt: "Generate the full strategy",
        icon: <Calendar className="w-3 h-3" />,
      });
    }
    
    if (recentTopics.includes('engagement')) {
      suggestions.unshift({
        prompt: "How to boost engagement?",
        icon: <TrendingUp className="w-3 h-3" />,
      });
    }
    
    return suggestions.slice(0, 4);
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {getSuggestions().map((suggestion, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          className="text-xs h-7 gap-1.5 bg-background/50"
          onClick={() => onChipClick(suggestion.prompt)}
        >
          {suggestion.icon}
          {suggestion.prompt}
        </Button>
      ))}
    </div>
  );
}
