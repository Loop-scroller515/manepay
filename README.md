# FluxPay Proximity - Contactless Payments & SoftPOS

Instant cryptographically secure BLE & NFC proximity payments, SoftPOS mobile terminal, and realtime settlement radar.

---

## 🚀 Running Locally

**Prerequisites:** Node.js 18+ (tested on Node 22)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Type-check and Lint:**
   ```bash
   npm run lint
   ```

4. **Production Build:**
   ```bash
   npm run build
   ```

5. **Preview Production Build:**
   ```bash
   npm run preview
   ```
   Or run the included production Node server:
   ```bash
   npm start
   ```

---

## 🌐 Deployment Options

The project includes ready-to-use configuration files for all major hosting providers:

### Option 1: Vercel (Recommended for instant deployment)
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository. The project will automatically be recognized as a **Vite** project (configured with `vercel.json`).
4. Click **Deploy**.

*Or using the Vercel CLI:*
```bash
npx vercel
```

---

### Option 2: Netlify
1. Push your repository to GitHub.
2. Go to [netlify.com](https://netlify.com) and click **"Add new site"** -> **"Import an existing project"**.
3. Select your repository. The build settings (`npm run build` and publish directory `dist`) are already configured in `netlify.toml` and `public/_redirects`.
4. Click **Deploy site**.

*Or using the Netlify CLI:*
```bash
npx netlify deploy --prod
```

---

### Option 3: GitHub Pages (Free automated CI/CD)
The project comes with a preconfigured GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit for deployment"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** -> **Pages**.
   - Under **Build and deployment** -> **Source**, select **GitHub Actions**.
3. Pushes to `main` will automatically build and publish the app to `https://<your-username>.github.io/<your-repo-name>/`.

---

### Option 4: Docker / Cloud Run / VPS / Render
A production multi-stage [`Dockerfile`](Dockerfile) and optimized [`nginx.conf`](nginx.conf) are included:

1. **Build Docker image:**
   ```bash
   docker build -t fluxpay-app .
   ```

2. **Run container:**
   ```bash
   docker run -p 8080:80 fluxpay-app
   ```
   Open [http://localhost:8080](http://localhost:8080).

---

### Option 5: Node.js / Render / Railway Web Service
The repository includes [`server.js`](server.js):
- **Build command:** `npm run build`
- **Start command:** `npm start`
- Port dynamically binds to `process.env.PORT` (defaults to 3000) with a `/health` endpoint for monitoring.
