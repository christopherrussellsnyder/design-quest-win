import { cn } from '@/lib/utils';

/**
 * Static, refined backdrop for the AI Strategist hub.
 * Fine architectural grid + soft ambient wash — no motion, no gimmicks.
 */
export function AnimatedDotGrid({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Fine line grid */}
      <div className="strategist-grid absolute inset-0" />
      {/* Soft ambient light from the top */}
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.07),transparent_70%)]" />
      {/* Edge vignette to keep focus centered */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,hsl(var(--background))_100%)]" />
    </div>
  );
}
