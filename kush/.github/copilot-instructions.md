# Kush Women's Fashion Store - AI Coding Guide

## Project Overview
Django 5.2.4 e-commerce platform for a women's fashion boutique with staff-managed inventory, WhatsApp ordering, and customer reviews.

**Stack:** Django 5.2.4, SQLite, Pillow 10.0.1, Swiper.js v9, Bootstrap 5, AOS animations  
**Primary App:** `store` (clothing inventory, categories, ratings/reviews)  
**Production URL:** http://officiallykush.com (72.61.146.74)  
**WhatsApp Contact:** +250785440056 (hardcoded in `script.js` for order integration)

## Critical Architecture Patterns

### Two-Track User System
1. **Staff/Managers** (`is_staff=True`) - Full CRUD on clothing items via manager dashboard
2. **Anonymous Customers** - Browse, like items, submit ratings/reviews, order via WhatsApp

**Key Decision:** No customer authentication. Likes and ratings tracked by IP address (`get_client_ip()` helper in `views.py`).

### Image Management Pattern
Each `Cloth` has 3 ImageFields: `image_front`, `image_left`, `image_right` uploaded to `media/clothes/{position}/`. Templates use Swiper.js carousels with lazy loading for multi-angle product viewing.

**Example from `models.py`:**
```python
image_front = models.ImageField(upload_to='clothes/front/', blank=True, null=True)
image_left = models.ImageField(upload_to='clothes/left/', blank=True, null=True)
image_right = models.ImageField(upload_to='clothes/right/', blank=True, null=True)
```

### CSRF-Exempt AJAX Endpoints
Views for anonymous actions (`like_cloth`, `submit_rating`, `submit_review`, `send_message`) use `@csrf_exempt` for simplicity. Always use `@require_http_methods(["POST"])` alongside.

**Pattern:**
```python
@csrf_exempt
@require_http_methods(["POST"])
def like_cloth(request, cloth_id):
    cloth = Cloth.objects.get(id=cloth_id)
    cloth.likes = (cloth.likes or 0) + 1
    cloth.save()
    return JsonResponse({'likes': cloth.likes, 'success': True})
```

## Essential Developer Workflows

### Setup (Windows cmd.exe)
```cmd
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Create staff account
python manage.py runserver
```

### Creating Test Data
```python
# Django shell (python manage.py shell)
from store.models import Category, Cloth
from django.contrib.auth.models import User

manager = User.objects.filter(is_staff=True).first()
cat = Category.objects.create(name="Evening Wear", description="Elegant dresses")
Cloth.objects.create(name="Black Gown", price=45000, category=cat, manager=manager)
```

### Run Migrations & Create Admin User
```cmd
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # Username, email, password - sets is_staff=True
```

### Media File Handling
- Development: `MEDIA_URL='/media/'` served by Django when `DEBUG=True` (see `kush/urls.py`)
- Upload path pattern: `upload_to='clothes/{position}/'` creates subdirectories automatically
- Always use `{% load static %}` and `{{ cloth.image_front.url }}` in templates

## Project-Specific Conventions

### Status Field Pattern
`Cloth.status` uses choices: `[('available', 'Available'), ('sold', 'Sold')]`. Frontend displays badge with ellipse indicator (see `STATUS_BADGE_ELLIPSE_UPDATE.md`). Never hardcode status strings—use `cloth.get_status_display()`.

### URL Naming Convention
- Manager routes: `manager/dashboard/`, `manager/clothes/add/`
- Public routes: `category/<slug:slug>/`, root path `''` = landing page
- AJAX endpoints: `submit-rating/`, `clothes/<int:cloth_id>/like/`

### Template Inheritance
`base.html` contains header, footer, rating system. Child templates (`Sample Kush.html`, `category_detail.html`) extend it. **Critical:** All templates include Swiper initialization script via CDN (`swiper@9`).

### JavaScript Organization
`store/static/store/script.js` (v14) handles:
- Swiper initialization (`initializeClothSwipers()`) for 3-image carousels
- WhatsApp order modals (data attributes: `data-item-name`, `data-item-category`, `data-item-id`)
- AJAX likes/ratings with animations (using `fetch()` API)
- Hamburger menu toggle for mobile navigation
- Search filtering - **client-side only**, highlights matches and scrolls to first result
- Dark theme toggle (localStorage key: `kush_theme`, syncs across pages)
- AOS (Animate On Scroll) initialization on page load

**Key Pattern:** WhatsApp orders use `api.whatsapp.com/send?phone=250785440056&text=...` with pre-filled product details.

**Search Implementation:**
```javascript
// Searches both categoryCards (.card-cat) and clothWrappers (.cloth-item-wrapper)
// Highlights first match with outline, auto-scrolls, removes highlight after 3s
```

## Data Flow Examples

### Adding a Cloth Item (Manager)
1. POST to `/manager/clothes/add/` with `ClothForm`
2. View auto-assigns `cloth.manager = request.user` before save
3. Redirect to `cloth_detail` with newly created ID
4. Images saved to `media/clothes/{front|left|right}/`

### Submitting a Review (Customer)
1. Click "Leave a Review" → modal opens (JS)
2. POST to `/submit-review/` with `name`, `contact` (optional), `review_text`
3. Backend saves with `ip_address = get_client_ip(request)` (extracts from HTTP_X_FORWARDED_FOR or REMOTE_ADDR)
4. JSON response includes review data, frontend displays success & reloads

### Category Filtering
Categories use auto-slugs (`slugify(name)` in `save()` method). URL `/category/evening-wear/` queries `Category.objects.get(slug='evening-wear')` then displays `category.clothes.all()`.

### WhatsApp Order Flow
1. User clicks "Order via WhatsApp" button on product card
2. JavaScript reads `data-item-name`, `data-item-category`, `data-item-id` attributes
3. Constructs WhatsApp URL: `https://api.whatsapp.com/send?phone=250785440056&text=...`
4. Opens in new tab with pre-filled message containing product details

## Common Tasks Quick Reference

### Add New Model Field
```bash
# After editing models.py
python manage.py makemigrations
python manage.py migrate
# Update admin.py list_display if needed
```

### Register Model in Admin
```python
# store/admin.py pattern (uses @admin.register decorator)
@admin.register(MyModel)
class MyModelAdmin(admin.ModelAdmin):
    list_display = ('field1', 'field2', 'created_at')
    search_fields = ('field1',)
    list_filter = ('status', 'created_at')  # Common for filtering
    readonly_fields = ('created_at',)  # Prevent modification
```

### Add AJAX View
```python
# store/views.py
@csrf_exempt  # Only for anonymous public endpoints
@require_http_methods(["POST"])
def my_endpoint(request):
    # Process request.POST data
    return JsonResponse({'success': True, 'data': result})

# store/urls.py
path('my-endpoint/', views.my_endpoint, name='my_endpoint'),
```

### Create Test Data in Django Shell
```python
python manage.py shell
from store.models import Category, Cloth
from django.contrib.auth.models import User

manager = User.objects.filter(is_staff=True).first()
cat = Category.objects.create(name="Evening Wear", description="Elegant dresses")
Cloth.objects.create(
    name="Black Gown", 
    price=45000, 
    category=cat, 
    manager=manager,
    status='available'
)
```

## Email Configuration
SMTP configured for Gmail (`vedasteapp@gmail.com`) using app password. Contact form in `send_message` view uses `send_mail()` from `django.core.mail`. 

**Settings required:**
```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'vedasteapp@gmail.com'  # Set in settings.py
EMAIL_HOST_PASSWORD = '<app-password>'    # Must be configured
```

**Contact form endpoint:** POST to `/send-contact/` with `name`, `email`, `phone`, `message` fields. Sends email to `EMAIL_HOST_USER` with formatted message body.

## Testing & Deployment Notes
- **No unit tests** exist yet (`store/tests.py` is empty stub)
- `runtime.txt` specifies Python version for deployment (check for platform compatibility)
- Multiple `.md` docs track feature implementations (see root directory for detailed changelogs)
- Email backend requires valid Gmail app password before deployment
- `DEBUG=True` in current settings.py - **must set to False** for production
- ALLOWED_HOSTS includes production domain `'http://officiallykush.com'` and IP `'72.61.146.74'`

## Safety Constraints
- **Never commit real SECRET_KEY** (current one is development-only: `django-insecure-p11&%8n#a27v55qazzvpt0-2e2cwcb+ot732yx$k@a0pniam#m`)
- **ALLOWED_HOSTS** includes production domain—verify before deployment (currently: `['http://officiallykush.com', '72.61.146.74', 'localhost', '127.0.0.1']`)
- **Media files** not version-controlled (`.gitignore` should exclude `media/` and `db.sqlite3`)
- **Staff access** required for inventory management—verify `is_staff` checks in all manager views
- **EMAIL_HOST_PASSWORD** must be set as environment variable for production (currently empty in settings.py)
- **CSRF exemptions** only on public anonymous endpoints - never exempt authenticated staff actions

## Core Models Reference
```python
Category: name, slug (auto), description, created_at
Cloth: name, price, description, status (choices), category (FK), manager (FK to User), 
       image_front/left/right, likes (counter), created_at, updated_at
SiteRating: rating (1-5 IntegerField), ip_address, created_at
SiteReview: name, contact, review_text, ip_address, is_approved (BooleanField), created_at
ManagerProfile: user (OneToOne to User), created_at (unused currently)
```

## Documentation References
Project maintains detailed `.md` docs in root directory for major features:
- **Rating system:** `RATING_REVIEW_SYSTEM_DOCUMENTATION.md` (API endpoints, models, JS implementation)
- **Swiper integration:** `SWIPER_SYNC_DOCUMENTATION.md`, `SWIPER_IMAGE_FIX.md`
- **Mobile responsive:** `MOBILE_RESPONSIVE_SUMMARY.md`, `HAMBURGER_MENU_ADDED.md`
- **Template changes:** `TEMPLATE_REFACTORING_SUMMARY.md`
- **Status badges:** `STATUS_BADGE_ELLIPSE_UPDATE.md`, `STATUS_STANDARDIZATION.md`
- **Quick start:** `RATING_SYSTEM_QUICK_START.md`

**When adding features:** Create similar `.md` doc describing models, views, URLs, frontend integration, and testing steps.

---

**Last Updated:** February 2026  
**Django Version:** 5.2.4  
**Dependencies:** See `requirements.txt` (Django, Pillow only - minimal setup)

For missing context on specific features, check root `.md` docs or `store/admin.py` configurations.
