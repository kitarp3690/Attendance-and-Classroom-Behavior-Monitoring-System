"""
Quick API Test Script
Tests login, department listing, and session workflow
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def print_response(title, response):
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")

# Test 1: Login as HOD
print("\n🔐 Test 1: Login as HOD (Computer Engineering)")
response = requests.post(
    f"{BASE_URL}/api/auth/login/",
    json={
        "username": "hod_ce",
        "password": "hod123"
    }
)
print_response("HOD Login", response)

if response.status_code == 200:
    hod_token = response.json().get('access')
    hod_headers = {"Authorization": f"Bearer {hod_token}"}
    
    # Test 2: Get departments
    print("\n📚 Test 2: Get Departments (HOD view)")
    response = requests.get(
        f"{BASE_URL}/api/attendance/departments/",
        headers=hod_headers
    )
    print_response("Departments List", response)
    
    # Test 3: Get HOD's own info
    print("\n👤 Test 3: Get Current User Info")
    response = requests.get(
        f"{BASE_URL}/api/auth/me/",
        headers=hod_headers
    )
    print_response("Current User", response)

# Test 4: Login as Teacher
print("\n\n🔐 Test 4: Login as Teacher")
response = requests.post(
    f"{BASE_URL}/api/auth/login/",
    json={
        "username": "teacher_ce_1",
        "password": "teacher123"
    }
)
print_response("Teacher Login", response)

if response.status_code == 200:
    teacher_token = response.json().get('access')
    teacher_headers = {"Authorization": f"Bearer {teacher_token}"}
    
    # Test 5: Get classes (teacher view)
    print("\n🏫 Test 5: Get Classes (Teacher view)")
    response = requests.get(
        f"{BASE_URL}/api/attendance/classes/",
        headers=teacher_headers
    )
    print_response("Classes List", response)
    
    # Test 6: Get subjects
    print("\n📖 Test 6: Get Subjects")
    response = requests.get(
        f"{BASE_URL}/api/attendance/subjects/",
        headers=teacher_headers
    )
    print_response("Subjects List", response)
    
    # Test 7: Get class schedules
    print("\n📅 Test 7: Get Class Schedules")
    response = requests.get(
        f"{BASE_URL}/api/attendance/class-schedules/",
        headers=teacher_headers
    )
    print_response("Class Schedules", response)

# Test 8: Login as Student
print("\n\n🔐 Test 8: Login as Student")
response = requests.post(
    f"{BASE_URL}/api/auth/login/",
    json={
        "username": "student_ce_1",
        "password": "student123"
    }
)
print_response("Student Login", response)

if response.status_code == 200:
    student_token = response.json().get('access')
    student_headers = {"Authorization": f"Bearer {student_token}"}
    
    # Test 9: Get student's classes
    print("\n🏫 Test 9: Get Student's Enrolled Classes")
    response = requests.get(
        f"{BASE_URL}/api/attendance/classes/",
        headers=student_headers
    )
    print_response("Student Classes", response)
    
    # Test 10: Get attendance reports
    print("\n📊 Test 10: Get Attendance Reports")
    response = requests.get(
        f"{BASE_URL}/api/attendance/attendance-reports/",
        headers=student_headers
    )
    print_response("Attendance Reports", response)

print("\n" + "="*60)
print("✅ API Tests Complete!")
print("="*60)
