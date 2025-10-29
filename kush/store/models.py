from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


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
