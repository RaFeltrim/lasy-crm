# CRM Lasy AI - Technical Test

<div align="center">
  <img src="./public/logo.png" alt="Lasy AI CRM Logo" width="200"/>
  <h3>A Modern CRM System for Technical Assessment</h3>
  <p>Built with Next.js 14, TypeScript, and Supabase</p>
</div>

## 📋 Project Overview

A comprehensive CRM system developed as part of the technical assessment for the AI Developer position at [Lasy AI](https://vagas.lasy.ai/apply/ai-developer). Based on the [reference project](https://github.com/RaFeltrim/Nova-pasta), enhanced with specific requirements and modern features.

## 🔐 Environment Setup

```env
NEXT_PUBLIC_SUPABASE_URL=https://qxbgltpxqhuhzyjfbcdp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4YmdsdHB4cWh1aHp5amZiY2RwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc3MDM3MSwiZXhwIjoyMDc2MzQ2MzcxfQ.MIpiv8UrBTtba3pJXlxVLbqRCeD4SuMYGb3DwOjWA5U
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/RaFeltrim/lasy-ai-crm.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## 🎯 Core Features

### 1. Authentication & Security
- Supabase Auth integration
- Protected routes with middleware
- Row Level Security (RLS)
- Real-time session management

### 2. Kanban Pipeline
- 5 Lead Stages:
  - New
  - Contacted
  - Qualified
  - Pending
  - Lost
- Drag-and-drop functionality
- Real-time updates
- Stage analytics

### 3. Lead Management
- Comprehensive lead forms
- Data validation
- Import/Export (CSV/XLSX)
- Activity timeline

### 4. Search & Filter System
- Advanced search capabilities
- Multiple filter options
- Real-time results
- Saved searches

## 🛠 Technical Stack

### Frontend
```typescript
// Core Technologies
Next.js 14 (App Router)
TypeScript
shadcn/ui (dark theme)
TailwindCSS

// State Management & Data Fetching
React Query
Zustand
SWR

// UI Components & Interactions
@dnd-kit/core
@tanstack/react-table
react-hook-form
```

### Backend
```typescript
// Database & Authentication
Supabase (PostgreSQL)
Row Level Security
Edge Functions

// API & Validation
API Routes
Zod
OpenAPI
```

## 📁 Project Structure

```
/app
  /api          # API routes
  /auth         # Auth pages
  /dashboard    # Main app pages
  /leads        # Lead management
/components
  /ui           # UI components
  /forms        # Form components
  /layouts      # Layout components
/lib
  /supabase     # Supabase client
  /utils        # Utilities
  /validation   # Zod schemas
```

## 🗄️ Database Schema

```sql
-- Users Table (managed by Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads Table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  status TEXT DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id)
);

-- Interactions Table
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id)
);
```

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

#### 1. Build Errors
```bash
# Clear Next.js cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
npm install

# Run development server
npm run dev
```

#### 2. Supabase Connection Issues
```typescript
// Check connection in utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

#### 3. Authentication Problems
- Clear browser cache and cookies
- Check Supabase dashboard for RLS policies
- Verify environment variables

#### 4. Performance Issues
```typescript
// Implement code splitting
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(
  () => import('../components/Heavy'),
  { loading: () => <p>Loading...</p> }
);
```

#### 5. TypeScript Errors
```typescript
// Update tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 📊 Performance Metrics

- Page Load Time: < 2s
- Time to Interactive: < 3s
- First Contentful Paint: < 1s
- Lighthouse Score: > 90

## 🔒 Security Measures

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  return response;
}
```

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - Mobile: 320px - 480px
  - Tablet: 481px - 768px
  - Desktop: 769px+

## 🧪 Testing

```bash
# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Run coverage
npm run test:coverage
```

## 📦 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details

## 🔗 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## 📞 Support

For support, please check:
1. [Documentation](./Crm-Documentation)
2. [Issues](https://github.com/RaFeltrim/lasy-ai-crm/issues)
3. [Discussions](https://github.com/RaFeltrim/lasy-ai-crm/discussions)

---
Last Updated: 2025-10-27 15:03:31 UTC by @RaFeltrim