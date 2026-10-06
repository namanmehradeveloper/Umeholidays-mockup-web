# UME Holidays — Deep Audit & Fix Report

Date: 2026-10-05

## Audit coverage

- Original ZIP extracted successfully.
- Original non-generated project files discovered: 198.
- Post-fix non-generated project files: 202 (new account guard + three legal route pages; this report is additional documentation).
- 121 frontend TypeScript/TSX/config files included in syntax/import/client-boundary scans.
- 61 backend JavaScript files included in Node syntax checks.
- Routes, API mount usage, auth/session storage, booking state transitions, upload security, rich-text sanitization, environment config, and the admin details UI were specifically traced.
- Generated/dependency folders (`node_modules`, `.next`, `dist`, `build`, `coverage`, `.git`) were not treated as application source.

## Critical / high-priority fixes applied

### 1. Booking cancellation inventory bug
**File:** `backend/src/controllers/bookingController.js`

The admin status transition used the inverse condition for active -> cancelled. A pending/confirmed booking could become cancelled without releasing reserved seats or clearing the active duplicate-booking lock.

**Fix:**
- Corrected active -> cancelled detection.
- Atomic cancel now uses MongoDB `$unset` for `activeKey` instead of `$set: { activeKey: undefined }`.
- Seats are released only after a real active -> cancelled transition.

### 2. Booking reactivation/completion state bug
**File:** `backend/src/controllers/bookingController.js`

The old code only reserved seats when a `cancelled` booking was reactivated. `completed -> pending/confirmed` could become active without reserving seats or restoring `activeKey`. Completed bookings could also keep a stale `activeKey` even though the code defines only pending/confirmed as active.

**Fix:**
- Uses inactive -> active transition logic instead of checking only `cancelled`.
- Reserves seats and restores duplicate protection for any inactive -> pending/confirmed transition.
- Clears cancellation metadata when a cancelled booking is reactivated.
- Clears `activeKey` whenever an active booking leaves the active state.
- Does not release seats when a booking is marked completed; historical consumed inventory remains consumed.
- Retains rollback logic if a reactivation reserves seats but the booking save fails.

### 3. Admin/customer session collision
**Files:**
- `lib/admin-api.ts`
- `components/admin/AdminShell.tsx`
- `components/admin/Users.tsx`

Admin auth previously fell back to `ume_token`, stored the admin in shared `ume_user`, and admin logout removed customer `ume_token` / `ume_user`.

**Fix:**
- Admin token now uses only `ume_admin_token`.
- Admin user now uses `ume_admin_user`.
- Admin logout removes only admin storage.
- Added one-way compatibility reading for legacy admin storage without deleting customer storage.
- Admin shell/user-management callers now use the isolated admin session helper.

### 4. Account routes were not client-protected
**File added:** `app/account/layout.tsx`

Account pages could render before a customer session was verified and relied on each child page failing its own API request.

**Fix:**
- `/account/*` verifies the current token through `/auth/me` before rendering children.
- Missing/expired sessions are cleared and redirected to login.
- The current account path is preserved through `?next=`.
- Customer cleanup does not touch admin storage.

### 5. Login ignored the requested return URL
**File:** `components/auth/AuthForm.tsx`

Booking redirected guests to login with `?next=...`, but successful login always sent users to `/account`.

**Fix:**
- Login/register honors a safe internal `next` path.
- External/protocol-relative redirect targets are rejected.
- Authentication response shape is validated before storing a session.

### 6. Legacy wishlist synchronization bug
**Files:**
- `components/auth/AuthForm.tsx`
- `components/common/LocalStorageList.tsx`
- `components/common/SaveButton.tsx`

Older browser wishlist entries stored a bare slug, while newer entries use `type:slug`. Bare slugs were being interpreted incorrectly during account sync/list rendering. Malformed local storage could also make the save button unusable.

**Fix:**
- Bare legacy entries are treated as tours.
- Known typed entries are validated.
- Local wishlist parsing is defensive.
- Malformed browser wishlist storage is safely reset.
- Failed sync no longer turns a successful login into a failed login; local data is retained for retry.

### 7. Broken My Bookings navigation
**File:** `components/common/BookingForm.tsx`

The booking success button linked to missing `/my-bookings`.

**Fix:** points to existing `/account/bookings`.

### 8. Missing footer/legal routes
**Files added:**
- `app/privacy/page.tsx`
- `app/terms/page.tsx`
- `app/cancellation/page.tsx`

Footer routes existed but the App Router pages did not, producing 404s.

**Fix:** added safe placeholder pages and marked them `noindex` until approved legal copy is supplied. These are route fixes, not legal advice or final policy text.

### 9. Admin record details drawer replaced with full popup
**Files:**
- `components/admin/TableControls.tsx`
- `app/admin/admin-theme.css`

**Fix:**
- Removed the right-side drawer implementation and drawer animation.
- Added centered large modal (`max-w-[1380px]`, viewport-constrained height).
- Sticky header/footer and independently scrollable body.
- Responsive two-column detail grid with full-width handling for long/content fields.
- Mobile single column.
- Backdrop close, Escape close, body scroll lock, focus restoration and Tab focus trapping.
- Existing `DetailsDialog` API preserved.
- Existing callers in ResourceManager, Enquiries, GenericModule and Bookings remain unchanged.

### 10. Runtime Node requirement made explicit
**Files:**
- `package.json`
- `package-lock.json`

The locked frontend dependency stack includes packages requiring Node 22.22.2+ (or supported 24.15+/26+ lines), while the project root did not declare that requirement.

**Fix:** added a matching root `engines.node` constraint and synchronized lockfile root metadata. Root postinstall now uses `npm ci --prefix backend` for reproducible backend dependency installation.

## Route verification

Post-fix route inventory: 69 App Router pages.

Static internal `href`, `router.push`, `router.replace`, and redirect references checked by route-matrix scan: no unresolved page routes found after the fixes.

The three previously missing footer routes and the invalid `/my-bookings` target are resolved.

## API verification

84 literal/custom-helper API references were scanned against backend top-level route mounts.

Unknown top-level API mounts found: 0.

Referenced mounts include: `admin`, `auth`, `bookings`, `destinations`, `enquiries`, `events`, `experiences`, `health`, `public-records`, `settings`, `stories`, `tours`, `uploads`, `users`, and `wishlist`.

Key auth, booking, wishlist, settings, user, enquiry, upload and content flows were manually traced from frontend helper -> backend route -> middleware -> controller/model.

## Security review

- Backend admin/user authorization is enforced on protected routes rather than only in UI.
- Rich text passes through DOMPurify before `dangerouslySetInnerHTML`.
- Image uploads require auth/roles, have 5 MB limits, MIME checks, magic-byte/content checks, folder allowlisting and Cloudinary server-side signing.
- Password reset stores a SHA-256 token hash and an expiry instead of the raw reset token.
- No real `.env` files were present in the ZIP; only example env files were found.
- Admin/customer browser sessions are now isolated.
- Login return paths are restricted to internal paths to prevent open redirects.

## Post-fix verification

| Check | Result |
|---|---|
| ZIP extraction | PASS |
| Backend JS syntax (`node --check`, including startup script) | PASS |
| TS/TSX parser syntax scan | PASS — 121 files, 0 syntax diagnostics |
| Local frontend import resolution | PASS — 0 unresolved local imports |
| Client/server heuristic (`use client`) | PASS — 0 likely missing client directives |
| Static internal page routes | PASS — 0 unresolved references |
| API top-level mount scan | PASS — 0 unknown mounts |
| Package/lock JSON validity | PASS |
| Package vs lock root metadata | PASS |
| Old admin drawer markers | PASS — removed |
| Full `npm ci` | NOT VERIFIED — registry/cache unavailable in audit environment; current runtime is also Node 22.16.0, below the locked frontend dependency requirement |
| Production `next build` | NOT VERIFIED — dependencies could not be installed (`next` unavailable) |
| `npm run lint` | NOT VERIFIED — dependencies could not be installed (`next` unavailable) |
| Semantic `tsc --noEmit` | NOT VERIFIED — React/Node/type packages unavailable because install could not complete; parser-level TypeScript syntax scan passed |
| Live MongoDB integration | NOT VERIFIED — credentials/live service not available |
| Cloudinary live upload | NOT VERIFIED — credentials/live service not available |
| Resend email delivery | NOT VERIFIED — credentials/live service not available |

## Remaining non-blocking work / recommendations

1. Run a clean install and final production validation on Node 22.22.2+ with registry access:
   - `npm ci`
   - `npm run build`
   - `npm run lint`
   - `npx tsc --noEmit`
2. Replace the three legal placeholder pages with approved privacy, terms and cancellation/refund policy text before public launch.
3. Several admin files are very large (`ResourceManager.tsx`, `Users.tsx`, etc.) and many areas still use `any`. These are maintainability improvements, not safe bug-fix refactors, so they were not mass-refactored in this pass.
4. Live database, email and Cloudinary behavior still requires environment credentials/integration testing.

## Files changed by this audit

1. `app/account/layout.tsx` (new)
2. `app/admin/admin-theme.css`
3. `app/cancellation/page.tsx` (new)
4. `app/privacy/page.tsx` (new)
5. `app/terms/page.tsx` (new)
6. `backend/src/controllers/bookingController.js`
7. `components/admin/AdminShell.tsx`
8. `components/admin/TableControls.tsx`
9. `components/admin/Users.tsx`
10. `components/auth/AuthForm.tsx`
11. `components/common/BookingForm.tsx`
12. `components/common/LocalStorageList.tsx`
13. `components/common/SaveButton.tsx`
14. `lib/admin-api.ts`
15. `package.json`
16. `package-lock.json`
17. `AUDIT-FIX-REPORT-2026-10-05.md` (this report)
