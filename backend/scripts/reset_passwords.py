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

creds = {
    'admin': 'admin123',
    'teacher1': 'teacher123',
    'student1': 'student123',
    'student2': 'student123',
}

for username, password in creds.items():
    try:
        user = CustomUser.objects.get(username=username)
        user.set_password(password)
        # ensure roles for admin
        if username == 'admin':
            user.is_staff = True
            user.is_superuser = True
            user.role = 'admin'
        user.save()
        print(f"Reset password for {username}")
    except CustomUser.DoesNotExist:
        print(f"User not found: {username}")
