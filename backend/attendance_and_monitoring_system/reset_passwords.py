import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_and_monitoring_system.settings')
django.setup()

from users.models import CustomUser

print("Resetting passwords for all users...")

# Reset admin password
try:
    admin = CustomUser.objects.get(username='admin')
    admin.set_password('admin123')
    admin.save()
    print("✓ admin / admin123")
except CustomUser.DoesNotExist:
    print("✗ admin not found")

# Reset teacher1 password
try:
    teacher = CustomUser.objects.get(username='teacher1')
    teacher.set_password('password123')
    teacher.save()
    print("✓ teacher1 / password123")
except CustomUser.DoesNotExist:
    print("✗ teacher1 not found")

# Reset hod1 password
try:
    hod = CustomUser.objects.get(username='hod1')
    hod.set_password('password123')
    hod.save()
    print("✓ hod1 / password123")
except CustomUser.DoesNotExist:
    print("✗ hod1 not found")

# Reset student1 password
try:
    student = CustomUser.objects.get(username='student1')
    student.set_password('password123')
    student.save()
    print("✓ student1 / password123")
except CustomUser.DoesNotExist:
    print("✗ student1 not found")

print("\n=== UPDATED LOGIN CREDENTIALS ===")
print("Admin:   admin / admin123")
print("Teacher: teacher1 / password123")
print("HOD:     hod1 / password123")
print("Student: student1 / password123")
