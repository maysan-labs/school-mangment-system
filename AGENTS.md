# AGENTS.md — AI Agent Operating Playbook

## 1. System & Developer Profile
- **Lead Developer**: Sanjay (`sanjay`)
- **Organization**: Maysan Labs (`maysan-labs`)
- **Runtime Environment**: Windows OS, PowerShell, Node.js 20+, npm
- **Cognitive Memory**: Honcho Cognitive Memory active via MCP (`honcho-memory`) configured in [`.agent/mcp_config.json`](file:///d:/maysanlabs%20projects/school-mangment-system/.agent/mcp_config.json).
- **Memory Store**: [`.agent/memory/`](file:///d:/maysanlabs%20projects/school-mangment-system/.agent/memory/) (`MEMORY.md`, `user-preferences.md`, `project-conventions.md`, `tech-decisions.md`).

---

## 2. Core Architecture & Layer Boundaries

```
src/
├── app/                       # Next.js App Router (Pages, Layouts, Route Handlers)
│   ├── (dashboard)/           # Protected feature domains (academics, students, hr, finance, services, etc.)
│   ├── actions/               # Server Actions (Mutations & Data Access with Supabase)
│   └── login/ portal/ ...     # Authentication and public gateways
├── components/                # UI Presentation Layer
│   ├── ui/                    # Primitive shadcn/ui components
│   ├── shared/                # Universal layout components (Header, Pagination, Stat Cards)
│   └── [domain]/              # Domain-specific components (academics, attendance, hr, etc.)
├── hooks/                     # Reusable client hooks
├── lib/                       # Utilities, Supabase clients, schema validation, stores
│   ├── supabase/              # SSR server/browser clients, middleware, auth utils
│   └── store/                 # Zustand client stores
├── providers/                 # React Context and TanStack Query providers
└── types/                     # Shared TypeScript domain definitions
```

### Layer Rules & Boundaries
1. **Server-First Execution**:
   - Favor Server Components for data fetching and layout composition.
   - Use `'use client'` only at interactive boundaries (forms, charts, interactive state).
2. **Direct Imports (No Barrel Bloat)**:
   - Import directly from target files using the `@/*` alias:
     - Good: `import { Button } from "@/components/ui/button";`
     - Avoid: `import { Button } from "@/components/ui";` or importing through cascading barrel files.
3. **Data Mutation**:
   - Execute database writes through Server Actions in `src/app/actions/` or Supabase SSR server clients.
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` to client components.
4. **Error Handling & Feedback**:
   - Provide toast notifications using `sonner`.
   - Prevent UI crashes using error boundaries and Suspense fallbacks.

---

## 3. Essential Commands & Hygiene Guardrails

| Task | Command | Purpose |
|---|---|---|
| **Type Check** | `npx tsc --noEmit` | Strict TypeScript verification (0 errors required) |
| **Lint** | `npm run lint` | ESLint 9 validation across all source files |
| **Dead Code Audit** | `npm run audit:dead-code` | Knip dependency & code hygiene check |
| **Context Packing** | `npm run context:pack` | Repomix XML context builder for LLM analysis |
| **Pre-Commit** | `npx lefthook run pre-commit` | Runs type-check, lint, and knip in parallel |

---

## 4. Agent Execution Guidelines (Ponytail Senior Mode)
- **Shortest Working Diff**: Do not rewrite functioning modules. Make minimal, surgical edits.
- **Root-Cause Fixes**: Fix issues at the root definition rather than patching individual caller symptoms.
- **Verification Discipline**: Always run `npx tsc --noEmit`, `npm run lint`, and `npm run audit:dead-code` before completing tasks.
