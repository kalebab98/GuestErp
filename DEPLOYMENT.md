# GuestCare - Production Deployment Guide

## 1. Prerequisites

- Supabase project (or self-hosted Supabase instance).
- PostgreSQL 15+ with `pgcrypto` and `uuid-ossp` extensions.
- Node.js 18+ or 20+ runtime environment.
- Domain with SSL certificate (HTTPS required for camera/upload and secure cookies).
- Optional: Resend account for email alerts.

---

## 2. Environment Variables

Create `.env.production` (or inject into your hosting provider like Vercel, Netlify, Cloudflare Pages, or Docker):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Application Configuration
VITE_APP_NAME="GuestCare"
VITE_APP_URL="https://guestcare.example.com"
VITE_USE_MOCK_PMS="false"

# Resend / Email Notifications (Server / Edge Functions only)
RESEND_API_KEY=re_123456789
EMAIL_FROM="GuestCare Support <notifications@guestcare.example.com>"
```

> **CRITICAL SECURITY NOTE**: Never provide `SUPABASE_SERVICE_ROLE_KEY` to the client-facing build. It should only be set in the Supabase Edge Functions environment.

---

## 3. Database Migrations

Apply database migrations strictly through Supabase CLI or controlled migration scripts:

```bash
# Link project
supabase link --project-ref your-project-ref

# Apply pending migrations
supabase db push
```

Migration files are located in `supabase/migrations/`:
1. `20261117000001_create_schema_and_categories.sql`
2. `20261117000002_create_core_tables.sql`
3. `20261117000003_create_functions_and_triggers.sql`
4. `20261117000004_create_rls_policies.sql`
5. `20261117000005_seed_initial_data.sql`

---

## 4. Frontend Build & Static Asset Hosting

```bash
# Clean install
npm ci

# Typecheck and production bundle
npm run build

# Preview build locally
npm run preview
```

The resulting `dist/` folder can be deployed to any static host (Vercel, Cloudflare Pages, AWS S3 + CloudFront, Nginx).

### Nginx Configuration Snippet (SPA routing)
```nginx
server {
    listen 443 ssl http2;
    server_name guestcare.example.com;

    root /var/www/guestcare/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

---

## 5. Storage Buckets Setup

In Supabase Dashboard -> Storage:
1. Create bucket: `guestcare-attachments`.
2. Visibility: Private.
3. Allowed MIME types: `image/jpeg, image/png, image/webp, image/heic, application/pdf`.
4. Max file size: `10MB`.
