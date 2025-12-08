import os
import sys
import django

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.join(BASE_DIR, 'attendance_and_monitoring_system')
if PROJECT_DIR not in sys.path:
	sys.path.append(PROJECT_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_and_monitoring_system.settings')
django.setup()

from users.models import CustomUser

users = list(CustomUser.objects.values('id','username','role','is_active','is_staff'))
print(users)
