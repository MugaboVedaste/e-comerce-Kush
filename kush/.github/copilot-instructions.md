# Kush Women's Fashion Store - AI Coding Guide

## Project Overview
Django 5.2.4 e-commerce platform for a women's fashion boutique with staff-managed inventory, WhatsApp ordering, and customer reviews.

**Stack:** Django 5.2.4, SQLite, Pillow 10.0.1, Swiper.js, Bootstrap 5, AOS animations  
**Primary App:** `store` (clothing inventory, categories, ratings/reviews)  
**Production URL:** http://officiallykush.com (72.61.146.74)

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
- Swiper initialization (`initializeClothSwipers()`)
- WhatsApp order modals (data attributes: `data-item-name`, `data-item-category`, `data-item-id`)
- AJAX likes/ratings with animations
- Hamburger menu toggle
- Search filtering (client-side text matching)
- Dark theme toggle (localStorage: `kush_theme`)

**Key Pattern:** WhatsApp orders use `api.whatsapp.com` with hardcoded number `250785440056`.

## Data Flow Examples

### Adding a Cloth Item (Manager)
1. POST to `/manager/clothes/add/` with `ClothForm`
2. View auto-assigns `cloth.manager = request.user` before save
3. Redirect to `cloth_detail` with newly created ID
4. Images saved to `media/clothes/{front|left|right}/`

### Submitting a Review (Customer)
1. Click "Leave a Review" → modal opens (JS)
2. POST to `/submit-review/` with `name`, `contact` (optional), `review_text`
3. Backend saves with `ip_address = get_client_ip(request)`
4. JSON response includes review data, frontend displays success & reloads

### Category Filtering
Categories use auto-slugs (`slugify(name)` in `save()` method). URL `/category/evening-wear/` queries `Category.objects.get(slug='evening-wear')` then displays `category.clothes.all()`.

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
# store/admin.py pattern
@admin.register(MyModel)
class MyModelAdmin(admin.ModelAdmin):
    list_display = ('field1', 'field2', 'created_at')
    search_fields = ('field1',)
```

### Add AJAX View
```python
# store/views.py
@csrf_exempt
@require_http_methods(["POST"])
def my_endpoint(request):
    # Process request.POST data
    return JsonResponse({'success': True, 'data': result})

# store/urls.py
path('my-endpoint/', views.my_endpoint, name='my_endpoint'),
```

## Email Configuration
SMTP configured for Gmail (`vedasteapp@gmail.com`) using app password. Contact form in `send_message` view uses `send_mail()` from `django.core.mail`. Always include subject, message, `from_email=settings.EMAIL_HOST_USER`.

## Testing & Deployment Notes
- No unit tests exist yet (`store/tests.py` is empty stub)
- `runtime.txt` specifies Python version for deployment
- Multiple `.md` docs track feature implementations (see root directory)
- Email backend uses Gmail SMTP—verify credentials before deployment

## Safety Constraints
- **Never commit real SECRET_KEY** (current one is development-only)
- **ALLOWED_HOSTS** includes production domain—verify before deployment
- **Media files** not version-controlled (`.gitignore` should exclude `media/`)
- **Staff access** required for inventory management—verify `is_staff` checks

## Documentation References
- Rating system: `RATING_REVIEW_SYSTEM_DOCUMENTATION.md`
- Swiper integration: `SWIPER_SYNC_DOCUMENTATION.md`
- Mobile responsive: `MOBILE_RESPONSIVE_SUMMARY.md`
- Template changes: `TEMPLATE_REFACTORING_SUMMARY.md`

---

**Last Updated:** Based on Django 5.2.4 codebase (November 2025)  
For missing context on specific features, check root `.md` docs or admin panel model configurations.
