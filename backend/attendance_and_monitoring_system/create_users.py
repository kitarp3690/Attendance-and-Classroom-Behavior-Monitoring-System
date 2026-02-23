import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_and_monitoring_system.settings')
django.setup()

from users.models import CustomUser

# Create test users
print("Creating test users...")

# Admin
admin, created = CustomUser.objects.get_or_create(
    username="admin",
    defaults={
        "email": "admin@khwopa.edu.np",
        "first_name": "System",
        "last_name": "Admin",
        "role": "admin",
        "is_staff": True,
        "is_superuser": True
    }
)
if created:
    admin.set_password("admin123")
    admin.save()
    print("✓ Created: admin / admin123")
else:
    print("✓ Exists: admin")

# Teacher
teacher, created = CustomUser.objects.get_or_create(
    username="teacher1",
    defaults={
        "email": "teacher1@khwopa.edu.np",
        "first_name": "Teacher",
        "last_name": "One",
        "role": "teacher"
    }
)
if created:
    teacher.set_password("password123")
    teacher.save()
    print("✓ Created: teacher1 / password123")
else:
    print("✓ Exists: teacher1")

# HOD
hod, created = CustomUser.objects.get_or_create(
    username="hod1",
    defaults={
        "email": "hod1@khwopa.edu.np",
        "first_name": "HOD",
        "last_name": "One",
        "role": "hod"
    }
)
if created:
    hod.set_password("password123")
    hod.save()
    print("✓ Created: hod1 / password123")
else:
    print("✓ Exists: hod1")

# Student
student, created = CustomUser.objects.get_or_create(
    username="student1",
    defaults={
        "email": "student1@khwopa.edu.np",
        "first_name": "Student",
        "last_name": "One",
        "role": "student"
    }
)
if created:
    student.set_password("password123")
    student.save()
    print("✓ Created: student1 / password123")
else:
    print("✓ Exists: student1")

print("\n=== LOGIN CREDENTIALS ===")
print("Admin:   admin / admin123")
print("Teacher: teacher1 / password123")
print("HOD:     hod1 / password123")
print("Student: student1 / password123")
