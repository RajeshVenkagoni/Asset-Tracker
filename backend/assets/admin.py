from django.contrib import admin
from .models import Asset, AssetAssignment, MaintenanceLog, Category

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ['asset_tag', 'name', 'category', 'status', 'assigned_to', 'department']
    list_filter = ['status', 'category', 'condition']
    search_fields = ['asset_tag', 'name', 'serial_number']

@admin.register(AssetAssignment)
class AssetAssignmentAdmin(admin.ModelAdmin):
    list_display = ['asset', 'assigned_to', 'assigned_by', 'assigned_date', 'returned_date']

@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display = ['asset', 'maintenance_type', 'date_performed', 'cost']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'depreciation_years']
