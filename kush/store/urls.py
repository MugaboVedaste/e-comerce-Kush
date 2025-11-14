from django.urls import path
from . import views
from .views import send_message

urlpatterns = [
    path('', views.landing_page, name='landing_page'),
    path('about/', views.about, name='about'),
    path('send-contact/', views.send_message, name='send_message'),
    # Category detail page
    path('category/<slug:slug>/', views.category_detail, name='category_detail'),

    # Public cloth views
    path('manager/clothes/', views.cloth_list, name='cloth_list'),
    path('manager/clothes/<int:cloth_id>/', views.cloth_detail, name='cloth_detail'),

    # Manager actions (staff only)
    path('manager/clothes/add/', views.add_cloth, name='add_cloth'),
    path('manager/clothes/<int:cloth_id>/edit/', views.edit_cloth, name='edit_cloth'),

    # Like endpoint
    path('clothes/<int:cloth_id>/like/', views.like_cloth, name='like_cloth'),

    # Site-wide Rating & Review endpoints
    path('submit-rating/', views.submit_rating, name='submit_rating'),
    path('submit-review/', views.submit_review, name='submit_review'),

    # Manager auth / dashboard
    path('manager/login/', views.manager_login, name='manager_login'),
    path('manager/dashboard/', views.manager_dashboard, name='manager_dashboard'),
    path('manager/logout/', views.manager_logout, name='manager_logout'),
]
