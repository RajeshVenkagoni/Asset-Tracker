# IT Asset Tracker Dashboard

![Python](https://img.shields.io/badge/Python-3.11-blue) ![Django](https://img.shields.io/badge/Django-5.0-green) ![React](https://img.shields.io/badge/React-18-61DAFB) ![SQLite](https://img.shields.io/badge/SQLite-3-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

Real-time IT asset tracking system managing 500+ assets with role-based access, automated depreciation alerts, and analytics dashboard.

**Live Demo:** [Frontend (Vercel)](https://your-app.vercel.app) | [Backend (Render)](https://your-api.onrender.com)

## Features
- Full CRUD asset management with auto-generated asset tags (AST-0001)
- Role-based access: Admin / Staff / Employee
- Dashboard with status charts and warranty alerts
- Asset assignment history and maintenance logs
- CSV export, print-friendly asset detail view
- JWT authentication with auto token refresh

## Architecture
```
React (Vite + Tailwind) → Django REST API → SQLite
      Vercel                   Render          Disk
```

## Setup

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env   # fill in values
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env  # set VITE_API_URL
npm run dev
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login/ | JWT login |
| POST | /api/auth/register/ | Register user |
| GET/POST | /api/assets/ | List/create assets |
| GET | /api/assets/stats/ | Dashboard statistics |
| GET | /api/assets/export/ | Export CSV |
| PUT/DELETE | /api/assets/{id}/ | Update/delete asset |
| GET/POST | /api/assignments/ | Assignment history |
| GET/POST | /api/maintenance/ | Maintenance logs |

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```
