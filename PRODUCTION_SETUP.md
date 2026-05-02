# 🌍 Full Production Deployment Guide

We are moving your app from your computer to the **Real Cloudflare Internet**.

### 1. Backend: Deploy to Cloudflare Workers
Open your terminal and run these 3 commands:
```bash
cd backend
# Create the tables on the real internet
npx wrangler d1 execute smart-language-db --remote --file=schema.sql
# Set your secure key
npx wrangler secret put JWT_SECRET
# Deploy the code
npm run deploy
```
**Take note of the URL it gives you** (e.g., `https://smart-language-app-backend.your-subdomain.workers.dev`).

---

### 2. Frontend: Connect to the Live Backend
1. Open `frontend/src/config.ts`.
2. Replace `http://localhost:8787` with your **New Backend URL** from Step 1.
```typescript
export const API_URL = 'https://your-backend-url.workers.dev';
```

---

### 3. Frontend: Deploy to Cloudflare Pages
I recommend **Cloudflare Pages** over GitHub Pages because it integrates perfectly with Workers.
1. In your terminal, run:
```bash
cd frontend
npm run build
npx wrangler pages deploy dist
```
2. It will ask for a project name. Call it `german-mastery`.
3. It will give you a **Live Website URL** (e.g., `https://german-mastery.pages.dev`).

---

### 4. Custom Domain
1. Go to your **Cloudflare Dashboard** > **Workers & Pages** > **Overview**.
2. Select your `german-mastery` project.
3. Go to **Custom Domains** and click **Set up a custom domain**.
4. Type your domain (e.g., `learn.yourdomain.com`).

---

### 📱 Android (.APK) Final Step
Now that your app is on the internet, your Android app will work anywhere in the world!
1. Make sure `frontend/src/config.ts` has your **Live Backend URL**.
2. Run:
```bash
cd frontend
npm run build
npx cap sync
```
3. Open **Android Studio** and click **Build APK**. This installer will now talk to the Cloudflare database automatically!

---

### 🚀 Summary
*   **Hosting:** Cloudflare (Backend + Frontend).
*   **Database:** Cloudflare D1 (No local data anymore).
*   **Android:** Fully connected to the Cloud.

**You are now officially a global platform owner!** 🌍🚀
