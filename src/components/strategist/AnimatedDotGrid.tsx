import { cn } from '@/lib/utils';

export function AnimatedDotGrid({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <div className="dot-grid-animated absolute inset-0" />
      {/* Subtle red glow in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
    </div>
  );
}
