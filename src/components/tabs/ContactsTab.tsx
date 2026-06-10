import { useState, useDeferredValue } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useGetContacts, useUpdateContactStatus, useDeleteContact, useAddContact } from '@/hooks/useQueries';
import { ContactStatus } from '@/backend';
import { Search, Trash2, Plus, Building2, Linkedin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

function AddContactDialog({ addContact }: { addContact: any }) {
    const [newContact, setNewContact] = useState({ email: '', company: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddContact = async () => {
        if (!newContact.email || !newContact.company) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const id = `contact-${Date.now()}`;
            await addContact.mutateAsync({
                id,
                email: newContact.email,
                company: newContact.company
            });
            toast.success('Contact added successfully');
            setNewContact({ email: '', company: '' });
            setIsDialogOpen(false);
        } catch (error) {
            toast.error('Failed to add contact');
        }
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Contact
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Contact</DialogTitle>
                    <DialogDescription>Add a new HR contact to your list</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="hr@company.com"
                            value={newContact.email}
                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                            id="company"
                            placeholder="Company Inc."
                            value={newContact.company}
                            onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddContact} disabled={addContact.isPending}>
                        {addContact.isPending ? 'Adding...' : 'Add Contact'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function ContactsTab() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: contacts, isLoading } = useGetContacts();
    const updateStatus = useUpdateContactStatus();
    const deleteContact = useDeleteContact();
    const addContact = useAddContact();

    const deferredSearchQuery = useDeferredValue(searchQuery);

    const filteredContacts = contacts?.filter((contact) => {
        const matchesSearch =
            contact.email.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
            contact.company.toLowerCase().includes(deferredSearchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleStatusChange = async (contactId: string, newStatus: ContactStatus) => {
        try {
            await updateStatus.mutateAsync({ id: contactId, status: newStatus });
            toast.success('Contact status updated');
        } catch (error) {
            toast.error('Failed to update contact status');
        }
    };

    const handleDelete = async (contactId: string) => {
        try {
            await deleteContact.mutateAsync(contactId);
            toast.success('Contact deleted');
        } catch (error) {
            toast.error('Failed to delete contact');
        }
    };

    const getStatusBadge = (status: ContactStatus) => {
        const variants: Record<ContactStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
            [ContactStatus.pending]: { variant: 'secondary', label: 'Pending' },
            [ContactStatus.sent]: { variant: 'default', label: 'Sent' },
            [ContactStatus.responded]: { variant: 'outline', label: 'Responded' },
            [ContactStatus.bounced]: { variant: 'destructive', label: 'Bounced' },
            [ContactStatus.unsubscribed]: { variant: 'destructive', label: 'Unsubscribed' }
        };
        const config = variants[status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

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
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>HR Contacts</CardTitle>
                            <CardDescription>Manage your HR email contact list</CardDescription>
                        </div>
                        <AddContactDialog addContact={addContact} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by email or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value={ContactStatus.pending}>Pending</SelectItem>
                                <SelectItem value={ContactStatus.sent}>Sent</SelectItem>
                                <SelectItem value={ContactStatus.responded}>Responded</SelectItem>
                                <SelectItem value={ContactStatus.bounced}>Bounced</SelectItem>
                                <SelectItem value={ContactStatus.unsubscribed}>Unsubscribed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>LinkedIn</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredContacts && filteredContacts.length > 0 ? (
                                    filteredContacts.map((contact) => (
                                        <TableRow key={contact.id}>
                                            <TableCell className="font-medium">{contact.email}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    {contact.company || <span className="text-muted-foreground italic">N/A</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {contact.linkedinUrl ? (
                                                    <a href={contact.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center">
                                                        <Linkedin className="h-4 w-4" />
                                                    </a>
                                                ) : (
                                                    <span className="text-muted-foreground italic text-xs">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={contact.status}
                                                    onValueChange={(value) =>
                                                        handleStatusChange(contact.id, value as ContactStatus)
                                                    }
                                                    disabled={updateStatus.isPending}
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        {getStatusBadge(contact.status)}
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={ContactStatus.pending}>Pending</SelectItem>
                                                        <SelectItem value={ContactStatus.sent}>Sent</SelectItem>
                                                        <SelectItem value={ContactStatus.responded}>
                                                            Responded
                                                        </SelectItem>
                                                        <SelectItem value={ContactStatus.bounced}>Bounced</SelectItem>
                                                        <SelectItem value={ContactStatus.unsubscribed}>
                                                            Unsubscribed
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(contact.id)}
                                                    disabled={deleteContact.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                            No contacts found. Add contacts or adjust your filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {filteredContacts && filteredContacts.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            Showing {filteredContacts.length} of {contacts?.length || 0} contacts
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
