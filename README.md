# manepay⚡💳

> *Empowering commerce everywhere—even where the signal stops.*

---

## Problem Statement

Everyday, thousands if not millions of people struggle or get "payment anxiety" when they make an online payment to a merchant and the screen just buffers around without the assurance of whether the payment has been made or not, this is true in situations where there is little to no internet available either due to their geographical location, network traffic in the area, and other reasons. Hence, we felt the ultimate need to build an app which tackles this problem by allowing users to pay to merchants offline(i.e., without the use of internet) and also allows the merchant to keep a digital ledger for their business, which they could use for their future financial references.

---

## 🌟 Features

* **🌐 100% Offline Capability:** Process transactions seamlessly in remote areas, underground markets, flights, or during major network outages without dropping a single sale.
* **⚡ Lightning-Fast Local Handshakes:** Complete a secure payment in under 2 seconds using optimized **Bluetooth Low Energy (BLE)** and **NFC tap-to-pay** protocols.
* **🛡️ Tamper-Proof Cryptography:** Advanced asymmetric encryption and pre-signed token certificates eliminate double-spending risks while keeping user funds secure offline.
* **🔄 Smart Auto-Reconciliation:** No manual bookkeeping needed! The app automatically detects returning network connectivity and securely syncs all pending offline ledgers to the cloud.
* **📊 Real-Time Merchant Ledger:** Track pending offline balances, completed settlements, and daily sales totals instantly on an intuitive local dashboard.
* **🔋 Ultra-Low Power Consumption:** Engineered to run efficiently on budget smartphones without draining the device's battery during active peer-to-peer broadcasting.

---

## 🚀 Overview

**ManePay** is a decentralized, peer-to-peer payment gateway designed for merchants and users operating in regions with little to no cellular or internet coverage. By bridging the gap between local device communication and backend banking infrastructure, ManePay ensures that business never has to pause due to infrastructure failures.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons
* **Build System:** Vite 8 (SPA optimized)
* **Local Connectivity:** BLE & NFC Tap-to-Pay simulation & protocols
* **Security & Crypto:** ECDSA Cryptographic Signatures & Secure Tokens
* **Local Storage:** Browser persistent storage & offline ledgers
* **Container & Serving:** Multi-stage Docker (Nginx Alpine) & Express static server

---

## ⚙️ How It Works

```text
[ Merchant App ]  ---( Broadcasts BLE/NFC Beacon )--->  [ Customer App ]
      ^                                                         |
      |                                              ( Enters Amount & Signs Token )
      |<---( Transfers Cryptographic Token Securely )-----------|
      |
[ Local Verification & Instant Success ] 
      |
      +---( Auto-Syncs to Cloud once Internet is Restored )---> [ Bank Settlement ]
```

---

## 🚀 Running Locally

**Prerequisites:** Node.js 20.19+ or 22.12+ (required by Vite 8)

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
   npm run build
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

In your GitHub repository:
1. Go to **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
3. Pushes to `main` will automatically build and publish the app to `https://<your-username>.github.io/<your-repo-name>/`.

---

### Option 4: Docker / Cloud Run / VPS / Render
A production multi-stage [`Dockerfile`](Dockerfile) and optimized [`nginx.conf`](nginx.conf) are included:

1. **Build Docker image:**
   ```bash
   docker build -t manepay-app .
   ```

2. **Run container:**
   ```bash
   docker run -p 8080:80 manepay-app
   ```
   Open [http://localhost:8080](http://localhost:8080).

---

### Option 5: Node.js / Render / Railway Web Service
The repository includes [`server.js`](server.js):
- **Build command:** `npm run build`
- **Start command:** `npm start`
- Port dynamically binds to `process.env.PORT` (defaults to 3000) with a `/health` endpoint for monitoring.
