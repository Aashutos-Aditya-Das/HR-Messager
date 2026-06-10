# HR Emails Cold Messager

Welcome to the **HR Emails Cold Messager**! This tool is designed to help job seekers instantly generate highly personalized outreach emails and LinkedIn messages to recruiters and hiring managers. 

Instead of sending generic "To Whom It May Concern" emails, you can now effortlessly create tailored messages that highlight your specific skills and fit the tone of the company you are applying to.

## Key Features

- **Instant Contacts Database**: Gain immediate access to thousands of pre-loaded HR contacts and recruiters across various companies.
- **AI-Powered Personalization**: Upload your resume and paste a job description. Our AI will automatically generate a highly targeted outreach message.
- **LinkedIn & Email Ready**: Generate content specifically formatted for a professional email or a short, punchy LinkedIn Connection Request/InMail.
- **Free to Try**: Get started immediately! Your first two AI template generations are completely free. 
- **Bring Your Own Key**: After your free uses, simply enter your own OpenAI or Google Gemini API key to keep generating unlimited templates securely.
- **Easy Copy-Pasting**: 1-click buttons to copy your generated Subject lines and Email Bodies separately so you can quickly paste them into Gmail or LinkedIn.

## How to Use It

1. **Find Your Contact**: Open the tool and search through the pre-loaded contacts by company or recruiter name.
2. **Upload Your Resume**: Go to the Upload tab and provide your latest resume.
3. **Generate a Template**: 
   - Select the contact you want to message.
   - Choose whether you want an **Email** or a **LinkedIn Message**.
   - Paste the specific Job Description (optional).
   - Click "Auto-Generate Template".
4. **Queue & Send**: Review the AI-generated message, queue it up, and use the 1-click copy buttons to send it out!

## Privacy & Security

Your API keys (OpenAI / Gemini) and your Resume data never leave your browser. They are stored securely in your local browser storage and are only sent directly to the AI providers when you request a new template. We do not store or track your personal API keys on any central database.

---

## Developer Guide

If you're a developer looking to study, fork, or modify this project, here is everything you need to know.

### File Structure
```text
HR Emails Cold Messager/
├── public/                 # Static assets served directly
│   └── datasets/           # Pre-loaded HR CSV contacts parsed on first load
├── src/
│   ├── backend/            # Type definitions and Domain Models
│   ├── components/
│   │   ├── tabs/           # Feature-specific tabs (Upload, Templates, Queue, etc.)
│   │   ├── ui/             # Reusable shadcn/ui components (Buttons, Dialogs, etc.)
│   │   ├── Dashboard.tsx   # Main layout routing between tabs
│   │   ├── Header.tsx      # Application header
│   │   └── Footer.tsx      # Application footer
│   ├── hooks/
│   │   ├── useActor.tsx    # Core logic simulating a backend (uses localStorage & fetches CSV)
│   │   └── useQueries.ts   # React Query wrappers over useActor.tsx
│   ├── App.tsx             # Root component initializing the ThemeProvider
│   └── index.css           # Global Tailwind and base styles
├── .env.example            # Example environment file
├── vite.config.ts          # Vite build configuration
├── tailwind.config.js      # Tailwind CSS theme configuration
└── package.json            # Project dependencies and npm scripts
```

### Technical Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Query (for caching queries) & `localStorage` (via `useActor.tsx`)
- **CSV Parsing**: PapaParse

### Running Locally
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory. You can configure your developer keys to enable the "Free Tier" locally without manually entering a key in the UI:
   ```env
   VITE_DEV_OPENAI_KEY=sk-...
   VITE_DEV_GEMINI_KEY=AIza...
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Architecture Overview
This application uses a "Mock Actor" pattern in `src/hooks/useActor.tsx`. Instead of a traditional backend, all data (like queued emails, templates, and contacts) is persisted entirely inside the user's `localStorage`. 
On the very first visit, if `localStorage` is empty, `useActor.tsx` automatically fetches the CSV datasets from `public/datasets/hr_contacts.csv`, parses them using `PapaParse`, and loads them into memory so the user sees thousands of contacts instantly.

If you want to modify how the AI generates templates, look at `handleGenerateTemplate` in `src/components/tabs/TemplatesTab.tsx`. This is where the prompts are constructed and the OpenAI/Gemini APIs are called directly from the client side.
