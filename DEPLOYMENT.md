# Deployment Guide

## 1. Deploy Backend to Render (Free)
1. Push backend/ to a GitHub repo
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo
4. Set:
   - Build Command: `./build.sh`
   - Start Command: `gunicorn config.wsgi --bind 0.0.0.0:$PORT`
5. Add Environment Variables:
   - `SECRET_KEY` → generate a random string
   - `DEBUG` → `False`
   - `ALLOWED_HOSTS` → `your-app.onrender.com`
6. Deploy — Render will run migrations automatically via build.sh
7. After deploy: open Shell → `python manage.py seed_data`

## 2. Deploy Frontend to Vercel (Free)
1. Push frontend/ to GitHub
2. Go to https://vercel.com → New Project → import repo
3. Add Environment Variables:
   - `VITE_API_URL` → `https://your-api.onrender.com/api`
4. Deploy — vercel.json handles SPA routing automatically

## 3. Connect Backend CORS
In Render dashboard, add environment variable:
- `CORS_ALLOWED_ORIGINS` → `https://your-app.vercel.app`

Or update settings.py `CORS_ALLOWED_ORIGIN_REGEXES` to match your Vercel domain.
