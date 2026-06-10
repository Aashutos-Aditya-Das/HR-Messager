import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetContacts, useGetEmailQueue, useGetEmailTemplates } from '@/hooks/useQueries';
import { Users, Mail, Send, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ContactStatus } from '@/backend';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useMemo } from 'react';

function SenderSettingsCard() {
    const [senderEmail, setSenderEmail] = useState('');

    useEffect(() => {
        const savedEmail = localStorage.getItem('senderEmail');
        if (savedEmail) setSenderEmail(savedEmail);
    }, []);

    return (
        <Card className="border-primary/30 shadow-sm bg-accent/5">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Sender Details
                </CardTitle>
                <CardDescription>Configure the email address you will use to send these campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 w-full">
                        <Label htmlFor="senderEmailConfig">Sender Email Address</Label>
                        <Input
                            id="senderEmailConfig"
                            type="email"
                            placeholder="you@company.com"
                            value={senderEmail}
                            onChange={(e) => setSenderEmail(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <Button className="w-full sm:w-auto" onClick={() => {
                        localStorage.setItem('senderEmail', senderEmail);
                        toast.success("Sender email saved successfully!");
                    }}>Save Email</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function LLMSettingsCard() {
    const [openAiKey, setOpenAiKey] = useState('');
    const [geminiKey, setGeminiKey] = useState('');
    const [aiProvider, setAiProvider] = useState('openai');
    const [freeUses, setFreeUses] = useState(2);

    useEffect(() => {
        const savedOpenAi = localStorage.getItem('openAiKey');
        if (savedOpenAi) setOpenAiKey(savedOpenAi);

        const savedGemini = localStorage.getItem('geminiKey');
        if (savedGemini) setGeminiKey(savedGemini);

        const savedProvider = localStorage.getItem('aiProvider');
        if (savedProvider) setAiProvider(savedProvider);

        const savedFreeUses = localStorage.getItem('freeUsesLeft');
        if (savedFreeUses) setFreeUses(parseInt(savedFreeUses));

        const handleFreeUsesUpdate = () => {
            const currentFreeUses = localStorage.getItem('freeUsesLeft');
            if (currentFreeUses) setFreeUses(parseInt(currentFreeUses));
        };
        window.addEventListener('freeUsesUpdated', handleFreeUsesUpdate);
        return () => window.removeEventListener('freeUsesUpdated', handleFreeUsesUpdate);
    }, []);

    return (
        <Card className="border-primary/30 shadow-sm bg-accent/5">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.073zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829v-2.3324a.0757.0757 0 0 1 .0332-.0615l4.854-2.8055a4.4897 4.4897 0 0 1 6.1408 1.6464 4.4803 4.4803 0 0 1 .5346 3.0137l-.142-.0852-4.783-2.7582a.7712.7712 0 0 0-.7806 0zM8.843 5.3061a4.4755 4.4755 0 0 1 2.8764 1.0408l-.1419.0804-4.7783 2.7582a.7948.7948 0 0 0-.3927.6813V16.604l-2.02-1.1686a.071.071 0 0 1-.038-.052V9.8008a4.504 4.504 0 0 1 4.4945-4.4944zm8.9042 2.5895a4.485 4.485 0 0 1-2.3655 1.9728V4.1956a.7664.7664 0 0 0-.3879-.6765l-5.8144-3.3543 2.0201-1.1685a.0757.0757 0 0 1 .071 0l4.8303 2.7865a4.504 4.504 0 0 1 1.6464 6.1128zM12 15.3344l-2.8887-1.6669V10.334L12 8.6672l2.8887 1.6668v3.3334z" />
                    </svg>
                    LLM AI Settings
                </CardTitle>
                <CardDescription>Select your provider and enter your API Key for AI generation.</CardDescription>
            </CardHeader>
            <CardContent>
                {freeUses > 0 && !openAiKey && !geminiKey && (
                    <div className="mb-4 rounded-md bg-primary/10 px-4 py-3 text-sm text-primary font-medium flex items-center justify-between border border-primary/20">
                        <span>You have {freeUses} free AI generation{freeUses > 1 ? 's' : ''} remaining!</span>
                        <span className="text-xs opacity-80">(No API Key required)</span>
                    </div>
                )}
                {freeUses === 0 && !openAiKey && !geminiKey && (
                    <div className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium border border-destructive/20">
                        You have exhausted your free uses. Please provide an API key to continue generating templates.
                    </div>
                )}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 w-full">
                        <Label htmlFor="aiProviderConfig">AI Provider</Label>
                        <Select value={aiProvider} onValueChange={setAiProvider}>
                            <SelectTrigger id="aiProviderConfig">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="openai">OpenAI (GPT-3.5/4)</SelectItem>
                                <SelectItem value="gemini">Google Gemini</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {aiProvider === 'openai' ? (
                        <div className="flex items-center gap-4 w-full">
                            <Label htmlFor="openAiKeyConfig">OpenAI API Key</Label>
                            <Input
                                id="openAiKeyConfig"
                                type="password"
                                placeholder="sk-..."
                                value={openAiKey}
                                onChange={(e) => setOpenAiKey(e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 w-full">
                            <Label htmlFor="geminiKeyConfig">Gemini API Key</Label>
                            <Input
                                id="geminiKeyConfig"
                                type="password"
                                placeholder="AIza..."
                                value={geminiKey}
                                onChange={(e) => setGeminiKey(e.target.value)}
                                autoComplete="off"
                            />
                        </div>
                    )}

                    <Button className="w-full sm:w-auto" onClick={() => {
                        localStorage.setItem('openAiKey', openAiKey);
                        localStorage.setItem('geminiKey', geminiKey);
                        localStorage.setItem('aiProvider', aiProvider);
                        toast.success(`${aiProvider === 'openai' ? 'OpenAI' : 'Gemini'} settings saved successfully!`);
                    }}>Save Settings</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function EmailJSSettingsCard() {
    const [emailJsServiceId, setEmailJsServiceId] = useState('');
    const [emailJsTemplateId, setEmailJsTemplateId] = useState('');
    const [emailJsPublicKey, setEmailJsPublicKey] = useState('');

    useEffect(() => {
        const savedServiceId = localStorage.getItem('emailJsServiceId');
        if (savedServiceId) setEmailJsServiceId(savedServiceId);

        const savedTemplateId = localStorage.getItem('emailJsTemplateId');
        if (savedTemplateId) setEmailJsTemplateId(savedTemplateId);

        const savedPublicKey = localStorage.getItem('emailJsPublicKey');
        if (savedPublicKey) setEmailJsPublicKey(savedPublicKey);
    }, []);

    return (
        <Card className="border-primary/30 shadow-sm bg-accent/5 col-span-1 md:col-span-2">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    EmailJS Settings (Automated Sending)
                </CardTitle>
                <CardDescription>Configure EmailJS to send your cold emails completely in the background without opening an email app.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Label htmlFor="emailJsServiceId">Service ID</Label>
                        <Input
                            id="emailJsServiceId"
                            type="text"
                            placeholder="service_..."
                            value={emailJsServiceId}
                            onChange={(e) => setEmailJsServiceId(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Label htmlFor="emailJsTemplateId">Template ID</Label>
                        <Input
                            id="emailJsTemplateId"
                            type="text"
                            placeholder="template_..."
                            value={emailJsTemplateId}
                            onChange={(e) => setEmailJsTemplateId(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Label htmlFor="emailJsPublicKey">Public Key</Label>
                        <Input
                            id="emailJsPublicKey"
                            type="text"
                            placeholder="Public Key..."
                            value={emailJsPublicKey}
                            onChange={(e) => setEmailJsPublicKey(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                </div>
                <Button className="mt-4 w-full md:w-auto" onClick={() => {
                    localStorage.setItem('emailJsServiceId', emailJsServiceId);
                    localStorage.setItem('emailJsTemplateId', emailJsTemplateId);
                    localStorage.setItem('emailJsPublicKey', emailJsPublicKey);
                    toast.success('EmailJS settings saved successfully!');
                }}>Save EmailJS Keys</Button>
            </CardContent>
        </Card>
    );
}

export function OverviewTab() {
    const { data: contacts, isLoading: contactsLoading } = useGetContacts();
    const { data: templates, isLoading: templatesLoading } = useGetEmailTemplates();
    const { data: queue, isLoading: queueLoading } = useGetEmailQueue();

    const isLoading = contactsLoading || templatesLoading || queueLoading;

    const stats = useMemo(() => ({
        totalContacts: contacts?.length || 0,
        totalTemplates: templates?.length || 0,
        queuedEmails: queue?.filter((item) => item.status === ContactStatus.pending).length || 0,
        sentEmails: contacts?.filter((c) => c.status === ContactStatus.sent || c.status === ContactStatus.responded).length || 0
    }), [contacts, templates, queue]);

    const statusCounts = useMemo(() => ({
        pending: contacts?.filter((c) => c.status === ContactStatus.pending).length || 0,
        sent: contacts?.filter((c) => c.status === ContactStatus.sent).length || 0,
        responded: contacts?.filter((c) => c.status === ContactStatus.responded).length || 0,
        bounced: contacts?.filter((c) => c.status === ContactStatus.bounced).length || 0,
        unsubscribed: contacts?.filter((c) => c.status === ContactStatus.unsubscribed).length || 0
    }), [contacts]);

    if (isLoading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="pb-3">
                            <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <SenderSettingsCard />
                <LLMSettingsCard />
                <EmailJSSettingsCard />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalContacts}</div>
                        <p className="text-xs text-muted-foreground mt-1">HR contacts in database</p>
                    </CardContent>
                </Card>

                <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
                        <Mail className="h-4 w-4 text-accent-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalTemplates}</div>
                        <p className="text-xs text-muted-foreground mt-1">Generated templates</p>
                    </CardContent>
                </Card>

                <Card className="border-chart-2/20 bg-gradient-to-br from-chart-2/5 to-chart-2/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Queued Emails</CardTitle>
                        <Clock className="h-4 w-4 text-chart-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.queuedEmails}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ready to send</p>
                    </CardContent>
                </Card>

                <Card className="border-chart-1/20 bg-gradient-to-br from-chart-1/5 to-chart-1/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
                        <Send className="h-4 w-4 text-chart-1" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{Number(stats.sentEmails)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total sent</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Live Contact Status
                        </CardTitle>
                        <CardDescription>Track where each HR contact is in the pipeline.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
                            <span className="text-sm font-medium text-muted-foreground mb-1">Waiting to Send</span>
                            <span className="text-4xl font-bold">{statusCounts.pending}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-chart-2/10 border border-chart-2/20">
                            <span className="text-sm font-medium text-chart-2 mb-1">Successfully Sent</span>
                            <span className="text-4xl font-bold text-chart-2">{statusCounts.sent}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <span className="text-sm font-medium text-green-500 mb-1">Got a Response!</span>
                            <span className="text-4xl font-bold text-green-500">{statusCounts.responded}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-dashed border-2 bg-muted/20">
                <CardHeader>
                    <CardTitle>How to Use This Tool</CardTitle>
                    <CardDescription>Follow these 4 simple steps to send your cold emails</CardDescription>
                </CardHeader>
                <CardContent>
                    <ol className="space-y-4 text-sm">
                        <li className="flex gap-4 items-start">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                                1
                            </span>
                            <div className="pt-1">
                                <strong className="text-base">Upload Your Stuff:</strong> Go to the Upload tab. Add your list of HR emails, upload your resume, and give the AI some examples of how you write so it can copy your style.
                            </div>
                        </li>
                        <li className="flex gap-4 items-start">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                                2
                            </span>
                            <div className="pt-1">
                                <strong className="text-base">Create AI Templates:</strong> Go to the Templates tab. Choose a contact, optionally paste the Job Description, and click the Auto-Generate button. The AI will write a perfect email for you.
                            </div>
                        </li>
                        <li className="flex gap-4 items-start">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                                3
                            </span>
                            <div className="pt-1">
                                <strong className="text-base">Queue Them Up:</strong> Go to the Queue tab and add your newly created templates to the waiting list.
                            </div>
                        </li>
                        <li className="flex gap-4 items-start">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                                4
                            </span>
                            <div className="pt-1">
                                <strong className="text-base">Send The Emails:</strong> Go to the Queue tab. Click "Send via EmailJS" to send automatically in the background, or click "Copy to Clipboard" to paste the email into your app manually.
                            </div>
                        </li>

                    </ol>
                </CardContent>
            </Card>
        </div>
    );
}
