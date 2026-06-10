import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { HRContact, EmailTemplate, EmailQueueItem, ContactStatus, EmailTemplateType } from '@/backend';

export function useGetContacts() {
    const { actor, isFetching } = useActor();

    return useQuery<HRContact[]>({
        queryKey: ['contacts'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getContacts();
        },
        staleTime: Infinity,
        enabled: !!actor && !isFetching
    });
}

export function useGetEmailTemplates() {
    const { actor, isFetching } = useActor();

    return useQuery<EmailTemplate[]>({
        queryKey: ['emailTemplates'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getEmailTemplates();
        },
        staleTime: Infinity,
        enabled: !!actor && !isFetching
    });
}

export function useGetEmailQueue() {
    const { actor, isFetching } = useActor();

    return useQuery<EmailQueueItem[]>({
        queryKey: ['emailQueue'],
        queryFn: async () => {
            if (!actor) return [];
            return actor.getEmailQueue();
        },
        staleTime: Infinity,
        enabled: !!actor && !isFetching
    });
}



export function useAddContact() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, email, company }: { id: string; email: string; company: string }) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.addContact(id, email, company);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        }
    });
}

export function useUpdateContactStatus() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }: { id: string; status: ContactStatus }) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.updateContactStatus(id, status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        }
    });
}

export function useDeleteContact() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.deleteContact(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        }
    });
}

export function useAddEmailTemplate() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            contactId,
            templateType,
            subject,
            body
        }: {
            id: string;
            contactId: string;
            templateType: EmailTemplateType;
            subject: string;
            body: string;
        }) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.addEmailTemplate(id, contactId, templateType, subject, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
        }
    });
}

export function useDeleteEmailTemplate() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.deleteEmailTemplate(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
        }
    });
}

export function useQueueEmail() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            contactId,
            templateId,
            scheduledDate
        }: {
            id: string;
            contactId: string;
            templateId: string;
            scheduledDate: bigint;
        }) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.queueEmail(id, contactId, templateId, scheduledDate);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emailQueue'] });
        }
    });
}

export function useDeleteEmailQueueItem() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.deleteEmailQueueItem(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emailQueue'] });
        }
    });
}

export function useBulkUploadContacts() {
    const { actor } = useActor();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (contactList: {email: string, company: string, linkedinUrl?: string}[]) => {
            if (!actor) throw new Error('Actor not initialized');
            return actor.bulkUploadContacts(contactList);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
    });
}
