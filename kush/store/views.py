from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth.models import User
from .models import Cloth
from .forms import ClothForm
from .models import Category


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
    return render(request, 'store/manager_dashboard.html', {'clothes': clothes})


# ----- Logout -----
@login_required(login_url='manager_login')
def manager_logout(request):
    logout(request)
    return redirect('manager_login')


@require_POST
def like_cloth(request, cloth_id):
    cloth = get_object_or_404(Cloth, id=cloth_id)
    cloth.likes += 1
    cloth.save()
    return redirect('cloth_detail', cloth_id=cloth.id)


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
        # show available clothes only on landing
        cat.items = cat.clothes.filter(status='available')

    return render(request, 'store/Sample Kush.html', {'categories': categories})


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
