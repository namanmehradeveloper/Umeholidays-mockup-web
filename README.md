# UME Holidays

Premium Rajasthan travel website built with Next.js 15 App Router, React, TypeScript and Tailwind CSS, with a Node.js + Express + MongoDB API in `backend/`.

## Run locally

Requires Node.js 22.22.2+ (or another version allowed by the root `engines` field) and MongoDB (local service or Atlas).

```bash
npm install                      # also installs backend/ dependencies
cp backend/.env.example backend/.env   # then set MONGODB_URI, JWT_SECRET, ADMIN_*
npm run seed                     # load backend seed content + admin account into MongoDB
npm run dev                      # frontend :3000 + backend :5000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Starts Next.js (`:3000`) and the API (`:5000`) together |
| `npm run dev:web` / `npm run dev:api` | Start only one side |
| `npm run seed` | Upserts the backend seed content into MongoDB (`npm run seed -- --force` overwrites seeded records) |
| `npm run start:api` | Production start for the API |

Production:

```bash
npm run build
npm run start
```

## Environment

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=919999999999
NEXT_PUBLIC_CONTACT_EMAIL=hello@umeholidays.com
# NEXT_PUBLIC_CKEDITOR_LICENSE_KEY=your-commercial-key-if-required
```

## Render

Use a **Web Service**. Keep Root Directory blank when `package.json` is in the repository root.

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

Do not use a Vite/static-site configuration.

## Content architecture

Travel content is seeded from `backend/src/seed/content.js`. The frontend reads published content from the API; replace placeholder image URLs with licensed production assets when branding/content is finalized.

The contact and planner flows use the backend enquiry API. CMS rich-text fields use the shared CKEditor 5 component and are sanitized before public rendering.

## Backend API

`backend/` is a standalone Express app (ES modules) with Mongoose, JWT auth (bcrypt-hashed passwords) and roles `user`, `organizer`, `admin`. The frontend calls relative `/api/...` URLs; `next.config.ts` proxies them to the backend on `http://127.0.0.1:5000` (or `API_URL`, if set at build time), so the browser never needs the backend URL.

```
backend/
├── server.js            entry: HTTP server, DB connect with retry, graceful shutdown
└── src/
    ├── app.js           helmet, cors, JSON body, routes, error handling
    ├── config/          env loading/validation, MongoDB connection
    ├── models/          User, Destination, Tour, Experience, Event, Story, Enquiry, Booking, Wishlist
    ├── controllers/     request handlers (content types share one CRUD factory)
    ├── routes/          route definitions + request validation
    ├── middleware/      auth/roles, validation, DB guard, errors
    ├── utils/           ApiError, response helper, query/pagination, JWT
    └── seed/            owns initial CMS content and seed logic
```

Responses are `{ success: true, data, meta? }` or `{ success: false, message, errors? }`. Send `Authorization: Bearer <token>` for protected routes.

| Endpoint | Access |
| --- | --- |
| `GET /api/health` | Public |
| `POST /api/auth/register`, `POST /api/auth/login` | Public |
| `GET/PATCH /api/auth/me`, `PATCH /api/auth/password` | Logged in |
| `GET /api/{destinations,tours,experiences,events,stories}` and `/:idOrSlug` | Public (published only; admins see drafts) |
| `POST/PATCH/DELETE` on the content routes above | Admin (events: organizers too, own events only, created as drafts) |
| `POST /api/enquiries` | Public |
| `GET /api/enquiries/me` | Logged in |
| `GET/PATCH/DELETE /api/enquiries[/:id]` | Admin |
| `POST /api/bookings`, `GET /api/bookings/me`, `GET /api/bookings/:id`, `PATCH /api/bookings/:id/cancel` | Logged in (own bookings) |
| `GET /api/bookings`, `PATCH/DELETE /api/bookings/:id` | Admin |
| `GET/POST/DELETE /api/wishlist`, `POST /api/wishlist/sync`, `DELETE /api/wishlist/:itemType/:slug` | Logged in |
| `GET/POST/PATCH/DELETE /api/users[/:id]` | Admin |
| `GET /api/admin/dashboard` | Admin |

List endpoints support `?q=`, `?page=`, `?limit=` (max 100), `?sort=field,-field` and per-resource filters, e.g. `/api/tours?category=Heritage&destination=Jaipur&minPrice=20000&maxPrice=50000&sort=-price`.

Secrets (`MONGODB_URI`, `JWT_SECRET`, admin password) belong only in `backend/.env`, which is git-ignored. In production set a 32+ character `JWT_SECRET` and `CLIENT_URL` to the site origin(s).

### Single-service production (Render)

One Web Service runs both apps: build command `npm install; npm run build`, start command `npm run start`. `scripts/start.mjs` starts the Express backend from `backend/` on the internal port `5000` (with `NODE_ENV=production` unless set) and Next.js on the platform's `$PORT`; if either process exits, the service exits so the platform restarts it. Add the backend variables (`MONGODB_URI`, `JWT_SECRET`, ...) to the same service's environment. `API_URL` is not needed; on Render `CLIENT_URL`/`APP_URL` default to `RENDER_EXTERNAL_URL` when unset. Set `API_URL` at build time only if you want to proxy to an external backend instead.

## Full-stack setup

1. Copy `.env.example` to `.env.local` and set the public values.
2. Copy `backend/.env.example` to `backend/.env` and set a real MongoDB URI, JWT secret, and admin credentials.
3. Install dependencies with `npm install` (this also installs backend dependencies).
4. Seed the database with `npm run seed`.
5. Start both applications with `npm run dev`.
6. Open `http://localhost:3000` for the website and `http://localhost:3000/admin/login` for the admin console.

The admin console uses the existing REST API for core resources and a flexible `AdminRecord` API for operational/CMS modules that do not yet have a dedicated domain model. Replace those flexible records with dedicated models when payment, supplier, hotel, vehicle, invoice and proposal integrations are connected to live providers.
