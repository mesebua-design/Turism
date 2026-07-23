# Deploying Guidewise

This walks through putting Guidewise live on the internet for free (or close to it), using three separate, purpose-built services:

| Piece | Service | Why |
|---|---|---|
| PostgreSQL database | [Neon](https://neon.tech) | Genuinely free forever (not a trial) — 0.5 GB storage, 100 compute-hours/month, no card required |
| Backend API (Express) | [Render](https://render.com) | Free web service tier, deploys straight from GitHub |
| Frontend (React/Vite) | [Vercel](https://vercel.com) | Free forever for personal projects, built for exactly this kind of app |

Total cost: **$0/month**, with one honest caveat explained in [Step 6](#step-6-know-the-free-tier-tradeoffs). An all-in-one paid alternative and a self-hosted option are covered at the end if you outgrow this.

**Order matters here** — follow the steps in sequence. The short version: database → backend (needs the database) → frontend (needs the backend's URL, because Vite bakes it in at build time, not runtime) → go back and tell the backend the frontend's URL (for CORS).

---

## Prerequisites

- A GitHub account
- The Guidewise project on your computer, extracted from the zip
- Node.js installed locally (to run the one-time migration against your live database)

---

## Step 1: Push the project to GitHub

Guidewise ships as a folder, not a git repo yet — you own that first commit.

```bash
cd guidewise
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

Create an empty repository on [github.com/new](https://github.com/new) (don't initialize it with a README — you already have one), then:

```bash
git remote add origin https://github.com/<your-username>/guidewise.git
git push -u origin main
```

---

## Step 2: Create your database (Neon)

1. Sign up at [neon.tech](https://neon.tech) (GitHub login is fastest).
2. Create a new project — name it `guidewise`. Pick a region close to where you'll deploy your backend (e.g. Oregon/US-West if you'll pick Render's Oregon region in Step 4).
3. On the project dashboard, copy the **pooled** connection string (it has `-pooler` in the hostname — this uses PgBouncer under the hood and handles concurrent connections better than the direct string). It looks like:
   ```
   postgresql://neondb_owner:AbC123@ep-cool-name-12345-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this tab open — you'll need this string twice: once now, once in Render.

### Run migrations and seed data against it

On your own machine:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and paste your Neon connection string as `DATABASE_URL`. Then:

```bash
npm install
npm run db:migrate
npm run db:seed
```

You should see `✅ Database schema is up to date.` and `✅ Seed complete.` — this created all the tables and demo data directly on Neon. (The backend's `pg` connection is already configured to use relaxed SSL verification for any non-`localhost` host, which is what lets this connect to Neon without a `self signed certificate` error — a very common snag when connecting Node to managed Postgres.)

---

## Step 3: Deploy the backend (Render)

1. Sign up at [render.com](https://render.com) and connect your GitHub account.
2. **New +** → **Web Service** → select your `guidewise` repo.
3. Configure:
   | Field | Value |
   |---|---|
   | Name | `guidewise-api` (or anything) |
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | Free |
4. Add environment variables (**Environment** tab):
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon pooled connection string from Step 2 |
   | `JWT_SECRET` | A long random string — generate one with `openssl rand -base64 48` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | Leave as `http://localhost:5173` for now — you'll update this in Step 5 |
   | `NODE_ENV` | `production` |
5. Click **Deploy Web Service**. Watch the logs; once it says your server is running, copy your service's URL from the top of the page — it looks like `https://guidewise-api.onrender.com`.
6. Sanity check it: visit `https://guidewise-api.onrender.com/api/health` — you should see `{"success":true,"message":"API is healthy"}`.

---

## Step 4: Deploy the frontend (Vercel)

1. Sign up at [vercel.com](https://vercel.com) and connect GitHub.
2. **Add New** → **Project** → select the same `guidewise` repo.
3. Configure:
   | Field | Value |
   |---|---|
   | Root Directory | `frontend` |
   | Framework Preset | Vite (should auto-detect) |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
4. Add an environment variable:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://guidewise-api.onrender.com/api` (your Render URL from Step 3, **with `/api` on the end**) |
5. Click **Deploy**. When it finishes, you'll get a URL like `https://guidewise.vercel.app`.

**Why order matters:** Vite environment variables are substituted into the JavaScript bundle *at build time*, not read at runtime. If you set `VITE_API_URL` after building, it won't take effect until you trigger a new deploy. This is the single most common "why isn't my frontend talking to my backend" bug with Vite apps — the fix is always "redeploy after changing a `VITE_` variable."

The repo already includes `frontend/vercel.json`, which tells Vercel to serve `index.html` for every route — without it, refreshing the page on `/guides/some-id` would 404, because Vercel would look for a file at that path instead of letting React Router handle it client-side.

---

## Step 5: Connect them (fix CORS)

Go back to Render → your service → **Environment** → update:

| Key | Value |
|---|---|
| `CLIENT_URL` | `https://guidewise.vercel.app` (your actual Vercel URL from Step 4) |

Save — Render will automatically redeploy with the new value. This is what allows your frontend's origin through the backend's CORS check (`cors({ origin: process.env.CLIENT_URL })` in `backend/src/app.js`).

Now visit your Vercel URL and confirm:
- The homepage loads and shows the seeded guides
- You can log in as `nino@example.com` / `password123`
- Search/filter on `/guides` works

If guides don't appear, open your browser's DevTools → Network tab and check the request to `/api/guides` — a CORS error or failed request there means Step 5 needs a re-check.

---

## Step 6: Know the free-tier tradeoffs

Being upfront about what "free" actually means on each platform, so nothing here surprises you:

- **Render's free web service sleeps after 15 minutes of no traffic.** The next request after that wakes it up, which takes 30–60 seconds — so if you share your link with someone and it's been quiet, their first load will hang before anything appears. This is normal, not a bug. If you want to avoid it: a free uptime monitor like [UptimeRobot](https://uptimerobot.com) or [cron-job.org](https://cron-job.org) pinging `https://guidewise-api.onrender.com/api/health` every 10 minutes will keep it awake. (750 free hours/month on Render comfortably covers one service running continuously — the limit only bites if you run multiple free services at once.)
- **Neon's free compute scales to zero after 5 minutes idle** and wakes in a few hundred milliseconds on the next query — this one is fast enough that you generally won't notice it.
- **Neon's free tier caps at 0.5 GB storage and 100 compute-hours/month.** For a portfolio project with a handful of users, this is very hard to hit. If you do, Neon simply pauses compute until the next billing cycle rather than charging you.
- **Vercel's Hobby tier is free with no expiry**, intended for personal, non-commercial projects — fine for a portfolio piece.

None of this costs anything extra to fix later — the moment traffic justifies it, Render's Starter tier ($7/mo) removes the sleep behavior, and Neon's Launch tier is pay-as-you-go with no minimum.

---

## Custom domain (optional)

Both Vercel and Render support custom domains for free (you just pay your registrar for the domain itself):
- **Vercel:** Project → Settings → Domains → add your domain → follow the CNAME/A record instructions it gives you.
- **Render:** Service → Settings → Custom Domains → same idea.

If you add a custom domain to the frontend, remember to update `CLIENT_URL` on Render to match it (Step 5), or CORS will start blocking requests again.

---

## Updating your site after code changes

Both Render and Vercel auto-deploy on every push to `main` by default:

```bash
git add .
git commit -m "Describe your change"
git push
```

That's it — both platforms pick up the push and redeploy automatically. If you change a schema (`backend/db/schema.sql`), re-run `npm run db:migrate` locally against your Neon `DATABASE_URL` — migrations don't run automatically on deploy.

---

## Alternative approaches

**All-in-one, less setup, costs money from day one:** [Railway](https://railway.com) can host the database and backend together (frontend still works best on Vercel). Railway's free tier is now a one-time $5 trial credit rather than an ongoing free plan, so budget roughly $5–10/month once the trial ends — but it's a genuinely faster path if you'd rather manage one dashboard than two.

**Full control, self-hosted:** the included `docker-compose.yml` already runs Postgres in a container; you could extend it with `backend` and `frontend` services and run the whole stack on a $4–6/month VPS (Hetzner, DigitalOcean). This trades the zero-config convenience above for full control over uptime and no cold starts, at the cost of managing your own server (updates, HTTPS certs via something like Caddy or Nginx + Certbot, backups). Reasonable next step if this project grows into something you want fully under your own control.

---

## Troubleshooting quick reference

| Symptom | Likely cause |
|---|---|
| Frontend loads but no guides appear, DevTools shows a CORS error | `CLIENT_URL` on Render doesn't exactly match your Vercel URL (Step 5) |
| Frontend loads but API calls go to `localhost:5000` | `VITE_API_URL` wasn't set before the Vercel build, or you need to redeploy after adding it |
| First load after inactivity takes ~30-60s | Render free tier cold start — see [Step 6](#step-6-know-the-free-tier-tradeoffs) |
| `self signed certificate in certificate chain` | You're using a `DATABASE_URL` for a remote host but running code from before the SSL fix — pull the latest `backend/src/config/db.js` |
| Refreshing `/guides/some-id` on the deployed site shows a 404 | Missing `frontend/vercel.json`, or Vercel's Root Directory isn't set to `frontend` |
| `npm run db:migrate` fails with `ECONNREFUSED` | `DATABASE_URL` in your local `.env` still points at `localhost` instead of your Neon string |
