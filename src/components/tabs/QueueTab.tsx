import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import ReactSelect from 'react-select';
import { Label } from '@/components/ui/label';
import { useGetEmailQueue, useGetContacts, useGetEmailTemplates, useQueueEmail, useDeleteEmailQueueItem, useUpdateContactStatus } from '@/hooks/useQueries';
import { ContactStatus } from '@/backend';
import { Send, Plus, Trash2, Download, Calendar, AlertCircle, Copy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useMemo } from 'react';

function QueueEmailDialog({
    isOpen,
    onClose,
    contactOptions,
    templates,
    queueEmail
}: {
    isOpen: boolean;
    onClose: () => void;
    contactOptions: any[];
    templates: any[] | undefined;
    queueEmail: any;
}) {
    const [newQueueItem, setNewQueueItem] = useState({
        contactId: '',
        templateId: ''
    });

    const handleQueueEmail = async () => {
        if (!newQueueItem.contactId || !newQueueItem.templateId) {
            toast.error('Please select both contact and template');
            return;
        }

        try {
            const id = `queue-${Date.now()}`;
            const scheduledDate = BigInt(Date.now() * 1000000); // Convert to nanoseconds
            await queueEmail.mutateAsync({
                id,
                contactId: newQueueItem.contactId,
                templateId: newQueueItem.templateId,
                scheduledDate
            });
            toast.success('Email added to queue');
            setNewQueueItem({ contactId: '', templateId: '' });
            onClose();
        } catch (error) {
            toast.error('Failed to queue email');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Email to Queue</DialogTitle>
                    <DialogDescription>
                        Select a contact and template to queue for sending
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="queue-contact">Contact (Searchable)</Label>
                        <ReactSelect
                            id="queue-contact"
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
                                newQueueItem.contactId 
                                    ? contactOptions.find(o => o.value === newQueueItem.contactId)
                                    : null
                            }
                            onChange={(selected: any) =>
                                setNewQueueItem({ ...newQueueItem, contactId: selected?.value || '' })
                            }
                            placeholder="Type to search contacts..."
                            isClearable
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="queue-template">Template</Label>
                        <Select
                            value={newQueueItem.templateId}
                            onValueChange={(value) =>
                                setNewQueueItem({ ...newQueueItem, templateId: value })
                            }
                        >
                            <SelectTrigger id="queue-template">
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                {templates
                                    ?.filter((t) => t.contactId === newQueueItem.contactId || t.contactId === 'GENERAL')
                                    .map((template) => (
                                        <SelectItem key={template.id} value={template.id}>
                                            {template.subject} {template.contactId === 'GENERAL' ? '(General)' : ''}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleQueueEmail} disabled={queueEmail.isPending}>
                        {queueEmail.isPending ? 'Adding...' : 'Add to Queue'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function QueueTab() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [viewItem, setViewItem] = useState<any>(null);

    const { data: queue, isLoading: queueLoading } = useGetEmailQueue();
    const { data: contacts, isLoading: contactsLoading } = useGetContacts();
    const { data: templates, isLoading: templatesLoading } = useGetEmailTemplates();
    const queueEmail = useQueueEmail();
    const deleteQueueItem = useDeleteEmailQueueItem();
    const updateContactStatus = useUpdateContactStatus();

    const isLoading = queueLoading || contactsLoading || templatesLoading;

    const pendingCount = queue?.filter((item) => item.status === ContactStatus.pending).length || 0;
    const dailyLimit = 400;

    const handleDelete = async (queueId: string) => {
        try {
            await deleteQueueItem.mutateAsync(queueId);
            toast.success('Email removed from queue');
        } catch (error) {
            toast.error('Failed to remove email from queue');
        }
    };

    const handleSendEmailJS = async (contactId: string, email: string, subject: string, body: string, queueId: string) => {
        const serviceId = localStorage.getItem('emailJsServiceId');
        const templateId = localStorage.getItem('emailJsTemplateId');
        const publicKey = localStorage.getItem('emailJsPublicKey');
        
        if (!serviceId || !templateId || !publicKey) {
            toast.error("Missing EmailJS Keys. Please configure them in the Overview tab.");
            return;
        }

        try {
            await emailjs.send(serviceId, templateId, {
                to_email: email,
                subject: subject,
                message: body,
            }, publicKey);
            
            await updateContactStatus.mutateAsync({ id: contactId, status: ContactStatus.sent });
            await deleteQueueItem.mutateAsync(queueId);
            
            toast.success("Email sent automatically via EmailJS!");
        } catch (error: any) {
            console.error("EmailJS Error:", error);
            // EmailJS usually throws an object with a `text` property (e.g., "The template_id is invalid")
            const errorMsg = error?.text || error?.message || "Check your Keys in the Overview tab.";
            toast.error(`EmailJS Failed: ${errorMsg}`);
        }
    };

    const handleCopyToClipboard = async (contactId: string, subject: string, body: string, _queueId: string) => {
        try {
            await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
            
            await updateContactStatus.mutateAsync({ id: contactId, status: ContactStatus.sent });
            // Do not delete from queue when copying manually per user request
            
            toast.success("Copied to clipboard and marked as Sent!");
        } catch (error) {
            toast.error("Failed to copy to clipboard");
        }
    };

    const handleExport = () => {
        if (!queue || queue.length === 0) {
            toast.error('No emails to export');
            return;
        }

        const csvContent = queue
            .map((item) => {
                const contact = contacts?.find((c) => c.id === item.contactId);
                const template = templates?.find((t) => t.id === item.templateId);
                return `"${contact?.email}","${template?.subject}","${template?.body?.replace(/"/g, '""')}"`;
            })
            .join('\n');

        const blob = new Blob([`Email,Subject,Body\n${csvContent}`], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-queue-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Queue exported successfully');
    };

    const getContact = (contactId: string) => contacts?.find((c) => c.id === contactId);
    const getTemplate = (templateId: string) => templates?.find((t) => t.id === templateId);

    const availableContacts = contacts?.filter(
        (contact) => !queue?.some((item) => item.contactId === contact.id && item.status === ContactStatus.pending)
    );

    const contactOptions = useMemo(() => {
        return availableContacts?.map((contact) => ({
            value: contact.id,
            label: `${contact.email} - ${contact.company}`
        })) || [];
    }, [availableContacts]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Alert className={pendingCount >= dailyLimit ? 'border-destructive/50 bg-destructive/10' : 'border-chart-2/50 bg-chart-2/10'}>
                <AlertCircle className={`h-4 w-4 ${pendingCount >= dailyLimit ? 'text-destructive' : 'text-chart-2'}`} />
                <AlertDescription className="text-sm">
                    <strong>Daily Limit:</strong> {pendingCount} / {dailyLimit} emails queued
                    {pendingCount >= dailyLimit && ' - Daily limit reached!'}
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Email Queue</CardTitle>
                            <CardDescription>Manage emails scheduled for sending (max 400/day)</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleExport} disabled={!queue || queue.length === 0} className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                            <Button className="gap-2" disabled={pendingCount >= dailyLimit} onClick={() => {
                                if (pendingCount >= dailyLimit) {
                                    toast.error(`Daily limit of ${dailyLimit} emails reached`);
                                    return;
                                }
                                setIsDialogOpen(true);
                            }}>
                                <Plus className="h-4 w-4" />
                                Queue Email
                            </Button>
                            <QueueEmailDialog 
                                isOpen={isDialogOpen}
                                onClose={() => setIsDialogOpen(false)}
                                contactOptions={contactOptions}
                                templates={templates}
                                queueEmail={queueEmail}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {queue && queue.length > 0 ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Scheduled</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {queue.map((item) => {
                                        const contact = getContact(item.contactId);
                                        const template = getTemplate(item.templateId);
                                        const scheduledDate = new Date(Number(item.scheduledDate) / 1000000);
                                        return (
                                            <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setViewItem(item)}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{contact?.email}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {contact?.company}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-0 w-full truncate font-medium text-muted-foreground hover:text-foreground transition-colors">
                                                    {template?.subject}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            item.status === ContactStatus.pending
                                                                ? 'secondary'
                                                                : 'default'
                                                        }
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        {scheduledDate.toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (contact?.email && template?.subject && template?.body) {
                                                                    handleSendEmailJS(contact.id, contact.email, template.subject, template.body, item.id);
                                                                } else {
                                                                    toast.error("Missing email or template data");
                                                                }
                                                            }}
                                                        >
                                                            <Send className="h-4 w-4" />
                                                            EmailJS
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="gap-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (contact && template?.subject && template?.body) {
                                                                    handleCopyToClipboard(contact.id, template.subject, template.body, item.id);
                                                                } else {
                                                                    toast.error("Missing template data");
                                                                }
                                                            }}
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                            Copy
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(item.id);
                                                            }}
                                                            disabled={deleteQueueItem.isPending}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Send className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No emails queued</h3>
                            <p className="text-sm text-muted-foreground mb-4 max-w-md">
                                Start adding emails to your queue. You can queue up to 400 emails per day for sending.
                            </p>
                            <Button onClick={() => setIsDialogOpen(true)} className="gap-2" disabled={pendingCount >= dailyLimit}>
                                <Plus className="h-4 w-4" />
                                Queue First Email
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!viewItem} onOpenChange={(isOpen) => { if(!isOpen) setViewItem(null); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Email Details</DialogTitle>
                        <DialogDescription>Review the content before sending.</DialogDescription>
                    </DialogHeader>
                    {viewItem && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2 border-b pb-2">
                                <span className="font-semibold text-sm text-muted-foreground">Send To:</span>
                                <span>{getContact(viewItem.contactId)?.email}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2 border-b pb-2">
                                <span className="font-semibold text-sm text-muted-foreground">Company:</span>
                                <span>{getContact(viewItem.contactId)?.company}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center gap-2 border-b pb-2">
                                <span className="font-semibold text-sm text-muted-foreground">Subject:</span>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="font-medium">{getTemplate(viewItem.templateId)?.subject}</span>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 gap-1"
                                        onClick={() => {
                                            const subject = getTemplate(viewItem.templateId)?.subject || '';
                                            navigator.clipboard.writeText(subject);
                                            toast.success("Subject copied!");
                                        }}
                                    >
                                        <Copy className="h-3 w-3" /> Copy
                                    </Button>
                                </div>
                            </div>
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-sm text-muted-foreground block">Content:</span>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 gap-1"
                                        onClick={() => {
                                            const body = getTemplate(viewItem.templateId)?.body || '';
                                            navigator.clipboard.writeText(body);
                                            toast.success("Content copied!");
                                        }}
                                    >
                                        <Copy className="h-3 w-3" /> Copy
                                    </Button>
                                </div>
                                <div className="rounded-md bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
                                    {getTemplate(viewItem.templateId)?.body}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
