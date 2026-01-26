import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, UserCheck, Mail } from 'lucide-react';

const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 ml-4">
              <img src="/marketai-logo.svg" alt="MarketAI" className="w-8 h-8" />
              <h1 className="text-xl font-bold">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground m-0">
              <strong className="text-foreground">Last Updated:</strong> January 26, 2026
            </p>
          </div>

          <p className="text-muted-foreground mb-8 text-lg">
            At MarketAI, we are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your personal information. This Privacy Policy explains our practices and your rights regarding your data.
          </p>

          {/* Information We Collect */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground m-0">1. Information We Collect</h2>
            </div>
            <p className="text-muted-foreground mb-4">We collect the following types of information to provide and improve our services:</p>
            
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-medium text-foreground mb-2">LinkedIn Profile Data</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 m-0">
                  <li>Your name, profile picture, and headline</li>
                  <li>Professional information (job title, company, industry)</li>
                  <li>Connection count and network statistics</li>
                  <li>OAuth access tokens for posting on your behalf</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-medium text-foreground mb-2">Content You Create</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 m-0">
                  <li>Posts, articles, and content drafts created within MarketAI</li>
                  <li>AI-generated content suggestions and variations</li>
                  <li>Scheduled posts and publishing preferences</li>
                  <li>Media files (images, videos) uploaded for content creation</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-lg font-medium text-foreground mb-2">Usage Analytics</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 m-0">
                  <li>Post performance metrics (impressions, engagement, clicks)</li>
                  <li>Feature usage patterns and preferences</li>
                  <li>Device information and browser type</li>
                  <li>IP address and approximate location</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground m-0">2. How We Use Your Information</h2>
            </div>
            <p className="text-muted-foreground mb-4">Your information is used exclusively to provide and enhance our services:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Post Content on Your Behalf:</strong> We use your LinkedIn authorization to publish scheduled posts and content you approve through our platform.</li>
              <li><strong className="text-foreground">Provide Analytics:</strong> We analyze your post performance to deliver insights, recommendations, and optimization suggestions.</li>
              <li><strong className="text-foreground">AI-Powered Features:</strong> Your content preferences help train and improve our AI content generation to match your voice and style.</li>
              <li><strong className="text-foreground">Improve Services:</strong> Usage data helps us identify issues, develop new features, and enhance user experience.</li>
              <li><strong className="text-foreground">Communications:</strong> We may send service updates, security alerts, and relevant product information.</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground m-0">3. Data Sharing</h2>
            </div>
            <p className="text-muted-foreground mb-4">We are committed to protecting your data and limit sharing to essential services:</p>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
              <p className="text-green-400 font-medium m-0 mb-2">✓ We DO share data with:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 m-0">
                <li><strong className="text-foreground">LinkedIn:</strong> Content and media you explicitly authorize for posting</li>
                <li><strong className="text-foreground">Cloud Infrastructure:</strong> Secure data storage and processing providers</li>
                <li><strong className="text-foreground">AI Providers:</strong> Anonymized content patterns for AI model improvements</li>
              </ul>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 font-medium m-0 mb-2">✗ We NEVER:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 m-0">
                <li>Sell your personal information to third parties</li>
                <li>Share your data for advertising purposes</li>
                <li>Provide your information to data brokers</li>
                <li>Use your content without explicit consent</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground m-0">4. Data Security</h2>
            </div>
            <p className="text-muted-foreground mb-4">We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
              <li><strong className="text-foreground">Access Controls:</strong> Strict role-based access with multi-factor authentication</li>
              <li><strong className="text-foreground">Regular Audits:</strong> Periodic security assessments and penetration testing</li>
              <li><strong className="text-foreground">Secure Infrastructure:</strong> SOC 2 Type II compliant cloud hosting</li>
              <li><strong className="text-foreground">Incident Response:</strong> 24/7 monitoring with rapid incident response protocols</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground m-0">5. Your Rights (GDPR & CCPA Compliant)</h2>
            </div>
            <p className="text-muted-foreground mb-4">You have full control over your personal data. Under GDPR, CCPA, and other privacy regulations, you have the right to:</p>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-1">Right to Access</h4>
                <p className="text-sm text-muted-foreground m-0">Request a copy of all personal data we hold about you</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-1">Right to Deletion</h4>
                <p className="text-sm text-muted-foreground m-0">Request permanent deletion of your account and all associated data</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-1">Right to Rectification</h4>
                <p className="text-sm text-muted-foreground m-0">Correct any inaccurate personal information</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-1">Right to Revocation</h4>
                <p className="text-sm text-muted-foreground m-0">Revoke LinkedIn access and disconnect your account at any time</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-1">Right to Portability</h4>
                <p className="text-sm text-muted-foreground m-0">Export your data in a machine-readable format</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <h4 className="font-medium text-foreground mb-1">Right to Object</h4>
                <p className="text-sm text-muted-foreground m-0">Opt out of data processing for specific purposes</p>
              </div>
            </div>

            <p className="text-muted-foreground mt-4">
              To exercise any of these rights, please contact us at <a href="mailto:privacy@marketai.com" className="text-primary hover:underline">privacy@marketai.com</a>. We will respond within 30 days as required by law.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground m-0">6. Contact Information</h2>
            </div>
            <p className="text-muted-foreground mb-4">For any privacy-related questions or concerns, please reach out to us:</p>
            
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground m-0">Email</p>
                  <a href="mailto:privacy@marketai.com" className="text-primary hover:underline font-medium">privacy@marketai.com</a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground m-0">Data Protection Officer</p>
                  <a href="mailto:dpo@marketai.com" className="text-primary hover:underline font-medium">dpo@marketai.com</a>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground m-0">Mailing Address</p>
                  <p className="text-foreground m-0">MarketAI Privacy Team<br />123 Innovation Drive<br />San Francisco, CA 94102<br />United States</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Notice */}
          <div className="border-t border-border pt-8 mt-12">
            <p className="text-sm text-muted-foreground">
              This Privacy Policy is effective as of January 26, 2026. We may update this policy periodically, and will notify you of any material changes via email or through our platform. Your continued use of MarketAI after such modifications constitutes acceptance of the updated policy.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              MarketAI is committed to compliance with the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and other applicable privacy laws.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
