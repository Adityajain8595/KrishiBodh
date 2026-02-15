# AgriTech AI – Setup Guide (0 to Run)

Follow these steps in order. Choose **Option A** if you only need the UI; **Option B** for frontend + backend on your machine; **Option C** for everything in Docker.

---

## Step 0: Prerequisites

Install these once on your machine.

| Requirement | Purpose | How to check |
|-------------|---------|--------------|
| **Node.js** (v18 or v20 LTS) | Frontend (React, Vite) | `node -v` |
| **npm** (comes with Node) | Install frontend dependencies | `npm -v` |
| **Python 3.11+** (optional) | Backend (FastAPI) – only for Option B | `python -v` or `py -3 -V` |
| **Docker + Docker Compose** (optional) | Full stack – only for Option C | `docker -v` and `docker compose version` |

- **Node.js**: Download from [nodejs.org](https://nodejs.org/) (LTS). On Windows you can also use [nvm-windows](https://github.com/coreybutler/nvm-windows).
- **Python**: Download from [python.org](https://www.python.org/downloads/) or `winget install Python.Python.3.12`. Ensure "Add Python to PATH" is checked.
- **Docker**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Compose).

---

## Step 1: Get the project on your machine

If the project is already on your Desktop (e.g. `deep`):

```text
C:\Users\YourName\Desktop\deep
```

If you use Git and clone from a repo:

```bash
git clone <repository-url>
cd deep
```

Your folder should contain at least:

- `frontend/` – React app (AgriTech UI)
- `backend/` – FastAPI app (optional for UI-only)
- `docker-compose.yml` – optional, for Docker

---

## Step 2: Install frontend dependencies

Open a terminal (PowerShell or Command Prompt) and run:

```bash
cd C:\Users\PRANJAL MISHRA\Desktop\deep\frontend
```

Then:

```bash
npm install
```

Wait until it finishes (no red errors). This installs React, Vite, Tailwind, Recharts, React Router, Lucide icons, etc.

---

## Step 3: Run the frontend (AgriTech UI)

Still in the `frontend` folder:

```bash
npm run dev
```

You should see something like:

```text
  VITE v5.x.x  ready in xxx ms
  Local:   http://localhost:5173/
  Network: use --host to expose
```

- Open a browser and go to: **http://localhost:5173**
- You should see the AgriTech AI platform: Dashboard, sidebar (Water & Irrigation, Crop Recommendation, Yield & Pest, AI Assistant, Reports, Settings).

**This is enough to use and demo the full UI.** The app uses in-page data; no backend is required for the current UI.

---

## Step 4 (optional): Run the backend locally (Option B)

Use this only if you want the FastAPI server running on your machine (e.g. to add or test APIs).

### 4.1 Create a Python virtual environment

In the project root (e.g. `C:\Users\PRANJAL MISHRA\Desktop\deep`):

**Windows (PowerShell):**

```bash
cd C:\Users\PRANJAL MISHRA\Desktop\deep
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If you get an execution policy error:

```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run `.\venv\Scripts\Activate.ps1` again.

**Windows (Command Prompt):**

```bash
cd C:\Users\PRANJAL MISHRA\Desktop\deep
python -m venv venv
venv\Scripts\activate.bat
```

You should see `(venv)` in the prompt.

### 4.2 Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

This can take several minutes (PyTorch and other ML libs are large).

### 4.3 Configure environment (optional)

Backend can run with defaults. To override (e.g. DB, CORS), copy and edit:

```bash
copy .env.example .env
# Edit .env with your DB URL, CORS origins, etc.
```

If there is no `.env.example`, the app uses defaults from `app/core/config.py`.

### 4.4 Start the API server

From the `backend` folder (with `venv` active):

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be at: **http://localhost:8000**  
Docs: **http://localhost:8000/docs**

Keep this terminal open. In another terminal, run the frontend (`npm run dev` in `frontend`) if not already running.

---

## Step 5 (optional): Run everything with Docker (Option C)

Use this to run frontend + API + PostgreSQL + Redis together.

### 5.1 Open project root

```bash
cd C:\Users\PRANJAL MISHRA\Desktop\deep
```

### 5.2 Backend `.env` (required for Docker API)

Ensure `backend/.env` exists. If not, create it with at least:

```env
# backend/.env
CORS_ALLOW_ORIGINS=["http://localhost:5173","http://localhost:4173"]
```

Adjust if your frontend runs on a different port.

### 5.3 Build and start all services

```bash
docker compose up --build
```

First run will build images and pull Postgres/Redis; it can take several minutes.

### 5.4 Access the app

- **Frontend**: http://localhost:5173 (if the frontend container serves it; see note below)
- **API**: http://localhost:8000 (if mapped in `docker-compose.yml`)
- **API docs**: http://localhost:8000/docs

**Note:** Your `docker-compose.yml` may map the frontend to port 5173 or 4173. Check the `ports` section under `frontend` and open the URL shown there. If you prefer to run the frontend locally (faster for UI work), keep using `npm run dev` in `frontend` and only run API/DB/Redis with Docker:

```bash
docker compose up --build api db redis
```

---

## Step 6: Verify everything works

1. **Frontend**
   - Open http://localhost:5173
   - Click: Dashboard, Water & Irrigation, Crop Recommendation, Yield & Pest Intelligence, AI Assistant, Reports, Settings.
   - Sidebar collapse/expand and (on small windows) mobile menu should work.

2. **Backend (if running)**
   - Open http://localhost:8000/docs
   - Try a simple GET (e.g. health or system) to confirm the API responds.

3. **Stopping**
   - Frontend: In the terminal where `npm run dev` is running, press `Ctrl+C`.
   - Backend: Same – `Ctrl+C` in the terminal where uvicorn is running.
   - Docker: In the project root, `docker compose down`.

---

## Quick reference

| Goal | Command | Where |
|------|---------|--------|
| Install frontend deps | `npm install` | `frontend/` |
| Run UI only | `npm run dev` | `frontend/` |
| Build UI for production | `npm run build` | `frontend/` |
| Preview production build | `npm run preview` | `frontend/` |
| Create venv | `python -m venv venv` | project root |
| Activate venv (Windows) | `.\venv\Scripts\Activate.ps1` or `venv\Scripts\activate.bat` | project root |
| Install backend deps | `pip install -r requirements.txt` | `backend/` |
| Run API | `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` | `backend/` |
| Run all with Docker | `docker compose up --build` | project root |
| Stop Docker | `docker compose down` | project root |

---

## Minimum path to “see it run” (no backend, no Docker)

1. Install Node.js (LTS).
2. Open terminal: `cd C:\Users\PRANJAL MISHRA\Desktop\deep\frontend`
3. Run: `npm install`
4. Run: `npm run dev`
5. Open browser: http://localhost:5173

That’s it. You now have each step from 0 to running the AgriTech AI project.
