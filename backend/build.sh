#!/usr/bin/env bash
set -o errexit

pip install -r backend/requirements.txt
python backend/manage.py collectstatic --no-input
python backend/manage.py migrate

# Create default admin user
python backend/manage.py shell << 'EOF'
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Created admin user: admin / admin123')
else:
    print('Admin user already exists')
EOF
