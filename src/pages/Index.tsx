import { Link } from 'react-router-dom';
import { TrendingUp, Target, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img src="/korex-wordmark-lockup.svg" alt="Korex Intelligence Systems Logo" className="h-[120px]" />
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Transform your marketing with intelligent insights and automation
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/signup"
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-card/50 border border-border rounded-xl p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-muted-foreground">Track your campaign performance with live data and insights</p>
          </div>
          <div className="bg-card/50 border border-border rounded-xl p-6">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Campaigns</h3>
            <p className="text-muted-foreground">Create and manage campaigns across multiple channels</p>
          </div>
          <div className="bg-card/50 border border-border rounded-xl p-6">
            <div className="w-12 h-12 rounded-lg bg-cyan/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-cyan" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Optimization</h3>
            <p className="text-muted-foreground">Let AI suggest improvements for better ROI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
