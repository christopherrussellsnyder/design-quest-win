import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What is Korex?',
    answer: 'Korex is an intelligence-driven marketing platform that helps you create, schedule, and analyze content across multiple platforms using advanced marketing intelligence tools.'
  },
  {
    question: 'Which social media platforms are supported?',
    answer: 'We support Facebook, Instagram, Twitter/X, LinkedIn, and TikTok. More platforms are being added regularly.'
  },
  {
    question: 'How does the content generator work?',
    answer: 'Simply describe your topic or idea, select your preferred tone and length, and Korex Intelligence will generate engaging, platform-optimized content for you. You can edit and refine the generated content before publishing.'
  },
  {
    question: 'Can I schedule posts in advance?',
    answer: 'Yes! You can schedule posts for any future date and time. Our platform also suggests optimal posting times based on when your audience is most active.'
  },
  {
    question: 'What plans are available?',
    answer: 'We offer three plans: Free (limited features), Pro at $29/month (most features), and Enterprise at $99/month (all features plus team collaboration). All paid plans come with a 14-day free trial.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Absolutely. You can cancel your subscription at any time from your account settings. You\'ll continue to have access until the end of your current billing period.'
  },
  {
    question: 'How do I connect my social media accounts?',
    answer: 'Go to Settings → Connected Accounts and click "Connect" next to the platform you want to link. You\'ll be redirected to authorize Korex to access your account.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and never share your data with third parties.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach our support team via email at support@korex.io or through the in-app chat. Pro and Enterprise users get priority support.'
  }
];

interface FAQProps {
  className?: string;
  limit?: number;
}

export function FAQ({ className, limit }: FAQProps) {
  const displayFaqs = limit ? faqs.slice(0, limit) : faqs;

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold text-foreground text-center mb-6">
        Frequently Asked Questions
      </h2>
      
      <Accordion type="single" collapsible className="w-full">
        {displayFaqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
