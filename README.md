# CMS Template — Blades Vision Tech

Reusable content management system for client websites.

## Stack

- Next.js 15 App Router
- Tailwind CSS v4
- GitHub API (Octokit) — reads/writes JSON files directly to client's website repo
- Vercel auto-deploy

## How it works

1. Client logs in → edits content → clicks "Save & Publish"
2. CMS commits JSON to client's website repo via GitHub API
3. Vercel detects the push → rebuilds the website
4. Live in ~30–60 seconds

---

## Setup for a new client

### 1. Clone this repo

```bash
git clone https://github.com/bladesvisiontech/cms-template
cd cms-template
rm -rf .git
git init
git remote add origin https://github.com/YOUR_ORG/cms-CLIENT.git
```

### 2. Generate bcrypt hash for client password

```bash
npm install
node -e "const b=require('bcryptjs'); b.hash('ClientPassword',10).then(h=>console.log(h))"
```

### 3. Set environment variables in Vercel

Copy `.env.example` and fill in all values.

Key variables:
- `GITHUB_TOKEN` — client's GitHub token (needs repo read/write)
- `GITHUB_OWNER` — client's GitHub username
- `GITHUB_REPO` — client's **website** repo name (not this CMS repo)
- `CONTENT_BASE_PATH` — folder inside website repo where JSON files live
- `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` — CMS login credentials

### 4. Adapt pages to client's content structure

- Edit `components/Sidebar.tsx` — update navigation links
- Edit `app/(protected)/dashboard/page.tsx` — update section cards
- Edit or create pages under `app/(protected)/` to match client's JSON structure

### 5. Deploy to Vercel

Connect to the client's GitHub repo and deploy.

---

## Adding a new page

1. Create `app/(protected)/[section]/page.tsx`
2. Fetch from `/api/content?file=data.json` (or your JSON file)
3. Add the route to `Sidebar.tsx` and `dashboard/page.tsx`

## Image uploads

Images are uploaded to the client's website repo under `public/` via `/api/upload`.
The URL returned is a relative path like `/cms-filename.jpg`.
