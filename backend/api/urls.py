from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'room-types', views.RoomTypeViewSet, basename='room-type')
router.register(r'rooms', views.RoomViewSet, basename='room')
router.register(r'bookings', views.BookingViewSet, basename='booking')
router.register(r'customers', views.CustomerViewSet, basename='customer')
router.register(r'users', views.UserManagementViewSet, basename='user-management')
router.register(r'audit', views.AuditLogViewSet, basename='audit')

urlpatterns = [
    path('landing/', views.landing_data, name='landing-data'),
    path('contact/', views.contact_info, name='contact-info'),
    path('branding/', views.branding, name='branding'),

    # Auth
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/me/', views.me, name='me'),
    path('push/public-key/', views.push_public_key, name='push-public-key'),
    path('push/subscribe/', views.push_subscribe, name='push-subscribe'),
    path('booking-options/', views.booking_options, name='booking-options'),

    # Analytics
    path('analytics/model-info/', views.analytics_model_info, name='analytics-model-info'),
    path('analytics/metrics/', views.analytics_metrics, name='analytics-metrics'),
    path('analytics/avp/', views.analytics_avp, name='analytics-avp'),
    path('analytics/forecasts/', views.analytics_forecasts, name='analytics-forecasts'),
    path('analytics/occupancy/', views.analytics_occupancy, name='analytics-occupancy'),
    path('analytics/bookings-by-month/', views.analytics_bookings_by_month, name='analytics-bbm'),
    path('analytics/room-mix/', views.analytics_room_mix, name='analytics-room-mix'),
    path('analytics/heatmap/', views.analytics_heatmap, name='analytics-heatmap'),
    path('analytics/accuracy/', views.analytics_accuracy, name='analytics-accuracy'),
    path('analytics/trends/', views.analytics_trends, name='analytics-trends'),

    # Search
    path('search/', views.search_all, name='search'),

    # Reports
    path('reports/options/', views.report_options, name='report-options'),
    path('reports/generate/', views.generate_report, name='generate-report'),

    # Router (ViewSets)
    path('', include(router.urls)),
]
