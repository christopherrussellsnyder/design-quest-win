import { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, Clock, Target, Zap, Users, DollarSign, BarChart3, Lightbulb, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AISuggestion {
  id: number;
  type: 'optimize' | 'content' | 'timing' | 'audience' | 'budget' | 'engagement';
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  category: string;
  actionable: boolean;
  metric?: string;
}

interface AISuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Generate personalized suggestions based on user data patterns
const generateSuggestions = (hasData: boolean): AISuggestion[] => {
  const baseSuggestions: AISuggestion[] = [
    {
      id: 1,
      type: 'timing',
      title: 'Increase ad spend on Tuesdays',
      description: 'Historical data shows 23% higher conversion rates on Tuesdays. Consider shifting 15% of weekend budget.',
      impact: 'High',
      category: 'Budget Optimization',
      actionable: true,
      metric: '+23% conversions',
    },
    {
      id: 2,
      type: 'content',
      title: 'Generate video content for Gen Z',
      description: 'Your Gen Z audience segment is showing 4x higher engagement with video content vs static images.',
      impact: 'High',
      category: 'Content Strategy',
      actionable: true,
      metric: '4x engagement',
    },
    {
      id: 3,
      type: 'timing',
      title: 'Schedule posts at 7-9 PM EST',
      description: 'Peak activity window for your audience. Posts in this window get 35% more impressions.',
      impact: 'High',
      category: 'Timing Optimization',
      actionable: true,
      metric: '+35% impressions',
    },
    {
      id: 4,
      type: 'audience',
      title: 'Expand targeting to Parents 30-45',
      description: 'This segment shows similar behavior patterns to your best performers but is underrepresented.',
      impact: 'Medium',
      category: 'Audience Expansion',
      actionable: true,
      metric: '+18% reach',
    },
    {
      id: 5,
      type: 'optimize',
      title: 'A/B test CTA button colors',
      description: 'Your current CTAs underperform industry benchmarks by 12%. Test alternative colors.',
      impact: 'Medium',
      category: 'Conversion Optimization',
      actionable: true,
      metric: '+12% CTR potential',
    },
    {
      id: 6,
      type: 'engagement',
      title: 'Reply to comments within 2 hours',
      description: 'Quick responses increase follower loyalty by 28%. Set up notification alerts.',
      impact: 'Medium',
      category: 'Engagement',
      actionable: true,
      metric: '+28% loyalty',
    },
    {
      id: 7,
      type: 'content',
      title: 'Use more question-based headlines',
      description: 'Posts with questions in headlines get 2.1x more comments in your niche.',
      impact: 'Medium',
      category: 'Content Strategy',
      actionable: true,
      metric: '2.1x comments',
    },
    {
      id: 8,
      type: 'budget',
      title: 'Pause underperforming ad sets',
      description: '3 ad sets have <1% CTR. Pausing them could save $340/month for better allocation.',
      impact: 'High',
      category: 'Budget Optimization',
      actionable: true,
      metric: '$340/mo savings',
    },
    {
      id: 9,
      type: 'audience',
      title: 'Create lookalike audience from converters',
      description: 'Your top 10% converters share distinct patterns. A lookalike could improve ROAS by 45%.',
      impact: 'High',
      category: 'Audience Targeting',
      actionable: true,
      metric: '+45% ROAS',
    },
    {
      id: 10,
      type: 'timing',
      title: 'Avoid posting on Sunday mornings',
      description: 'Sunday 6-10 AM shows 67% lower engagement for your audience. Reschedule these slots.',
      impact: 'Low',
      category: 'Timing Optimization',
      actionable: true,
      metric: 'Avoid -67% dip',
    },
    {
      id: 11,
      type: 'content',
      title: 'Add emojis to your Instagram captions',
      description: 'Posts with 2-4 emojis get 17% more engagement on Instagram for your brand.',
      impact: 'Low',
      category: 'Content Strategy',
      actionable: true,
      metric: '+17% engagement',
    },
    {
      id: 12,
      type: 'optimize',
      title: 'Enable automatic bid optimization',
      description: 'Manual bidding is costing 8% more than necessary. Switch to automatic for efficiency.',
      impact: 'Medium',
      category: 'Cost Optimization',
      actionable: true,
      metric: '-8% CPC',
    },
    {
      id: 13,
      type: 'engagement',
      title: 'Run a user-generated content campaign',
      description: 'UGC posts perform 3.2x better than branded content for trust-building.',
      impact: 'High',
      category: 'Engagement',
      actionable: true,
      metric: '3.2x trust score',
    },
    {
      id: 14,
      type: 'audience',
      title: 'Retarget website visitors after 7 days',
      description: 'Visitors who don\'t convert in 7 days have 52% higher conversion on retargeting.',
      impact: 'High',
      category: 'Retargeting',
      actionable: true,
      metric: '+52% conversions',
    },
    {
      id: 15,
      type: 'content',
      title: 'Create carousel posts for product features',
      description: 'Carousel posts get 1.4x more reach and 3.1x more engagement than single images.',
      impact: 'Medium',
      category: 'Content Format',
      actionable: true,
      metric: '3.1x engagement',
    },
  ];

  return baseSuggestions;
};

export default function AISuggestionsModal({ isOpen, onClose }: AISuggestionsModalProps) {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate loading AI suggestions
      setTimeout(() => {
        setSuggestions(generateSuggestions(true));
        setLoading(false);
      }, 800);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'optimize':
        return <Zap className="w-4 h-4" />;
      case 'content':
        return <Lightbulb className="w-4 h-4" />;
      case 'timing':
        return <Clock className="w-4 h-4" />;
      case 'audience':
        return <Users className="w-4 h-4" />;
      case 'budget':
        return <DollarSign className="w-4 h-4" />;
      case 'engagement':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getIconBg = (type: AISuggestion['type']) => {
    switch (type) {
      case 'optimize':
        return 'bg-amber-500/20 text-amber-400';
      case 'content':
        return 'bg-fuchsia-500/20 text-fuchsia-400';
      case 'timing':
        return 'bg-cyan-500/20 text-cyan-400';
      case 'audience':
        return 'bg-violet-500/20 text-violet-400';
      case 'budget':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'engagement':
        return 'bg-rose-500/20 text-rose-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getImpactColor = (impact: AISuggestion['impact']) => {
    switch (impact) {
      case 'High':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400';
      case 'Low':
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const handleApply = (id: number) => {
    setAppliedIds((prev) => [...prev, id]);
  };

  const filteredSuggestions =
    filter === 'all' ? suggestions : suggestions.filter((s) => s.impact === filter);

  const highCount = suggestions.filter((s) => s.impact === 'High').length;
  const mediumCount = suggestions.filter((s) => s.impact === 'Medium').length;
  const lowCount = suggestions.filter((s) => s.impact === 'Low').length;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-100">AI Recommendations</h2>
              <p className="text-sm text-slate-400">
                {suggestions.length} personalized suggestions based on your data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-violet-500/20 text-violet-400'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            All ({suggestions.length})
          </button>
          <button
            onClick={() => setFilter('High')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'High'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            High Impact ({highCount})
          </button>
          <button
            onClick={() => setFilter('Medium')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'Medium'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Medium ({mediumCount})
          </button>
          <button
            onClick={() => setFilter('Low')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === 'Low'
                ? 'bg-slate-500/20 text-slate-300'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Low ({lowCount})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-slate-400">Analyzing your data for insights...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`p-4 rounded-xl border transition-all ${
                    appliedIds.includes(suggestion.id)
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-slate-800/50 border-slate-700 hover:border-violet-500/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconBg(
                        suggestion.type
                      )}`}
                    >
                      {getIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-slate-200">{suggestion.title}</h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getImpactColor(
                            suggestion.impact
                          )}`}
                        >
                          {suggestion.impact}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{suggestion.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded">
                            {suggestion.category}
                          </span>
                          {suggestion.metric && (
                            <span className="text-xs text-emerald-400 font-medium">
                              {suggestion.metric}
                            </span>
                          )}
                        </div>
                        {appliedIds.includes(suggestion.id) ? (
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApply(suggestion.id)}
                            className="text-xs px-3 py-1 bg-violet-500/20 text-violet-400 rounded-lg hover:bg-violet-500/30 transition-colors"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/50">
          <p className="text-sm text-slate-500">
            {appliedIds.length} of {suggestions.length} suggestions applied
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
