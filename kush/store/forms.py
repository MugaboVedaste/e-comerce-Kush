from django import forms
from .models import Cloth


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
