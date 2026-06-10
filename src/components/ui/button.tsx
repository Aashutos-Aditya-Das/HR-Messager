import { ReactNode } from 'react';

export function Button({
  children,
  className,
  onClick,
  disabled,
  size,
  variant,
  ...props
}: {
  children: ReactNode;
  className?: string;
  onClick?: (e?: any) => void;
  disabled?: boolean;
  size?: string;
  variant?: string;
  [key: string]: any;
}) {
  const sizeClass = size === 'sm' ? 'px-3 py-1 text-sm' : size === 'icon' ? 'h-10 w-10' : 'px-4 py-2';
  const variantClass =
    variant === 'ghost'
      ? 'bg-transparent hover:bg-accent'
      : variant === 'outline'
        ? 'border border-input bg-background hover:bg-accent'
        : 'bg-primary text-primary-foreground hover:bg-primary/90';

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors ${sizeClass} ${variantClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
