# Contributing Guide

This project is a portfolio project demonstrating full-stack development skills. Contributions are welcome!

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open http://localhost:3000 in your browser

## Code Style

This project uses:
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting
- **TypeScript** - Type safety

Run linting and formatting:
```bash
npm run lint
npm run format
```

## Project Architecture

### Frontend Structure
- React components using functional components and hooks
- Type-safe props with TypeScript interfaces
- React Query for server state management
- Tailwind CSS with shadcn/ui for consistent styling

### Backend Structure
- Motoko smart contract for data persistence
- Type-safe data structures and operations
- CSV parsing for bulk imports
- Analytics tracking

## Key Areas for Improvement

### High Priority
1. **Email Sending Integration** - Add SMTP or SendGrid integration
2. **User Authentication** - Implement Internet Identity properly
3. **File Upload Handler** - Complete CSV upload and parsing

### Medium Priority
1. **AI Content Generation** - Integrate with OpenAI or similar
2. **Email Style Analysis** - ML model for learning writing patterns
3. **Advanced Analytics** - Charts and metrics dashboard

### Nice to Have
1. **Email Templates Library** - Pre-built templates
2. **A/B Testing** - Test different email variants
3. **Scheduling** - Advanced scheduling with timezone support
4. **Integrations** - Slack, Discord notifications

## Testing

Currently, the project doesn't have automated tests. Consider adding:
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright

## Deployment

### Frontend
- Deploy to Vercel, Netlify, or AWS S3 + CloudFront
- Build: `npm run build`

### Backend
- Deploy Motoko canister to Internet Computer
- Use `dfx deploy` for deployment

## Code Review Guidelines

When reviewing code:
1. Check TypeScript types are properly defined
2. Ensure components are reusable and follow conventions
3. Verify React Query usage is correct
4. Check accessibility (a11y) standards

## Questions?

Refer to the README.md for project overview and technology stack details.
