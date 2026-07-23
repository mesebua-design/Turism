# Guidewise

A full-stack marketplace connecting travelers with local, licensed tour guides — inspired by directories like [Georgian Travel Guide](https://georgiantravelguide.com/en/guides). Guides create profiles and list tours; travelers search, compare, and leave reviews.

**Live demo data:** the seed script creates 4 published guides across Tbilisi, Kazbegi, Kakheti, and Batumi, 3 tourists, an admin, sample tours, and reviews — see [Demo accounts](#demo-accounts).

---

## Features

**Travelers**
- Browse and search guides by location, language, and price
- Sort by rating, price, or newest
- View guide profiles with tours, photos, and reviews
- Leave star ratings and written reviews
- Save guides to a favorites list

**Guides**
- Register and build a public profile (bio, location, languages, experience, cover photo)
- Create, edit, and delete tour listings with pricing, duration, group size, and availability
- Upload tour photos
- Draft profiles stay private until you explicitly publish them

**Admin**
- Dashboard with platform-wide stats
- Manage/delete users
- Verify guide profiles (adds a "Verified" badge)
- Moderate (delete) reviews

**Platform**
- JWT authentication with bcrypt-hashed passwords
- Role-based access control (Tourist / Guide / Admin)
- Server-side validation (Zod) on every write endpoint
- Rate limiting on auth endpoints
- Image uploads via Multer with type/size validation
- Fully responsive UI

---

## Tech stack

| Layer     | Choices |
|-----------|---------|
| Frontend  | React 19, Vite, Tailwind CSS v4, React Router v7, TanStack Query v5, React Hook Form, Axios |
| Backend   | Node.js, Express 5, PostgreSQL, JWT, bcryptjs, Zod, Multer |
| Data access | Plain parameterized SQL via [`pg`](https://node-postgres.com/) — no ORM |

**Why raw SQL instead of an ORM?** It keeps the data layer transparent and dependency-light — every query in `backend/src/models/` is plain, readable SQL with no generated-client build step, which also makes the whole stack easy to run in restricted/offline environments. If you'd prefer Prisma or Drizzle, the schema in `backend/db/schema.sql` translates directly.

---

## Project structure

```
guidewise/
├── backend/
│   ├── db/
│   │   ├── schema.sql        # Full DDL (tables, indexes, enum)
│   │   ├── migrate.js        # Applies schema.sql — safe to re-run
│   │   └── seed.js           # Demo data
│   ├── src/
│   │   ├── config/db.js      # PostgreSQL connection pool
│   │   ├── models/           # SQL queries, grouped by entity
│   │   ├── controllers/      # Request handlers
│   │   ├── routes/           # Express routers
│   │   ├── middleware/       # auth, validation, uploads, errors, rate limiting
│   │   ├── validators/       # Zod schemas
│   │   ├── app.js            # Express app (middleware + routes)
│   │   └── server.js         # Entry point
│   └── uploads/               # Uploaded images (gitignored, kept via .gitkeep)
├── frontend/
│   └── src/
│       ├── components/        # layout/, ui/, guides/, tours/, reviews/
│       ├── pages/              # Home, GuideSearch, GuideProfile, dashboards, auth
│       ├── hooks/               # TanStack Query hooks per resource
│       ├── context/AuthContext.jsx
│       └── lib/                  # axios instance, query client
├── docker-compose.yml          # Local PostgreSQL
└── .gitignore
```

---

## Getting started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (locally installed, or via the included `docker-compose.yml`)

### 1. Clone and install

```bash
git clone <your-repo-url> guidewise
cd guidewise

cd backend && npm install
cd ../frontend && npm install
```

### 2. Start PostgreSQL

Using Docker (recommended):
```bash
docker compose up -d
```
This starts Postgres on `localhost:5432` with user `postgres` / password `postgres` / database `guidewise`.

Or use an existing local/hosted PostgreSQL instance — just make sure a `guidewise` database exists:
```bash
createdb guidewise
```

### 3. Configure environment variables

```bash
cd backend
cp .env.example .env
```
Edit `.env` — at minimum, set `DATABASE_URL` to match your database and generate a real `JWT_SECRET` (e.g. `openssl rand -base64 48`). See [Environment variables](#environment-variables) below.

```bash
cd ../frontend
cp .env.example .env
```
The default `VITE_API_URL=http://localhost:5000/api` matches the backend's default port.

### 4. Run migrations and seed demo data

```bash
cd backend
npm run db:migrate
npm run db:seed
```

### 5. Run the app

In two terminals:
```bash
# Terminal 1 — API on http://localhost:5000
cd backend && npm run dev

# Terminal 2 — app on http://localhost:5173
cd frontend && npm run dev
```

Visit **http://localhost:5173**.

---

## Demo accounts

Every seeded account uses the password `password123`.

| Role    | Email               |
|---------|---------------------|
| Admin   | admin@example.com   |
| Guide   | nino@example.com (also levan / mariam / david) |
| Tourist | anna@example.com (also james / elena) |

---

## Environment variables

**`backend/.env`**

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the API listens on | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/guidewise` |
| `JWT_SECRET` | Secret used to sign auth tokens — use a long random value | `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Frontend origin, used for CORS | `http://localhost:5173` |

**`frontend/.env`**

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

---

## Database

The schema (`backend/db/schema.sql`) defines six tables:

```mermaid
erDiagram
    USERS ||--o| GUIDE_PROFILES : "has (if role=GUIDE)"
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ FAVORITES : saves
    GUIDE_PROFILES ||--o{ TOURS : lists
    GUIDE_PROFILES ||--o{ REVIEWS : receives
    GUIDE_PROFILES ||--o{ FAVORITES : "is saved by"
    TOURS ||--o{ TOUR_IMAGES : has
```

`npm run db:migrate` applies `schema.sql` directly and is idempotent (safe to run repeatedly — it uses `CREATE TABLE IF NOT EXISTS`). There's no migration-history table; for a project this size, the single schema file is easier to review than a chain of incremental migrations. If the app grows, consider introducing a migration tool (e.g. `node-pg-migrate`) at that point.

---

## API overview

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | – | Create a tourist or guide account |
| POST | `/auth/login` | – | Log in |
| GET | `/auth/me` | ✓ | Current user |
| PUT | `/auth/me` | ✓ | Update name |
| POST | `/auth/me/avatar` | ✓ | Upload avatar |
| GET | `/guides` | – | Search/filter/paginate published guides |
| GET | `/guides/:id` | – | Guide detail (tours + reviews) |
| GET, PUT | `/guides/me` | ✓ Guide | View/update own profile |
| POST | `/guides/me/cover-photo` | ✓ Guide | Upload cover photo |
| GET | `/tours`, `/tours/:id` | – | List / view tours |
| GET | `/tours/me` | ✓ Guide | Own tours |
| POST, PUT, DELETE | `/tours(/:id)` | ✓ Guide | Manage own tours |
| POST | `/tours/:id/images` | ✓ Guide | Upload tour photos |
| GET, POST | `/guides/:guideId/reviews` | GET public / POST ✓ Tourist | List / create reviews |
| PUT, DELETE | `/reviews/:id` | ✓ Owner | Edit/delete own review |
| GET, POST, DELETE | `/favorites(/:guideId)` | ✓ Tourist | Manage favorites |
| GET, DELETE, PATCH | `/admin/*` | ✓ Admin | Stats, users, guide verification, review moderation |

---

## Deployment

This is two independently deployable apps plus a database:

1. **Database** — any managed PostgreSQL works (Neon, Supabase, Railway, RDS). Run `npm run db:migrate` (and optionally `db:seed`) against it once.
2. **Backend** — deploy `backend/` to Render, Railway, Fly.io, or similar. Set the environment variables from the table above (a real `JWT_SECRET`, the managed `DATABASE_URL`, and `CLIENT_URL` pointing at your deployed frontend). Persistent disk is recommended for `backend/uploads`, or swap the upload middleware for S3/Cloudinary if your host uses ephemeral storage.
3. **Frontend** — deploy `frontend/` to Vercel or Netlify. Set `VITE_API_URL` to your deployed backend's `/api` URL, and run `npm run build`.

**For a full, step-by-step walkthrough** (specific to Neon + Render + Vercel, including free-tier caveats and a troubleshooting table), see **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

---

## Notable design decisions & possible next steps

- **JWTs are stored in `localStorage`** for simplicity. For stronger XSS protection in production, switch to httpOnly cookies.
- **No booking/payment flow** — the brief called for discovery, listings, and reviews, not transactions. Tours have `price` and `availableDays` for display; wiring up real bookings/payments (e.g. Stripe) would be a natural next step.
- **No email verification or password reset** — out of scope for this build, but the `users` table and auth routes are structured to add them easily.
- **Image storage is local disk** (`backend/uploads`) for zero-config local development. Swap `src/middleware/upload.js` for an S3/Cloudinary adapter for production durability.

---

## License

MIT — see [LICENSE](./LICENSE).
