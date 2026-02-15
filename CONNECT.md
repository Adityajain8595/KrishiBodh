# Connect Frontend to Backend (0 to Working)

Steps to run the AgriTech frontend and Node.js backend together so the UI calls the real API.

---

## Step 0: Prerequisites

- **Node.js** (v18 or v20 LTS) installed. Check: `node -v` and `npm -v`.
- Project folder: e.g. `C:\Users\PRANJAL MISHRA\Desktop\deep`.

---

## Step 1: Start the backend (Node.js API)

Open a terminal (Terminal 1).

```bash
cd C:\Users\PRANJAL MISHRA\Desktop\deep\backend-node
```

Install dependencies (first time only):

```bash
npm install
```

Start the API server:

```bash
npm run dev
```

You should see:

```
AgriTech API listening on port 3000
```

Leave this terminal open. The backend serves:

- `GET http://localhost:3000/health`
- `POST http://localhost:3000/api/irrigation/predict`
- `POST http://localhost:3000/api/crops/recommend`
- `POST http://localhost:3000/api/yield/predict`
- `POST http://localhost:3000/api/pests/analyze`
- `POST http://localhost:3000/api/chat/ask`

---

## Step 2: Start the frontend (React + Vite)

Open a **second** terminal (Terminal 2).

```bash
cd C:\Users\PRANJAL MISHRA\Desktop\deep\frontend
```

Install dependencies (first time only):

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

You should see something like:

```
  Local:   http://localhost:5173/
```

Leave this terminal open.

---

## Step 3: How they connect

- The **frontend** runs at **http://localhost:5173**.
- The **backend** runs at **http://localhost:3000**.
- In development, **Vite proxies** `/api` and `/health` from the frontend to the backend. So when the UI calls `/api/irrigation/predict`, the request goes to the same origin (5173), and Vite forwards it to `http://localhost:3000/api/irrigation/predict`.
- No extra env vars are needed for local dev; the proxy is configured in `frontend/vite.config.ts`.

---

## Step 4: Use the app

1. In the browser, open **http://localhost:5173**.
2. Go to **Water & Irrigation**, fill the form, and click **Run AI optimization**. The efficiency score, risk, schedule, and recommendations should come from the backend.
3. Go to **Crop Recommendation**, fill the form, and click **Get recommendations**. The ranked crops and confidence should come from the API.
4. Go to **Yield & Pest Intelligence**, fill the form, and click **Run yield and pest analysis**. Predicted yield and pest risk should come from the API.
5. Go to **AI Assistant**, type a question, and send. The answer should come from the backend (context depends on the last module you were on).

If any request fails, check:

- Backend is still running in Terminal 1 (port 3000).
- Frontend is still running in Terminal 2 (port 5173).
- Browser console (F12) and Terminal 1 for error messages.

---

## Step 5: Stopping

- In **Terminal 1** (backend): press `Ctrl+C`.
- In **Terminal 2** (frontend): press `Ctrl+C`.

---

## Summary

| Step | Where | Command |
|------|--------|---------|
| 1 | `deep/backend-node` | `npm install` then `npm run dev` |
| 2 | `deep/frontend` | `npm install` then `npm run dev` |
| 3 | Browser | Open http://localhost:5173 |
| 4 | App | Use Water, Crop, Yield, Pest, and AI Assistant; data comes from backend |

Connection is done via the Vite proxy: frontend and backend are connected from the moment both servers are running.
