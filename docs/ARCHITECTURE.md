 MaapSetu architecture, security and deployment

Problem framing

SIH26036 asks for a unified verification and digital certification system under the Legal Metrology Act, 2009 and the Legal Metrology (General) Rules, 2011. National e-Maap already covers much of licensing and registrations. MaapSetu implements the **instrument lifecycle**: apply → allocate → inspect → stamp → expire → re-verify, plus consumer authentication.

Architecture

```
Browser / officer phone (PWA-ready web)
        │
        ▼
Next.js App Router
  Public pages     Authenticated /app/*      API routes
        │                  │                      │
        └──────────── Prisma / SQLite ────────────┘
                       public/uploads (photos)
```

Roles: `TRADER`, `LMO`, `GATC`, `ADMIN`. Middleware blocks `/app` without a JWT cookie.

Domain model

`User` → `Instrument` → `Application` → `Inspection` → `Certificate`

Certificates store `integrityHash = SHA-256(certificateNo, serial, result, issuedAt, validUntil)` and a QR that resolves to `/verify/{certificateNo}`.

Security framework (prototype vs production)

| Control | This prototype | Production |
| --- | --- | --- |
| Auth | HS256 JWT in httpOnly cookie | NIC SSO / Parichay, MFA |
| Passwords | bcrypt | Same + password policy |
| Authorisation | Role checks on every mutation | ABAC by state/district/circle |
| Certificates | SHA-256 hash + public verify URL | eSign / DSC, DigiLocker |
| Uploads | Local `public/uploads` | Encrypted object storage, virus scan |
| Transport | HTTP localhost | TLS, HSTS |
| Audit | `AuditLog` table | Immutable SIEM feed |
| PII on QR page | No Aadhaar; business + instrument only | Same + DPDP notices |
| Payments | Recorded as demo | Bharatkosh / state treasury |

Field photos are stored with inspection lat/lng and timestamp to discourage ghost verification. Offline sync is specified for the next iteration (IndexedDB queue).

Deployment methodology

1. Replace SQLite with PostgreSQL (`DATABASE_URL`).
2. Set `AUTH_SECRET` and `NEXT_PUBLIC_APP_URL`.
3. `npx prisma migrate deploy && npx prisma db seed` (seed only in demo).
4. Reverse proxy (Nginx) + systemd or container:

```text
docker compose: next app + postgres + volume for uploads
```

5. Integration: REST to e-Maap / CLMS for stakeholder IDs; optional WhatsApp expiry notices; optional DigiLocker push of the signed PDF.

Demo script for jury

1. Public verify `VC/TS/HYD/2025/00011`.
2. Trader: apply re-verification on the expiring scale.
3. Admin: auto-assign pending jobs.
4. LMO: pass the assigned dispenser inspection with a photo.
5. Open the new certificate QR page.
6. Show the failed counter scale enforcement note.
