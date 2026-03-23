from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Asset, AssetAssignment, MaintenanceLog, Category


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class MaintenanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaintenanceLog
        fields = '__all__'


class AssetAssignmentSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AssetAssignment
        fields = '__all__'

    def get_assigned_to_name(self, obj):
        return f'{obj.assigned_to.first_name} {obj.assigned_to.last_name}'.strip() or obj.assigned_to.username

    def get_assigned_by_name(self, obj):
        return f'{obj.assigned_by.first_name} {obj.assigned_by.last_name}'.strip() or obj.assigned_by.username


class AssetSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    maintenance_logs = MaintenanceLogSerializer(many=True, read_only=True)
    assignments = AssetAssignmentSerializer(many=True, read_only=True)

    class Meta:
        model = Asset
        fields = '__all__'
        read_only_fields = ['asset_tag', 'created_at', 'updated_at']

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f'{obj.assigned_to.first_name} {obj.assigned_to.last_name}'.strip() or obj.assigned_to.username
        return None


class AssetListSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Asset
        fields = ['id', 'asset_tag', 'name', 'category', 'status', 'condition',
                  'location', 'department', 'assigned_to', 'assigned_to_name',
                  'purchase_cost', 'warranty_expiry', 'created_at']

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f'{obj.assigned_to.first_name} {obj.assigned_to.last_name}'.strip() or obj.assigned_to.username
        return None
