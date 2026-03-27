import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, BarChart3, Zap, Target, Rocket, Shield,
  Upload, Settings, Sparkles, TrendingUp, ChevronDown,
  Check, X, ChevronLeft, ChevronRight, ArrowRight,
  Lock, Globe, Award, Users, Calendar, DollarSign,
  MonitorSmartphone, Star, Quote, Minus
} from 'lucide-react';

// --- Animated Counter ---
const AnimatedCounter = ({ target, suffix = '', prefix = '' }: { target: string; suffix?: string; prefix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  const numericTarget = parseInt(target.replace(/[^0-9]/g, ''));

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = Math.ceil(numericTarget / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, numericTarget]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// --- Section wrapper with scroll animation ---
const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// --- Particle Background ---
const ParticleField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -200 - Math.random() * 300],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

// --- Features Data ---
const features = [
  { icon: Lightbulb, title: 'AI Strategy Generation', desc: 'Generate comprehensive multi-platform content calendars powered by AI analyzing your business context and performance data.' },
  { icon: BarChart3, title: 'Multi-Format Analytics', desc: 'Upload screenshots, PDFs, and Excel files from any advertising platform and get instant AI-powered insights.' },
  { icon: Zap, title: 'Real-Time Intelligence', desc: 'Streaming AI responses and progressive analysis delivering insights 70% faster than traditional tools.' },
  { icon: Target, title: 'Business Context Engine', desc: 'Configure your business profile once and every strategy recommendation is personalized to your brand voice and goals.' },
  { icon: Rocket, title: 'Performance Optimization', desc: 'Automatic caching, intelligent retry logic, and smart batching ensuring smooth interactions even under heavy load.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Authentication, row-level security, and encrypted data storage protecting your marketing intelligence.' },
];

// --- How It Works Data ---
const steps = [
  { icon: Upload, title: 'Connect Your Data', desc: 'Upload analytics screenshots or connect your website for instant AI analysis.' },
  { icon: Settings, title: 'Configure Business Context', desc: 'Set up your business profile, target audience, and brand voice preferences.' },
  { icon: Sparkles, title: 'Generate Strategy', desc: 'AI generates comprehensive content strategies tailored to your specific goals.' },
  { icon: TrendingUp, title: 'Execute & Optimize', desc: 'Follow your content calendar and track performance with real-time insights.' },
];

// --- Testimonials ---
const testimonials = [
  { quote: 'Korex cut our strategy planning time from 8 hours to 20 minutes while improving engagement by 40%.', name: 'Sarah Chen', role: 'CMO', company: 'TechFlow' },
  { quote: 'The AI-generated content calendars are incredibly detailed. It feels like having a senior strategist on demand.', name: 'Marcus Rivera', role: 'Head of Marketing', company: 'GrowthLab' },
  { quote: 'We manage 12 client accounts with Korex. The multi-platform analytics alone saved us 30 hours per week.', name: 'Emily Park', role: 'Agency Director', company: 'Spark Digital' },
  { quote: 'As a startup founder, Korex gave us enterprise-level marketing intelligence at a fraction of the cost.', name: 'David Okonkwo', role: 'CEO', company: 'NovaTech' },
  { quote: 'The business context engine understands our brand voice better than most freelancers we\'ve hired.', name: 'Lisa Nakamura', role: 'Brand Manager', company: 'Elevate Co' },
];

// --- Pricing ---
const pricing = [
  {
    name: 'Starter', price: '$0', period: '/month', popular: false,
    features: ['5 AI strategies per month', 'Basic analytics uploads', 'Single platform support', 'Community access'],
    cta: 'Get Started Free', missing: ['Advanced analytics', 'Priority support', 'Custom integrations'],
  },
  {
    name: 'Pro', price: '$99', period: '/month', popular: true,
    features: ['Unlimited AI strategies', 'Multi-format analytics', 'All platform support', 'Priority support', 'Advanced reporting', 'Team collaboration'],
    cta: 'Start Pro Trial', missing: [],
  },
  {
    name: 'Enterprise', price: 'Custom', period: '', popular: false,
    features: ['Everything in Pro', 'Dedicated account manager', 'White-label options', 'Custom integrations', 'SLA guarantee', 'On-premise deployment'],
    cta: 'Contact Sales', missing: [],
  },
];

// --- FAQ ---
const faqs = [
  { q: 'What platforms does Korex support?', a: 'Korex supports all major social and advertising platforms including Instagram, Facebook, LinkedIn, TikTok, Twitter, YouTube, Google Ads, and more. You can also upload screenshots from any platform for instant analysis.' },
  { q: 'Do I need a credit card to start?', a: 'No. The Starter plan is completely free with no credit card required. You can upgrade to Pro anytime when you\'re ready for more advanced features.' },
  { q: 'How does AI strategy generation work?', a: 'Our AI analyzes your business profile, target audience, industry trends, and past performance data to generate comprehensive content strategies with specific post ideas, optimal timing, and engagement predictions.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use enterprise-grade encryption, row-level security policies, and SOC 2 compliant infrastructure to protect all your marketing data and business intelligence.' },
];

// --- Platforms ---
const platforms = [
  'Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'Twitter', 'YouTube', 'Pinterest', 'Google Ads', 'Shopify',
];

const Index = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [floatingDismissed, setFloatingDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(p => (p + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowFloatingCta(window.scrollY > 800);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#060606] text-[#EEEEEE] overflow-x-hidden">
      {/* =================== HERO =================== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <ParticleField />
        {/* Background K glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] opacity-[0.04] text-[400px] font-black select-none" style={{ fontFamily: 'Arial Black, sans-serif', color: '#CC0000' }}>K</div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#060606] via-[#0A0A0B] to-[#060606] opacity-90" />
        {/* Red glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#CC0000]/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <img src="/korex-wordmark-lockup.svg" alt="Korex Intelligence Systems" className="h-[60px] mx-auto mb-10" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-[56px] font-black leading-tight mb-6"
            style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '4px' }}
          >
            Transform Marketing Strategy{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CC0000] to-[#FF1A1A]">with AI Intelligence</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg sm:text-xl text-[#A0A0A8] max-w-[600px] mx-auto mb-10"
          >
            Data-driven insights. Automated content. Strategic campaigns. Built for modern marketers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }}
            className="flex items-center justify-center gap-4 flex-wrap mb-4"
          >
            <Link
              to="/signup"
              className="px-8 py-4 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white text-lg font-bold rounded-lg hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(204,0,0,0.3)] hover:shadow-[0_0_40px_rgba(204,0,0,0.5)]"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border border-[#CC0000] text-[#CC0000] text-lg font-bold rounded-lg hover:bg-[#CC0000] hover:text-white transition-all duration-300"
            >
              Watch Demo
            </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-sm text-[#6B6B73]">
            No credit card required · Free forever plan
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#6B6B73]"
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* =================== STATS BANNER =================== */}
      <section className="relative py-16 border-y border-[#2A2B2E] bg-[#0A0A0B]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: Calendar, value: '1M', suffix: '+', label: 'Strategies Generated' },
            { icon: DollarSign, value: '10M', suffix: '+', prefix: '$', label: 'Ad Spend Analyzed' },
            { icon: BarChart3, value: '50K', suffix: '+', label: 'Analytics Uploads' },
            { icon: Check, value: '99.9', suffix: '%', label: 'Uptime Guaranteed' },
          ].map((stat, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <div className="group cursor-default">
                <stat.icon className="w-6 h-6 text-[#CC0000] mx-auto mb-3" />
                <div className="text-3xl sm:text-4xl font-black text-white mb-1" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                  <AnimatedCounter target={stat.value.replace(/[^0-9]/g, '')} suffix={stat.suffix} prefix={stat.value.includes('$') ? '$' : ''} />
                </div>
                <div className="text-sm text-[#A0A0A8]">{stat.label}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* =================== FEATURES =================== */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-[42px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '3px' }}>
              Intelligence Systems Built for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CC0000] to-[#FF1A1A]">Performance</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#CC0000] to-[#990000] mx-auto mt-4" />
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="bg-[#16171A] border border-[#2A2B2E] rounded-xl p-6 h-full hover:border-[#CC0000] transition-all duration-300 group hover:shadow-[0_0_20px_rgba(204,0,0,0.1)]">
                  <div className="w-12 h-12 rounded-lg bg-[#CC0000]/10 flex items-center justify-center mb-4 group-hover:bg-[#CC0000]/20 transition-colors">
                    <f.icon className="w-6 h-6 text-[#CC0000]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-[#A0A0A8] text-sm leading-relaxed">{f.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* =================== HOW IT WORKS =================== */}
      <section className="py-24 px-4 bg-[#0A0A0B]">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-[42px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '3px' }}>
              How It Works
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#CC0000] to-[#990000] mx-auto mt-4" />
          </AnimatedSection>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#CC0000] via-[#CC0000]/50 to-transparent hidden sm:block" />

            {steps.map((step, i) => (
              <AnimatedSection key={i} delay={i * 0.15} className={`relative flex items-start gap-6 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="flex-1 hidden md:block" />
                {/* Circle */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-[#CC0000] flex items-center justify-center text-white font-black text-lg shrink-0 shadow-[0_0_20px_rgba(204,0,0,0.3)]">
                  {i + 1}
                </div>
                {/* Card */}
                <div className="flex-1 bg-[#16171A] border border-[#2A2B2E] rounded-xl p-6 hover:border-[#CC0000]/50 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <step.icon className="w-5 h-5 text-[#CC0000]" />
                    <h3 className="text-lg font-bold">{step.title}</h3>
                  </div>
                  <p className="text-[#A0A0A8] text-sm">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* =================== PLATFORMS =================== */}
      <section className="py-16 border-y border-[#2A2B2E] overflow-hidden">
        <AnimatedSection className="text-center mb-10 px-4">
          <p className="text-[#A0A0A8] text-lg">Works with every major social and advertising platform</p>
        </AnimatedSection>
        <div className="relative">
          <motion.div
            className="flex gap-12 items-center whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            {[...platforms, ...platforms].map((p, i) => (
              <div key={i} className="text-[#6B6B73] hover:text-[#EEEEEE] transition-colors text-lg font-semibold tracking-wider px-4 shrink-0">
                {p}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =================== TESTIMONIALS =================== */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-[42px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '3px' }}>
              Trusted by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CC0000] to-[#FF1A1A]">Marketing Leaders</span>
            </h2>
          </AnimatedSection>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4 }}
                className="bg-[#16171A] border border-[#2A2B2E] rounded-2xl p-8 sm:p-12 text-center"
              >
                <Quote className="w-8 h-8 text-[#CC0000]/40 mx-auto mb-6" />
                <p className="text-lg sm:text-xl italic text-[#EEEEEE] mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].quote}"
                </p>
                <div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CC0000] to-[#990000] mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[currentTestimonial].name[0]}
                  </div>
                  <p className="font-bold text-white">{testimonials[currentTestimonial].name}</p>
                  <p className="text-sm text-[#A0A0A8]">{testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setCurrentTestimonial(p => (p - 1 + testimonials.length) % testimonials.length)} className="p-2 text-[#6B6B73] hover:text-[#CC0000] transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrentTestimonial(i)} className={`w-2 h-2 rounded-full transition-all ${i === currentTestimonial ? 'bg-[#CC0000] w-6' : 'bg-[#3A3B3E]'}`} />
              ))}
              <button onClick={() => setCurrentTestimonial(p => (p + 1) % testimonials.length)} className="p-2 text-[#6B6B73] hover:text-[#CC0000] transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =================== PRICING =================== */}
      <section className="py-24 px-4 bg-[#0A0A0B]">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-[42px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '3px' }}>
              Simple, Transparent Pricing
            </h2>
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm ${!billingAnnual ? 'text-white' : 'text-[#6B6B73]'}`}>Monthly</span>
              <button
                onClick={() => setBillingAnnual(!billingAnnual)}
                className={`relative w-12 h-6 rounded-full transition-colors ${billingAnnual ? 'bg-[#CC0000]' : 'bg-[#3A3B3E]'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${billingAnnual ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className={`text-sm ${billingAnnual ? 'text-white' : 'text-[#6B6B73]'}`}>Annual</span>
              {billingAnnual && <span className="text-xs bg-[#CC0000]/20 text-[#CC0000] px-2 py-0.5 rounded-full font-semibold">Save 20%</span>}
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map((plan, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className={`relative bg-[#16171A] rounded-2xl p-8 h-full flex flex-col border transition-all duration-300 hover:-translate-y-1 ${plan.popular ? 'border-[#CC0000] shadow-[0_0_30px_rgba(204,0,0,0.15)]' : 'border-[#2A2B2E] hover:border-[#3A3B3E]'}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white text-xs font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-black" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                      {plan.price === 'Custom' ? plan.price : billingAnnual && plan.price !== '$0' ? `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}` : plan.price}
                    </span>
                    {plan.period && <span className="text-[#6B6B73] text-sm">{plan.period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-[#A0A0A8]">
                        <Check className="w-4 h-4 text-[#CC0000] shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                    {plan.missing.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-[#3A3B3E]">
                        <X className="w-4 h-4 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={plan.name === 'Enterprise' ? '/login' : '/signup'}
                    className={`block text-center py-3 rounded-lg font-bold text-sm transition-all ${plan.popular ? 'bg-gradient-to-r from-[#CC0000] to-[#990000] text-white hover:shadow-[0_0_20px_rgba(204,0,0,0.3)]' : 'border border-[#3A3B3E] text-[#EEEEEE] hover:border-[#CC0000] hover:text-[#CC0000]'}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* =================== FAQ =================== */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl font-black" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '3px' }}>
              Frequently Asked Questions
            </h2>
          </AnimatedSection>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left bg-[#16171A] border border-[#2A2B2E] rounded-xl p-5 hover:border-[#3A3B3E] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#6B6B73] transition-transform shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm text-[#A0A0A8] mt-3 leading-relaxed overflow-hidden"
                      >
                        {faq.a}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* =================== FINAL CTA =================== */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/5 to-transparent pointer-events-none" />
        <AnimatedSection className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black mb-6" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '3px' }}>
            Ready to Transform Your Marketing?
          </h2>
          <p className="text-[#A0A0A8] text-lg mb-8 max-w-lg mx-auto">
            Join thousands of marketers using Korex Intelligence to create smarter strategies in minutes, not hours.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white text-lg font-bold rounded-lg hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(204,0,0,0.3)]"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-[#6B6B73] mt-4">No credit card required · Setup in under 2 minutes</p>
        </AnimatedSection>
      </section>

      {/* =================== TRUST BADGES =================== */}
      <section className="py-12 px-4 border-t border-[#2A2B2E]">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-[#6B6B73]">
          {[
            { icon: Lock, label: 'Encrypted Data' },
            { icon: Shield, label: 'SOC 2 Compliant' },
            { icon: Globe, label: 'GDPR Ready' },
            { icon: Award, label: '99.9% Uptime' },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <badge.icon className="w-4 h-4" />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* =================== FOOTER =================== */}
      <footer className="bg-[#060606] border-t border-[#CC0000]/30 pt-16 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <img src="/korex-wordmark-lockup.svg" alt="Korex" className="h-10 mb-4" />
              <p className="text-sm text-[#6B6B73] leading-relaxed">Intelligence-driven marketing systems for modern teams.</p>
            </div>
            {/* Product */}
            <div>
              <h4 className="font-bold text-sm mb-4 tracking-wider uppercase text-[#A0A0A8]">Product</h4>
              <ul className="space-y-2 text-sm text-[#6B6B73]">
                {['Features', 'Pricing', 'Integrations', 'Changelog'].map(l => (
                  <li key={l}><span className="hover:text-[#CC0000] transition-colors cursor-pointer">{l}</span></li>
                ))}
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="font-bold text-sm mb-4 tracking-wider uppercase text-[#A0A0A8]">Company</h4>
              <ul className="space-y-2 text-sm text-[#6B6B73]">
                {['About', 'Blog', 'Careers', 'Contact'].map(l => (
                  <li key={l}><span className="hover:text-[#CC0000] transition-colors cursor-pointer">{l}</span></li>
                ))}
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h4 className="font-bold text-sm mb-4 tracking-wider uppercase text-[#A0A0A8]">Resources</h4>
              <ul className="space-y-2 text-sm text-[#6B6B73]">
                <li><Link to="/help" className="hover:text-[#CC0000] transition-colors">Help Center</Link></li>
                {['API Docs', 'Community', 'Case Studies'].map(l => (
                  <li key={l}><span className="hover:text-[#CC0000] transition-colors cursor-pointer">{l}</span></li>
                ))}
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="font-bold text-sm mb-4 tracking-wider uppercase text-[#A0A0A8]">Legal</h4>
              <ul className="space-y-2 text-sm text-[#6B6B73]">
                <li><Link to="/privacy" className="hover:text-[#CC0000] transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-[#CC0000] transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-[#CC0000] transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#2A2B2E] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#6B6B73]">© 2026 Korex Intelligence Systems. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-[#6B6B73]">
              <Link to="/health" className="hover:text-[#CC0000] transition-colors">Status</Link>
              <Link to="/privacy" className="hover:text-[#CC0000] transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-[#CC0000] transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* =================== FLOATING CTA =================== */}
      <AnimatePresence>
        {showFloatingCta && !floatingDismissed && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
          >
            <Link
              to="/signup"
              className="px-6 py-3 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white font-bold rounded-lg shadow-[0_0_20px_rgba(204,0,0,0.4)] hover:scale-105 transition-all text-sm"
            >
              Get Started Free
            </Link>
            <button
              onClick={() => setFloatingDismissed(true)}
              className="w-8 h-8 rounded-full bg-[#16171A] border border-[#2A2B2E] flex items-center justify-center text-[#6B6B73] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
