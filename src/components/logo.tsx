import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 font-bold font-headline', className)}>
      <ShieldCheck className="h-6 w-6 text-primary" />
      <span>PriceWise</span>
    </div>
  );
}
