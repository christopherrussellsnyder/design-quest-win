import { AlertCircle, TrendingUp, TrendingDown, Lightbulb, CheckCircle, Target, ChevronRight } from 'lucide-react';

interface Insight {
  type: 'warning' | 'success' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actions: string[];
  expectedImpact?: string;
}

interface AnalyticsInsightsProps {
  insights: Insight[];
}

export function AnalyticsInsights({ insights }: AnalyticsInsightsProps) {
  if (!insights || insights.length === 0) return null;
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'success':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'opportunity':
        return <Lightbulb className="w-5 h-5 text-blue-400" />;
      default:
        return <Target className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-yellow-500';
      case 'success': return 'border-l-green-500';
      case 'opportunity': return 'border-l-blue-500';
      default: return 'border-l-border';
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-500/5';
      case 'success': return 'bg-green-500/5';
      case 'opportunity': return 'bg-blue-500/5';
      default: return 'bg-muted';
    }
  };
  
  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Smart Insights</h3>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, idx) => (
          <div 
            key={idx} 
            className={`border-l-4 ${getBorderColor(insight.type)} ${getBackgroundColor(insight.type)} rounded-r-lg p-4`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-foreground">{insight.title}</h4>
                  {insight.expectedImpact && (
                    <span className="text-sm font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                      {insight.expectedImpact}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Recommended Actions:</p>
                  <ul className="space-y-1">
                    {insight.actions.map((action, aidx) => (
                      <li key={aidx} className="flex items-start gap-2 text-sm text-foreground/80">
                        <ChevronRight className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
