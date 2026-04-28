import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Upload, Brain, TrendingUp, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { KorexLogoLockup } from '@/components/branding/KorexLogoLockup';
import korexIcon from '/korex-icon.png';

// REPLACE WITH ACTUAL VIDEO URL WHEN READY
const DEMO_VIDEO_URL: string = '';

const VideoPlayer = () => {
  if (DEMO_VIDEO_URL && DEMO_VIDEO_URL.includes('youtube.com')) {
    const videoId = DEMO_VIDEO_URL.split('v=')[1]?.split('&')[0] || DEMO_VIDEO_URL.split('/').pop();
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        className="w-full aspect-video rounded-2xl"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (DEMO_VIDEO_URL && DEMO_VIDEO_URL.endsWith('.mp4')) {
    return (
      <video controls className="w-full aspect-video rounded-2xl">
        <source src={DEMO_VIDEO_URL} type="video/mp4" />
      </video>
    );
  }

  // Styled placeholder
  return (
    <div className="w-full aspect-video rounded-2xl bg-[#16171A] border border-[#CC0000]/30 flex items-center justify-center relative overflow-hidden"
      style={{ boxShadow: '0 0 40px rgba(204,0,0,0.15)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/10 to-transparent" />
      <div className="relative z-10 text-center">
        <img src="/korex-wordmark-lockup.svg" alt="Korex" className="h-12 mx-auto mb-6 opacity-40" />
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-[#CC0000] flex items-center justify-center mx-auto cursor-pointer shadow-[0_0_30px_rgba(204,0,0,0.4)]"
        >
          <Play className="w-8 h-8 text-white ml-1" fill="white" />
        </motion.div>
        <p className="text-[#6B6B73] text-sm mt-4">Demo video coming soon</p>
      </div>
    </div>
  );
};

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Analytics',
    description: 'Drop in a screenshot or export from any platform. Korex reads and interprets your data automatically.',
  },
  {
    icon: Brain,
    title: 'Get Your Strategy',
    description: 'In seconds, Korex generates a tailored marketing strategy based on your business goals, audience, and performance data.',
  },
  {
    icon: TrendingUp,
    title: 'Execute & Grow',
    description: 'Follow your AI-generated strategy, track performance, and let Korex help you continuously optimize.',
  },
];

export default function Demo() {
  return (
    <>
      <Helmet>
        <title>Demo | Korex Intelligence Systems</title>
        <meta name="description" content="See exactly how Korex turns your analytics and goals into a complete marketing strategy." />
      </Helmet>

      <div className="min-h-screen bg-[#060606] text-[#EEEEEE]">
        {/* Navbar */}
        <nav className="border-b border-[#2A2B2E] px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/">
              <img src="/korex-wordmark-lockup.svg" alt="Korex" className="h-8" />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-[#A0A0A8]">
              <Link to="/features" className="hover:text-white transition-colors">Features</Link>
              <Link to="/demo" className="text-[#CC0000]">Demo</Link>
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

        {/* Hero + Video */}
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-black mb-4" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>
                The Korex Platform Demo
              </h1>
              <p className="text-lg text-[#A0A0A8] max-w-2xl mx-auto">
                See exactly how Korex turns your analytics and goals into a complete marketing strategy.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <VideoPlayer />
            </motion.div>
          </div>
        </section>

        {/* 3-step breakdown */}
        <section className="py-24 px-4 bg-[#0A0A0A]">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="bg-[#16171A] border border-[#2A2B2E] rounded-2xl p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#CC0000] flex items-center justify-center mx-auto mb-5 text-white font-black text-lg shadow-[0_0_20px_rgba(204,0,0,0.3)]">
                    {i + 1}
                  </div>
                  <step.icon className="w-6 h-6 text-[#CC0000] mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                  <p className="text-[#A0A0A8] text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#CC0000]/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black mb-6" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              Ready to Try It Yourself?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white font-bold rounded-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(204,0,0,0.3)]">
                Create Your Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/#pricing" className="text-[#A0A0A8] hover:text-white transition-colors text-sm underline underline-offset-4">
                View Pricing
              </Link>
            </div>
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
