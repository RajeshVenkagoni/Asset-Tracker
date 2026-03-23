from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssetViewSet, AssetAssignmentViewSet, MaintenanceLogViewSet, CategoryViewSet, UserListView

router = DefaultRouter()
router.register(r'assets', AssetViewSet)
router.register(r'assignments', AssetAssignmentViewSet)
router.register(r'maintenance', MaintenanceLogViewSet)
router.register(r'categories', CategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('users/', UserListView.as_view(), name='user-list'),
]
