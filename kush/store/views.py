from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
from .models import Cloth, SiteRating, SiteReview
from .forms import ClothForm, SiteRatingForm, SiteReviewForm
from .models import Category
from django.db.models import Avg
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
import json


# ----- Manager Login -----
def manager_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None and user.is_staff:  # Only staff can log in as manager
            login(request, user)
            return redirect('manager_dashboard')
        else:
            messages.error(request, "Invalid credentials or not authorized")
            return redirect('manager_login')
    return render(request, 'store/manager_login.html')


# ----- Manager Dashboard -----
@login_required(login_url='manager_login')
def manager_dashboard(request):
    if not request.user.is_staff:
        return redirect('manager_login')  # Extra security
    clothes = Cloth.objects.filter(manager=request.user)
    
    # Calculate statistics
    total_items = clothes.count()
    available_items = clothes.filter(status='available').count()
    sold_items = clothes.filter(status='sold').count()
    
    return render(request, 'store/manager_dashboard.html', {
        'clothes': clothes,
        'total_items': total_items,
        'available_items': available_items,
        'sold_items': sold_items
    })


# ----- Logout -----
@login_required(login_url='manager_login')
def manager_logout(request):
    logout(request)
    return redirect('manager_login')


from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_http_methods

# Simple like view - no login required, CSRF exempt for anonymous likes
@csrf_exempt
@require_http_methods(["POST"])
def like_cloth(request, cloth_id):
    """Add one like to the cloth - anonymous users can like"""
    try:
        cloth = Cloth.objects.get(id=cloth_id)
        cloth.likes = (cloth.likes or 0) + 1
        cloth.save()
        return JsonResponse({'likes': cloth.likes, 'success': True})
    except Cloth.DoesNotExist:
        return JsonResponse({'error': 'Cloth not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# ----- Public / Manager-facing Cloth views -----
def cloth_list(request):
    """List available clothes. Use query params to show all (admin) or filter by category."""
    clothes = Cloth.objects.filter(status='available')
    return render(request, 'store/cloth_list.html', {'clothes': clothes})


def landing_page(request):
    """Render the main landing page using the Sample Kush template and categories from DB."""
    # load categories and attach available clothes to each for the template
    categories = list(Category.objects.all())
    for cat in categories:
        # show all clothes in each category
        cat.items = cat.clothes.all()

    # Get rating statistics
    avg_rating = SiteRating.objects.aggregate(Avg('rating'))['rating__avg']
    total_ratings = SiteRating.objects.count()
    recent_reviews = SiteReview.objects.filter(is_approved=True)[:5]  # Last 5 approved reviews

    return render(request, 'store/Sample Kush.html', {
        'categories': categories,
        'average_rating': round(avg_rating, 1) if avg_rating else 0,
        'total_ratings': total_ratings,
        'recent_reviews': recent_reviews,
    })


def category_detail(request, slug):
    """Display all clothes in a specific category."""
    category = get_object_or_404(Category, slug=slug)
    clothes = category.clothes.all()  # Get all clothes in this category
    
    # Get rating statistics
    avg_rating = SiteRating.objects.aggregate(Avg('rating'))['rating__avg']
    total_ratings = SiteRating.objects.count()
    recent_reviews = SiteReview.objects.filter(is_approved=True)[:5]
    
    return render(request, 'store/category_detail.html', {
        'category': category,
        'clothes': clothes,
        'average_rating': round(avg_rating, 1) if avg_rating else 0,
        'total_ratings': total_ratings,
        'recent_reviews': recent_reviews,
    })


def about(request):
    """Render the about page."""
    # Get rating statistics
    avg_rating = SiteRating.objects.aggregate(Avg('rating'))['rating__avg']
    total_ratings = SiteRating.objects.count()
    recent_reviews = SiteReview.objects.filter(is_approved=True)[:5]
    
    return render(request, 'store/about.html', {
        'average_rating': round(avg_rating, 1) if avg_rating else 0,
        'total_ratings': total_ratings,
        'recent_reviews': recent_reviews,
    })


def cloth_detail(request, cloth_id):
    cloth = get_object_or_404(Cloth, id=cloth_id)
    return render(request, 'store/cloth_detail.html', {'cloth': cloth})


@login_required(login_url='manager_login')
def add_cloth(request):
    """Create a new Cloth. Only staff users may add and they become the assigned manager."""
    if not request.user.is_staff:
        messages.error(request, "Only staff users can add clothes")
        return redirect('manager_login')

    if request.method == 'POST':
        form = ClothForm(request.POST, request.FILES)
        if form.is_valid():
            cloth = form.save(commit=False)
            cloth.manager = request.user
            cloth.save()
            messages.success(request, 'Cloth created')
            return redirect('cloth_detail', cloth_id=cloth.id)
    else:
        form = ClothForm()

    return render(request, 'store/cloth_form.html', {'form': form, 'action': 'Add'})


@login_required(login_url='manager_login')
def edit_cloth(request, cloth_id):
    cloth = get_object_or_404(Cloth, id=cloth_id)
    # Only the assigned manager (staff) can edit
    if not request.user.is_staff or cloth.manager != request.user:
        messages.error(request, "Not authorized to edit this item")
        return redirect('cloth_detail', cloth_id=cloth.id)

    if request.method == 'POST':
        form = ClothForm(request.POST, request.FILES, instance=cloth)
        if form.is_valid():
            form.save()
            messages.success(request, 'Cloth updated')
            return redirect('cloth_detail', cloth_id=cloth.id)
    else:
        form = ClothForm(instance=cloth)

    return render(request, 'store/cloth_form.html', {'form': form, 'action': 'Edit', 'cloth': cloth})


# ----- Site-Wide Rating & Review System -----

def get_client_ip(request):
    """Helper function to get client's IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


@csrf_exempt
@require_http_methods(["POST"])
def submit_rating(request):
    """Handle site-wide rating submission (1-5 stars)"""
    try:
        rating_value = int(request.POST.get('rating', 0))
        
        if rating_value < 1 or rating_value > 5:
            return JsonResponse({'success': False, 'error': 'Rating must be between 1 and 5'}, status=400)
        
        # Create rating
        rating = SiteRating.objects.create(
            rating=rating_value,
            ip_address=get_client_ip(request)
        )
        
        # Calculate new average
        avg_rating = SiteRating.objects.aggregate(Avg('rating'))['rating__avg']
        total_ratings = SiteRating.objects.count()
        
        return JsonResponse({
            'success': True,
            'message': 'Thank you for rating our website!',
            'average_rating': round(avg_rating, 1) if avg_rating else 0,
            'total_ratings': total_ratings
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def submit_review(request):
    """Handle written review submission"""
    try:
        form = SiteReviewForm(request.POST)
        
        if form.is_valid():
            review = form.save(commit=False)
            review.ip_address = get_client_ip(request)
            review.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Thank you for your review! We appreciate your feedback.',
                'review': {
                    'name': review.name,
                    'review_text': review.review_text,
                    'created_at': review.created_at.strftime('%B %d, %Y')
                }
            })
        else:
            errors = form.errors.as_json()
            return JsonResponse({'success': False, 'errors': errors}, status=400)
            
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt  # for testing; later, remove and use proper CSRF handling
@require_POST
def send_message(request):
    """Handle contact form submission and send email"""
    if request.method == 'POST':
        try:
            # Get form data
            name = request.POST.get('name', '').strip()
            email = request.POST.get('email', '').strip()
            phone = request.POST.get('phone', '').strip()
            message = request.POST.get('message', '').strip()
            
            # Validate required fields
            if not name or not email or not message:
                return JsonResponse({
                    'success': False,
                    'error': 'Name, email, and message are required.'
                }, status=400)
            
            # Compose email
            subject = f'Contact Form Message from {name}'
            email_message = f"""
New Contact Form Submission

From: {name}
Email: {email}
Phone: {phone if phone else 'Not provided'}

Message:
{message}

---
Sent from Kush Women's Fashion Store website
            """
            
            # Send email
            send_mail(
                subject=subject,
                message=email_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[settings.EMAIL_HOST_USER],  # Send to yourself
                fail_silently=False,
            )
            
            return JsonResponse({
                'success': True,
                'message': 'Thank you! Your message has been sent successfully.'
            })
            
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': f'Failed to send message: {str(e)}'
            }, status=500)
    
    return JsonResponse({
        'success': False,
        'error': 'Invalid request method'
    }, status=405)