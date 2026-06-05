# Traveller's Inn Deployment

## Backend on Render

Create a Render Web Service from this repository.

Use these commands if not using `render.yaml`:

```bash
pip install -r requirements.txt && python backend/manage.py collectstatic --noinput && python backend/manage.py migrate
```

```bash
cd backend && gunicorn travellers_inn.wsgi:application
```

Set these Render environment variables:

```env
SECRET_KEY=your-long-random-secret
DEBUG=False
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
DATABASE_SSL_REQUIRE=True
ALLOWED_HOSTS=your-render-service.onrender.com
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://your-render-service.onrender.com,https://your-vercel-app.vercel.app
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
WEBPUSH_VAPID_PUBLIC_KEY=your-public-key
WEBPUSH_VAPID_PRIVATE_KEY=your-private-key
WEBPUSH_VAPID_SUBJECT=mailto:stay@travellersinn.ph
```

## Frontend on Vercel

Set the Vercel project root to:

```text
frontend
```

Use:

```text
npm run build
```

Output directory:

```text
dist
```

Set this Vercel environment variable:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

## Transfer SQLite Data to Supabase/PostgreSQL

Put your Supabase PostgreSQL connection string in `.env` or in Render env as `DATABASE_URL`.

Then run locally:

```bash
cd backend
..\.venv\Scripts\python.exe manage.py transfer_sqlite_to_postgres --flush-target
```

Use `--flush-target` only for a fresh PostgreSQL database or when you intentionally want to replace its current data.
