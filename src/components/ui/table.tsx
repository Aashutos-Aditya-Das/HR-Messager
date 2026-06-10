import { ReactNode } from 'react';

export function Table({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="w-full overflow-auto">
      <table className={`w-full caption-bottom text-sm ${className || ''}`}>{children}</table>
    </div>
  );
}

export function TableHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <thead className={`border-b ${className || ''}`}>{children}</thead>;
}

export function TableBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <tbody className={`[&_tr:last-child]:border-0 ${className || ''}`}>{children}</tbody>;
}

export function TableRow({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement> & {
  children?: ReactNode;
  className?: string;
}) {
  return <tr className={`border-b transition-colors hover:bg-muted/50 ${className || ''}`} {...props}>{children}</tr>;
}

export function TableHead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className || ''}`}>{children}</th>;
}

export function TableCell({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}) {
  return <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`} {...props}>{children}</td>;
}
