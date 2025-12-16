import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAIService } from '@/services/aiService';
import { 
  ChevronLeft, Hash, Zap, DollarSign, Clock, CheckCircle, 
  TrendingUp, BarChart3, PieChart, Activity
} from 'lucide-react';

interface UsageLog {
  id: string;
  request_type: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  response_time_ms: number;
  status: string;
  feature: string;
  created_at: string;
}

interface Stats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgResponseTime: number;
  successRate: number;
}

export default function AIAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;

      try {
        const aiService = getAIService(user.id);
        const logsData = await aiService.getUsageLogs(100);
        setLogs(logsData);

        // Calculate stats
        const totalRequests = logsData.length;
        const totalTokens = logsData.reduce((sum: number, log: UsageLog) => sum + (log.total_tokens || 0), 0);
        const totalCost = logsData.reduce((sum: number, log: UsageLog) => sum + parseFloat(log.estimated_cost?.toString() || '0'), 0);
        const avgResponseTime = totalRequests > 0 
          ? logsData.reduce((sum: number, log: UsageLog) => sum + (log.response_time_ms || 0), 0) / totalRequests 
          : 0;
        const successCount = logsData.filter((log: UsageLog) => log.status === 'success').length;
        const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 100;

        setStats({
          totalRequests,
          totalTokens,
          totalCost,
          avgResponseTime,
          successRate,
        });
      } catch (error) {
        console.error('Failed to load AI analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Group logs by request type
  const requestTypeStats = logs.reduce((acc: Record<string, number>, log) => {
    acc[log.request_type] = (acc[log.request_type] || 0) + 1;
    return acc;
  }, {});

  // Group logs by feature
  const featureStats = logs.reduce((acc: Record<string, number>, log) => {
    const feature = log.feature || 'unknown';
    acc[feature] = (acc[feature] || 0) + 1;
    return acc;
  }, {});

  // Group logs by model
  const modelStats = logs.reduce((acc: Record<string, number>, log) => {
    acc[log.model] = (acc[log.model] || 0) + 1;
    return acc;
  }, {});

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-violet-400" />
            <h1 className="text-xl font-bold">AI Usage Analytics</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            title="Total Requests"
            value={stats?.totalRequests || 0}
            icon={<Hash className="w-5 h-5" />}
            color="violet"
          />
          <StatCard
            title="Total Tokens"
            value={(stats?.totalTokens || 0).toLocaleString()}
            icon={<Zap className="w-5 h-5" />}
            color="cyan"
          />
          <StatCard
            title="Total Cost"
            value={`$${(stats?.totalCost || 0).toFixed(4)}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            title="Avg Response"
            value={`${Math.round(stats?.avgResponseTime || 0)}ms`}
            icon={<Clock className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            title="Success Rate"
            value={`${(stats?.successRate || 0).toFixed(1)}%`}
            icon={<CheckCircle className="w-5 h-5" />}
            color="emerald"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* By Request Type */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-violet-400" />
              By Request Type
            </h3>
            <div className="space-y-3">
              {Object.entries(requestTypeStats).map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400 capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-white">{count}</span>
                  </div>
                  <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500"
                      style={{ width: `${(count / logs.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(requestTypeStats).length === 0 && (
                <p className="text-slate-500 text-sm">No data yet</p>
              )}
            </div>
          </div>

          {/* By Feature */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              By Feature
            </h3>
            <div className="space-y-3">
              {Object.entries(featureStats).map(([feature, count]) => (
                <div key={feature}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400 capitalize">{feature.replace('_', ' ')}</span>
                    <span className="text-white">{count}</span>
                  </div>
                  <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500"
                      style={{ width: `${(count / logs.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(featureStats).length === 0 && (
                <p className="text-slate-500 text-sm">No data yet</p>
              )}
            </div>
          </div>

          {/* By Model */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              By Model
            </h3>
            <div className="space-y-3">
              {Object.entries(modelStats).map(([model, count]) => (
                <div key={model}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400 truncate">{model}</span>
                    <span className="text-white">{count}</span>
                  </div>
                  <div className="bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${(count / logs.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {Object.keys(modelStats).length === 0 && (
                <p className="text-slate-500 text-sm">No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-lg font-semibold">Recent Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3">Time</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3">Model</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3">Tokens</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3">Cost</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3">Response</th>
                  <th className="text-left text-xs font-medium text-slate-400 uppercase px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {logs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50">
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white capitalize">
                      {log.request_type?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 truncate max-w-[150px]">
                      {log.model}
                    </td>
                    <td className="px-6 py-4 text-sm text-white">
                      {log.total_tokens?.toLocaleString() || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-emerald-400">
                      ${parseFloat(log.estimated_cost?.toString() || '0').toFixed(5)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {log.response_time_ms}ms
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        log.status === 'success' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No AI requests yet. Generate some content to see analytics here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color: 'violet' | 'cyan' | 'emerald' | 'amber'; 
}) {
  const colors = {
    violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <div className={`${colors[color]} border p-4 rounded-xl`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-sm opacity-80">{title}</p>
    </div>
  );
}
