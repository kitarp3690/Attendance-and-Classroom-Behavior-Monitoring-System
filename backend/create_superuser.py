#!/usr/bin/env python3
"""
Create Django Superuser for Attendance System
"""

import os
import django
import sys

# Add backend to Python path
backend_path = r"C:\Attendance-and-Classroom-Behavior-Monitoring-System\backend\attendance_and_monitoring_system"
sys.path.insert(0, backend_path)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_and_monitoring_system.settings')

# Setup Django
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Superuser credentials
USERNAME = "admin"
EMAIL = "admin@attendance-system.com"
PASSWORD = "admin123456"

print("\n" + "="*60)
print("Creating Django Superuser")
print("="*60 + "\n")

# Check if superuser already exists
if User.objects.filter(username=USERNAME).exists():
    print(f"✓ Superuser '{USERNAME}' already exists\n")
else:
    # Create superuser
    print(f"Creating superuser '{USERNAME}'...")
    User.objects.create_superuser(username=USERNAME, email=EMAIL, password=PASSWORD)
    print(f"✓ Superuser '{USERNAME}' created successfully\n")

print("="*60)
print("Superuser Details:")
print("="*60)
print(f"Username: {USERNAME}")
print(f"Email: {EMAIL}")
print(f"Password: {PASSWORD}")
print("\nYou can now login to Django admin at: http://localhost:8000/admin/")
print("\n")
