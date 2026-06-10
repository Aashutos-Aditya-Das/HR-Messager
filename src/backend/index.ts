/**
 * Backend Types and Interfaces
 * These types correspond to the Motoko smart contract definitions
 */

export enum ContactStatus {
  pending = 'pending',
  sent = 'sent',
  responded = 'responded',
  bounced = 'bounced',
  unsubscribed = 'unsubscribed',
}

export enum EmailTemplateType {
  generalOutreach = 'generalOutreach',
  roleSpecific = 'roleSpecific',
  linkedinMessage = 'linkedinMessage',
}

export interface HRContact {
  id: string;
  email: string;
  company: string;
  linkedinUrl?: string;
  status: ContactStatus;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface EmailTemplate {
  id: string;
  contactId: string;
  templateType: EmailTemplateType;
  subject: string;
  body: string;
  status: ContactStatus;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface EmailQueueItem {
  id: string;
  contactId: string;
  templateId: string;
  scheduledDate: bigint;
  status: ContactStatus;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface CampaignAnalytics {
  totalContacts: bigint;
  emailsSent: bigint;
  responsesReceived: bigint;
  bounces: bigint;
  unsubscribes: bigint;
  lastUpdated: bigint;
}

export interface Actor {
  addContact(id: string, email: string, company: string, linkedinUrl?: string): Promise<boolean>;
  updateContactStatus(id: string, status: ContactStatus): Promise<boolean>;
  deleteContact(id: string): Promise<boolean>;
  getContacts(): Promise<HRContact[]>;
  
  addEmailTemplate(
    id: string,
    contactId: string,
    templateType: EmailTemplateType,
    subject: string,
    body: string
  ): Promise<boolean>;
  deleteEmailTemplate(id: string): Promise<boolean>;
  getEmailTemplates(): Promise<EmailTemplate[]>;
  
  queueEmail(
    id: string,
    contactId: string,
    templateId: string,
    scheduledDate: bigint
  ): Promise<boolean>;
  deleteEmailQueueItem(id: string): Promise<boolean>;
  getEmailQueue(): Promise<EmailQueueItem[]>;
  
  updateAnalytics(
    campaignId: string,
    totalContacts: bigint,
    emailsSent: bigint,
    responsesReceived: bigint,
    bounces: bigint,
    unsubscribes: bigint
  ): Promise<boolean>;
  getAnalytics(): Promise<CampaignAnalytics[]>;
  
  uploadContactsFromCSV(csvData: string): Promise<[string, boolean][]>;
  bulkUploadContacts(contactList: {email: string, company: string, linkedinUrl?: string}[]): Promise<boolean>;
  searchContactsByEmail(query: string): Promise<HRContact[]>;
  searchContactsByCompany(query: string): Promise<HRContact[]>;
  getContactCountByStatus(): Promise<[string, bigint][]>;
  getTotalEmailsQueued(): Promise<bigint>;
  getPendingEmailCount(): Promise<bigint>;
}
