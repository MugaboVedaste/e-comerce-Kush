## Project snapshot

- Framework: Django 5.2.x (project created with django-admin startproject).
- App: `store` (single app included in `INSTALLED_APPS`).
- DB: SQLite at `db.sqlite3` (local development only).
- Key files to inspect: `kush/settings.py`, `manage.py`, `store/views.py`, `store/urls.py`, `store/models.py`, `store/templates/store/landing.html`.

## Quick developer workflows (command examples — Windows `cmd.exe`)

- Create and activate a venv:

    python -m venv .venv
    .venv\Scripts\activate

- Install dependencies (project has no `requirements.txt`; check with the user or infer from environment):

    pip install -r requirements.txt  # if provided

- Apply DB migrations and run server:

    python manage.py migrate
    python manage.py runserver 127.0.0.1:8000

- Run tests (no tests currently present in `store/tests.py`):

    python manage.py test

## Architecture & conventions (what to know)

- This is a single Django project (`kush`) with one app (`store`). The app follows the conventional layout: `models.py`, `views.py`, `urls.py`, and a `templates/store` folder.
- Views: `store/views.py` currently defines `landing_page(request)` which renders `store/landing.html`. Route configured in `store/urls.py` maps `''` to that view.
- Templates: Uses CDN-hosted Bootstrap and inline styles in `store/templates/store/landing.html`. Expect front-end work to be mostly static markup and templates.
- Models: `store/models.py` is currently empty — feature work will likely add models and migrations.

## Project-specific patterns & helpful examples

- URL routing: app `store` exposes URLs in `store/urls.py`. The project uses `ROOT_URLCONF = 'kush.urls'` so follow that file when adding new top-level routes.

- Template discovery: `TEMPLATES` has `'APP_DIRS': True`, so templates in `store/templates/...` will be picked up automatically.

- Database: local `sqlite3` file at `BASE_DIR / 'db.sqlite3'`. No remote DB or third-party integrations are configured in source.

## What an AI coding agent should do first

1. Inspect `kush/settings.py` for environment-specific flags (DEBUG, SECRET_KEY, ALLOWED_HOSTS). Don't change SECRET_KEY or DEBUG without explicit instructions.
2. Run `python manage.py migrate` before making DB-related changes; migrations folder currently has only `__init__.py`.
3. Use `store/views.py` + `store/templates/store/landing.html` for UI examples. To add new pages, mirror the existing pattern: view -> template -> `store/urls.py` entry.

## Safety notes / constraints

- The repo contains an in-repo SECRET_KEY (development). Do not commit new secrets or move secrets to public files. If asked to add production-ready config, propose using environment variables and a `.env` loader.
- No external services (APIs, storage, auth) are present; avoid introducing integrations unless requested and documented.

## Where to add tests & examples

- Unit tests belong in `store/tests.py` or under `store/tests/`. Add simple view tests that assert the landing page returns 200 and uses correct template.

## Quick references for contributors (examples to copy)

- Example view & route (already present):

    # store/views.py
    def landing_page(request):
        return render(request, 'store/landing.html')

    # store/urls.py
    urlpatterns = [ path('', views.landing_page, name='landing'), ]

## If you need more context

- If `requirements.txt` or a deployment setup is missing, ask the repository owner for the preferred Python packages and deployment steps.
- If you are asked to enable static asset serving or add `collectstatic`, propose and document `STATIC_ROOT` changes and CDN/hosting strategy before applying them.

---
If anything here is incomplete or you want me to include additional examples (migrations, admin, or CI commands), tell me which area to expand and I will iterate.
