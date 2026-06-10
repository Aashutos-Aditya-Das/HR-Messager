import OrderedMap "mo:base/OrderedMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import List "mo:base/List";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor HREmailsColdMessager {
  let storage = Storage.new();
  include MixinStorage(storage);

  transient let textMap = OrderedMap.Make<Text>(Text.compare);

  type ContactStatus = {
    #pending;
    #sent;
    #responded;
    #bounced;
    #unsubscribed;
  };

  type HRContact = {
    id : Text;
    email : Text;
    company : Text;
    linkedinUrl : ?Text;
    status : ContactStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type EmailTemplateType = {
    #generalOutreach;
    #roleSpecific;
  };

  type EmailTemplate = {
    id : Text;
    contactId : Text;
    templateType : EmailTemplateType;
    subject : Text;
    body : Text;
    status : ContactStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type EmailQueueItem = {
    id : Text;
    contactId : Text;
    templateId : Text;
    scheduledDate : Time.Time;
    status : ContactStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type CampaignAnalytics = {
    totalContacts : Nat;
    emailsSent : Nat;
    responsesReceived : Nat;
    bounces : Nat;
    unsubscribes : Nat;
    lastUpdated : Time.Time;
  };

  var contacts : OrderedMap.Map<Text, HRContact> = textMap.empty<HRContact>();
  var emailTemplates : OrderedMap.Map<Text, EmailTemplate> = textMap.empty<EmailTemplate>();
  var emailQueue : OrderedMap.Map<Text, EmailQueueItem> = textMap.empty<EmailQueueItem>();
  var analytics : OrderedMap.Map<Text, CampaignAnalytics> = textMap.empty<CampaignAnalytics>();

  public func addContact(id : Text, email : Text, company : Text, linkedinUrl: ?Text) : async Bool {
    let now = Time.now();
    let contact : HRContact = {
      id;
      email;
      company;
      linkedinUrl;
      status = #pending;
      createdAt = now;
      updatedAt = now;
    };
    contacts := textMap.put(contacts, id, contact);
    true;
  };

  public func updateContactStatus(id : Text, status : ContactStatus) : async Bool {
    switch (textMap.get(contacts, id)) {
      case (null) { false };
      case (?contact) {
        let updatedContact = {
          contact with
          status;
          updatedAt = Time.now();
        };
        contacts := textMap.put(contacts, id, updatedContact);
        true;
      };
    };
  };

  public func addEmailTemplate(id : Text, contactId : Text, templateType : EmailTemplateType, subject : Text, body : Text) : async Bool {
    let now = Time.now();
    let template : EmailTemplate = {
      id;
      contactId;
      templateType;
      subject;
      body;
      status = #pending;
      createdAt = now;
      updatedAt = now;
    };
    emailTemplates := textMap.put(emailTemplates, id, template);
    true;
  };

  public func queueEmail(id : Text, contactId : Text, templateId : Text, scheduledDate : Time.Time) : async Bool {
    let now = Time.now();
    let queueItem : EmailQueueItem = {
      id;
      contactId;
      templateId;
      scheduledDate;
      status = #pending;
      createdAt = now;
      updatedAt = now;
    };
    emailQueue := textMap.put(emailQueue, id, queueItem);
    true;
  };

  public func updateAnalytics(campaignId : Text, totalContacts : Nat, emailsSent : Nat, responsesReceived : Nat, bounces : Nat, unsubscribes : Nat) : async Bool {
    let now = Time.now();
    let campaignAnalytics : CampaignAnalytics = {
      totalContacts;
      emailsSent;
      responsesReceived;
      bounces;
      unsubscribes;
      lastUpdated = now;
    };
    analytics := textMap.put(analytics, campaignId, campaignAnalytics);
    true;
  };

  public query func getContacts() : async [HRContact] {
    Iter.toArray(textMap.vals(contacts));
  };

  public query func getEmailTemplates() : async [EmailTemplate] {
    Iter.toArray(textMap.vals(emailTemplates));
  };

  public query func getEmailQueue() : async [EmailQueueItem] {
    Iter.toArray(textMap.vals(emailQueue));
  };

  public query func getAnalytics() : async [CampaignAnalytics] {
    Iter.toArray(textMap.vals(analytics));
  };

  public func deleteContact(id : Text) : async Bool {
    let (newContacts, removedContact) = textMap.remove(contacts, id);
    contacts := newContacts;
    switch (removedContact) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public func deleteEmailTemplate(id : Text) : async Bool {
    let (newTemplates, removedTemplate) = textMap.remove(emailTemplates, id);
    emailTemplates := newTemplates;
    switch (removedTemplate) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public func deleteEmailQueueItem(id : Text) : async Bool {
    let (newQueue, removedItem) = textMap.remove(emailQueue, id);
    emailQueue := newQueue;
    switch (removedItem) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public func deleteEmailTemplate(id : Text) : async Bool {
    let (newTemplates, removedTemplate) = textMap.remove(emailTemplates, id);
    emailTemplates := newTemplates;
    switch (removedTemplate) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public func getContactById(id : Text) : async ?HRContact {
    textMap.get(contacts, id);
  };

  public func getEmailTemplateById(id : Text) : async ?EmailTemplate {
    textMap.get(emailTemplates, id);
  };

  public func getEmailQueueItemById(id : Text) : async ?EmailQueueItem {
    textMap.get(emailQueue, id);
  };

  public func uploadContactsFromCSV(csvData : Text) : async [(Text, Bool)] {
    let lines = Text.split(csvData, #text("\n"));
    let results : [(Text, Bool)] = [];
    var resultList = List.nil<(Text, Bool)>();

    var isFirstLine = true;
    for (line in Iter.fromArray(Iter.toArray(lines))) {
      if (isFirstLine) {
        isFirstLine := false;
      } else {
        if (line.size() > 0) {
          let parts = Text.split(line, #text(","));
          let partsArray = Iter.toArray(parts);
          
          if (partsArray.size() >= 2) {
            let email = Text.trim(partsArray[1], #char(' '));
            let company = if (partsArray.size() > 3) { 
              Text.trim(partsArray[3], #char(' '))
            } else { 
              "" 
            };
            
            let id = "contact-" # email # "-" # Text.fromNat(Nat.randomRange(0, 1000000));
            let contact : HRContact = {
              id;
              email;
              company;
              linkedinUrl = null;
              status = #pending;
              createdAt = Time.now();
              updatedAt = Time.now();
            };
            contacts := textMap.put(contacts, id, contact);
            resultList := List.push((email, true), resultList);
          };
        };
      };
    };
    List.toArray(List.reverse(resultList));
  };

  // NOTE: This assumes standard string format or specific structured data
  // Using this bulk upload from the frontend is preferred over uploadContactsFromCSV
  public func bulkUploadContacts(contactList : [(Text, Text, ?Text)] ) : async Bool {
    let now = Time.now();
    for ((email, company, linkedinUrl) in Iter.fromArray(contactList)) {
      if (email.size() > 0) {
        let id = "contact-" # email # "-" # Text.fromNat(Nat.randomRange(0, 1000000));
        let contact : HRContact = {
          id;
          email;
          company;
          linkedinUrl;
          status = #pending;
          createdAt = now;
          updatedAt = now;
        };
        contacts := textMap.put(contacts, id, contact);
      };
    };
    true;
  };

  public func searchContactsByEmail(query : Text) : async [HRContact] {
    let allContacts = Iter.toArray(textMap.vals(contacts));
    let filtered = Array.filter<HRContact>(allContacts, func(contact) {
      Text.contains(contact.email, #text(query));
    });
    filtered;
  };

  public func searchContactsByCompany(query : Text) : async [HRContact] {
    let allContacts = Iter.toArray(textMap.vals(contacts));
    let filtered = Array.filter<HRContact>(allContacts, func(contact) {
      Text.contains(contact.company, #text(query));
    });
    filtered;
  };

  public func getContactCountByStatus() : async [(Text, Nat)] {
    let allContacts = Iter.toArray(textMap.vals(contacts));
    var pending = 0;
    var sent = 0;
    var responded = 0;
    var bounced = 0;
    var unsubscribed = 0;

    for (contact in Iter.fromArray(allContacts)) {
      switch (contact.status) {
        case (#pending) { pending += 1 };
        case (#sent) { sent += 1 };
        case (#responded) { responded += 1 };
        case (#bounced) { bounced += 1 };
        case (#unsubscribed) { unsubscribed += 1 };
      };
    };

    [
      ("pending", pending),
      ("sent", sent),
      ("responded", responded),
      ("bounced", bounced),
      ("unsubscribed", unsubscribed)
    ];
  };

  public func getTotalEmailsQueued() : async Nat {
    let allQueueItems = Iter.toArray(textMap.vals(emailQueue));
    Array.size(allQueueItems);
  };

  public func getPendingEmailCount() : async Nat {
    let allQueueItems = Iter.toArray(textMap.vals(emailQueue));
    let pending = Array.filter<EmailQueueItem>(allQueueItems, func(item) {
      item.status == #pending;
    });
    Array.size(pending);
  };
};