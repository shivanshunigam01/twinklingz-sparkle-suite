# Deploy Twinklingz storefront (Vercel)

Production: **https://www.twinklingz.com** (Vercel)

## One-time: link Vercel CLI

```bash
cd twinklingz-sparkle-suite
npx vercel login
npx vercel link   # pick the existing Twinklingz project
```

## Production deploy

```bash
npm run deploy
```

Or:

```bash
npx vercel deploy --prod
```

Build uses `VITE_API_URL` from `.env.production` (`https://api.twinklingz.com/api`).

## Git push

If the Vercel Git integration is connected to `shivanshunigam01/twinklingz-sparkle-suite`, every push to `main` should auto-deploy. If not, use the CLI steps above.

## API (backend)

Deploy separately on the VPS — see `../twinklingz-backend/DEPLOY.md`:

```bash
cd /var/www/twinklingz-backend
git pull
npm ci
pm2 restart twinklingz-api
curl -s http://127.0.0.1:5010/api/health
```
