import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Terms: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Korex</title>
        <meta name="description" content="Terms of Service for Korex - Intelligence Systems platform." />
        <meta property="og:title" content="Terms of Service | Korex" />
        <meta property="og:description" content="Read Korex's Terms of Service for using our marketing intelligence platform." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header with Logo */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src="/korex-icon.png" alt="Korex" className="w-8 h-8" />
                <span className="text-xl font-bold text-foreground">Korex</span>
              </Link>
              <nav className="flex items-center gap-4">
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Terms of Service for Korex</h1>
            <p className="text-muted-foreground">Last Updated: January 26, 2026</p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. ACCEPTANCE OF TERMS</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Korex ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. SERVICE DESCRIPTION</h2>
              <p className="text-muted-foreground leading-relaxed">
                Korex is an intelligence-driven marketing platform that allows users to create, schedule, and publish content to social media platforms. The Service uses advanced intelligence algorithms to help optimize content and posting strategies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. USER OBLIGATIONS</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">Users must:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Own or have rights to all content they post through the Service</li>
                <li>Comply with platform Community Guidelines and Terms of Service</li>
                <li>Not use the Service for spam, abuse, or illegal activities</li>
                <li>Provide accurate information when creating an account</li>
                <li>Keep their account credentials secure</li>
                <li>Not attempt to circumvent any security features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. PLATFORM INTEGRATION</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our Service integrates with social media platform APIs to post content on your behalf. By connecting your accounts, you authorize Korex to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                <li>Access your profile information</li>
                <li>Upload and publish content to your accounts</li>
                <li>Access basic analytics about your posts</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                You can revoke this authorization at any time by disconnecting your account in Settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. INTELLECTUAL PROPERTY</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content you create and post remains your property. Korex does not claim ownership of your content. You grant Korex a limited license to process and transmit your content solely for the purpose of posting it to connected platforms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. DATA USAGE AND PRIVACY</h2>
              <p className="text-muted-foreground leading-relaxed">
                We collect and process your data as described in our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>. We do not sell your personal information to third parties. We use your data only to provide and improve the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. DISCLAIMERS</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is provided "as is" without warranties of any kind, express or implied. Korex does not guarantee uninterrupted service, error-free operation, or that the Service will meet your specific requirements. We are not responsible for content posted through the Service or any consequences resulting from such posts.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. LIMITATION OF LIABILITY</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Korex shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. TERMINATION</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account if you violate these Terms or platform policies. You may terminate your account at any time by contacting us or deleting your account in Settings. Upon termination, all scheduled posts will be cancelled.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">10. CHANGES TO TERMS</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may modify these Terms at any time. We will notify users of material changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">11. GOVERNING LAW</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms are governed by the laws of the State of Florida, United States, without regard to conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">12. CONTACT INFORMATION</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For questions about these Terms, contact us at:
              </p>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-foreground mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:support@korex.io" className="text-primary hover:underline">
                    support@korex.io
                  </a>
                </p>
                <p className="text-foreground">
                  <strong>Address:</strong> Bradenton, Florida, United States
                </p>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/30 mt-12">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © 2026 Korex Intelligence Systems. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link to="/terms" className="text-sm text-primary hover:underline">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Terms;