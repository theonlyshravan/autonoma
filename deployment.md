# Autonoma Deployment Guide

This guide will take you step-by-step through deploying your Autonoma application. We will use **Supabase** for the database, **Render** for the backend, and **Vercel** for the frontend.

## 🛑 Prerequisites

1.  **GitHub Account**: You must have your project pushed to GitHub (which we have already done).
2.  **Supabase Account**: [Sign up here](https://supabase.com/).
3.  **Render Account**: [Sign up here](https://render.com/).
4.  **Vercel Account**: [Sign up here](https://vercel.com/signup).
5.  **API Keys**: You will need your Gemini Explorer API Key (and OpenAI/Exa keys if you use those features).

---

## Step 1: Database Setup (Supabase)

1.  **Create Project**:
    *   Log in to Supabase and click **"New Project"**.
    *   Select your Organization.
    *   **Name**: `AutonomaDB` (or similar).
    *   **Database Password**: **IMPORTANT!** Click "Generate a password" and **COPY IT IMMEDIATELY** to a text file. You will need it later.
    *   Select a **Region** close to you (e.g., Singapore, Mumbai, Frankfurt).
    *   Click **"Create new project"**.

2.  **Get Connection String**:
    *   Wait for the project to finish setting up (green status).
    *   Go to **Project Settings** (gear icon) -> **Database**.
    *   Scroll down to **Connection String**.
    *   Click on **URI** tab.
    *   Copy the string. It looks like:
        `postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres`
    *   **Replace `[YOUR-PASSWORD]`** with the password you saved in step 1.
    *   **Save this final URL**. This is your `DATABASE_URL`.

---

## Step 2: Backend Deployment (Render)

1.  **Create Service**:
    *   Log into Render.
    *   Click **"New +"** button -> **"Web Service"**.
    *   **Connect GitHub**: Scroll down to "Connect a repository" and ensure your GitHub account is linked.
    *   Select your repo **`autonoma`**.

2.  **Configure Settings**:
    *   **Name**: `autonoma-backend`.
    *   **Region**: Same as your database (if possible).
    *   **Branch**: `main`.
    *   **Root Directory**: `backend` (Type this exactly).
    *   **Runtime**: `Python 3`.
    *   **Build Command**: `pip install -r requirements.txt` (Render should auto-fill this, but verify).
    *   **Start Command**: `gunicorn main:app -k uvicorn.workers.UvicornWorker` (Render should see the `Procfile` and use it. If not, type this manually).
    *   **Instance Type**: **Free**.

3.  **Environment Variables (Keys)**:
    *   Scroll down to the **"Environment Variables"** section. Click **"Add Environment Variable"**.
    *   Add the following keys:
        *   **Key**: `DATABASE_URL`
            *   **Value**: Paste the Supabase URI you created in Step 1.
        *   **Key**: `GEMINI_API_KEY`
            *   **Value**: Your actual Gemini API key.
        *   **Key**: `JWT_SECRET_KEY`
            *   **Value**: Generate a random string (e.g., `sadf876asdf786asdf`).
        *   *(Optional)* `OPENAI_API_KEY`: If you are using OpenAI features.
        *   *(Optional)* `EXA_API_KEY`: If you are using Exa search.
    *   Click **"Create Web Service"**.

4.  **Wait & Get URL**:
    *   Render will start building. This takes 2-5 minutes.
    *   Watch the logs. It should say "Build successful" and "Deploying...".
    *   Once it says "Live", look at the top left under the name.
    *   **Copy the URL**. It connects to your backend (e.g., `https://autonoma-backend.onrender.com`).

---

## Step 3: Frontend Deployment (Vercel)

1.  **Import Project**:
    *   Log into Vercel.
    *   Click **"Add New..."** -> **"Project"**.
    *   Find your `Autonoma` repository and click **"Import"**.

2.  **Configure Project**:
    *   **Project Name**: `autonoma` (or leave default).
    *   **Framework Preset**: **Next.js**.
    *   **Root Directory**: **Edit** this! Click "Edit" and select the **`frontend`** folder.
    *   **Build Command**: default (`npm run build`).
    *   **Install Command**: default (`npm install`).

3.  **Environment Variables**:
    *   Click to expand **"Environment Variables"**.
    *   Add the connection to your backend:
        *   **Key**: `NEXT_PUBLIC_API_URL`
        *   **Value**: Paste your **Render Backend URL** (from Step 2).
        *   *Examples*: `https://autonoma-backend.onrender.com` (Ensure no trailing slash usually, unless your app logic appends paths directly).

4.  **Deploy**:
    *   Click **"Deploy"**.
    *   Vercel will build the site. It takes 1-2 minutes.
    *   Once done, you will see a big "Congratulations!" screen.
    *   **Click the Image** to visit your live site.

---

## Step 4: Final Database Setup (Migrations)

Since your new Supabase database is empty, the app might crash if tables don't exist.

**Option A (Easiest)**: Run migrations locally against the live DB.
1.  Open your local terminal in VS Code.
2.  Set your local variable just for this command (Linux/Mac):
    ```bash
    export DATABASE_URL="Your_Supabase_URI"
    ```
3.  Run the alembic migration from the `backend` folder:
    ```bash
    cd backend
    alembic upgrade head
    ```
4.  Or run your seed script if you have one:
    ```bash
    python seed.py
    ```

**Option B**: If you cannot run locally, you can connect to the Supabase **SQL Editor** in their dashboard and run your SQL table creation scripts manually.

---

## Summary of Files

*   **GitHub**: Contains all code.
*   **Render**: Needs `backend/requirements.txt` and `backend/Procfile` (Already uploaded).
*   **Vercel**: Needs `frontend/package.json` (Already uploaded).

You do **not** need to manually upload specific files. The connection to GitHub handles "uploading" files for you.
