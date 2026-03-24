from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from assets.views import RegisterView

def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'asset-tracker-api'})

urlpatterns = [
    path('', health_check),
    path('admin/', admin.site.urls),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/', include('assets.urls')),
]
