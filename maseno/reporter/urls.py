from django.urls import path
from django.contrib.auth.views import LoginView, LogoutView
from .views import HomePageView
from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    # URL pattern for the home page view
    path('', HomePageView.as_view(), name='home'),
    path('login/', views.custom_login, name='login'),
    path('logout/', views.custom_logout, name='logout'),
    path('register/', views.custom_register, name='register'),
    path('password_reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
    path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
]
