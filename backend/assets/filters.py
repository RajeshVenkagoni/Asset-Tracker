import django_filters
from .models import Asset


class AssetFilter(django_filters.FilterSet):
    min_cost = django_filters.NumberFilter(field_name='purchase_cost', lookup_expr='gte')
    max_cost = django_filters.NumberFilter(field_name='purchase_cost', lookup_expr='lte')
    warranty_before = django_filters.DateFilter(field_name='warranty_expiry', lookup_expr='lte')
    warranty_after = django_filters.DateFilter(field_name='warranty_expiry', lookup_expr='gte')

    class Meta:
        model = Asset
        fields = ['status', 'category', 'department', 'assigned_to', 'condition']
