import { useState } from 'react';
import { HelpCircle, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface ContextualHelpProps {
  title: string;
  content: string;
  steps?: string[];
  learnMoreLink?: string;
}

export function ContextualHelp({ title, content, steps, learnMoreLink }: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg z-40"
      >
        <HelpCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 max-h-[calc(100vh-6rem)] overflow-hidden z-40 shadow-xl">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => setIsOpen(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="overflow-y-auto max-h-72">
        <p className="text-sm text-muted-foreground mb-4">{content}</p>
        
        {steps && steps.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-foreground mb-2">Quick Steps:</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {learnMoreLink && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-between"
              onClick={() => navigate(learnMoreLink)}
            >
              Learn More
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={() => navigate('/help')}
          >
            Visit Help Center
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Predefined help contexts for different pages
export const helpContexts = {
  dashboard: {
    title: 'Dashboard Help',
    content: 'Your dashboard shows an overview of your social media performance and upcoming posts.',
    steps: [
      'View key metrics at the top',
      'Check your upcoming scheduled posts',
      'Monitor recent engagement',
      'Access quick actions'
    ],
    learnMoreLink: '/help'
  },
  scheduler: {
    title: 'Scheduler Help',
    content: 'Plan and schedule your social media posts across multiple platforms.',
    steps: [
      'Click "Create Post" to start',
      'Write or generate content with AI',
      'Select platforms and time',
      'Schedule or publish immediately'
    ],
    learnMoreLink: '/help'
  },
  contentAI: {
    title: 'Content AI Help',
    content: 'Generate engaging content using our AI-powered tools.',
    steps: [
      'Describe your topic or idea',
      'Select tone and length',
      'Click Generate',
      'Edit and save to library'
    ],
    learnMoreLink: '/help'
  },
  analytics: {
    title: 'Analytics Help',
    content: 'Track your social media performance with detailed insights.',
    steps: [
      'Select date range',
      'Filter by platform',
      'View key metrics',
      'Export reports'
    ],
    learnMoreLink: '/help'
  },
  campaigns: {
    title: 'Campaigns Help',
    content: 'Create and manage marketing campaigns with goals and tracking.',
    steps: [
      'Click "Create Campaign"',
      'Set objectives and budget',
      'Add content and schedule',
      'Monitor performance'
    ],
    learnMoreLink: '/help'
  }
};
