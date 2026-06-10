import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { Dashboard } from '@/components/Dashboard';

export default function App() {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Dashboard />
            <Toaster toastOptions={{ className: 'text-base font-medium p-4' }} position="bottom-right" />
        </ThemeProvider>
    );
}
