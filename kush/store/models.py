from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"


class Cloth(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('sold', 'Sold'),
    ]

    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='clothes')
    manager = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'is_staff': True})

    # Three images
    image_front = models.ImageField(upload_to='clothes/front/', blank=True, null=True)
    image_left = models.ImageField(upload_to='clothes/left/', blank=True, null=True)
    image_right = models.ImageField(upload_to='clothes/right/', blank=True, null=True)


    # Likes counter (anonymous)
    likes = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class ManagerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Manager: {self.user.username}"


class SiteRating(models.Model):
    """Website-wide star rating (1-5 stars)"""
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], help_text="Rating from 1 to 5 stars")
    ip_address = models.GenericIPAddressField(blank=True, null=True, help_text="User's IP address for tracking")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating} stars on {self.created_at.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Site Rating"
        verbose_name_plural = "Site Ratings"


class SiteReview(models.Model):
    """Written reviews from customers"""
    name = models.CharField(max_length=100, help_text="Customer's name")
    contact = models.CharField(max_length=100, blank=True, help_text="Email or phone number (optional)")
    review_text = models.TextField(help_text="Customer's written review")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    is_approved = models.BooleanField(default=True, help_text="Approve review for display")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.name} on {self.created_at.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Site Review"
        verbose_name_plural = "Site Reviews"
