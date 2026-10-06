# UME Holidays — White Theme + CKEditor + Regression Audit

Date: 2026-10-05

## Scope

The uploaded full-stack project was reviewed as a Next.js 15 / React 19 / TypeScript frontend with an Express / MongoDB backend. The pass focused on preserving working functionality while normalizing the UI to a white/light base, consolidating rich-content editing on CKEditor 5, and fixing concrete runtime/data-flow defects found during the review.

## Main fixes

### White-theme normalization
- Header is always a white/light navigation surface rather than switching to a dark/transparent home state.
- Footer, floating contact action, homepage hero, search page, account dashboard, admin shell/header, planner, calculator, buttons, admin controls and modal content were normalized to a white/light base with terracotta accents.
- Remaining dark/black surfaces are limited to functional overlays on photography, modal backdrops, error/status colors, and code/preformatted content where contrast is intentional.
- Admin blue action accents were normalized to the same terracotta theme so public and admin UI are visually consistent.

### Shared CKEditor implementation
- Added `components/common/RichTextEditor.tsx` as the shared CKEditor 5 implementation.
- `components/admin/RichTextEditor.tsx` now re-exports the shared editor so all admin rich fields use one configuration.
- Rich editor is used for destination, tour, experience, event and story rich descriptions/content as well as CMS FAQ answers, testimonial reviews, mood/seasonal descriptions and organizer event descriptions.
- Plain/structured fields such as itinerary rows, highlights, SEO descriptions, booking requests and contact messages intentionally remain normal textarea/input fields so HTML is not written into structured data.
- CKEditor uses a white toolbar/editing surface and reads `NEXT_PUBLIC_CKEDITOR_LICENSE_KEY` when provided, otherwise it uses GPL mode.

### Rich-text rendering and security
- Public CKEditor output continues to pass through DOMPurify before `dangerouslySetInnerHTML`.
- Sanitizer now preserves both semantic and CKEditor-compatible emphasis output (`strong`, `b`, `em`, `i`) plus the supported headings, lists, links and blockquotes.
- Added `richTextToPlainText()` for cards and SEO metadata so CKEditor HTML tags do not appear as literal text in summaries/search metadata.
- Corrected multiple public cards/detail metadata paths to use sanitized rich output or plain-text extraction as appropriate.

### CMS fixes
- Fixed Travel Mood records: homepage no longer passes an empty string to `next/image` when a mood has no image.
- Travel Moods can now upload an optional image through the existing authenticated Cloudinary flow.
- Added a safe white placeholder when a mood image is absent.
- Fixed legacy seeded Mood/Seasonal records that use `data.title`: existing records are mapped into `moodTitle` / `seasonTitle` when edited, preventing false required-field errors.
- Added the missing Seasonal `season / date range` field so the admin form can actually edit the label displayed by the homepage.

### Search fixes
- Search page uses a white-theme layout with the live search kept as the main focus.
- Search input/button alignment, clear action, loading state, API error state, no-result state and URL query handling were fixed.
- Search still queries destinations, tours, experiences, stories and events concurrently.
- Search `q` from Next.js App Router `searchParams` initializes the client search correctly without requiring `useSearchParams` in the client component.

### Account/client robustness
- Account home no longer crashes if `ume_user` contains malformed JSON; corrupt local storage is cleared safely.
- Account enquiry page now uses the shared API wrapper instead of an independent Axios/token implementation, with typed data, loading/error/empty states and cancellation protection.
- Account/auth pages use the same white base theme.

### Common component robustness
- Tour compare component now handles API failures and component unmounts instead of leaving an unhandled promise path.
- Tour comparison gracefully handles missing optional values and an empty selection.
- Calculator validates/clamps traveller/day numeric inputs and uses a light price-summary surface instead of the old dark maroon panel.
- FAQ uses stable unique keys, `type="button"`, `aria-controls` and the sanitized shared RichText renderer.

### Existing prior fixes rechecked
- Admin/customer session keys remain isolated.
- Old right-side admin details drawer markers are absent; the centered full-details dialog remains in place.
- Previously corrected booking transition/inventory logic remains present in the backend.
- Legal routes referenced by the footer remain present.

## Static regression verification

| Check | Result |
|---|---|
| TypeScript/TSX parser pass | PASS — 121 files, 0 syntax errors |
| Backend JavaScript syntax | PASS — 61 files, 0 syntax errors |
| Relative/local imports | PASS — 174 checked, 0 unresolved |
| Likely missing `use client` | PASS — 0 found |
| App Router pages inventoried | 69 routes |
| Static internal navigation references | PASS — 60 checked, 0 unresolved |
| Frontend API mount references | PASS — 80 checked, 0 unknown backend mounts |
| Old drawer markers | PASS — 0 found |
| Unsafe rich HTML renderer locations | PASS — centralized through `RichText` sanitizer |

## Build / dependency verification limitation

A full `npm ci`, semantic `tsc`, ESLint and Next.js production build could not be completed inside the audit container because the environment cannot resolve `registry.npmjs.org` (`EAI_AGAIN`) and therefore cannot install the dependency tree. The audit container is also running Node.js `22.16.0`, while the root project correctly requires a newer supported line (`^22.22.2 || ^24.15.0 || >=26.0.0`) because of the locked frontend dependency stack.

This environment limitation is not reported as an application-source defect. For final deployment verification use an allowed Node version and run:

```bash
npm ci
npm run build
npm run lint
npx tsc --noEmit
```

## CKEditor deployment note

If this is a proprietary/commercial deployment, set the CKEditor license key appropriate for that deployment:

```env
NEXT_PUBLIC_CKEDITOR_LICENSE_KEY=...
```

If omitted, the code uses CKEditor GPL mode.

## Files modified
- `.env.example`
- `CKEDITOR-SETUP.md`
- `README.md`
- `app/account/enquiries/page.tsx`
- `app/account/events/page.tsx`
- `app/account/layout.tsx`
- `app/account/password/page.tsx`
- `app/account/profile/page.tsx`
- `app/admin/login/page.tsx`
- `app/auth/forgot-password/page.tsx`
- `app/auth/login/page.tsx`
- `app/auth/register/page.tsx`
- `app/auth/reset-password/page.tsx`
- `app/destinations/[slug]/page.tsx`
- `app/destinations/page.tsx`
- `app/events/[slug]/page.tsx`
- `app/experiences/[slug]/page.tsx`
- `app/experiences/page.tsx`
- `app/globals.css`
- `app/not-found.tsx`
- `app/offers/page.tsx`
- `app/search/page.tsx`
- `app/stories/[slug]/page.tsx`
- `app/stories/page.tsx`
- `app/tours/[slug]/page.tsx`
- `app/tours/page.tsx`
- `components/account/AccountHome.tsx`
- `components/admin/AdminFooter.tsx`
- `components/admin/AdminHeader.tsx`
- `components/admin/AdminShell.tsx`
- `components/admin/AuditLogs.tsx`
- `components/admin/Bookings.tsx`
- `components/admin/CompanySettings.tsx`
- `components/admin/Dashboard.tsx`
- `components/admin/Enquiries.tsx`
- `components/admin/GenericModule.tsx`
- `components/admin/InputIcon.tsx`
- `components/admin/ResourceManager.tsx`
- `components/admin/RichTextEditor.tsx`
- `components/admin/TableControls.tsx`
- `components/admin/Users.tsx`
- `components/auth/AuthForm.tsx`
- `components/common/Button.tsx`
- `components/common/Calculator.tsx`
- `components/common/Compare.tsx`
- `components/common/FAQ.tsx`
- `components/common/PlannerBuilder.tsx`
- `components/common/RichTextEditor.tsx`
- `components/common/SearchBox.tsx`
- `components/home/Hero.tsx`
- `components/home/HomeSections.tsx`
- `components/home/TripPlanner.tsx`
- `components/layout/Footer.tsx`
- `components/layout/Header.tsx`
- `components/layout/SiteChrome.tsx`
- `lib/rich-text.ts`

## Final verification status

- Production Build: **NOT VERIFIED in this container** (dependency registry unavailable / Node version below project engine requirement)
- TypeScript syntax: **PASS**
- Backend syntax: **PASS**
- Local imports: **PASS**
- Static routes: **PASS**
- API mount mapping: **PASS**
- Rich-text sanitizer path: **PASS**
- CKEditor shared integration: **PASS (source/static verification)**
- White-theme normalization: **COMPLETED**
- Second static regression pass: **COMPLETED**
