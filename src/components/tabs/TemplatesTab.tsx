import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import ReactSelect from 'react-select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { useGetEmailTemplates, useGetContacts, useAddEmailTemplate, useDeleteEmailTemplate } from '@/hooks/useQueries';
import { EmailTemplateType } from '@/backend';
import { FileText, Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

function CreateTemplateDialog({
    isOpen,
    onClose,
    initialTemplate,
    contacts,
    contactOptions,
    addTemplate
}: {
    isOpen: boolean;
    onClose: () => void;
    initialTemplate: any | null;
    contacts: any[];
    contactOptions: any[];
    addTemplate: any;
}) {
    const [newTemplate, setNewTemplate] = useState({
        contactId: '',
        templateType: EmailTemplateType.generalOutreach,
        subject: '',
        body: '',
        includeJD: false,
        jobDescription: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialTemplate) {
                setNewTemplate({
                    contactId: initialTemplate.contactId,
                    templateType: initialTemplate.templateType,
                    subject: initialTemplate.subject,
                    body: initialTemplate.body,
                    includeJD: false,
                    jobDescription: ''
                });
            } else {
                setNewTemplate({
                    contactId: '',
                    templateType: EmailTemplateType.generalOutreach,
                    subject: '',
                    body: '',
                    includeJD: false,
                    jobDescription: ''
                });
            }
        }
    }, [isOpen, initialTemplate]);

    const handleAddTemplate = async () => {
        if (!newTemplate.contactId || !newTemplate.subject || !newTemplate.body) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const id = initialTemplate ? initialTemplate.id : `template-${Date.now()}`;
            await addTemplate.mutateAsync({
                id,
                contactId: newTemplate.contactId,
                templateType: newTemplate.templateType,
                subject: newTemplate.subject,
                body: newTemplate.body
            });
            toast.success(initialTemplate ? 'Template updated successfully' : 'Template created successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to save template');
        }
    };

    const getContact = (contactId: string) => {
        return contacts?.find((c) => c.id === contactId);
    };

    const handleGenerateTemplate = async () => {
        if (!newTemplate.contactId) {
            toast.error("Please select a contact first.");
            return;
        }

        let contact = null;
        if (newTemplate.contactId !== 'GENERAL') {
            contact = getContact(newTemplate.contactId);
            if (!contact) return;
        }

        const resumeData = localStorage.getItem('resumeData');
        if (!resumeData) {
            toast.error("Please upload a resume in the Upload tab first.");
            return;
        }

        const aiProvider = localStorage.getItem('aiProvider') || 'openai';
        let openAiKey = localStorage.getItem('openAiKey');
        let geminiKey = localStorage.getItem('geminiKey');

        let freeUsesLeftStr = localStorage.getItem('freeUsesLeft');
        let freeUsesLeft = freeUsesLeftStr ? parseInt(freeUsesLeftStr) : 2;
        let usingFreeTier = false;

        if (aiProvider === 'openai' && !openAiKey) {
            if (freeUsesLeft > 0) {
                openAiKey = import.meta.env.VITE_DEV_OPENAI_KEY || '';
                usingFreeTier = true;
            }
            if (!openAiKey) {
                toast.error(freeUsesLeft === 0 ? "You've used your 2 free AI generations! Please enter your OpenAI API Key in the Overview tab." : "Please enter your OpenAI API Key in the Overview tab.");
                return;
            }
        }

        if (aiProvider === 'gemini' && !geminiKey) {
            if (freeUsesLeft > 0) {
                geminiKey = import.meta.env.VITE_DEV_GEMINI_KEY || '';
                usingFreeTier = true;
            }
            if (!geminiKey) {
                toast.error(freeUsesLeft === 0 ? "You've used your 2 free AI generations! Please enter your Gemini API Key in the Overview tab." : "Please enter your Gemini API Key in the Overview tab.");
                return;
            }
        }

        setIsGenerating(true);
        
        try {
            const companyName = contact?.company || "your company";
            
            // Retrieve sample emails and extra info
            let sampleEmailsStr = '';
            try {
                const storedEmails = localStorage.getItem('sampleEmails');
                if (storedEmails) {
                    const emailsArray = JSON.parse(storedEmails);
                    if (emailsArray && emailsArray.length > 0) {
                        sampleEmailsStr = emailsArray.map((e: string, i: number) => `Sample ${i+1}:\n${e}`).join('\n\n');
                    }
                }
            } catch (e) {
                console.error("Failed to parse sample emails", e);
            }
            const extraInfo = localStorage.getItem('extraInfo') || '';

            let systemPrompt = `You are an expert career coach helping a candidate write a cold outreach message to an HR recruiter. `;
            
            if (newTemplate.templateType === EmailTemplateType.linkedinMessage) {
                systemPrompt += `CRITICAL: You are writing a LinkedIn connection request or InMail message, NOT an email. The message must be extremely concise, friendly, and conversational. Limit the length to under 300 characters. If generating a connection request, a subject is not necessary, but if the format requires a JSON subject, use a short phrase like "Connecting on LinkedIn" or "Hello". `;
            } else {
                systemPrompt += `This is a cold outreach email. Keep it professional and confident. `;
            }
            
            if (newTemplate.contactId === 'GENERAL') {
                systemPrompt += `This is a GENERAL REUSABLE template. DO NOT invent or use a specific company name or recruiter name. You MUST use exact placeholders like [Company Name], [Job Title], and [Hiring Manager Name] where appropriate. `;
            } else {
                systemPrompt += `The recruiter is at ${companyName}. Tailor the email to this specific company. `;
            }

            systemPrompt += `Use the following resume data to highlight the candidate's strengths appropriately. Keep the email concise, professional, and confident. `;
            
            if (sampleEmailsStr) {
                systemPrompt += `\n\nAnalyze the following Sample Emails provided by the candidate and strictly mimic their tone, style, and structure:\n${sampleEmailsStr}`;
            }
            if (extraInfo) {
                systemPrompt += `\n\nCRITICAL CUSTOM INSTRUCTIONS (You MUST strictly follow these rules over anything else):\n${extraInfo}`;
            }

            systemPrompt += `\n\nReturn ONLY a JSON object with two keys: "subject" and "body".`;
            
            let userPrompt = `Resume:\n${resumeData}`;
            if (newTemplate.includeJD && newTemplate.jobDescription.trim()) {
                userPrompt += `\n\nJob Description (Tailor the email heavily to address these requirements):\n${newTemplate.jobDescription}`;
            }

            let subject = '';
            let body = '';

            if (aiProvider === 'openai') {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${openAiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        response_format: { type: "json_object" }
                    })
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error?.message || `OpenAI Error ${response.status}`);
                }
                const data = await response.json();
                const parsed = JSON.parse(data.choices[0].message.content);
                subject = parsed.subject;
                body = parsed.body;
            } else {
                const geminiPayload = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
                        generationConfig: { responseMimeType: "application/json" }
                    })
                };
                
                // Attempt gemini-2.5-flash first
                let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, geminiPayload);
                
                // If 2.5 is not available (404), fallback to 1.5-flash
                if (response.status === 404) {
                    console.log("Gemini 2.5 not found, falling back to 1.5-flash...");
                    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, geminiPayload);
                }

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.error?.message || `Gemini Error ${response.status}`);
                }
                const data = await response.json();
                let textContent = data.candidates[0].content.parts[0].text;
                // Clean potential markdown formatting from Gemini's response
                textContent = textContent.replace(/```json/gi, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(textContent);
                subject = parsed.subject || parsed.Subject;
                body = parsed.body || parsed.Body;
            }

            setNewTemplate({ ...newTemplate, subject, body });
            if (usingFreeTier) {
                localStorage.setItem('freeUsesLeft', (freeUsesLeft - 1).toString());
                toast.success(`Template auto-generated! You have ${freeUsesLeft - 1} free uses left.`);
                
                // Dispatch event to update the overview tab free uses counter immediately
                window.dispatchEvent(new Event('freeUsesUpdated'));
            } else {
                toast.success("Template auto-generated successfully!");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(`Generation Failed: ${error.message || "Unknown error"}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialTemplate ? 'Edit Email Template' : 'Create Email Template'}</DialogTitle>
                    <DialogDescription>
                        {initialTemplate ? 'Update your personalized email template' : 'Create a personalized email template for a contact'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="contact">Contact (Searchable)</Label>
                        <ReactSelect
                            id="contact"
                            unstyled
                            classNames={{
                                control: ({ isFocused }) =>
                                    `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background ${isFocused ? 'ring-2 ring-ring ring-offset-2' : ''}`,
                                menu: () =>
                                    "mt-1 rounded-md border bg-popover text-popover-foreground shadow-md z-50",
                                option: ({ isFocused, isSelected }) =>
                                    `relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none ${isFocused ? 'bg-accent text-accent-foreground' : ''} ${isSelected ? 'bg-primary/10 text-primary' : ''}`,
                                singleValue: () => "text-foreground",
                                input: () => "text-foreground",
                                placeholder: () => "text-muted-foreground",
                                noOptionsMessage: () => "p-4 text-center text-sm text-muted-foreground",
                            }}
                            options={contactOptions}
                            value={
                                newTemplate.contactId 
                                    ? contactOptions.find(o => o.value === newTemplate.contactId)
                                    : null
                            }
                            onChange={(selected: any) =>
                                setNewTemplate({ ...newTemplate, contactId: selected?.value || '' })
                            }
                            placeholder="Type to search contacts..."
                            isClearable
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Template Type</Label>
                        <Select
                            value={newTemplate.templateType}
                            onValueChange={(value) =>
                                setNewTemplate({
                                    ...newTemplate,
                                    templateType: value as EmailTemplateType
                                })
                            }
                        >
                            <SelectTrigger id="type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={EmailTemplateType.generalOutreach}>
                                    General Outreach
                                </SelectItem>
                                <SelectItem value={EmailTemplateType.linkedinMessage}>
                                    LinkedIn Message
                                </SelectItem>
                                <SelectItem value={EmailTemplateType.roleSpecific}>
                                    Role-Specific
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-4 pt-2 pb-4 border-b border-border/50">
                        <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/10">
                            <div className="space-y-0.5">
                                <Label className="text-base">Include Job Description</Label>
                                <p className="text-xs text-muted-foreground">
                                    Tailor the AI generated email to a specific job opening.
                                </p>
                            </div>
                            <button
                                onClick={() => setNewTemplate({ ...newTemplate, includeJD: !newTemplate.includeJD })}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${newTemplate.includeJD ? 'bg-primary' : 'bg-input'}`}
                            >
                                <span
                                    className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${newTemplate.includeJD ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                        {newTemplate.includeJD && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                                <Label htmlFor="jd">Job Description / Requirements</Label>
                                <Textarea
                                    id="jd"
                                    placeholder="Paste the job description here..."
                                    value={newTemplate.jobDescription}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, jobDescription: e.target.value })}
                                    rows={5}
                                    className="font-mono text-sm border-primary/20 bg-primary/5"
                                />
                            </div>
                        )}
                    </div>
                    {(newTemplate.templateType === EmailTemplateType.generalOutreach || newTemplate.templateType === EmailTemplateType.linkedinMessage) && !newTemplate.subject && !newTemplate.body ? (
                        <div className="py-4 flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-lg p-6 bg-primary/5">
                            <Sparkles className="h-8 w-8 text-primary mb-3" />
                            <h4 className="font-semibold text-lg text-center">AI Template Generation</h4>
                            <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm leading-relaxed">
                                Automatically generate a tailored outreach email using your uploaded Resume and the contact's company profile.
                            </p>
                            <Button 
                                onClick={handleGenerateTemplate} 
                                disabled={isGenerating || !newTemplate.contactId} 
                                className="w-full gap-2 transition-all duration-300"
                                size="lg"
                            >
                                {isGenerating ? (
                                    'Analyzing Profile & Generating...'
                                ) : (
                                    <><Sparkles className="h-4 w-4" /> Auto-Generate Template</>
                                )}
                            </Button>
                            {!newTemplate.contactId && (
                                <p className="text-xs text-destructive mt-2">Please select a contact first.</p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject Line</Label>
                                <Input
                                    id="subject"
                                    placeholder="Enter email subject"
                                    value={newTemplate.subject}
                                    onChange={(e) =>
                                        setNewTemplate({ ...newTemplate, subject: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="body">Email Body</Label>
                                <Textarea
                                    id="body"
                                    placeholder="Enter email content..."
                                    value={newTemplate.body}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                                    rows={12}
                                    className="font-mono text-sm"
                                />
                            </div>
                            {(newTemplate.templateType === EmailTemplateType.generalOutreach || newTemplate.templateType === EmailTemplateType.linkedinMessage) && (
                                    <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full text-xs text-muted-foreground hover:text-primary mt-2"
                                    onClick={() => setNewTemplate({...newTemplate, subject: '', body: ''})}
                                >
                                    Reset and Regenerate with AI
                                </Button>
                            )}
                        </>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddTemplate} disabled={addTemplate.isPending}>
                        {addTemplate.isPending ? 'Saving...' : (initialTemplate ? 'Save Changes' : 'Create Template')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function TemplatesTab() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);

    const { data: templates, isLoading: templatesLoading } = useGetEmailTemplates();
    const { data: contacts, isLoading: contactsLoading } = useGetContacts();
    const addTemplate = useAddEmailTemplate();
    const deleteTemplate = useDeleteEmailTemplate();

    const isLoading = templatesLoading || contactsLoading;

    const contactOptions = useMemo(() => {
        return [
            { value: 'GENERAL', label: '-- General Template (Reusable) --' },
            ...(contacts?.map((contact) => ({
                value: contact.id,
                label: `${contact.email} - ${contact.company}`
            })) || [])
        ];
    }, [contacts]);

    const handleEdit = (template: any) => {
        setEditingTemplate(template);
        setIsDialogOpen(true);
    };

    const handleDelete = async (templateId: string) => {
        try {
            await deleteTemplate.mutateAsync(templateId);
            toast.success('Template deleted');
        } catch (error) {
            toast.error('Failed to delete template');
        }
    };

    const getContact = (contactId: string) => {
        return contacts?.find((c) => c.id === contactId);
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Alert className="border-orange-500/50 bg-orange-500/10">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-sm">
                    <strong>Note:</strong> AI-powered email generation based on writing style analysis and candidate
                    profile is not yet implemented. Templates can be created manually for now.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Email Templates</CardTitle>
                            <CardDescription>Manage personalized email templates for your contacts</CardDescription>
                        </div>
                        {templates && templates.length > 0 && (
                            <Button className="gap-2" onClick={() => {
                                setEditingTemplate(null);
                                setIsDialogOpen(true);
                            }}>
                                <Plus className="h-4 w-4" />
                                Create Template
                            </Button>
                        )}
                        <CreateTemplateDialog
                            isOpen={isDialogOpen}
                            onClose={() => setIsDialogOpen(false)}
                            initialTemplate={editingTemplate}
                            contacts={contacts || []}
                            contactOptions={contactOptions}
                            addTemplate={addTemplate}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {templates && templates.length > 0 ? (
                        <div className="space-y-4">
                            {templates.map((template) => {
                                const contact = getContact(template.contactId);
                                return (
                                    <Card key={template.id} className="border-muted">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <CardTitle className="text-lg">{template.subject}</CardTitle>
                                                    </div>
                                                    {template.contactId === 'GENERAL' ? (
                                                        <Badge variant="outline" className="text-primary border-primary bg-primary/10 mt-1">General Template (Reusable)</Badge>
                                                    ) : (
                                                        <CardDescription className="flex items-center gap-2">
                                                            To: {contact?.email || 'Unknown'} 
                                                            <Badge variant="outline" className="bg-accent/10 border-accent text-accent-foreground font-semibold">{contact?.company || 'Unknown'}</Badge>
                                                        </CardDescription>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            template.templateType === EmailTemplateType.generalOutreach
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {template.templateType === EmailTemplateType.generalOutreach
                                                            ? 'General Outreach'
                                                            : 'Role-Specific'}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 text-xs gap-1"
                                                        onClick={() => handleEdit(template)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(template.id)}
                                                        disabled={deleteTemplate.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="rounded-md bg-muted p-4">
                                                <p className="whitespace-pre-wrap text-sm font-mono">{template.body}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                            <p className="text-sm text-muted-foreground mb-4 max-w-md">
                                Create your first email template to start your outreach campaign. Templates will be
                                personalized based on your writing style and candidate profile.
                            </p>
                            <Button onClick={() => handleEdit(null)} className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create First Template
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
