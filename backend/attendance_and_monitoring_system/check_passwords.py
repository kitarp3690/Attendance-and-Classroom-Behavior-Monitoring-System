import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_and_monitoring_system.settings')
django.setup()

from users.models import CustomUser
from django.contrib.auth.hashers import check_password

# Get all users
users = CustomUser.objects.all()[:5]

print("\n=== User Password Info ===\n")
for user in users:
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Role: {user.role}")
    print(f"Password (hashed): {user.password[:50]}...")
    print(f"Is password hashed: {user.password.startswith('pbkdf2_sha256')}")
    
    # Test with a known password (if you know it)
    # Uncomment and modify this line if you know the password
    # test_password = "your_test_password"
    # print(f"Check 'admin123': {check_password('admin123', user.password)}")
    # print(f"Check 'password': {check_password('password', user.password)}")
    
    print("-" * 60)

# Check if there's a specific user you're testing with
print("\n=== Testing Specific User ===")
try:
    test_user = CustomUser.objects.get(username='admin')  # Change this to your test username
    print(f"Found user: {test_user.username}")
    print(f"Password field: {test_user.password}")
    
    # Test common passwords
    common_passwords = ['admin', 'admin123', 'password', 'password123', '12345678']
    print("\nTesting common passwords:")
    for pwd in common_passwords:
        result = check_password(pwd, test_user.password)
        print(f"  '{pwd}': {result}")
        
except CustomUser.DoesNotExist:
    print("User 'admin' not found. Available users:")
    for u in CustomUser.objects.all():
        print(f"  - {u.username} ({u.role})")
