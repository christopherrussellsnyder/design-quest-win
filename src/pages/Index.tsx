import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Target, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="font-bold text-4xl">MarketAI</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            AI-Powered Marketing Dashboard
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Transform your marketing with intelligent insights and automation
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-16">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time Analytics</h3>
            <p className="text-slate-400">Track your campaign performance with live data and insights</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="w-12 h-12 rounded-lg bg-fuchsia-500/10 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-fuchsia-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Campaigns</h3>
            <p className="text-slate-400">Create and manage campaigns across multiple channels</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Optimization</h3>
            <p className="text-slate-400">Let AI suggest improvements for better ROI</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
