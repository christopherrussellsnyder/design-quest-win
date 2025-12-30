import { BarChart3 } from 'lucide-react';

interface EngagementScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function EngagementScore({ score, size = 'md' }: EngagementScoreProps) {
  const getColor = (score: number) => {
    if (score >= 7) return 'text-emerald-400 border-emerald-400 bg-emerald-400/10';
    if (score >= 4) return 'text-amber-400 border-amber-400 bg-amber-400/10';
    return 'text-rose-400 border-rose-400 bg-rose-400/10';
  };
  
  const getLabel = (score: number) => {
    if (score >= 7) return 'Excellent';
    if (score >= 4) return 'Good';
    return 'Needs Work';
  };
  
  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };
  
  return (
    <div className={`inline-flex items-center gap-2 rounded-full border-2 ${getColor(score)} ${sizes[size]} font-semibold`}>
      <BarChart3 className="w-4 h-4" />
      <span>{score}% - {getLabel(score)}</span>
    </div>
  );
}
