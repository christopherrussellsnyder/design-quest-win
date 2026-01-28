import { StrategyOverview, StrategyPost } from '@/hooks/useStrategyGeneration';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function exportStrategyToCSV(
  strategy: StrategyOverview,
  posts: StrategyPost[]
): void {
  const headers = [
    'Day',
    'Date',
    'Time',
    'Type',
    'Theme',
    'Hook',
    'Caption',
    'Hashtags',
    'CTA',
    'Predicted Reach',
    'Predicted Engagement',
  ];

  const rows = posts.map(post => [
    post.day_number.toString(),
    post.post_date,
    post.post_time || '',
    post.post_type || '',
    post.theme || '',
    `"${(post.hook || '').replace(/"/g, '""')}"`,
    `"${(post.caption || '').replace(/"/g, '""')}"`,
    `"${(post.hashtags || []).join(' ')}"`,
    `"${(post.cta || '').replace(/"/g, '""')}"`,
    (post.predicted_reach || '').toString(),
    (post.predicted_engagement || '').toString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${strategy.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast({
    title: 'CSV Exported',
    description: `Strategy exported with ${posts.length} posts.`,
  });
}

export function exportStrategyToJSON(
  strategy: StrategyOverview,
  posts: StrategyPost[]
): void {
  const data = {
    strategy_overview: strategy,
    posts: posts.map(post => ({
      day_number: post.day_number,
      post_date: post.post_date,
      post_time: post.post_time,
      post_type: post.post_type,
      theme: post.theme,
      hook: post.hook,
      caption: post.caption,
      hashtags: post.hashtags,
      cta: post.cta,
      predicted_reach: post.predicted_reach,
      predicted_engagement: post.predicted_engagement,
      rationale: post.rationale,
    })),
  };

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${strategy.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast({
    title: 'JSON Exported',
    description: `Strategy exported with ${posts.length} posts.`,
  });
}

export function generateStrategyMarkdown(
  strategy: StrategyOverview,
  posts: StrategyPost[]
): string {
  let markdown = `# ${strategy.title}\n\n`;
  markdown += `**Platform:** ${strategy.platform}\n`;
  markdown += `**Duration:** ${strategy.duration_days} days\n`;
  markdown += `**Date Range:** ${strategy.start_date} to ${strategy.end_date}\n\n`;

  if (strategy.goals?.length) {
    markdown += `## Goals\n`;
    strategy.goals.forEach(goal => {
      markdown += `- ${goal}\n`;
    });
    markdown += '\n';
  }

  markdown += `## Predicted Metrics\n`;
  markdown += `- **Total Reach:** ${strategy.predicted_metrics?.total_reach?.toLocaleString() || 'N/A'}\n`;
  markdown += `- **Avg Engagement:** ${strategy.predicted_metrics?.avg_engagement_rate || 'N/A'}%\n`;
  markdown += `- **Follower Growth:** +${strategy.predicted_metrics?.expected_follower_growth || 'N/A'}\n\n`;

  markdown += `## Content Calendar\n\n`;

  posts.forEach(post => {
    markdown += `### Day ${post.day_number} - ${post.post_date}\n`;
    markdown += `**Time:** ${post.post_time || 'TBD'} | **Type:** ${post.post_type || 'N/A'} | **Theme:** ${post.theme || 'N/A'}\n\n`;
    
    if (post.hook) {
      markdown += `**Hook:** "${post.hook}"\n\n`;
    }
    
    markdown += `**Caption:**\n${post.caption}\n\n`;
    
    if (post.hashtags?.length) {
      markdown += `**Hashtags:** ${post.hashtags.join(' ')}\n\n`;
    }
    
    if (post.cta) {
      markdown += `**CTA:** ${post.cta}\n\n`;
    }
    
    markdown += `**Predicted:** ${post.predicted_reach?.toLocaleString() || 'N/A'} reach, ${post.predicted_engagement || 'N/A'}% engagement\n\n`;
    markdown += `---\n\n`;
  });

  return markdown;
}

export function copyStrategyMarkdown(
  strategy: StrategyOverview,
  posts: StrategyPost[]
): void {
  const markdown = generateStrategyMarkdown(strategy, posts);
  navigator.clipboard.writeText(markdown);
  
  toast({
    title: 'Copied to Clipboard',
    description: 'Full strategy copied in markdown format.',
  });
}
