# GuestCare

**QR-based Guest Experience & Service Management System for Serviced Apartments and Boutique Hotels**

GuestCare connects guests staying in apartments directly to front-desk, maintenance, and housekeeping teams through a secure, friction-free QR code interface. It empowers operators to detect and resolve issues before checkout, turning potential negative reviews into high guest satisfaction.

---

## Key Capabilities

1. **Mobile-First Guest Portal**
   - Instant access via reservation-bound QR code (no registration or app download needed).
   - Real-time service, maintenance, and housekeeping requests with photo attachments.
   - Live ticket status tracking and guest resolution confirmation.
   - Private, in-stay feedback and direct reception contact.

2. **Staff Operations Dashboard**
   - Centralized ticket inbox with status workflows (`New` → `Acknowledged` → `Assigned` → `In Progress` → `Waiting` → `Resolved` → `Closed` / `Reopened`).
   - Department segregation: Maintenance, Housekeeping, Reception, Management.
   - Internal team collaboration notes and SLA monitoring.
   - Direct QR code generator for room reservations.

3. **Rule-Based Guest Experience Health Monitoring**
   - Dynamic real-time risk assessment (`Good`, `Improving`, `At Risk`, `Critical`).
   - Clear rule justifications (e.g. overdue urgent tickets, unresolved cleanliness complaint).
   - Pre-checkout intervention alerts for reception.

4. **PMS Integration Architecture**
   - Modular PMS adapter layer separating PMS reservations from GuestCare operational data.
   - Includes production-ready contract and a high-fidelity mock adapter with simulated live stays.

---

## Technical Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router 6, TanStack Query 5, React Hook Form, Zod, Recharts.
- **Backend & Database**: PostgreSQL (schema `guestcare`), Supabase Auth, Storage, Edge Functions, Row Level Security (RLS).
- **Testing**: Vitest, React Testing Library, Playwright.

---

## Project Structure

```
├── src/
│   ├── components/         # UI components & design system (shadcn/ui inspired)
│   ├── features/
│   │   ├── guest/          # Guest portal views & forms (mobile-first)
│   │   ├── staff/          # Staff dashboard, tables, dispatch, reports
│   │   ├── health/         # Guest health scoring engine & badges
│   │   └── pms/            # PMS adapter interfaces & implementations
│   ├── lib/                # Supabase client, utils, crypto, tokens
│   ├── types/              # Domain models, database schemas, API types
│   ├── test/               # Test setups and mocks
│   ├── App.tsx             # Application routing & providers
│   └── main.tsx            # Vite root entry
├── supabase/
│   ├── migrations/         # PostgreSQL schema migrations (schema guestcare)
│   └── functions/          # Supabase Edge Functions (token validation, dispatch)
├── docs/                   # Architectural & technical specs
└── tests/                  # Automated integration and e2e test suites
```

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_USE_MOCK_PMS=true
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Automated Tests
```bash
npm test
```

