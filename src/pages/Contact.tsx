import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Mail, Clock, DollarSign, Wrench, Handshake, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { KorexLogoLockup } from '@/components/branding/KorexLogoLockup';

const contactReasons = [
  { icon: DollarSign, title: 'Sales & Pricing', description: 'Questions about plans, enterprise, or custom pricing.' },
  { icon: Wrench, title: 'Technical Support', description: 'Help with your account, features, or integrations.' },
  { icon: Handshake, title: 'Partnerships', description: 'Interested in partnering or reselling Korex.' },
];

const allowedSubjects = ['General Inquiry', 'Sales & Pricing', 'Technical Support', 'Partnership', 'Other'];

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setError('Please fill in all required fields.');
      return;
    }

    if (trimmedName.length > 100) {
      setError('Name must be less than 100 characters.');
      return;
    }

    if (trimmedMessage.length > 5000) {
      setError('Message must be less than 5000 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!allowedSubjects.includes(subject)) {
      setError('Please select a valid subject.');
      return;
    }

    // Rate limit: 3 per hour per session
    const now = Date.now();
    const submissions: number[] = JSON.parse(sessionStorage.getItem('contact_submissions') || '[]');
    const recentSubmissions = submissions.filter(t => now - t < 3600000);
    if (recentSubmissions.length >= 3) {
      setError('You\'ve submitted too many messages. Please try again later.');
      return;
    }

    setLoading(true);
    try {
      const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert({ name: trimmedName, email: trimmedEmail, subject, message: trimmedMessage });

      if (dbError) throw dbError;

      recentSubmissions.push(now);
      sessionStorage.setItem('contact_submissions', JSON.stringify(recentSubmissions));
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact | Korex Intelligence Systems</title>
        <meta name="description" content="Get in touch with Korex Intelligence Systems. Questions about features, pricing, or partnerships — our team is ready to help." />
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
              <Link to="/demo" className="hover:text-white transition-colors">Demo</Link>
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/contact" className="text-[#CC0000]">Contact</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-[#A0A0A8] hover:text-white transition-colors">Sign In</Link>
              <Link to="/signup" className="text-sm px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#990000] transition-colors">Get Started</Link>
            </div>
          </div>
        </nav>

        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-black mb-6" style={{ fontFamily: 'Arial Black, sans-serif', letterSpacing: '2px' }}>
                Get In Touch
              </h1>
              <p className="text-[#A0A0A8] text-lg mb-8 leading-relaxed">
                Whether you have a question about features, pricing, enterprise plans, or anything else — our team is ready to help.
              </p>

              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-[#CC0000]" />
                <a href="mailto:support@korexintelligence.com" className="text-[#A0A0A8] hover:text-white transition-colors">
                  support@korexintelligence.com
                </a>
              </div>
              <div className="flex items-center gap-3 mb-10">
                <Clock className="w-5 h-5 text-[#CC0000]" />
                <span className="text-[#6B6B73] text-sm">We typically respond within 24 hours.</span>
              </div>

              <div className="space-y-4">
                {contactReasons.map((reason, i) => (
                  <div key={i} className="bg-[#16171A] border border-[#2A2B2E] rounded-xl p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#CC0000]/10 flex items-center justify-center shrink-0">
                      <reason.icon className="w-5 h-5 text-[#CC0000]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-1">{reason.title}</h3>
                      <p className="text-[#6B6B73] text-xs">{reason.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-[#16171A] border border-[#2A2B2E] rounded-2xl p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                    <Mail className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Your message has been sent.</h3>
                  <p className="text-[#A0A0A8] text-sm">We'll be in touch within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A8] mb-2">Full Name *</label>
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100}
                      className="w-full bg-[#0A0A0A] border border-[#2A2B2E] rounded-lg px-4 py-3 text-white placeholder-[#6B6B73] focus:outline-none focus:border-[#CC0000] transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A8] mb-2">Email Address *</label>
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255}
                      className="w-full bg-[#0A0A0A] border border-[#2A2B2E] rounded-lg px-4 py-3 text-white placeholder-[#6B6B73] focus:outline-none focus:border-[#CC0000] transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A8] mb-2">Subject</label>
                    <select
                      value={subject} onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#2A2B2E] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#CC0000] transition-colors"
                    >
                      {allowedSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#A0A0A8] mb-2">Message *</label>
                    <textarea
                      value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} maxLength={5000}
                      className="w-full bg-[#0A0A0A] border border-[#2A2B2E] rounded-lg px-4 py-3 text-white placeholder-[#6B6B73] focus:outline-none focus:border-[#CC0000] transition-colors resize-none"
                      placeholder="How can we help?"
                    />
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white font-bold rounded-lg hover:shadow-[0_0_20px_rgba(204,0,0,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? 'Sending...' : <>Send Message <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}
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
