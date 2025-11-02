from django import forms
from .models import Cloth, SiteRating, SiteReview


class ClothForm(forms.ModelForm):
    class Meta:
        model = Cloth
        fields = [
            'name',
            'price',
            'description',
            'status',
            'category',
            'image_front',
            'image_left',
            'image_right',
        ]

        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
        }


class SiteRatingForm(forms.ModelForm):
    """Form for submitting site-wide ratings (1-5 stars)"""
    class Meta:
        model = SiteRating
        fields = ['rating']
        widgets = {
            'rating': forms.HiddenInput(),
        }


class SiteReviewForm(forms.ModelForm):
    """Form for submitting written reviews"""
    class Meta:
        model = SiteReview
        fields = ['name', 'contact', 'review_text']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Your name',
                'required': True,
            }),
            'contact': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Email or phone number (optional)',
            }),
            'review_text': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Share your experience with us...',
                'rows': 4,
                'required': True,
            }),
        }
        labels = {
            'name': 'Your Name',
            'contact': 'Email or Phone',
            'review_text': 'Your Review',
        }
