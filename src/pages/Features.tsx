import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Brain, BarChart3, MessageSquare, Users, FileText, Briefcase, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Brain,
    title: 'AI Strategy Generation',
    description: 'Generate data-driven marketing strategies tailored to your business in seconds. Korex analyzes your market, audience, and analytics to produce actionable plans that drive results.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Intelligence',
    description: 'Upload screenshots or exports from any platform — Facebook, Instagram, Google — and let Korex extract insights, identify trends, and recommend optimizations automatically.',
  },
  {
    icon: MessageSquare,
    title: 'AI Strategist Chat',
    description: 'Ask anything. Get expert-level marketing guidance 24/7. Korex understands your business context and gives you advice tailored to your specific goals and data.',
  },
  {
    icon: Users,
    title: 'Audience Intelligence',
    description: 'Identify your ideal customer segments, understand behavioral patterns, and receive targeting recommendations that help you reach the right people at the right time.',
  },
  {
    icon: FileText,
    title: 'Content AI',
    description: 'From ad copy to social captions to email campaigns — Korex generates on-brand content optimized for engagement and conversion across every channel.',
  },
  {
    icon: Briefcase,
    title: 'Campaign Management',
    description: 'Manage your marketing campaigns end-to-end. Build campaign structures, set schedules, track performance, and iterate — all from one unified dashboard.',
  },
];

export default function Features() {
  return (
    <>
      <Helmet>
        <title>Features | Korex Intelligence Systems</title>
        <meta name="description" content="Explore Korex features: AI strategy generation, analytics intelligence, content AI, audience insights, and campaign management." />
      </Helmet>

      <div className="min-h-screen bg-[#060606] text-[#EEEEEE]">
        {/* Navbar */}
        <nav className="border-b border-[#2A2B2E] px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/">
              <img src="/korex-wordmark-lockup.svg" alt="Korex" className="h-8" />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-[#A0A0A8]">
              <Link to="/features" className="text-[#CC0000]">Features</Link>
              <Link to="/demo" className="hover:text-white transition-colors">Demo</Link>
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-[#A0A0A8] hover:text-white transition-colors">Sign In</Link>
              <Link to="/signup" className="text-sm px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#990000] transition-colors">Get Started</Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-[56px] font-black mb-6" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>
              Everything You Need to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CC0000] to-[#FF1A1A]">Dominate Your Market</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[#A0A0A8] max-w-2xl mx-auto mb-10">
              Korex combines AI strategy, analytics intelligence, and content automation into one powerful platform.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
              <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white text-lg font-bold rounded-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(204,0,0,0.3)]">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-4 bg-[#0A0A0A]">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-[#16171A] border border-[#2A2B2E] rounded-2xl p-8 hover:border-[#CC0000]/50 transition-all group">
                  <div className="w-14 h-14 rounded-xl bg-[#CC0000]/10 flex items-center justify-center mb-6 group-hover:bg-[#CC0000]/20 transition-colors">
                    <feature.icon className="w-7 h-7 text-[#CC0000]" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-[#A0A0A8] text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black mb-6" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>
              Ready to Outperform Your Competition?
            </h2>
            <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white text-lg font-bold rounded-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(204,0,0,0.3)]">
              Start Free Today <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#060606] border-t border-[#2A2B2E] py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#6B6B73]">© 2026 Korex Intelligence Systems. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-[#6B6B73]">
              <Link to="/features" className="hover:text-[#CC0000] transition-colors">Features</Link>
              <Link to="/about" className="hover:text-[#CC0000] transition-colors">About</Link>
              <Link to="/contact" className="hover:text-[#CC0000] transition-colors">Contact</Link>
              <Link to="/privacy" className="hover:text-[#CC0000] transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-[#CC0000] transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
