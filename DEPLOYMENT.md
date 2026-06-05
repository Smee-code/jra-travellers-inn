# Traveller's Inn PythonAnywhere Deployment

This project is configured to use SQLite for PythonAnywhere.

## 1. Upload / clone the repository

On PythonAnywhere Bash:

```bash
git clone https://github.com/Smee-code/jra-travellers-inn.git
cd jra-travellers-inn
```

## 2. Create and activate a virtualenv

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Configure `.env`

Create `.env` in the project root:

```env
SECRET_KEY=your-long-random-secret
DEBUG=False
ALLOWED_HOSTS=yourusername.pythonanywhere.com
CORS_ALLOWED_ORIGINS=https://yourusername.pythonanywhere.com
CSRF_TRUSTED_ORIGINS=https://yourusername.pythonanywhere.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
WEBPUSH_VAPID_PUBLIC_KEY=your-public-key
WEBPUSH_VAPID_PRIVATE_KEY=your-private-key
WEBPUSH_VAPID_SUBJECT=mailto:stay@travellersinn.ph
```

## 4. Build frontend locally or on PythonAnywhere

If Node is available on PythonAnywhere:

```bash
cd frontend
npm install
npm run build
```

The build output is `frontend/dist`.

If Node is not available, build locally and upload `frontend/dist`.

## 5. Django setup

```bash
cd backend
python manage.py migrate
python manage.py collectstatic --noinput
```

SQLite database path:

```text
backend/db.sqlite3
```

Keep this file backed up because it contains the live data.

## 6. PythonAnywhere Web app settings

Create a Manual Configuration web app.

Virtualenv path:

```text
/home/yourusername/jra-travellers-inn/.venv
```

Source code:

```text
/home/yourusername/jra-travellers-inn/backend
```

Static files:

```text
/static/ -> /home/yourusername/jra-travellers-inn/backend/staticfiles
```

If serving the React frontend from PythonAnywhere too:

```text
/assets/ -> /home/yourusername/jra-travellers-inn/frontend/dist/assets
/rooms/ -> /home/yourusername/jra-travellers-inn/frontend/dist/rooms
/landing-hero.png -> /home/yourusername/jra-travellers-inn/frontend/dist/landing-hero.png
/sw.js -> /home/yourusername/jra-travellers-inn/frontend/dist/sw.js
```

## 7. WSGI file

Use this in the PythonAnywhere WSGI file:

```python
import os
import sys

project_root = '/home/yourusername/jra-travellers-inn'
backend_root = f'{project_root}/backend'

if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'travellers_inn.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

Reload the web app after saving changes.
