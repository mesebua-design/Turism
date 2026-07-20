# Going Live: TourGuide.ge (single-folder repo)

Everything — backend and frontend — lives in one flat folder, no nested
subfolders. Deploys straight from GitHub, auto-updates on every push.

**Stack:** GitHub (source) → Vercel (frontend) + Render (backend) → MongoDB Atlas (database)

## File map

| File | Purpose |
|---|---|
| `server.cjs` | Express/MongoDB backend (all API routes) |
| `App.jsx`, `main.jsx`, `api.js`, `index.html`, `index.css` | React frontend (Vite) |
| `package.json` | Single package.json — scripts for both backend (`npm run server`) and frontend (`npm run client` / `npm run build`) |
| `vite.config.js`, `tailwind.config.js`, `postcss.config.js` | Frontend build config |
| `render.yaml` | Render deploy blueprint (backend) |
| `vercel.json` | Vercel deploy config (frontend) |
| `Dockerfile` | Optional container build for the backend |
| `docker-compose.yml` | Optional local dev stack (Mongo + backend + frontend) |
| `.env.example` | All environment variables, backend and frontend, in one file |

> Why `server.cjs` and not `server.js`? The frontend build tool (Vite) needs
> `"type": "module"` in package.json. Since the backend uses old-style
> `require()`, it's named `.cjs` so Node treats it as CommonJS regardless of
> that setting. Nothing to change — just run `npm run server` as usual.

---

## 1. Push to GitHub

```bash
cd tourguide-marketplace   # this folder
git init
git add .
git commit -m "Initial commit: TourGuide.ge marketplace"
git remote add origin https://github.com/YOUR_USERNAME/tourguide-marketplace.git
git branch -M main
git push -u origin main
```

## 2. Create the database (MongoDB Atlas — free)

1. https://www.mongodb.com/cloud/atlas → sign up → create a free M0 cluster
2. Database Access → add a user with a password
3. Network Access → allow `0.0.0.0/0`
4. Connect → Drivers → copy the connection string:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/tourguide-marketplace
   ```

## 3. Deploy the backend (Render — free)

1. https://render.com → New → Web Service → connect your GitHub repo
2. Render reads `render.yaml` automatically. If asked manually:
   - **Build Command:** `npm install`
   - **Start Command:** `npm run server`
3. Environment variables (Render dashboard):
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | any long random string |
   | `FRONTEND_URL` | fill in after step 4 |
   | `NODE_ENV` | `production` |
4. Deploy. Copy the resulting URL, e.g. `https://tourguide-backend.onrender.com`

> Free Render instances sleep when idle — first request after a while takes ~30-50s to wake up. Normal.

## 4. Deploy the frontend (Vercel — free)

1. https://vercel.com → Add New → Project → import the same repo
2. Framework preset: **Vite**
3. Environment variable:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://tourguide-backend.onrender.com/api` |
4. Deploy. You'll get a URL like `https://tourguide-marketplace.vercel.app`

## 5. Connect the two directions

Back in Render → Environment → set:
```
FRONTEND_URL=https://tourguide-marketplace.vercel.app
```
Render redeploys automatically after saving env vars.

## 6. Verify

```bash
curl https://tourguide-backend.onrender.com/api/guides
```
Expect `[]` — empty is normal until guides register. Then open the Vercel URL: the homepage loads real guides from the API, falling back to 5 sample guides if none exist yet.

## 7. Every future change

```bash
git add .
git commit -m "describe your change"
git push
```
Both Vercel and Render redeploy automatically from `main`.

## Optional: run locally

```bash
npm install
cp .env.example .env       # fill in your own Mongo URI, JWT secret, etc.
npm run server              # backend on :5000
npm run client               # frontend on :3000 (separate terminal)
```

## Optional: custom domain

- **Vercel:** Project → Settings → Domains
- **Render:** Service → Settings → Custom Domain

---

## What's already live vs. what still needs building

**Live and connected:** the homepage guide listing fetches real data from `GET /api/guides`.

**Backend ready, frontend UI not built yet** (the original `App.jsx` is a
homepage/browse shell only — no login, booking, or review forms exist,
just nav buttons):
- Registration / login
- Booking flow
- Review submission
- Guide dashboard editing / photo upload

The functions for all of these already exist in `api.js`
(`authAPI`, `bookingsAPI`, `reviewsAPI`, `toursAPI`) — just need forms built
to call them. Say the word and I'll build those out next.
