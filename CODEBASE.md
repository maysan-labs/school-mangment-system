# CODEBASE.md — Edu Maysan ERP Architecture & Directory Map

## Tech Stack Overview
- **Framework**: Next.js 16 (App Router, Turbopack) & React 19
- **Language**: TypeScript 6 (Strict mode enabled)
- **Styling**: Tailwind CSS v4 + Radix UI / shadcn/ui primitives + Sonner toasts
- **Backend & Database**: Supabase PostgreSQL with Row Level Security (RLS) + `@supabase/ssr`
- **State Management**: `@tanstack/react-query` v5 (Server state/caching), `zustand` (UI client state)
- **Charts & Reports**: `recharts`, `@react-pdf/renderer`, `jspdf`, `jspdf-autotable`
- **Testing**: Vitest + jsdom
- **Tooling**: Lefthook (Git hooks), Knip (Hygiene/dead code), Repomix (Context packing), ESLint 9

---

## Directory Mapping

```
.
├── .agent/
│   ├── mcp_config.json               # Honcho Cognitive Memory MCP server configuration
│   └── memory/
│       ├── MEMORY.md                 # Cognitive memory index
│       ├── user-preferences.md       # Developer preferences & execution rules
│       ├── project-conventions.md    # Code styling, component patterns, import rules
│       └── tech-decisions.md         # Architecture, DB, security, and stack decisions
├── .agents/workflows/                # Legacy domain workflows & system design documents
├── migrations/                       # PostgreSQL database migration SQL files
├── public/                           # Static assets, branding, and icons
├── scripts/                          # Node.js and TypeScript DB sync, migration, and verification scripts
├── src/
│   ├── app/                          # Next.js App Router root
│   │   ├── (dashboard)/              # Protected application views
│   │   │   ├── academics/            # Timetable, exams, subjects, classes, gradebook
│   │   │   ├── admin/                # Admin overview dashboard
│   │   │   ├── audit/                # Audit trails and compliance tracking
│   │   │   ├── fees/ & finance/      # Fee collection, day-book, payroll, payment gateways
│   │   │   ├── hr/                   # Staff directory, roles, designations, staff attendance
│   │   │   ├── insights/             # Institutional intelligence & analytics
│   │   │   ├── messages/             # Teacher-student-parent messaging portal
│   │   │   ├── notifications/        # User notification feed
│   │   │   ├── parent/               # Dedicated parent dashboard
│   │   │   ├── profile/              # User profile management
│   │   │   ├── reports/              # Report cards, attendance reports, academic transcripts
│   │   │   ├── services/             # Library, transport, alumni, and inventory services
│   │   │   ├── settings/             # System settings & enterprise config
│   │   │   ├── student/              # Dedicated student dashboard
│   │   │   ├── students/             # Student registry, enrollments, attendance, conduct, health
│   │   │   ├── teacher/              # Dedicated teacher dashboard
│   │   │   └── users/                # User administration and RBAC
│   │   ├── actions/                  # Server Actions for DB mutations (students, attendance, fees, etc.)
│   │   ├── login/                    # Authentication login interface
│   │   ├── portal/                   # Role-based redirection portal
│   │   ├── reset-password/           # Password recovery
│   │   ├── unauthorized/             # Access denied fallback
│   │   ├── globals.css               # Tailwind CSS v4 base & design system variables
│   │   └── layout.tsx                # Root layout, theme provider, and font initialization
│   ├── components/
│   │   ├── ui/                       # Reusable shadcn/ui primitives (button, dialog, input, etc.)
│   │   ├── shared/                   # Unified page headers, stat cards, pagination, breadcrumbs
│   │   └── [domain]/                 # Feature components matching dashboard domains
│   ├── hooks/                        # Custom client-side React hooks
│   ├── lib/
│   │   ├── supabase/                 # Supabase client/server setup, middleware, demo protection
│   │   ├── store/                    # Zustand stores (app-store, user-store)
│   │   ├── validations/              # Zod schemas for input validation
│   │   └── utils.ts                  # Classname merging (`cn`) and string formatting
│   ├── providers/                    # React Query and Theme providers
│   ├── styles/                       # Supplementary CSS overrides
│   ├── types/                        # TypeScript type definitions and database schemas
│   ├── proxy.ts                      # Next.js request session updater
│   └── __tests__/                    # Vitest unit test suites
├── knip.json                         # Knip dead code & dependency audit config
├── lefthook.yml                      # Git pre-commit hooks configuration
├── repomix.config.json               # Repomix context packing configuration
└── tsconfig.json                     # TypeScript strict configuration
```

---

## Import Conventions
1. **Direct Path Imports**: Always import directly from destination modules. Do not re-export through generic barrel files.
   ```typescript
   // Correct
   import { Button } from "@/components/ui/button";
   import { createClient } from "@/lib/supabase/client";

   // Avoid
   import { Button } from "@/components";
   ```
2. **Path Aliasing**:
   - `@/*` maps directly to `./src/*`.
