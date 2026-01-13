import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Cookies: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold ml-4">Cookie Policy</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">Last updated: January 13, 2026</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">1. What Are Cookies</h2>
            <p className="text-muted-foreground">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">2. How We Use Cookies</h2>
            <p className="text-muted-foreground mb-4">We use cookies for several purposes:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Essential cookies:</strong> Required for the operation of our website</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Functionality cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Authentication cookies:</strong> Keep you logged in securely</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">3. Types of Cookies We Use</h2>
            
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Session Cookies</h3>
            <p className="text-muted-foreground">
              Temporary cookies that expire when you close your browser. They are essential for navigating our website.
            </p>
            
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Persistent Cookies</h3>
            <p className="text-muted-foreground">
              Cookies that remain on your device for a set period or until you delete them. They help us remember your preferences.
            </p>
            
            <h3 className="text-lg font-medium text-foreground mt-6 mb-3">Third-Party Cookies</h3>
            <p className="text-muted-foreground">
              Cookies set by third-party services we use, such as analytics providers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">4. Managing Cookies</h2>
            <p className="text-muted-foreground mb-4">
              You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit a site.
            </p>
            <p className="text-muted-foreground">
              To manage cookies in your browser, please refer to your browser's help documentation or visit aboutcookies.org for more information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">5. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">6. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about our use of cookies, please contact us at privacy@marketai.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Cookies;
