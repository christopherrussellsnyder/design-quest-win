import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Database, Sparkles, Zap, ArrowRight, Brain, Search, Video,
  Image as ImageIcon, Building2, FileBarChart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { KorexLogoLockup } from '@/components/branding/KorexLogoLockup';

const beliefs = [
  {
    icon: Database,
    title: 'Evidence Beats Opinion',
    description: 'Every recommendation should trace back to a real signal — live search demand, a running competitor ad, or your own performance data.',
  },
  {
    icon: Sparkles,
    title: 'The Process Is the Product',
    description: 'Anyone can output a content calendar. The value is in the research pipeline and the review pass that happen before it is written.',
  },
  {
    icon: Zap,
    title: 'Sophistication Should Be Legible',
    description: 'A deep system is worthless if you cannot understand what it did. We explain the reasoning in plain language, every time.',
  },
];

const capabilities = [
  {
    icon: Brain,
    title: 'Live-Data Strategy Engine',
    description: 'Strategies grounded in real search demand, competitor ad recon, community sentiment, and a crawl of your own product pages — then critiqued and rewritten before delivery.',
  },
  {
    icon: Search,
    title: 'Research Analysis',
    description: 'Industry trend intelligence and personalized market research so you act on what is working now, not last year.',
  },
  {
    icon: Video,
    title: 'AI Video Ads',
    description: 'Script, cast an AI actor and voice, render. Studio-grade UGC-style ads produced inside the same workspace as the strategy that called for them.',
  },
  {
    icon: ImageIcon,
    title: 'AI Image Studio',
    description: 'A two-stage pipeline — cinematic art direction, then flagship rendering — for creative that looks art-directed rather than auto-generated.',
  },
  {
    icon: Building2,
    title: 'Multi-Brand Workspaces',
    description: 'Isolated data, business context, and team seats for every brand or client you run.',
  },
  {
    icon: FileBarChart,
    title: 'White-Label Client Reports',
    description: 'Branded exports and shareable public links that turn raw performance into a deliverable.',
  },
];


export default function About() {
  return (
    <>
      <Helmet>
        <title>About | Korex Intelligence Systems</title>
        <meta name="description" content="Built for marketers who play to win. Learn about Korex Intelligence Systems and our mission to democratize marketing intelligence." />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Navbar */}
        <nav className="border-b border-border px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link to="/">
              <KorexLogoLockup height={32} showTagline={false} />
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/features" className="hover:text-foreground transition-colors">Features</Link>
              <Link to="/demo" className="hover:text-foreground transition-colors">Demo</Link>
              <Link to="/about" className="text-primary">About</Link>
              <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link to="/signup" className="text-sm px-4 py-2 bg-primary text-white rounded-sm hover:bg-[hsl(var(--primary-dark))] transition-colors">Get Started</Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="py-24 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-[56px] font-semibold mb-6">
              Built for Marketers Who{' '}
              <span className="text-primary">Play to Win</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Korex Intelligence Systems was built to give every business access to enterprise-level marketing intelligence.
            </motion.p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 px-4 bg-muted">
          <div className="max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-3xl font-semibold mb-6">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
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
                  className="bg-card border border-border rounded-sm p-8 hover:border-[hsl(var(--primary)/0.5)] transition-all">
                  <div className="w-12 h-12 rounded-sm bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mb-5">
                    <belief.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-3">{belief.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{belief.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform */}
        <section className="py-24 px-4 bg-muted">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-semibold mb-6">The Korex Platform</h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
              Korex Intelligence Systems is a full-stack marketing intelligence platform. It researches your market with live data, builds the strategy, writes the copy, produces the creative, and reports on the results — in one workspace.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              {capabilities.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-card border border-border rounded-sm p-6 hover:border-[hsl(var(--primary)/0.5)] transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <c.icon className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">{c.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{c.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-10">
              <Link to="/features" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                See every feature <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>


        {/* Bottom CTA */}
        <section className="py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.05)] to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
              Join the future of marketing intelligence.
            </h2>
            <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-primary to-[hsl(var(--primary-dark))] text-white text-lg font-bold rounded-sm hover:scale-105 transition-all shadow-[0_0_30px_hsl(var(--primary) / 0.3)]">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t border-border py-8 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[hsl(var(--text-tertiary))]">© 2026 Korex Intelligence Systems. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-[hsl(var(--text-tertiary))]">
              <Link to="/features" className="hover:text-primary transition-colors">Features</Link>
              <Link to="/about" className="hover:text-primary transition-colors">About</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
