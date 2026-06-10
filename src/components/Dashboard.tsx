import React, { useState } from 'react';
import { OverviewTab } from '@/components/tabs/OverviewTab';
import { ContactsTab } from '@/components/tabs/ContactsTab';
import { TemplatesTab } from '@/components/tabs/TemplatesTab';
import { QueueTab } from '@/components/tabs/QueueTab';
import { UploadTab } from '@/components/tabs/UploadTab';
import { LayoutDashboard, Users, FileText, Send, Upload, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const MemoizedOverview = React.memo(OverviewTab);
const MemoizedUpload = React.memo(UploadTab);
const MemoizedContacts = React.memo(ContactsTab);
const MemoizedTemplates = React.memo(TemplatesTab);
const MemoizedQueue = React.memo(QueueTab);

export function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const { theme, setTheme } = useTheme();

    const NavButton = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center justify-start gap-4 px-6 py-4 text-base font-semibold rounded-xl transition-all duration-200 ${
                activeTab === id 
                ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20' 
                : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
        >
            <Icon className="h-6 w-6" /> {label}
        </button>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-background w-full">
            {/* Desktop Sidebar */}
            <aside className="w-[320px] border-r bg-muted/10 flex flex-col hidden md:flex shrink-0">
                <div 
                    className="h-[96px] flex items-center gap-4 px-8 border-b border-border/40 cursor-pointer hover:bg-muted/50 transition-colors" 
                    onClick={() => setActiveTab('overview')}
                >
                    <img src="/favicon.webp" alt="HR Logo" className="h-14 w-14 rounded-lg object-cover shadow-sm" />
                    <span className="font-extrabold text-2xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        HR Messager
                    </span>
                </div>
                
                <div className="flex flex-col flex-1 h-auto w-full bg-transparent gap-3 items-start justify-start px-6 py-8 overflow-y-auto">
                    <NavButton id="overview" icon={LayoutDashboard} label="Overview" />
                    <NavButton id="upload" icon={Upload} label="Upload Data" />
                    <NavButton id="contacts" icon={Users} label="Contact List" />
                    <NavButton id="templates" icon={FileText} label="Templates" />
                    <NavButton id="queue" icon={Send} label="Email Queue" />
                </div>
                
                <div className="mt-auto p-6 border-t border-border/40">
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-4 px-6 py-4 text-base font-semibold rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors" 
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        <div className="relative h-6 w-6 flex items-center justify-center">
                            <Sun className="absolute h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </div>
                        Toggle Theme
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gradient-to-br from-background via-background to-muted/20">
                <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-10">
                    <div className="max-w-5xl mx-auto w-full">
                        <div className="mb-8 md:hidden flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src="/favicon.webp" alt="HR Logo" className="h-10 w-10 rounded-md" />
                                <span className="font-bold text-xl">HR Cold Messager</span>
                            </div>
                        </div>

                        {/* Rendering all tabs and hiding inactive ones with CSS to completely eliminate unmounting latency */}
                        <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
                            <MemoizedOverview />
                        </div>
                        <div className={activeTab === 'upload' ? 'block' : 'hidden'}>
                            <MemoizedUpload />
                        </div>
                        <div className={activeTab === 'contacts' ? 'block' : 'hidden'}>
                            <MemoizedContacts />
                        </div>
                        <div className={activeTab === 'templates' ? 'block' : 'hidden'}>
                            <MemoizedTemplates />
                        </div>
                        <div className={activeTab === 'queue' ? 'block' : 'hidden'}>
                            <MemoizedQueue />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
