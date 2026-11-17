# GuestCare - Security Architecture & Threat Model

## 1. Threat Model & Mitigations

| Threat | Impact | Mitigation in GuestCare |
|---|---|---|
| **QR Code Tampering / Guessing** | Attacker accesses another room's guest requests | 256-bit cryptographically random tokens (`crypto.getRandomValues`). Stored exclusively as SHA-256 hashes in database. No sequential IDs or reservation numbers in URLs. |
| **Expired / Post-Checkout Access** | Former guest continues to submit requests | Automatic session expiration pegged to PMS reservation checkout timestamp (+ configurable 2-hour grace period). Active token revocation upon checkout event. |
| **Client-side Privilege Escalation** | Guest attempts to assign staff or alter ticket priority | Request priority, assigned department, and staff IDs are determined server-side based on category rules or staff role. Guest payload inputs strictly sanitized and validated via Zod. |
| **Direct Database Enumeration** | Unauthorized access to other guests' data | PostgreSQL Row Level Security (RLS) enabled on all tables in `guestcare` schema. Supabase anon key cannot bypass RLS. Direct table queries by guests are blocked; all guest operations route through security-definer RPC functions or Edge functions that validate the active session token hash. |
| **Malicious File Uploads** | Web shells, viruses, or storage denial-of-service | Supabase Storage bucket configured with strict MIME-type whitelist (`image/jpeg`, `image/png`, `image/webp`, `image/heic`), file size limit (10MB max), and private access (only accessible via signed URLs). |
| **Credential Leakage** | Leaking service-role keys in frontend build | Service-role keys are strictly quarantined in Supabase Edge Functions and CI/CD secrets. Client only bundles the public anon key. |
| **Denial of Service / Rate Limiting** | Flooding ticket or feedback forms | Rate limiting implemented on token verification and request submission (max 10 requests per session per hour, max 5 verification attempts per minute). |

---

## 2. Cryptographic QR Token Implementation

1. **Token Generation**:
   ```typescript
   // 32-byte cryptographic random hex string (64 characters)
   const buffer = new Uint8Array(32);
   crypto.getRandomValues(buffer);
   const token = Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
   ```
2. **Hash Computation**:
   ```typescript
   // Server-side SHA-256 hash stored in DB
   const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
   const tokenHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
   ```
3. **Database Storage**:
   - The plain token is sent in the QR URL: `https://hotel.app/portal?token=<token>`.
   - The database stores **only** `token_hash`.
   - Even if the database is read, raw tokens cannot be recovered without a pre-image break of SHA-256.

---

## 3. Row Level Security (RLS) Policy Design

Every table in `guestcare` schema has `ENABLE ROW LEVEL SECURITY`:

- **Staff Access**:
  - Requires `auth.role() = 'authenticated'`.
  - Roles (`reception`, `maintenance`, `housekeeping`, `manager`, `admin`) determined via metadata or staff profile table.
- **Guest Access**:
  - Direct `SELECT`, `INSERT`, `UPDATE`, `DELETE` grants on `guestcare.requests` are disabled for public anon.
  - Operations occur exclusively through Security Definer functions (`guest_validate_session`, `guest_create_request`, `guest_confirm_resolution`, `guest_submit_feedback`) which execute with controlled privileges after verifying that the submitted token's SHA-256 matches an active session.

---

## 4. Audit Logging
Every security-sensitive event (session creation, revocation, status update, assignment, staff login) writes to `guestcare.audit_logs`:
- Timestamp
- Actor type (`guest`, `staff`, `system`)
- Actor ID / Session ID
- Action name
- Entity type and ID
- Client IP & User-Agent
- Diff of state changes (JSONB)

