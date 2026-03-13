import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Privacy: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Korex</title>
        <meta name="description" content="Privacy Policy for Korex - Learn how we collect, use, and protect your data when using our marketing intelligence platform." />
        <meta property="og:title" content="Privacy Policy | Korex" />
        <meta property="og:description" content="Read Korex's Privacy Policy to understand how we handle your personal information." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src="/korex-logo-transparent.svg" alt="Korex" className="w-8 h-8" />
                <span className="text-xl font-bold text-foreground">Korex</span>
              </Link>
              <nav className="flex items-center gap-4">
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Privacy Policy for Korex</h1>
            <p className="text-muted-foreground">Last Updated: January 26, 2026</p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. INTRODUCTION</h2>
              <p className="text-muted-foreground leading-relaxed">
                Korex Intelligence Systems ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information when you use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. INFORMATION WE COLLECT</h2>
              
              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.1 Account Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you create an account, we collect your name, email address, and login credentials.
              </p>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.2 Social Account Information</h3>
              <p className="text-muted-foreground leading-relaxed">
                When you connect your social accounts, we collect your username, profile information, and access tokens necessary to post on your behalf.
              </p>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.3 Content Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We store the content you create and schedule, including text, images, and videos.
              </p>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.4 Usage Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We collect information about how you use the Service, including features accessed, posts created, and performance metrics.
              </p>

              <h3 className="text-lg font-medium text-foreground mt-6 mb-3">2.5 Technical Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                We automatically collect IP address, browser type, device information, and cookies for analytics and security purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. HOW WE USE YOUR INFORMATION</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide and maintain the Service</li>
                <li>Post content to social platforms on your behalf</li>
                <li>Analyze and improve the Service</li>
                <li>Communicate with you about your account and updates</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
                <li>Provide customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. DATA SHARING AND DISCLOSURE</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We share your data only in these circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                <li><strong className="text-foreground">With Platforms:</strong> We share necessary data with platform APIs to post content on your behalf</li>
                <li><strong className="text-foreground">With Service Providers:</strong> We use third-party services (hosting, analytics, email) that may access your data to provide their services</li>
                <li><strong className="text-foreground">Legal Requirements:</strong> We may disclose data if required by law or to protect our rights</li>
                <li><strong className="text-foreground">With Your Consent:</strong> We may share data with other parties if you explicitly consent</li>
              </ul>
              <p className="text-primary font-semibold">
                WE DO NOT SELL YOUR PERSONAL INFORMATION TO THIRD PARTIES.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. DATA SECURITY</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement industry-standard security measures to protect your data, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure access controls</li>
                <li>Regular security audits</li>
                <li>Secure credential storage</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. DATA RETENTION</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your data for as long as your account is active or as needed to provide the Service. If you delete your account, we will delete your personal data within 30 days, except where retention is required for legal compliance, dispute resolution, or enforcement of agreements.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. YOUR RIGHTS</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mb-4">
                <li>Access your personal data we hold</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of marketing communications</li>
                <li>Revoke platform authorization at any time</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                To exercise these rights, contact us or use the settings in your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. CHILDREN'S PRIVACY</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Service is not intended for users under 18 years of age. We do not knowingly collect data from children under 18. If we become aware of such collection, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. INTERNATIONAL DATA TRANSFERS</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data may be transferred to and processed in the United States or other countries where our service providers operate. We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">10. COOKIES AND TRACKING</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies for: authentication, preferences, analytics, and security. You can control cookies through your browser settings, but some features may not function properly if cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">11. THIRD-PARTY LINKS</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">12. CHANGES TO THIS POLICY</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">13. GDPR COMPLIANCE (FOR EU USERS)</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are in the European Union, you have additional rights under GDPR including the right to data portability, the right to object to processing, and the right to lodge a complaint with your supervisory authority.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">14. CCPA COMPLIANCE (FOR CALIFORNIA USERS)</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you are a California resident, you have rights under CCPA including the right to know what personal information is collected, the right to delete personal information, and the right to opt out of sale (note: we do not sell personal information).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">15. CONTACT INFORMATION</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For privacy questions or to exercise your rights, contact us at:
              </p>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-foreground mb-2">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacy@korex.io" className="text-primary hover:underline">
                    privacy@korex.io
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
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="text-sm text-primary hover:underline">
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

export default Privacy;