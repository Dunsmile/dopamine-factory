# market-sentiment-worker

Cloudflare Worker that crawls DCInside/FMKorea posts and stores market sentiment snapshots in Firestore.

## Local

```bash
npm install
npm run test
npm run dev
```

## Required Secrets

```bash
wrangler secret put FIREBASE_PROJECT_ID
wrangler secret put FIREBASE_CLIENT_EMAIL
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put MARKET_ADMIN_KEY
```

## API

- `GET /api/market/assets`
- `GET /api/market/sentiment/current?asset=BTC`
- `GET /api/market/sentiment/history?asset=BTC&period=24h`
- `GET /api/market/posts?asset=BTC&limit=30`
- `POST /api/market/pipeline/run` (`x-admin-key` required)
- `GET /api/market/health`
