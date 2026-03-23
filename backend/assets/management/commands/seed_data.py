import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from assets.models import Asset, AssetAssignment, MaintenanceLog


CATEGORIES = ['Laptop', 'Desktop', 'Monitor', 'Phone', 'Printer', 'Network Equipment', 'Server', 'Other']
MANUFACTURERS = ['Dell', 'HP', 'Apple', 'Lenovo', 'Cisco', 'Samsung', 'LG', 'Logitech']
DEPARTMENTS = ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations', 'Sales', 'IT', 'Legal']
LOCATIONS = ['Floor 1 - A', 'Floor 1 - B', 'Floor 2 - A', 'Floor 2 - B', 'Server Room', 'Warehouse']
STATUSES = ['Available', 'Assigned', 'In Repair', 'Retired']
CONDITIONS = ['New', 'Good', 'Fair', 'Poor']


class Command(BaseCommand):
    help = 'Seed database with 50 sample assets'

    def handle(self, *args, **kwargs):
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
            self.stdout.write('Created admin user: admin / admin123')

        # Create staff users
        users = []
        names = [('alice', 'Alice', 'Smith'), ('bob', 'Bob', 'Johnson'),
                 ('carol', 'Carol', 'Williams'), ('david', 'David', 'Brown')]
        for username, first, last in names:
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={'email': f'{username}@example.com', 'first_name': first, 'last_name': last, 'is_staff': True}
            )
            users.append(user)

        # Create 50 assets
        for i in range(50):
            category = random.choice(CATEGORIES)
            manufacturer = random.choice(MANUFACTURERS)
            status = random.choice(STATUSES)
            assigned_user = random.choice(users) if status == 'Assigned' else None
            purchase_date = date.today() - timedelta(days=random.randint(30, 1500))
            cost = round(random.uniform(200, 5000), 2)

            asset = Asset(
                name=f'{manufacturer} {category} {i+1:02d}',
                category=category,
                manufacturer=manufacturer,
                model_number=f'{manufacturer[:3].upper()}-{random.randint(100,999)}',
                serial_number=f'SN{random.randint(100000,999999)}',
                purchase_date=purchase_date,
                purchase_cost=cost,
                warranty_expiry=purchase_date + timedelta(days=random.choice([365, 730, 1095])),
                status=status,
                condition=random.choice(CONDITIONS),
                location=random.choice(LOCATIONS),
                department=random.choice(DEPARTMENTS),
                assigned_to=assigned_user,
            )
            asset.save()

            # Add maintenance log for some assets
            if random.random() > 0.6:
                MaintenanceLog.objects.create(
                    asset=asset,
                    maintenance_type=random.choice(['Repair', 'Upgrade', 'Inspection', 'Cleaning']),
                    description='Routine maintenance performed',
                    cost=round(random.uniform(20, 500), 2),
                    performed_by='IT Team',
                    date_performed=date.today() - timedelta(days=random.randint(1, 180)),
                )

        self.stdout.write(self.style.SUCCESS('Successfully seeded 50 assets'))
