# Arogya-AI Frontend Setup

## Project Structure

This is a Next.js 14+ project with TypeScript and App Router, configured for the Arogya-AI Telehealth Platform.

## Installed Dependencies

### Core Framework
- **Next.js 16.0.1** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Component library with the following components:
  - Button
  - Textarea
  - Alert
  - Card
  - Input

### Backend Integration
- **@supabase/supabase-js** - Supabase client for authentication and database

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Getting Started

1. Install dependencies (already done):
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Supabase Client

The Supabase client is initialized in `lib/supabase.ts` and can be imported throughout the application:

```typescript
import { supabase } from '@/lib/supabase'
```

## Next Steps

Refer to the implementation tasks in `.kiro/specs/arogya-ai-telehealth/tasks.md` for the next development steps.
