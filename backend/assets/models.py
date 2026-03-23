from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    depreciation_years = models.PositiveIntegerField(default=5)

    class Meta:
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name


class Asset(models.Model):
    CATEGORY_CHOICES = [
        ('Laptop', 'Laptop'), ('Desktop', 'Desktop'), ('Monitor', 'Monitor'),
        ('Phone', 'Phone'), ('Printer', 'Printer'),
        ('Network Equipment', 'Network Equipment'), ('Server', 'Server'), ('Other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('Available', 'Available'), ('Assigned', 'Assigned'),
        ('In Repair', 'In Repair'), ('Retired', 'Retired'), ('Lost', 'Lost'),
    ]
    CONDITION_CHOICES = [
        ('New', 'New'), ('Good', 'Good'), ('Fair', 'Fair'), ('Poor', 'Poor'),
    ]

    asset_tag = models.CharField(max_length=20, unique=True, blank=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    manufacturer = models.CharField(max_length=100, blank=True)
    model_number = models.CharField(max_length=100, blank=True)
    serial_number = models.CharField(max_length=100, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    warranty_expiry = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='Good')
    location = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_assets')
    department = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.asset_tag:
            last = Asset.objects.order_by('-id').first()
            next_id = (last.id + 1) if last else 1
            self.asset_tag = f'AST-{next_id:04d}'
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.asset_tag} - {self.name}'


class AssetAssignment(models.Model):
    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='assignments')
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='asset_assignments')
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assets_assigned_by')
    assigned_date = models.DateField()
    returned_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f'{self.asset} → {self.assigned_to}'


class MaintenanceLog(models.Model):
    MAINTENANCE_CHOICES = [
        ('Repair', 'Repair'), ('Upgrade', 'Upgrade'),
        ('Inspection', 'Inspection'), ('Cleaning', 'Cleaning'),
    ]

    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='maintenance_logs')
    maintenance_type = models.CharField(max_length=20, choices=MAINTENANCE_CHOICES)
    description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    performed_by = models.CharField(max_length=200)
    date_performed = models.DateField()
    next_maintenance_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f'{self.maintenance_type} on {self.asset} ({self.date_performed})'
