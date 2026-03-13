import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  Link2, 
  Sparkles, 
  Calendar, 
  BarChart3,
  CheckCircle2
} from 'lucide-react';

const steps = [
  {
    icon: Rocket,
    title: 'Welcome to Korex Intelligence! 🎉',
    description: 'Korex is your marketing intelligence platform. Let us show you around.',
    image: null
  },
  {
    icon: Link2,
    title: 'Connect Your Accounts',
    description: 'Link your social media platforms like Facebook, Instagram, Twitter, and LinkedIn to start managing them all in one place.',
    image: null
  },
  {
    icon: Sparkles,
    title: 'Create with AI',
    description: 'Use our AI-powered content generator to create engaging posts in seconds. Just describe what you want, and let AI do the rest.',
    image: null
  },
  {
    icon: Calendar,
    title: 'Schedule & Publish',
    description: 'Plan your content calendar, schedule posts for optimal times, and publish across all platforms simultaneously.',
    image: null
  },
  {
    icon: BarChart3,
    title: 'Track Performance',
    description: 'Monitor your reach, engagement, and growth with detailed analytics. Make data-driven decisions to improve your strategy.',
    image: null
  },
  {
    icon: CheckCircle2,
    title: "You're All Set!",
    description: "You're ready to supercharge your social media marketing. Let's get started!",
    image: null
  }
];

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      onComplete();
    } else {
      setCurrentStep(s => s + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        {/* Progress Bar */}
        <div className="flex gap-1 p-4 pb-0">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i <= currentStep ? 'bg-primary' : 'bg-muted'
              }`} 
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 pt-4 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">
            {step.title}
          </h2>
          
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            {step.description}
          </p>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={onComplete}
              className="text-muted-foreground"
            >
              Skip
            </Button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('korex_onboarding_complete');
  });

  const completeOnboarding = () => {
    localStorage.setItem('korex_onboarding_complete', 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('korex_onboarding_complete');
    setShowOnboarding(true);
  };

  return { showOnboarding, completeOnboarding, resetOnboarding };
}
