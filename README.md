# HR Emails Cold Messager

A web application that helps job seekers create personalized email campaigns to HR contacts by analyzing communication style and generating targeted outreach emails.

## Features

### Core Functionality
- **Contact Management**: Upload and manage HR contact lists with email addresses and company information
- **Email Templates**: Generate personalized email templates for outreach campaigns
- **Email Queue**: Queue emails for sending with daily limits (400/day)
- **Campaign Analytics**: Track email performance including responses, bounces, and engagement metrics
- **Dark Mode**: Built-in dark/light theme support

### Technical Features
- Modern React with TypeScript
- Real-time data synchronization with React Query
- Internet Identity authentication for secure access
- Responsive design with Tailwind CSS and shadcn/ui components
- Motoko backend on Internet Computer for decentralized storage

## Project Structure

```
HR Emails Cold Messager/
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── tabs/               # Feature tabs
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Dashboard.tsx
│   ├── hooks/
│   │   ├── useQueries.ts       # React Query hooks for data fetching
│   │   └── useInternetIdentity # Internet Identity auth
│   ├── backend/                # Type definitions for Motoko
│   ├── App.tsx
│   ├── main.tsx                # React entry point
│   └── index.css               # Global styles
├── main.mo                     # Motoko backend canister
├── datasets/                   # Sample HR contact data
│   ├── hr_contacts.csv
│   └── HR Curated List BM.csv
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## Setup & Installation

### Prerequisites
- Node.js 16+
- npm or yarn
- DFX (for Internet Computer development)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Data Management

The application supports importing HR contact data from CSV files with the following formats:

### Format 1: Structured (hr_contacts.csv)
```csv
Name,Email,Title,Company
John Doe,john@company.com,HR Manager,Tech Corp
```

### Format 2: Mixed (HR Curated List BM.csv)
```csv
First Name,Last Name,Email & Linkedin Url
John,Doe,john@company.com
http://linkedin.com/in/john-doe
```

## Backend (Motoko)

The application uses a Motoko canister deployed on the Internet Computer to handle:
- Contact storage and management
- Email template creation and management
- Email queue management
- Campaign analytics tracking
- CSV data parsing and bulk upload

### Key Canister Functions

**Contact Management:**
- `addContact(id, email, company)` - Add new HR contact
- `updateContactStatus(id, status)` - Update contact status
- `deleteContact(id)` - Remove contact
- `getContacts()` - Fetch all contacts
- `bulkUploadContacts(contactList)` - Bulk import contacts

**Email Templates:**
- `addEmailTemplate(...)` - Create email template
- `deleteEmailTemplate(id)` - Remove template
- `getEmailTemplates()` - Fetch all templates

**Email Queue:**
- `queueEmail(...)` - Add email to queue
- `deleteEmailQueueItem(id)` - Remove queued email
- `getEmailQueue()` - Fetch queue status

**Analytics:**
- `updateAnalytics(...)` - Update campaign metrics
- `getAnalytics()` - Fetch analytics data

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **React Query** - Data fetching and caching
- **next-themes** - Theme management
- **Sonner** - Toast notifications
- **Lucide React** - Icons

### Backend
- **Motoko** - Smart contract language
- **Internet Computer** - Blockchain platform
- **Blob Storage** - Decentralized file storage

## Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_CANISTER_ID=your_canister_id
VITE_II_URL=https://identity.ic0.app
VITE_HOST=http://localhost:4943
```

## Contact Status Flow

- **Pending** - Initial state after import
- **Sent** - Email has been queued/sent
- **Responded** - HR has replied
- **Bounced** - Email delivery failed
- **Unsubscribed** - Contact opted out

## Usage Workflow

1. **Upload Contacts** - Import HR contact lists from CSV files
2. **Create Templates** - Generate personalized email templates
3. **Queue Emails** - Add emails to the daily queue (up to 400/day)
4. **Track Performance** - Monitor responses, bounces, and engagement
5. **Export Results** - Download queued emails for external sending

## Notes for Portfolio Presentation

### Strengths
- Clean, professional UI with dark mode support
- Proper component organization and reusability
- Type-safe TypeScript implementation
- Decentralized backend using Internet Computer
- Scalable architecture with React Query

### Current Limitations
- Email sending is manual (export to external service)
- AI-powered template generation not implemented
- Style analysis from sample emails not implemented
- PDF parsing not implemented

### Future Enhancements
- Automated email sending via SMTP integration
- AI-powered content generation
- Advanced analytics and A/B testing
- LinkedIn profile integration
- Batch scheduling with timezone support

## License

MIT License - Feel free to use this for your portfolio

## Author

Created as a portfolio project for recruiting demonstration
