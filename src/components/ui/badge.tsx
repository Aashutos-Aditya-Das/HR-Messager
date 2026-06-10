import { ReactNode } from 'react';

export function Badge({
  children,
  className,
  variant,
}: {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}) {
  const variantClass =
    variant === 'secondary'
      ? 'bg-secondary text-secondary-foreground'
      : variant === 'destructive'
        ? 'bg-destructive text-destructive-foreground'
        : variant === 'outline'
          ? 'border border-input bg-background'
          : 'bg-primary text-primary-foreground';

  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClass} ${className || ''}`}>{children}</span>;
}
