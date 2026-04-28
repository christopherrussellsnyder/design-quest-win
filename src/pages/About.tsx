import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Database, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { KorexLogoLockup } from '@/components/branding/KorexLogoLockup';

const beliefs = [
  {
    icon: Database,
    title: 'Data Should Drive Every Decision',
    description: 'Great marketing isn\'t guesswork. It\'s built on real signals from real audiences.',
  },
  {
    icon: Sparkles,
    title: 'AI Should Amplify Human Creativity',
    description: 'Korex doesn\'t replace your team. It makes every member of your team more powerful.',
  },
  {
    icon: Zap,
    title: 'Speed Is a Competitive Advantage',
    description: 'The faster you can test, learn, and adapt, the faster you grow.',
  },
];

export default function About() {
  return (
    <>
      <Helmet>
        <title>About | Korex Intelligence Systems</title>
        <meta name="description" content="Built for marketers who play to win. Learn about Korex Intelligence Systems and our mission to democratize marketing intelligence." />
      </Helmet>

      <div className="min-h-screen bg-[#060606] text-[#EEEEEE]">
        {/* Navbar */}
        <nav className="border-b border-[#2A2B2E] px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/">
              <KorexLogoLockup height={32} showTagline={false} />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-[#A0A0A8]">
              <Link to="/features" className="hover:text-white transition-colors">Features</Link>
              <Link to="/demo" className="hover:text-white transition-colors">Demo</Link>
              <Link to="/about" className="text-[#CC0000]">About</Link>
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
              Built for Marketers Who{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CC0000] to-[#FF1A1A]">Play to Win</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-[#A0A0A8] max-w-2xl mx-auto">
              Korex Intelligence Systems was built to give every business access to enterprise-level marketing intelligence.
            </motion.p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 px-4 bg-[#0A0A0A]">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl font-black mb-6" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>Our Mission</h2>
              <p className="text-[#A0A0A8] text-lg leading-relaxed">
                Marketing has always favored those with the biggest budgets and the largest teams. We built Korex to change that. Our mission is to democratize marketing intelligence — giving independent businesses, agencies, and growth teams the same AI-powered strategic advantage that Fortune 500 companies have always had.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Beliefs */}
        <section className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {beliefs.map((belief, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="bg-[#16171A] border border-[#2A2B2E] rounded-2xl p-8 hover:border-[#CC0000]/50 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#CC0000]/10 flex items-center justify-center mb-5">
                    <belief.icon className="w-6 h-6 text-[#CC0000]" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">{belief.title}</h3>
                  <p className="text-[#A0A0A8] text-sm leading-relaxed">{belief.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform */}
        <section className="py-24 px-4 bg-[#0A0A0A]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black mb-6" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>The Korex Platform</h2>
            <p className="text-[#A0A0A8] text-lg leading-relaxed">
              Korex Intelligence Systems is a full-stack marketing intelligence platform combining AI strategy generation, analytics interpretation, audience modeling, and content automation into one seamlessly integrated workspace.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-6" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              Join the future of marketing intelligence.
            </h2>
            <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white text-lg font-bold rounded-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(204,0,0,0.3)]">
              Get Started Free <ArrowRight className="w-5 h-5" />
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
