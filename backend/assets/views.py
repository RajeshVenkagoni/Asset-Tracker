import csv
from datetime import date, timedelta
from django.utils import timezone
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.db.models import Sum, Count, Q
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from .models import Asset, AssetAssignment, MaintenanceLog, Category
from .serializers import (
    AssetSerializer, AssetListSerializer, AssetAssignmentSerializer,
    MaintenanceLogSerializer, CategorySerializer, UserSerializer, RegisterSerializer
)
from .filters import AssetFilter



class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.select_related('assigned_to').prefetch_related('maintenance_logs', 'assignments')
    permission_classes = [AllowAny]
    filterset_class = AssetFilter
    search_fields = ['name', 'asset_tag', 'serial_number']
    ordering_fields = '__all__'
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return AssetListSerializer
        return AssetSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.is_authenticated and not (self.request.user.is_staff or self.request.user.is_superuser):
            qs = qs.filter(assigned_to=self.request.user)
        return qs

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Asset.objects.count()
        by_status = dict(Asset.objects.values_list('status').annotate(count=Count('id')))
        total_value = Asset.objects.aggregate(total=Sum('purchase_cost'))['total'] or 0
        expiring_soon = Asset.objects.filter(
            warranty_expiry__gte=date.today(),
            warranty_expiry__lte=date.today() + timedelta(days=30)
        ).count()
        by_category = dict(Asset.objects.values_list('category').annotate(count=Count('id')))
        return Response({
            'total_assets': total,
            'by_status': by_status,
            'total_value': float(total_value),
            'expiring_warranty_30_days': expiring_soon,
            'by_category': by_category,
        })

    @action(detail=False, methods=['get'])
    def export(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="assets.csv"'
        writer = csv.writer(response)
        writer.writerow(['Asset Tag', 'Name', 'Category', 'Status', 'Condition',
                         'Manufacturer', 'Model Number', 'Serial Number',
                         'Purchase Date', 'Purchase Cost', 'Warranty Expiry',
                         'Location', 'Department', 'Assigned To'])
        for asset in Asset.objects.select_related('assigned_to'):
            writer.writerow([
                asset.asset_tag, asset.name, asset.category, asset.status, asset.condition,
                asset.manufacturer, asset.model_number, asset.serial_number,
                asset.purchase_date, asset.purchase_cost, asset.warranty_expiry,
                asset.location, asset.department,
                asset.assigned_to.username if asset.assigned_to else ''
            ])
        return response


class AssetAssignmentViewSet(viewsets.ModelViewSet):
    queryset = AssetAssignment.objects.select_related('asset', 'assigned_to', 'assigned_by')
    serializer_class = AssetAssignmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['asset', 'assigned_to']
    ordering = ['-assigned_date']

    def perform_create(self, serializer):
        assignment = serializer.save(assigned_by=self.request.user)
        asset = assignment.asset
        asset.status = 'Assigned'
        asset.assigned_to = assignment.assigned_to
        asset.save()


class MaintenanceLogViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceLog.objects.select_related('asset')
    serializer_class = MaintenanceLogSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['asset', 'maintenance_type']
    ordering = ['-date_performed']


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
