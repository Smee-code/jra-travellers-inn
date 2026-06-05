from django.contrib import admin
from django.conf import settings
from django.http import FileResponse, Http404
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView


def frontend_app(request, path=''):
    index_path = settings.BASE_DIR.parent / 'frontend' / 'dist' / 'index.html'
    if not index_path.exists():
        raise Http404('Frontend build not found. Run npm run build in the frontend folder.')
    return FileResponse(index_path.open('rb'), content_type='text/html')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', frontend_app, name='frontend_app'),
    path('<path:path>', frontend_app, name='frontend_app_catch_all'),
]
