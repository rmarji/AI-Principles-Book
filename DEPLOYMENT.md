# Deployment Guide - AI Principles Book

## Quick Deploy Options

### Option 1: Railway (Recommended)
1. Connect GitHub repo to Railway
2. Railway auto-detects Node.js
3. Set `PORT` env var (Railway sets automatically)
4. Deploy with: `npm run build && npm start`

**Estimated time:** 5 minutes

### Option 2: Render
1. Create new Web Service
2. Connect GitHub repo
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Environment: Node 20+

**Estimated time:** 5 minutes

### Option 3: Vercel (with Serverless adapter)
1. Connect GitHub repo
2. Framework preset: Other
3. Build: `npm run build`
4. Output: `dist/` directory
5. Note: May need Express-to-Vercel adapter

### Option 4: Self-hosted VPS
```bash
git clone <repo>
cd AI-Principles-Book
npm install
npm run build
NODE_ENV=production PORT=3000 npm start
# Use nginx/caddy as reverse proxy
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| PORT | No | Server port (default: 5000) |
| NODE_ENV | No | Set to 'production' |
| DATABASE_URL | No | PostgreSQL (uses in-memory if unset) |

## Pre-deploy Checklist

- [x] All chapters have Works Cited (38+ citations)
- [x] Content updated to 2025/2026 tech
- [ ] Test PDF export locally
- [ ] Test Word export locally
- [ ] Verify all 10 chapters load
- [ ] Check mobile responsiveness

## Build Requirements

- Node.js 20+
- npm or bun
- ~500MB disk for node_modules

## Post-deploy

1. Verify homepage loads
2. Test chapter navigation
3. Test PDF export
4. Test Word export
5. Set up analytics (OPS-22)
6. Create landing page (OPS-21)

---
Created: 2026-02-27
Status: Ready for deployment
