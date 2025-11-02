from django.contrib import admin
from .models import Category, Cloth, ManagerProfile, SiteRating, SiteReview

# Register Category
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)


# Register Cloth
@admin.register(Cloth)
class ClothAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'status', 'category', 'manager', 'created_at', 'updated_at')
    list_filter = ('status', 'category')
    search_fields = ('name',)
    # only staff users will be selectable as manager
    raw_id_fields = ('manager',)


# Register ManagerProfile
@admin.register(ManagerProfile)
class ManagerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    search_fields = ('user__username',)


# Register SiteRating
@admin.register(SiteRating)
class SiteRatingAdmin(admin.ModelAdmin):
    list_display = ('rating', 'ip_address', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('ip_address',)
    readonly_fields = ('created_at',)


# Register SiteReview
@admin.register(SiteReview)
class SiteReviewAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'created_at')
    search_fields = ('name', 'contact', 'review_text')
    readonly_fields = ('created_at',)
    list_editable = ('is_approved',)
