import { createContext, useContext, useEffect, useState, ReactNode, createElement } from 'react';
import { Actor, HRContact, EmailTemplate, EmailQueueItem, CampaignAnalytics, ContactStatus } from '@/backend';
import Papa from 'papaparse';

interface ActorContextType {
  actor: Actor | null;
  isFetching: boolean;
}

const ActorContext = createContext<ActorContextType | undefined>(undefined);

const getStorage = <T,>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored, (_, v) => {
        if (typeof v === 'string' && /^\d+n$/.test(v)) return BigInt(v.slice(0, -1));
        return v;
    });
  } catch {
    return defaultValue;
  }
};

const setStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() + 'n' : v));
};

export function ActorProvider({ children }: { children: ReactNode }) {
  const [actor, setActor] = useState<Actor | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    let contacts = getStorage<HRContact[]>('hr_contacts', []);
    let templates = getStorage<EmailTemplate[]>('hr_templates', []);
    let queue = getStorage<EmailQueueItem[]>('hr_queue', []);
    let analytics = getStorage<CampaignAnalytics[]>('hr_analytics', [{
        totalContacts: BigInt(0),
        emailsSent: BigInt(0),
        responsesReceived: BigInt(0),
        bounces: BigInt(0),
        unsubscribes: BigInt(0),
        lastUpdated: BigInt(Date.now())
    }]);

    const updateAnalyticsStats = () => {
        analytics[0].totalContacts = BigInt(contacts.length);
        const sent = contacts.filter(c => c.status === ContactStatus.sent).length;
        const responded = contacts.filter(c => c.status === ContactStatus.responded).length;
        const bounced = contacts.filter(c => c.status === ContactStatus.bounced).length;
        const unsubscribed = contacts.filter(c => c.status === ContactStatus.unsubscribed).length;
        analytics[0].emailsSent = BigInt(sent);
        analytics[0].responsesReceived = BigInt(responded);
        analytics[0].bounces = BigInt(bounced);
        analytics[0].unsubscribes = BigInt(unsubscribed);
        analytics[0].lastUpdated = BigInt(Date.now());
        setStorage('hr_analytics', analytics);
    };

    const mockActor: Actor = {
      addContact: async (id, email, company, linkedinUrl) => {
        const contact: HRContact = { id, email, company, linkedinUrl, status: ContactStatus.pending, createdAt: BigInt(Date.now()), updatedAt: BigInt(Date.now()) };
        contacts.push(contact);
        setStorage('hr_contacts', contacts);
        updateAnalyticsStats();
        return true;
      },
      updateContactStatus: async (id, status) => {
        const idx = contacts.findIndex(c => c.id === id);
        if (idx !== -1) {
            contacts[idx].status = status;
            contacts[idx].updatedAt = BigInt(Date.now());
            setStorage('hr_contacts', contacts);
            updateAnalyticsStats();
            return true;
        }
        return false;
      },
      deleteContact: async (id) => {
        contacts = contacts.filter(c => c.id !== id);
        setStorage('hr_contacts', contacts);
        updateAnalyticsStats();
        return true;
      },
      getContacts: async () => [...contacts],
      
      addEmailTemplate: async (id, contactId, templateType, subject, body) => {
        // Find existing template index if any, to avoid duplicates
        const t: EmailTemplate = { id, contactId, templateType, subject, body, status: ContactStatus.pending, createdAt: BigInt(Date.now()), updatedAt: BigInt(Date.now()) };
        templates.push(t);
        setStorage('hr_templates', templates);
        return true;
      },
      deleteEmailTemplate: async (id) => {
        templates = templates.filter(t => t.id !== id);
        setStorage('hr_templates', templates);
        return true;
      },
      getEmailTemplates: async () => [...templates],
      
      queueEmail: async (id, contactId, templateId, scheduledDate) => {
        const q: EmailQueueItem = { id, contactId, templateId, scheduledDate, status: ContactStatus.pending, createdAt: BigInt(Date.now()), updatedAt: BigInt(Date.now()) };
        queue.push(q);
        setStorage('hr_queue', queue);
        return true;
      },
      deleteEmailQueueItem: async (id) => {
        queue = queue.filter(q => q.id !== id);
        setStorage('hr_queue', queue);
        return true;
      },
      getEmailQueue: async () => [...queue],
      
      updateAnalytics: async () => true,
      getAnalytics: async () => {
          updateAnalyticsStats();
          return [...analytics];
      },
      
      uploadContactsFromCSV: async () => [],
      bulkUploadContacts: async (contactList) => {
        const now = BigInt(Date.now());
        const newContacts = contactList.map((c, i) => ({
            id: `contact-${Date.now()}-${i}`,
            email: c.email,
            company: c.company,
            linkedinUrl: c.linkedinUrl,
            status: ContactStatus.pending,
            createdAt: now,
            updatedAt: now
        }));
        contacts = [...contacts, ...newContacts];
        setStorage('hr_contacts', contacts);
        updateAnalyticsStats();
        return true;
      },
      searchContactsByEmail: async (query) => contacts.filter(c => c.email.toLowerCase().includes(query.toLowerCase())),
      searchContactsByCompany: async (query) => contacts.filter(c => c.company.toLowerCase().includes(query.toLowerCase())),
      getContactCountByStatus: async () => {
        const counts: Record<string, number> = {};
        Object.values(ContactStatus).forEach(s => counts[s] = 0);
        contacts.forEach(c => {
            counts[c.status] = (counts[c.status] || 0) + 1;
        });
        return Object.entries(counts).map(([k, v]) => [k, BigInt(v)] as [string, bigint]);
      },
      getTotalEmailsQueued: async () => BigInt(queue.length),
      getPendingEmailCount: async () => BigInt(queue.filter(q => q.status === ContactStatus.pending).length)
    };

    const initialize = async () => {
        if (contacts.length === 0) {
            try {
                const response = await fetch('/datasets/hr_contacts.csv');
                if (response.ok) {
                    const csvText = await response.text();
                    const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
                    const newContacts: {email: string, company: string, linkedinUrl?: string}[] = [];
                    results.data.forEach((row: any) => {
                        let email = row['Email'] || row['email'];
                        let company = row['Company'] || row['company'] || '';
                        let linkedinUrl: string | undefined = undefined;

                        const combinedCell = row['Email & Linkedin Url'] || row['Email & Linkedin URL'];
                        if (combinedCell) {
                            const emailMatch = combinedCell.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
                            const linkedinMatch = combinedCell.match(/http[s]?:\/\/(www\.)?linkedin\.com\/[^\s]+/);
                            
                            if (emailMatch) email = emailMatch[0];
                            if (linkedinMatch) linkedinUrl = linkedinMatch[0];
                        }

                        if (email) {
                            newContacts.push({ email, company, linkedinUrl });
                        }
                    });
                    if (newContacts.length > 0) {
                        await mockActor.bulkUploadContacts(newContacts);
                    }
                }
            } catch (err) {
                console.error("Failed to load initial contacts:", err);
            }
        }
        setActor(mockActor);
        setIsFetching(false);
    };

    initialize();
  }, []);

  return createElement(ActorContext.Provider, { value: { actor, isFetching } }, children);
}

export function useActor() {
  const context = useContext(ActorContext);
  if (context === undefined) {
    throw new Error('useActor must be used within ActorProvider');
  }
  return context;
}
