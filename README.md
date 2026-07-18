# Money Tracker

Personal finance / money tracking system: Next.js 15 (App Router) + TypeScript +
TailwindCSS + Prisma + PostgreSQL + Recharts.

## What this implements

- **Prisma schema** (`prisma/schema.prisma`) — Users, Banks, Accounts (Income /
  Daily / Outlay / Saving / Liability buckets), Categories, Transactions, People
  (debtors), Liabilities, MonthlyAllocationStatus, Settings.
- **Allocation Service** (`src/services/allocation.service.ts`) — the core
  business rule: Job income first tops up Ryt Invest SavePlus (RM100/month) then
  ASNB (RM600/month) via a waterfall, then splits whatever remains
  Daily 10% / Outlay 70% / Saving 10% / Liability 10%, with Liability further
  split Father/iPhone 50/50. Pure function, fully unit tested
  (`allocation.service.test.ts`) against both spec examples (RM1000 fresh month,
  RM600 with targets already met) plus edge cases and invariants.
- **Clean layering**: `services/` (business logic, no I/O) →
  `repositories/` (Prisma access per entity) → `app/api/*/route.ts` (HTTP +
  Zod validation) → `components/` (UI) → `app/*/page.tsx` (pages, mostly
  server components).
- **Pages**: Dashboard (total balance + bank slider + liability progress),
  Income (Job auto-split form + manual Allowance/Debtor/Other form),
  Transactions, Accounts, Banks, People (debtor ledger), Liabilities, Reports
  (bar chart + table, grouped by month/bank/category/person), Settings
  (edit split % and targets — no code changes needed).
- **Seed script** (`prisma/seed.ts`) — creates the 5 banks, all buckets,
  every category from the spec, the Father/iPhone liabilities, and a demo
  person, idempotently.

## Setup

```bash
npm install
cp .env.example .env        # then fill in your real DATABASE_URL
npm run db:generate
npm run db:migrate          # creates the schema in Postgres
npm run db:seed             # populates banks/categories/liabilities
npm run dev                 # http://localhost:3000
```

Run the allocation engine's unit tests any time with:

```bash
npm test
```

## Auth

This scaffold runs in **single-user demo mode** (`getCurrentUserId()` in
`src/lib/utils.ts` looks up the user by `DEMO_USER_EMAIL`). Swap that function
for real session/auth lookup (NextAuth, Clerk, etc.) when you're ready to add
multi-user support — nothing else in the app needs to change since every
repository call already takes a `userId`.

## Notes on the shadcn/ui requirement

The spec asked for shadcn/ui. To keep this project runnable without extra setup,
`src/components/ui/*` contains small hand-written equivalents (Button, Card,
Input, Select, Label, Badge, Progress) styled with the same Tailwind/CVA
approach shadcn uses. If you want the real shadcn components, run
`npx shadcn@latest init` and `npx shadcn@latest add button card input ...` —
the existing component usages (`<Button variant="gold">`, `<Card>`, etc.) are
close enough to shadcn's API that migrating later is a low-effort swap.

## Extending

- Add real file upload for `Transaction.attachment` (currently a plain string
  field — wire up your storage of choice, e.g. S3 or Vercel Blob).
- Add a monthly cron / server action to explicitly reset
  `MonthlyAllocationStatus` — in practice it resets implicitly because the
  service always reads/creates the row keyed by the current `YYYY-MM`, but a
  visible "reset" audit log entry might be useful.
- Wire NextAuth for real multi-user login.
