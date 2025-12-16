import { useEffect, useState } from 'react';
import { Zap, Hash, DollarSign, AlertTriangle } from 'lucide-react';
import { getAIService } from '@/services/aiService';
import { useAuth } from '@/contexts/AuthContext';

interface UsageStats {
  thisMonth: { requests: number; tokens: number; cost: number };
  remaining: { requests: number; tokens: number };
  limit: { requests: number; tokens: number };
}

export function UsageStatsBar() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return;
      
      try {
        const aiService = getAIService(user.id);
        const usageStats = await aiService.getUsageStats();
        setStats(usageStats);
      } catch (error) {
        console.error('Failed to load AI usage stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.id]);

  if (loading || !stats) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl mb-6 animate-pulse">
        <div className="h-16 bg-slate-700/50 rounded" />
      </div>
    );
  }

  const requestsPercent = (stats.thisMonth.requests / stats.limit.requests) * 100;
  const tokensPercent = (stats.thisMonth.tokens / stats.limit.tokens) * 100;
  const isNearLimit = requestsPercent > 80 || tokensPercent > 80;

  const getProgressColor = (percent: number) => {
    if (percent > 90) return 'bg-rose-500';
    if (percent > 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-400" />
          AI Usage This Month
        </h3>
        <span className="text-xs text-slate-500">
          Plan: {stats.limit.requests === 100 ? 'Free' : 'Pro'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Requests */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Requests
            </span>
            <span className="text-white font-medium">
              {stats.thisMonth.requests} / {stats.limit.requests}
            </span>
          </div>
          <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor(requestsPercent)}`}
              style={{ width: `${Math.min(requestsPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {stats.remaining.requests} remaining
          </p>
        </div>

        {/* Tokens */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Tokens
            </span>
            <span className="text-white font-medium">
              {stats.thisMonth.tokens.toLocaleString()} / {stats.limit.tokens.toLocaleString()}
            </span>
          </div>
          <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor(tokensPercent)}`}
              style={{ width: `${Math.min(tokensPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {stats.remaining.tokens.toLocaleString()} remaining
          </p>
        </div>

        {/* Cost */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Estimated Cost
            </span>
            <span className="text-white font-medium">
              ${stats.thisMonth.cost.toFixed(4)}
            </span>
          </div>
          <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500" style={{ width: '100%' }} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            This month
          </p>
        </div>
      </div>

      {isNearLimit && (
        <div className="mt-4 bg-amber-900/20 border border-amber-600/30 p-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-amber-400 text-sm">
            You're approaching your monthly limit.{' '}
            <a href="/settings" className="underline hover:text-amber-300">
              Upgrade for more
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
