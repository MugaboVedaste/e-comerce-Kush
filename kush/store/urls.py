from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing_page, name='landing'),

    # Public cloth views
    path('clothes/', views.cloth_list, name='cloth_list'),
    path('clothes/<int:cloth_id>/', views.cloth_detail, name='cloth_detail'),

    # Manager actions (staff only)
    path('clothes/add/', views.add_cloth, name='add_cloth'),
    path('clothes/<int:cloth_id>/edit/', views.edit_cloth, name='edit_cloth'),

    # Like endpoint
    path('clothes/<int:cloth_id>/like/', views.like_cloth, name='like_cloth'),

    # Manager auth / dashboard
    path('manager/login/', views.manager_login, name='manager_login'),
    path('manager/dashboard/', views.manager_dashboard, name='manager_dashboard'),
    path('manager/logout/', views.manager_logout, name='manager_logout'),
]
