import os
import django
import requests
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_and_monitoring_system.settings')
django.setup()

from users.models import CustomUser

BASE_URL = "http://localhost:8000/api"

print("\n=== Testing Password Change API ===\n")

# Step 1: Login
print("Step 1: Login with admin/admin123")
login_data = {
    "username": "admin",
    "password": "admin123"
}

try:
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    print(f"Login Status: {response.status_code}")
    
    if response.status_code == 200:
        tokens = response.json()
        access_token = tokens.get('access')
        print(f"Access Token: {access_token[:50]}...")
        
        # Step 2: Get current user info
        print("\nStep 2: Get current user info")
        headers = {"Authorization": f"Bearer {access_token}"}
        me_response = requests.get(f"{BASE_URL}/auth/me/", headers=headers)
        print(f"Me Status: {me_response.status_code}")
        if me_response.status_code == 200:
            user_info = me_response.json()
            print(f"Current User: {user_info.get('username')} ({user_info.get('role')})")
        
        # Step 3: Try to change password
        print("\nStep 3: Change password")
        change_pwd_data = {
            "old_password": "admin123",
            "new_password": "newadmin123"
        }
        
        pwd_response = requests.post(
            f"{BASE_URL}/auth/change_password/",
            json=change_pwd_data,
            headers=headers
        )
        print(f"Change Password Status: {pwd_response.status_code}")
        print(f"Response: {pwd_response.text}")
        
        if pwd_response.status_code == 200:
            print("\n✅ Password changed successfully!")
            
            # Step 4: Change it back
            print("\nStep 4: Change password back to original")
            change_back_data = {
                "old_password": "newadmin123",
                "new_password": "admin123"
            }
            
            back_response = requests.post(
                f"{BASE_URL}/auth/change_password/",
                json=change_back_data,
                headers=headers
            )
            print(f"Change Back Status: {back_response.status_code}")
            print(f"Response: {back_response.text}")
            
            if back_response.status_code == 200:
                print("\n✅ Password restored successfully!")
            else:
                print("\n❌ Failed to restore password")
        else:
            print("\n❌ Failed to change password")
            print(f"Error: {pwd_response.json()}")
    else:
        print(f"Login failed: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("❌ Could not connect to Django server at http://localhost:8000")
    print("Make sure Django server is running: python manage.py runserver")
except Exception as e:
    print(f"❌ Error: {e}")

# Check database directly
print("\n=== Checking Database ===")
admin_user = CustomUser.objects.get(username='admin')
print(f"Admin password hash (first 50 chars): {admin_user.password[:50]}...")
print(f"Checking 'admin123': {admin_user.check_password('admin123')}")
print(f"Checking 'newadmin123': {admin_user.check_password('newadmin123')}")
