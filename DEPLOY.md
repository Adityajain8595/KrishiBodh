# KrishiBodh – Step-by-Step Deployment Guide (Free, No Credit Card)

Follow these steps **in order**. Do not skip steps. After each step, check the “✓ Check” before moving on.

---

## Before You Start – Checklist

Have these ready:

| Item | Where to get it |
|------|------------------|
| **GitHub account** | [github.com](https://github.com) – Sign up if needed |
| **Render account** | [render.com](https://render.com) – Sign up with GitHub (no credit card) |
| **Firebase project** | [Firebase Console](https://console.firebase.google.com) – You already use this locally |
| **Gemini API key** | [Google AI Studio](https://aistudio.google.com/apikey) or Google Cloud |
| **Groq API key** (optional, for voice input) | [console.groq.com](https://console.groq.com) |
| **Google Cloud TTS** (optional, for voice output) | Same Firebase/Google Cloud project or separate service account |

---

## Step 1: Prepare Your Code and Push to GitHub

### 1.1 Open terminal in your project folder

```bash
cd "C:\Users\PRANJAL MISHRA\Desktop\deep - Copy"
```

### 1.2 Ensure secrets are not committed

- Make sure you have **no** `.env` or `key.json` in the repo (they should be in `.gitignore`).
- If `backend-node/key.json` exists, do **not** add it to git. The `.gitignore` already excludes `**/key.json`.

### 1.3 Initialize git (if not already)

```bash
git status
```

- If you see "not a git repository", run:

```bash
git init
git add .
git commit -m "Prepare for deployment"
```

- If you already have a repo and have uncommitted changes:

```bash
git add .
git commit -m "Prepare for deployment"
```

### 1.4 Create a new repository on GitHub

1. Go to [github.com/new](https://github.com/new).
2. **Repository name:** e.g. `krishibodh` (or any name).
3. **Public.**
4. Do **not** add README, .gitignore, or license (you already have them).
5. Click **Create repository**.

### 1.5 Connect and push

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M master
git push -u origin master
```

If you already had a remote:

```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin master
```

✓ **Check:** On GitHub you see your project with folders `backend-node` and `frontend`. There is no `.env` or `key.json` in the file list.

---

## Step 2: Get Firebase and API Keys Ready

### 2.1 Firebase Web config (for frontend)

1. Go to [Firebase Console](https://console.firebase.google.com) → your project.
2. Click the **gear** → **Project settings**.
3. Under **Your apps**, select your web app (or create one).
4. Copy these 6 values (you will use them in Step 4):

   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

Keep them in a notepad. **Do not** share or commit them; you will paste them only in Render’s Environment.

### 2.2 Firebase Service Account JSON (for backend auth)

1. In Firebase Console → **Project settings** → **Service accounts**.
2. Click **Generate new private key** → **Generate key**. A JSON file downloads.
3. Open the JSON file in a text editor.
4. **Minify it to one line** (required for Render environment variable):
   - Remove all line breaks and extra spaces.
   - You can use [jsonformatter.org](https://jsonformatter.org) → paste JSON → “Minify” → copy result.
   - Or in Notepad: replace newlines with nothing so the whole JSON is on a single line.
5. Save this single-line string somewhere safe (e.g. a local file that you will **not** commit). You will paste it in Step 3 as `FIREBASE_SERVICE_ACCOUNT`.

### 2.3 Gemini API key

- Get your key from [Google AI Studio](https://aistudio.google.com/apikey) or your Google Cloud project.
- Keep it ready for Step 3.

### 2.4 (Optional) Groq API key – for Speech-to-Text

- Sign up at [console.groq.com](https://console.groq.com), create an API key.
- If you skip this, **voice input** will not work; rest of the app will work.

### 2.5 (Optional) Google Cloud TTS – for voice output

- Either use the **same** service account JSON as Firebase (if it has Cloud TTS enabled), or create a separate service account with Text-to-Speech API enabled and download its JSON.
- Minify that JSON to one line. You will use it as `GOOGLE_CLOUD_TTS_KEY` in Step 3.
- If you skip this, **voice output** will not work; text answers will still work.

✓ **Check:** You have: (1) 6 Firebase web config values, (2) one-line Firebase service account JSON, (3) Gemini API key, and optionally (4) Groq key, (5) TTS JSON.

---

## Step 3: Deploy Backend on Render

### 3.1 Create Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Log in with **GitHub** (no credit card).
3. Click **New +** → **Web Service**.
4. Under **Connect a repository**, select your **GitHub repo** (e.g. `krishibodh`). If you don’t see it, click **Configure account** and grant Render access to the repo.

### 3.2 Configure the service

Fill in **exactly** as below. Do not change Root Directory or Build/Start commands.

| Field | Value |
|-------|--------|
| **Name** | `krishibodh-api` (or any name; you’ll get `krishibodh-api.onrender.com`) |
| **Region** | **Singapore** (or closest to India) |
| **Branch** | `master` |
| **Root Directory** | `backend-node` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | **Free** |

### 3.3 Add Environment Variables

Click **Advanced** → **Add Environment Variable**. Add each of these **one by one**:

| Key | Value | Notes |
|----|--------|--------|
| `NODE_ENV` | `production` | Exact text |
| `GEMINI_API_KEY` | Your Gemini API key | Paste the key |
| `FIREBASE_SERVICE_ACCOUNT` | Your **one-line** Firebase service account JSON | Paste the whole minified JSON string. No line breaks inside the value. |
| `CORS_ORIGIN` | Leave **empty** for now | You will set this in Step 5 after frontend is live |

**Do not set** `PORT` – Render sets it automatically.

Optional (for full functionality):

| Key | Value |
|----|--------|
| `GROQ_API_KEY` | Your Groq API key (for STT / voice input) |
| `GOOGLE_CLOUD_TTS_KEY` | One-line JSON of Google Cloud service account with TTS enabled (for voice output) |
| `DATA_GOV_IN_API_KEY` | If you use data.gov.in for market prices |

**Important for `FIREBASE_SERVICE_ACCOUNT`:**

- The value must be the **entire** JSON as a **single line**.
- In Render’s value box, paste that single line. If the value is long, Render accepts it.
- Do not wrap it in extra quotes. Just the raw JSON string.

### 3.4 Create and wait for deploy

1. Click **Create Web Service**.
2. Wait for the first deploy (about 2–5 minutes). Watch the **Logs** tab for errors.
3. When status is **Live**, copy your service URL, e.g.:
   - `https://krishibodh-api.onrender.com`

### 3.5 Test backend

Open in browser (use your actual URL):

```
https://YOUR-BACKEND-NAME.onrender.com/health
```

You should see JSON:

```json
{"status":"ok","service":"agritech-api"}
```

✓ **Check:** Backend is Live and `/health` returns the JSON above. Save the backend URL; you need it for the frontend.

---

## Step 4: Deploy Frontend on Render

### 4.1 Create Static Site

1. In Render dashboard, click **New +** → **Static Site**.
2. Select the **same** GitHub repo.
3. Click **Connect**.

### 4.2 Configure the site

Fill in **exactly**:

| Field | Value |
|-------|--------|
| **Name** | `krishibodh` (or any name; you’ll get `krishibodh.onrender.com`) |
| **Branch** | `master` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 4.3 Add Environment Variables (critical)

Click **Advanced** → **Add Environment Variable**. Add **every** variable below.  
**Order does not matter**, but **names and values** must be exact.

**Backend URL (required):**

| Key | Value |
|----|--------|
| `VITE_API_BASE` | Your backend URL **with no trailing slash**, e.g. `https://krishibodh-api.onrender.com` |

**Firebase (required for login):**

| Key | Value |
|----|--------|
| `VITE_FIREBASE_API_KEY` | From Step 2.1 |
| `VITE_FIREBASE_AUTH_DOMAIN` | From Step 2.1 |
| `VITE_FIREBASE_PROJECT_ID` | From Step 2.1 |
| `VITE_FIREBASE_STORAGE_BUCKET` | From Step 2.1 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | From Step 2.1 |
| `VITE_FIREBASE_APP_ID` | From Step 2.1 |

So you have **7** environment variables for the frontend. Double-check:

- `VITE_API_BASE` = backend URL, no `/` at the end.
- All 6 Firebase variables match your Firebase Console web app config.

### 4.4 Create and wait for deploy

1. Click **Create Static Site**.
2. Wait for build and deploy (about 3–6 minutes). If build fails, open **Logs** and fix the error (often a missing env var or typo).
3. When status is **Live**, copy your site URL, e.g.:
   - `https://krishibodh.onrender.com`

✓ **Check:** Frontend is Live. Save the frontend URL; you need it for Step 5.

---

## Step 5: Connect Frontend and Backend (CORS + Firebase)

### 5.1 Set CORS on backend

1. In Render dashboard, open your **Web Service** (backend).
2. Go to **Environment** tab.
3. Find `CORS_ORIGIN`. If it’s empty, click **Edit** (or Add) and set:
   - **Key:** `CORS_ORIGIN`
   - **Value:** Your **frontend** URL, **no trailing slash**, e.g. `https://krishibodh.onrender.com`
4. Save. Render will **redeploy** the backend automatically (wait 1–2 minutes).

### 5.2 Add your site to Firebase Authorized domains

1. Go to [Firebase Console](https://console.firebase.google.com) → your project.
2. **Authentication** → **Settings** → **Authorized domains**.
3. Click **Add domain**.
4. Enter your Render frontend host **without** `https://`, e.g.:
   - `krishibodh.onrender.com`
5. Save.

✓ **Check:** Backend has `CORS_ORIGIN` = frontend URL, and Firebase lists your `*.onrender.com` domain.

---

## Step 6: Verify Everything Works

### 6.1 Open the app

1. Open your **frontend** URL in the browser, e.g. `https://krishibodh.onrender.com`.
2. You should see the KrishiBodh landing/login page (no “Failed to fetch” or blank screen).

### 6.2 Test login

1. Click **Login** / **Sign in**.
2. Sign in with **Google** (or your configured method).
3. You should land on the dashboard. If you see “Authentication failed” or 401, re-check:
   - Firebase authorized domain (Step 5.2).
   - Backend `FIREBASE_SERVICE_ACCOUNT` is the full, valid, one-line JSON.

### 6.3 Test API features (while logged in)

| Feature | How to test | If it fails |
|--------|-------------|-------------|
| **Yield prediction** | Open Yield / Crop page, enter crop + location, get prediction | Check browser Network tab: request to `.../api/yield/predict` should go to backend URL; if CORS error, re-check `CORS_ORIGIN` and `VITE_API_BASE`. |
| **Pest advisory** | Open Pest page, enter crop + location, get risk | Same as above for `/api/pests/analyze`. |
| **Weather** | Use any feature that uses location (e.g. yield or irrigation) | Backend uses weather API; if you didn’t set a weather key, some features may still work with fallback. |
| **Assistant (Gemini)** | Open Assistance / AI Assistant, ask a question in text | If “Assistant unavailable”, check backend env: `GEMINI_API_KEY` must be set and valid. |
| **Voice input (STT)** | Use microphone in assistant (if available) | Needs `GROQ_API_KEY` on backend. Without it, only text input works. |
| **Voice output (TTS)** | Click “speak” / play answer (if available) | Needs `GOOGLE_CLOUD_TTS_KEY` (or TTS-enabled credentials) on backend. Without it, only text answer works. |
| **Market prices** | Open Market prices page | May use mock or external API; optional `DATA_GOV_IN_API_KEY`. |

### 6.4 First request slow?

- On Render **free** tier, the backend **sleeps** after ~15 minutes of no traffic.
- The **first** request after that can take **30–60 seconds**. Later requests are fast.
- This is normal; no error.

✓ **Check:** You can log in, open dashboard, and use at least yield, pest, and assistant (text). Optional: STT/TTS and market work if you set the keys.

---

## Summary of Your URLs

| What | URL |
|------|-----|
| **Backend** | `https://YOUR-BACKEND-NAME.onrender.com` |
| **Backend health** | `https://YOUR-BACKEND-NAME.onrender.com/health` |
| **Frontend (main)** | `https://YOUR-FRONTEND-NAME.onrender.com` |

Share the **frontend** URL with users. Keep backend URL only for `VITE_API_BASE` and debugging.

---

## Troubleshooting

### “Backend not reachable” or CORS error in browser

- **Backend:** Env var `CORS_ORIGIN` must be **exactly** the frontend URL (e.g. `https://krishibodh.onrender.com`), no trailing slash, same protocol (https).
- **Frontend:** `VITE_API_BASE` must be **exactly** the backend URL, no trailing slash.
- After changing env vars, wait for redeploy (1–2 min) and hard-refresh the app (Ctrl+Shift+R).

### 401 Unauthorized on login or on API calls

- **Firebase:** Add the Render frontend domain in **Authentication → Authorized domains** (e.g. `krishibodh.onrender.com`).
- **Backend:** `FIREBASE_SERVICE_ACCOUNT` must be the **full** Firebase service account JSON, **one line**, valid JSON (no missing brackets, no extra quotes around the whole value).

### “Authentication service unavailable” (503)

- Backend could not parse or load `FIREBASE_SERVICE_ACCOUNT`. Check Render **Logs** for the exact error.
- Fix the JSON (minify again, ensure it’s one line, no truncation when pasting).

### Gemini / Assistant not working

- In Render → **backend** → **Environment**, set `GEMINI_API_KEY` to a valid key.
- Redeploy if you just added it.

### Build failed (frontend)

- Check **Logs** in Render for the failing command (often `npm run build`).
- Typical causes: missing env var (e.g. one of the `VITE_*`), or Node version. Render usually uses a recent Node for Static Sites; if you need a specific version, we can add an `.nvmrc` or `engines` in `package.json`.

### Build failed (backend)

- Check **Logs**. Common: typo in Start Command (must be `npm start`), or missing `engines` if Node version is wrong. Your `package.json` has `"engines": {"node": ">=18"}` which is fine.

---

## Security Reminders

- **Never** commit `.env` or `key.json` to GitHub. Use Render’s Environment for all secrets.
- In Firebase, only add domains you actually use (e.g. your Render URL).
- Keep your Gemini, Groq, and service account keys private; use them only in Render env vars.

---

You now have a working deployment with all core functionalities. For voice input/output and market data, add the optional keys and redeploy the backend.
