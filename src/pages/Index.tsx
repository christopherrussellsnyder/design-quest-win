import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Upload, Brain, BarChart3, Download, ChevronDown,
  Check, X, ArrowRight, Shield, Minus, Plus,
  Clock, DollarSign, Users, Zap,
  Lock, Globe, Award
} from 'lucide-react';
import { KorexLogoLockup } from '@/components/branding/KorexLogoLockup';

// --- Section wrapper ---
const AnimatedSection = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
};

// --- Particle Background ---
const ParticleField = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 30 }).map((_, i) => (
      <motion.div key={i} className="absolute w-1 h-1 rounded-full bg-[#CC0000]/30"
        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        animate={{ y: [0, -200 - Math.random() * 300], opacity: [0, 0.6, 0] }}
        transition={{ duration: 6 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 5, ease: 'linear' }}
      />
    ))}
  </div>
);

// --- Data ---
const painPoints = [
  'Spending 8-12 hours every month planning content',
  'Paying $3,000-$10,000/month for agency retainers',
  'Using generic AI tools that give template responses',
  'Guessing what content will actually perform',
];

const howItWorks = [
  { icon: Upload, title: 'Upload Analytics', desc: 'Instagram, Facebook, TikTok, Google Ads — any platform' },
  { icon: Brain, title: 'AI Analysis', desc: 'Real-time performance data analysis in 30 seconds' },
  { icon: BarChart3, title: 'Generate Strategy', desc: 'Complete 14-day strategy + content calendar' },
  { icon: Download, title: 'Export & Implement', desc: 'Download as PDF or copy directly' },
];

const comparisonData = [
  { label: 'Cost/Month', korex: '$49', agency: '$3-10K', freelancer: '$500-2K', chatgpt: '$20' },
  { label: 'Strategy Time', korex: '60 sec', agency: '2-3 weeks', freelancer: '1 week', chatgpt: 'Manual' },
  { label: 'Uses Your Data', korex: true, agency: true, freelancer: false, chatgpt: false },
  { label: 'Platform AI', korex: true, agency: false, freelancer: false, chatgpt: false },
  { label: 'Revisions', korex: 'Unlimited', agency: '2-3 max', freelancer: 'Limited', chatgpt: 'Manual' },
  { label: 'Content Calendar', korex: true, agency: true, freelancer: true, chatgpt: false },
];

const techSteps = [
  { name: 'OCR Analysis', time: '2 seconds', details: ['Extracts all metrics from screenshots', 'Supports any platform, any format'] },
  { name: 'Pattern Recognition', time: '10 seconds', details: ['Identifies top-performing content types', 'Maps engagement patterns', 'Analyzes audience behavior'] },
  { name: 'Algorithm Optimization', time: '15 seconds', details: ['Platform-specific ranking signals', 'Instagram: Engagement-first', 'TikTok: Watch time + completion rate'] },
  { name: 'Strategy Generation', time: '25 seconds', details: ['Personalized 14-day plan', 'Content calendar with daily tasks', 'Performance prediction modeling'] },
  { name: 'Export & Implement', time: '8 seconds', details: ['Download as PDF or copy directly'] },
];

const faqs = [
  { q: 'Is this just ChatGPT with a wrapper?', a: 'No. ChatGPT gives template responses. Korex analyzes YOUR actual performance data using proprietary algorithms trained on $10M+ in ad spend. It\'s like the difference between getting generic advice vs. hiring a strategist who studied your business.' },
  { q: 'Do I need to be tech-savvy?', a: 'Not at all. If you can take a screenshot and upload it, you can use Korex. The interface is simpler than Instagram.' },
  { q: 'What platforms do you support?', a: 'Any platform you can screenshot. Instagram, Facebook, TikTok, Google Ads, LinkedIn, Twitter, YouTube, Pinterest, Shopify — if you have analytics, we can analyze them.' },
  { q: 'How is this different from a marketing agency?', a: 'Cost: $99/month vs $3,000-$10,000/month. Speed: 60 seconds vs 2-3 weeks. Revisions: Unlimited vs 2-3 max. Data: Real-time analysis vs monthly reports.' },
  { q: 'What do I get with the free Starter plan?', a: 'You get 2 free strategy generations with no credit card required. After using them, you can upgrade to Pro for unlimited access or continue using basic features.' },
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel in 2 clicks. No contracts, no commitments.' },
];

const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'Twitter', 'YouTube', 'Pinterest', 'Google Ads', 'Shopify'];

const pricing = [
  {
    name: 'Pro', monthlyPrice: 99, yearlyPrice: 990, popular: true,
    features: ['Unlimited AI strategies', 'Unlimited analytics uploads', 'All platforms supported', 'Export to PDF', 'Priority support', 'Cancel anytime'],
  },
  {
    name: 'Agency', monthlyPrice: 299, yearlyPrice: 2990, popular: false,
    features: ['Everything in Pro', 'Multi-client management', 'White-label reports', 'API access', 'Dedicated support'],
    badge: 'Popular for agencies',
  },
];

const CellValue = ({ value }: { value: string | boolean }) => {
  if (typeof value === 'boolean') {
    return value ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-[#6B6B73] mx-auto" />;
  }
  return <span>{value}</span>;
};

const Index = () => {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showFloatingCta, setShowFloatingCta] = useState(false);
  const [floatingDismissed, setFloatingDismissed] = useState(false);

  // Calculator state
  const [calcResearch, setCalcResearch] = useState(4);
  const [calcPlanning, setCalcPlanning] = useState(6);
  const [calcCalendar, setCalcCalendar] = useState(3);
  const [calcHourlyRate, setCalcHourlyRate] = useState(50);

  const totalHours = calcResearch + calcPlanning + calcCalendar;
  const annualHours = totalHours * 12;
  const annualValue = annualHours * calcHourlyRate;
  const netBenefit = annualValue - 1188;
  const roi = Math.round((netBenefit / 1188) * 100);

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
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] opacity-[0.04] text-[400px] font-black select-none" style={{ fontFamily: 'Arial Black, sans-serif', color: '#CC0000' }}>K</div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#060606] via-[#0A0A0B] to-[#060606] opacity-90" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#CC0000]/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <KorexLogoLockup height={80} mdHeight={120} lgHeight={152} className="mx-auto mb-6 md:mb-10" />
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-[56px] font-black leading-tight mb-6"
            style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>
            Replace 8 Hours of Strategy Planning{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CC0000] to-[#FF1A1A]">with 60 Seconds of AI Intelligence</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg sm:text-xl text-[#A0A0A8] max-w-[640px] mx-auto mb-10">
            Agency-level marketing strategies, built specifically for your business, delivered in less time than it takes to make coffee.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }}
            className="flex items-center justify-center gap-4 flex-wrap mb-4">
            <Link to="/signup"
              className="px-8 py-4 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white text-lg font-bold rounded-lg hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(204,0,0,0.3)] hover:shadow-[0_0_40px_rgba(204,0,0,0.5)]">
              Start Free — No Credit Card Required
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-6 text-sm text-[#6B6B73] flex-wrap">
            <span>✓ No credit card required</span>
            <span>✓ 2 free strategy generations</span>
            <span>✓ Cancel anytime</span>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#6B6B73]"
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <span className="text-xs tracking-widest uppercase">Scroll to see how it works</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* =================== THE PROBLEM =================== */}
      <section className="py-24 px-4 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-[40px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>
              Creating Effective Marketing Strategies Shouldn't Take Days
            </h2>
            <p className="text-lg text-[#A0A0A8]">If you're an e-commerce founder or marketing manager, you know the pain:</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            {painPoints.map((point, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="flex items-start gap-3 bg-[#16171A] border border-[#2A2B2E] rounded-xl p-5">
                  <X className="w-5 h-5 text-[#CC0000] shrink-0 mt-0.5" />
                  <span className="text-[#A0A0A8] text-sm">{point}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="text-center" delay={0.4}>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#CC0000] to-[#FF1A1A]">There's a better way.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* =================== THE SOLUTION =================== */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-[42px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>
              Korex: Marketing Intelligence That{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CC0000] to-[#FF1A1A]">Actually Knows Your Business</span>
            </h2>
            <p className="text-[#A0A0A8] text-lg mt-4">No templates. No guessing. Just strategies built for YOUR audience.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="bg-[#16171A] border border-[#2A2B2E] rounded-xl p-6 text-center hover:border-[#CC0000]/50 transition-all h-full">
                  <div className="w-14 h-14 rounded-full bg-[#CC0000] flex items-center justify-center mx-auto mb-4 text-white font-black text-lg shadow-[0_0_20px_rgba(204,0,0,0.3)]">
                    {i + 1}
                  </div>
                  <step.icon className="w-6 h-6 text-[#CC0000] mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-[#A0A0A8] text-sm">{step.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

        </div>
      </section>

      {/* =================== VALUE COMPARISON =================== */}
      <section className="py-24 px-4 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-[40px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>
              Why Korex Outperforms Agencies, Freelancers, and Generic AI
            </h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2A2B2E]">
                    <th className="text-left py-4 px-3 text-[#6B6B73] font-normal"></th>
                    <th className="py-4 px-3 text-[#CC0000] font-bold">Korex</th>
                    <th className="py-4 px-3 text-[#6B6B73]">Agency</th>
                    <th className="py-4 px-3 text-[#6B6B73]">Freelancer</th>
                    <th className="py-4 px-3 text-[#6B6B73]">ChatGPT</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, i) => (
                    <tr key={i} className="border-b border-[#2A2B2E]/50">
                      <td className="py-4 px-3 text-[#A0A0A8] font-medium">{row.label}</td>
                      <td className="py-4 px-3 text-center text-white font-semibold"><CellValue value={row.korex} /></td>
                      <td className="py-4 px-3 text-center text-[#6B6B73]"><CellValue value={row.agency} /></td>
                      <td className="py-4 px-3 text-center text-[#6B6B73]"><CellValue value={row.freelancer} /></td>
                      <td className="py-4 px-3 text-center text-[#6B6B73]"><CellValue value={row.chatgpt} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedSection>

          <AnimatedSection className="mt-8" delay={0.2}>
            <div className="border border-[#CC0000]/30 rounded-xl p-6 text-center bg-[#CC0000]/5">
              <p className="text-lg font-bold">With Korex, you save <span className="text-[#CC0000]">$5,412–$119,412</span> annually.</p>
              <p className="text-[#A0A0A8] text-sm mt-1">Plus 156 hours of your time.</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* =================== ALGORITHM SUPERIORITY =================== */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-[40px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>
              Why It's Not 'Just Another AI Tool'
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <AnimatedSection>
              <div className="bg-[#16171A] border border-[#2A2B2E] rounded-xl p-6 h-full">
                <h3 className="text-lg font-bold mb-4 text-[#6B6B73]">Generic AI (ChatGPT, etc.)</h3>
                <ul className="space-y-3">
                  {['Gives template responses', "Doesn't analyze your data", 'One-size-fits-all strategies', 'No platform optimization'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#6B6B73]">
                      <X className="w-4 h-4 shrink-0 mt-0.5" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="bg-[#16171A] border border-[#CC0000]/30 rounded-xl p-6 h-full">
                <h3 className="text-lg font-bold mb-4 text-[#CC0000]">Korex Algorithm</h3>
                <ul className="space-y-3">
                  {['Analyzes 47 engagement signals from YOUR data', 'Cross-platform pattern recognition', 'Audience behavior prediction', 'Platform-specific ranking optimization', 'Trained on $10M+ in ad spend analysis'].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#A0A0A8]">
                      <Check className="w-4 h-4 text-[#CC0000] shrink-0 mt-0.5" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#16171A] border border-[#2A2B2E] rounded-xl p-6">
                <p className="text-xs uppercase tracking-wider text-[#6B6B73] mb-2">ChatGPT says:</p>
                <p className="text-[#6B6B73] text-sm italic">"Here's a social media strategy template"</p>
              </div>
              <div className="bg-[#16171A] border border-[#CC0000]/30 rounded-xl p-6">
                <p className="text-xs uppercase tracking-wider text-[#CC0000] mb-2">Korex says:</p>
                <p className="text-[#A0A0A8] text-sm italic">"Based on your data, your audience engages 3.2x more with educational content on Tuesdays at 2pm. Here's your 14-day calendar optimized for this pattern."</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* =================== TIME SAVINGS CALCULATOR =================== */}
      <section className="py-24 px-4 bg-[#0A0A0A]">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-[40px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>
              Calculate Your Time Savings
            </h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-[#16171A] border border-[#2A2B2E] rounded-2xl p-8">
              <div className="space-y-6 mb-8">
                {[
                  { label: 'Market research', value: calcResearch, setter: setCalcResearch },
                  { label: 'Strategy planning', value: calcPlanning, setter: setCalcPlanning },
                  { label: 'Content calendar creation', value: calcCalendar, setter: setCalcCalendar },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-[#A0A0A8] flex-1">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => item.setter(Math.max(0, item.value - 1))} className="w-8 h-8 rounded-lg bg-[#2A2B2E] flex items-center justify-center text-[#A0A0A8] hover:bg-[#3A3B3E] transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 text-center font-bold">{item.value}</span>
                      <button onClick={() => item.setter(item.value + 1)} className="w-8 h-8 rounded-lg bg-[#2A2B2E] flex items-center justify-center text-[#A0A0A8] hover:bg-[#3A3B3E] transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-[#6B6B73] w-16">hrs/mo</span>
                    </div>
                  </div>
                ))}

                <div className="border-t border-[#2A2B2E] pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-[#A0A0A8]">Your hourly rate</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#6B6B73]">$</span>
                      <input
                        type="number" value={calcHourlyRate} onChange={(e) => setCalcHourlyRate(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 bg-[#2A2B2E] border border-[#3A3B3E] rounded-lg px-3 py-2 text-center text-sm focus:border-[#CC0000] outline-none"
                      />
                      <span className="text-xs text-[#6B6B73]">/hour</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0A0A0A] rounded-xl p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B73]">Monthly time saved</span>
                  <span className="font-bold">{totalHours} hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B73]">Annual time saved</span>
                  <span className="font-bold">{annualHours} hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B73]">Annual value saved</span>
                  <span className="font-bold text-[#CC0000]">${annualValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6B73]">Korex annual cost</span>
                  <span className="font-bold">$1,188</span>
                </div>
                <div className="border-t border-[#2A2B2E] pt-3 flex justify-between">
                  <span className="text-[#A0A0A8] font-semibold">ROI</span>
                  <span className="text-2xl font-black text-[#CC0000]">{roi > 0 ? `${roi}%` : '—'}</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white font-bold rounded-lg hover:scale-105 transition-all shadow-[0_0_20px_rgba(204,0,0,0.3)]">
                  Start Free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* =================== SOCIAL PROOF =================== */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-[40px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>
              Built by Marketers, for Marketers
            </h2>
          </AnimatedSection>

          <AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: DollarSign, value: '$10M+', label: 'Ad spend analyzed' },
                { icon: Users, value: '12', label: 'Industries covered' },
                { icon: Globe, value: '8', label: 'Social platforms' },
                { icon: Zap, value: '47', label: 'Engagement signals' },
              ].map((stat, i) => (
                <div key={i} className="bg-[#16171A] border border-[#2A2B2E] rounded-xl p-5 text-center">
                  <stat.icon className="w-5 h-5 text-[#CC0000] mx-auto mb-2" />
                  <p className="text-2xl font-black" style={{ fontFamily: 'Arial Black, sans-serif' }}>{stat.value}</p>
                  <p className="text-xs text-[#6B6B73] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="bg-[#16171A] border border-[#CC0000]/20 rounded-2xl p-8 text-center">
              <p className="text-xl sm:text-2xl italic text-[#A0A0A8] mb-6 leading-relaxed">
                "I spent 6 months analyzing what actually works in marketing data. Then I built an AI that does it in 60 seconds."
              </p>
              <p className="text-sm text-[#6B6B73]">— Founder, Korex Intelligence</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* =================== TECHNOLOGY =================== */}
      <section className="py-24 px-4 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-[40px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>
              The Technology Behind Korex
            </h2>
            <p className="text-[#A0A0A8]">Powered by advanced AI + a live Research Analysis engine that tracks what's actually working — organic and paid — across every major platform.</p>
          </AnimatedSection>

          <div className="space-y-4">
            {techSteps.map((step, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="bg-[#16171A] border border-[#2A2B2E] rounded-xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#CC0000]/10 flex items-center justify-center text-[#CC0000] font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold">{step.name}</h3>
                      <span className="text-xs bg-[#2A2B2E] px-2 py-0.5 rounded-full text-[#6B6B73]">{step.time}</span>
                    </div>
                    <ul className="space-y-1">
                      {step.details.map((d, di) => (
                        <li key={di} className="text-sm text-[#6B6B73] flex items-start gap-2">
                          <span className="text-[#CC0000] mt-1.5 text-xs">├─</span>{d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-8 text-center" delay={0.5}>
            <div className="inline-flex items-center gap-4 bg-[#16171A] border border-[#CC0000]/20 rounded-xl px-6 py-3">
              <Clock className="w-5 h-5 text-[#CC0000]" />
              <span className="text-sm">Total time: <strong>60 seconds</strong></span>
              <span className="text-[#2A2B2E]">|</span>
              <span className="text-sm text-[#A0A0A8]">You save: <strong className="text-[#CC0000]">8-12 hours</strong></span>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* =================== PLATFORMS =================== */}
      <section className="py-16 border-y border-[#2A2B2E] overflow-hidden">
        <AnimatedSection className="text-center mb-10 px-4">
          <p className="text-[#A0A0A8] text-lg">Works with every major social and advertising platform</p>
        </AnimatedSection>
        <div className="relative">
          <motion.div className="flex gap-12 items-center whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
            {[...platforms, ...platforms].map((p, i) => (
              <div key={i} className="text-[#6B6B73] hover:text-[#EEEEEE] transition-colors text-lg font-semibold tracking-wider px-4 shrink-0">{p}</div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* =================== PRICING =================== */}
      <section className="py-24 px-4 bg-[#0A0A0B]">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-[48px] font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '3px' }}>
              Simple, Transparent Pricing
            </h2>
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm ${!billingAnnual ? 'text-white' : 'text-[#6B6B73]'}`}>Monthly</span>
              <button onClick={() => setBillingAnnual(!billingAnnual)}
                className={`relative w-12 h-6 rounded-full transition-colors ${billingAnnual ? 'bg-[#CC0000]' : 'bg-[#3A3B3E]'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${billingAnnual ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className={`text-sm ${billingAnnual ? 'text-white' : 'text-[#6B6B73]'}`}>Yearly</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${billingAnnual ? 'bg-[#CC0000]/20 text-[#CC0000]' : 'bg-[#CC0000]/10 text-[#CC0000]/70'}`}>2 months free</span>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {pricing.map((plan, i) => {
              const displayPrice = billingAnnual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
              const savings = plan.monthlyPrice * 12 - plan.yearlyPrice;
              return (
                <AnimatedSection key={i} delay={i * 0.1}>
                  <div className={`relative bg-[#16171A] rounded-2xl p-8 h-full flex flex-col border transition-all duration-300 hover:-translate-y-1 ${plan.popular ? 'border-[#CC0000] shadow-[0_0_30px_rgba(204,0,0,0.15)]' : 'border-[#2A2B2E] hover:border-[#3A3B3E]'}`}>
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
                    )}
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-4xl font-black" style={{ fontFamily: 'Arial Black, sans-serif' }}>${displayPrice}</span>
                      <span className="text-[#6B6B73] text-sm">/month</span>
                    </div>
                    {billingAnnual && <p className="text-xs text-[#6B6B73] mb-4">${plan.yearlyPrice}/year · Save ${savings}</p>}
                    {!billingAnnual && <div className="mb-4" />}
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2 text-sm text-[#A0A0A8]">
                          <Check className="w-4 h-4 text-[#CC0000] shrink-0 mt-0.5" />{f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/signup" className={`block text-center py-3 rounded-lg font-bold text-sm transition-all ${plan.popular ? 'bg-gradient-to-r from-[#CC0000] to-[#990000] text-white hover:shadow-[0_0_20px_rgba(204,0,0,0.3)]' : 'border border-[#3A3B3E] text-[#EEEEEE] hover:border-[#CC0000] hover:text-[#CC0000]'}`}>
                      Start Free
                    </Link>
                    <p className="text-xs text-[#6B6B73] text-center mt-3">No credit card required</p>
                    {plan.badge && <p className="text-xs text-[#A0A0A8] text-center mt-1">{plan.badge}</p>}
                  </div>
                </AnimatedSection>
              );
            })}
          </div>

        </div>
      </section>

      {/* =================== FAQ =================== */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-[40px] font-black" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '3px' }}>
              Frequently Asked Questions
            </h2>
          </AnimatedSection>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left bg-[#16171A] border border-[#2A2B2E] rounded-xl p-5 hover:border-[#3A3B3E] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#6B6B73] transition-transform shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }} className="text-sm text-[#A0A0A8] mt-3 leading-relaxed overflow-hidden">
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
            Ready to Save 8 Hours Every Month?
          </h2>
          <p className="text-[#A0A0A8] text-lg mb-8 max-w-lg mx-auto">
            Join the marketing teams who've automated their strategy planning.
          </p>
          <Link to="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white text-lg font-bold rounded-lg hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(204,0,0,0.3)]">
            Start Free — No Credit Card Required <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="flex items-center justify-center gap-6 text-sm text-[#6B6B73] mt-6 flex-wrap">
            <span>✓ 2 free strategy generations</span>
            <span>✓ No credit card required</span>
            <span>✓ Upgrade anytime</span>
          </div>
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
              <badge.icon className="w-4 h-4" /><span>{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* =================== FOOTER =================== */}
      <footer className="bg-[#060606] border-t border-[#CC0000]/30 pt-16 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left min-w-0">
              <KorexLogoLockup height={52} showTagline={false} className="mb-4 self-center" />
              <p className="text-sm text-[#6B6B73] leading-relaxed">Intelligence-driven marketing systems for modern teams.</p>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4 tracking-wider uppercase text-[#A0A0A8]">Product</h4>
              <ul className="space-y-2 text-sm text-[#6B6B73]">
                <li><Link to="/features" className="hover:text-[#CC0000] transition-colors">Features</Link></li>
                
                <li><Link to="/pricing" className="hover:text-[#CC0000] transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 tracking-wider uppercase text-[#A0A0A8]">Company</h4>
              <ul className="space-y-2 text-sm text-[#6B6B73]">
                <li><Link to="/about" className="hover:text-[#CC0000] transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-[#CC0000] transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 tracking-wider uppercase text-[#A0A0A8]">Resources</h4>
              <ul className="space-y-2 text-sm text-[#6B6B73]">
                <li><Link to="/help" className="hover:text-[#CC0000] transition-colors">Help Center</Link></li>
              </ul>
            </div>
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
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
            <Link to="/signup"
              className="px-6 py-3 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white font-bold rounded-lg shadow-[0_0_20px_rgba(204,0,0,0.4)] hover:scale-105 transition-all text-sm">
              Start Free
            </Link>
            <button onClick={() => setFloatingDismissed(true)}
              className="w-8 h-8 rounded-full bg-[#16171A] border border-[#2A2B2E] flex items-center justify-center text-[#6B6B73] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
