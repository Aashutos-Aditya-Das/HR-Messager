import { ReactNode } from 'react';
import * as TabsPrimitive from "@radix-ui/react-tabs";

export function Tabs({
  value,
  onValueChange,
  children,
  className,
  defaultValue,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  className?: string;
  defaultValue?: string;
}) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} defaultValue={defaultValue} className={className}>
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.List
      className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ''}`}
    >
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  onClick,
}: {
  value?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <TabsPrimitive.Trigger
      value={value as string}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:bg-muted/80 ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.Content
      value={value as string}
      forceMount={true}
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=inactive]:hidden ${className || ''}`}
    >
      {children}
    </TabsPrimitive.Content>
  );
}
