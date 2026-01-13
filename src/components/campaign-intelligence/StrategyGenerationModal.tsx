import { useState, useEffect } from 'react';
import { 
  Brain, Loader2, Check, Sparkles, Target, 
  BarChart3, Users, Calendar, AlertCircle 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface GenerationStep {
  id: string;
  label: string;
  description: string;
  icon: typeof Brain;
  status: 'pending' | 'active' | 'complete' | 'error';
}

interface StrategyGenerationModalProps {
  isOpen: boolean;
  progress: number;
  currentStep: string;
  error?: string | null;
}

const GENERATION_STEPS: GenerationStep[] = [
  { 
    id: 'profile', 
    label: 'Analyzing Business Profile', 
    description: 'Understanding your business, audience, and goals',
    icon: Users,
    status: 'pending'
  },
  { 
    id: 'research', 
    label: 'Researching Platform Best Practices', 
    description: 'Gathering platform-specific strategies and trends',
    icon: Target,
    status: 'pending'
  },
  { 
    id: 'themes', 
    label: 'Generating Content Themes', 
    description: 'Creating weekly themes aligned with your objectives',
    icon: Sparkles,
    status: 'pending'
  },
  { 
    id: 'posts', 
    label: 'Creating Daily Posts', 
    description: 'Writing 30 unique, optimized posts',
    icon: Calendar,
    status: 'pending'
  },
  { 
    id: 'optimize', 
    label: 'Optimizing Posting Schedule', 
    description: 'Using ML to find optimal posting times',
    icon: BarChart3,
    status: 'pending'
  },
  { 
    id: 'finalize', 
    label: 'Finalizing Strategy', 
    description: 'Packaging your complete 30-day campaign',
    icon: Check,
    status: 'pending'
  }
];

export function StrategyGenerationModal({ 
  isOpen, 
  progress, 
  currentStep,
  error 
}: StrategyGenerationModalProps) {
  const [steps, setSteps] = useState(GENERATION_STEPS);

  useEffect(() => {
    const stepIndex = GENERATION_STEPS.findIndex(s => s.id === currentStep);
    setSteps(GENERATION_STEPS.map((step, idx) => ({
      ...step,
      status: error ? (idx <= stepIndex ? 'error' : 'pending') :
              idx < stepIndex ? 'complete' : 
              idx === stepIndex ? 'active' : 'pending'
    })));
  }, [currentStep, error]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary animate-pulse" />
            Generating Your 30-Day Strategy
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              This may take 60-90 seconds...
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div 
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                    step.status === 'active' 
                      ? 'bg-primary/10 border border-primary/30' 
                      : step.status === 'complete'
                        ? 'bg-green-500/10 border border-green-500/30'
                        : step.status === 'error'
                          ? 'bg-red-500/10 border border-red-500/30'
                          : 'bg-muted/50 border border-transparent'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    step.status === 'active' 
                      ? 'bg-primary/20' 
                      : step.status === 'complete'
                        ? 'bg-green-500/20'
                        : step.status === 'error'
                          ? 'bg-red-500/20'
                          : 'bg-muted'
                  }`}>
                    {step.status === 'active' ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : step.status === 'complete' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : step.status === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <StepIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${
                      step.status === 'active' ? 'text-primary' :
                      step.status === 'complete' ? 'text-green-500' :
                      step.status === 'error' ? 'text-red-500' :
                      'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  {step.status === 'complete' && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                      Done
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {/* AI Animation */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-purple-500 opacity-20 animate-ping absolute" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center relative">
                <Brain className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}