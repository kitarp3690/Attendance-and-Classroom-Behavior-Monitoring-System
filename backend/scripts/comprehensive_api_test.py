"""
Comprehensive API Testing for Khwopa Attendance System
Tests all major workflows and features
"""

import requests
import json
import sys
import io
from datetime import datetime, timedelta

# Set UTF-8 encoding
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

# Symbols for terminal output
CHECK = "[PASS]"
CROSS = "[FAIL]"

class APITester:
    def __init__(self):
        self.results = []
        self.tokens = {}
        
    def test(self, name, method, endpoint, data=None, headers=None, expected_status=None):
        """Execute API test"""
        url = f"{BASE_URL}{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers)
            elif method == "PATCH":
                response = requests.patch(url, json=data, headers=headers)
            else:
                return False
            
            success = expected_status is None or response.status_code == expected_status
            
            status_symbol = CHECK if success else CROSS
            status_text = f"{response.status_code}"
            
            print(f"{status_symbol} {name:<50} {status_text}")
            
            if not success and expected_status:
                print(f"  Expected {expected_status}, got {response.status_code}")
                if response.text:
                    print(f"  Response: {response.text[:200]}")
            
            self.results.append({
                "test": name,
                "status": response.status_code,
                "success": success
            })
            
            return response
        except Exception as e:
            print(f"{CROSS} {name:<50} ERROR: {str(e)}")
            self.results.append({
                "test": name,
                "status": "ERROR",
                "success": False
            })
            return None

    def print_section(self, title):
        """Print section header"""
        print(f"\n{'='*70}")
        print(f"  {title}")
        print(f"{'='*70}\n")

    def print_summary(self):
        """Print test summary"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r["success"])
        failed = total - passed
        
        print(f"\n{'='*70}")
        print(f"  TEST SUMMARY")
        print(f"{'='*70}")
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/total*100):.1f}%\n")

def main():
    tester = APITester()
    
    # ============= SECTION 1: AUTHENTICATION =============
    tester.print_section("1. AUTHENTICATION & USER MANAGEMENT")
    
    # Login as HOD
    response = tester.test(
        "1.1 HOD Login (hod_ce)",
        "POST",
        "/api/auth/login/",
        {"username": "hod_ce", "password": "hod123"},
        expected_status=200
    )
    if response:
        hod_token = response.json()["access"]
        tester.tokens["hod"] = {"Authorization": f"Bearer {hod_token}"}
        print(f"    Token saved: {hod_token[:30]}...")
    
    # Login as Teacher
    response = tester.test(
        "1.2 Teacher Login (teacher_ce_1)",
        "POST",
        "/api/auth/login/",
        {"username": "teacher_ce_1", "password": "teacher123"},
        expected_status=200
    )
    if response:
        teacher_token = response.json()["access"]
        tester.tokens["teacher"] = {"Authorization": f"Bearer {teacher_token}"}
    
    # Login as Student
    response = tester.test(
        "1.3 Student Login (student_ce_1)",
        "POST",
        "/api/auth/login/",
        {"username": "student_ce_1", "password": "student123"},
        expected_status=200
    )
    if response:
        student_token = response.json()["access"]
        tester.tokens["student"] = {"Authorization": f"Bearer {student_token}"}
    
    # Get current user info
    if "hod" in tester.tokens:
        tester.test(
            "1.4 Get Current User (HOD)",
            "GET",
            "/api/auth/me/",
            headers=tester.tokens["hod"],
            expected_status=200
        )
    
    # ============= SECTION 2: DEPARTMENT MANAGEMENT =============
    tester.print_section("2. DEPARTMENT MANAGEMENT")
    
    tester.test(
        "2.1 List Departments (HOD - should see only own)",
        "GET",
        "/api/attendance/departments/",
        headers=tester.tokens.get("hod"),
        expected_status=200
    )
    
    tester.test(
        "2.2 Department Statistics (HOD)",
        "GET",
        "/api/attendance/departments/1/statistics/",
        headers=tester.tokens.get("hod"),
        expected_status=200
    )
    
    # ============= SECTION 3: CLASS & SUBJECT MANAGEMENT =============
    tester.print_section("3. CLASS & SUBJECT MANAGEMENT")
    
    tester.test(
        "3.1 List Subjects (Department filtering)",
        "GET",
        "/api/attendance/subjects/",
        headers=tester.tokens.get("hod"),
        expected_status=200
    )
    
    tester.test(
        "3.2 List Classes (Department filtering)",
        "GET",
        "/api/attendance/classes/",
        headers=tester.tokens.get("teacher"),
        expected_status=200
    )
    
    tester.test(
        "3.3 Get Class Details (Class 1)",
        "GET",
        "/api/attendance/classes/1/",
        headers=tester.tokens.get("teacher"),
        expected_status=200
    )
    
    # ============= SECTION 4: CLASS SCHEDULE =============
    tester.print_section("4. CLASS SCHEDULE MANAGEMENT")
    
    tester.test(
        "4.1 List Class Schedules",
        "GET",
        "/api/attendance/class-schedules/",
        headers=tester.tokens.get("teacher"),
        expected_status=200
    )
    
    tester.test(
        "4.2 Get Schedules by Day (Sunday=0)",
        "GET",
        "/api/attendance/class-schedules/by_day/?day=0",
        headers=tester.tokens.get("teacher"),
        expected_status=200
    )
    
    # ============= SECTION 5: SESSION MANAGEMENT =============
    tester.print_section("5. SESSION MANAGEMENT (Teacher Workflow)")
    
    # Get class info first
    classes_response = tester.test(
        "5.1 Get Available Classes",
        "GET",
        "/api/attendance/classes/",
        headers=tester.tokens.get("teacher"),
        expected_status=200
    )
    
    class_id = None
    if classes_response and classes_response.json()["results"]:
        class_id = classes_response.json()["results"][0]["id"]
        
        # Get subject info
        subjects = classes_response.json()["results"][0].get("subjects", [])
        subject_id = subjects[0]["id"] if subjects else 1
        
        # Start session
        session_response = tester.test(
            "5.2 Start Session (Teacher)",
            "POST",
            "/api/attendance/sessions/start_session/",
            {
                "class_assigned": class_id,
                "subject": subject_id
            },
            headers=tester.tokens.get("teacher"),
            expected_status=201
        )
        
        if session_response:
            session_data = session_response.json()
            session_id = session_data.get("id")
            print(f"    Session created: ID={session_id}, Status={session_data.get('is_active')}")
            
            # List active sessions
            tester.test(
                "5.3 List Active Sessions",
                "GET",
                "/api/attendance/sessions/active_sessions/",
                headers=tester.tokens.get("teacher"),
                expected_status=200
            )
    
    # ============= SECTION 6: ATTENDANCE MARKING =============
    tester.print_section("6. ATTENDANCE MARKING")
    
    if class_id:
        # Get enrolled students
        students_response = tester.test(
            "6.1 Get Class Students",
            "GET",
            f"/api/attendance/class-students/?class_assigned={class_id}",
            headers=tester.tokens.get("teacher"),
            expected_status=200
        )
        
        student_ids = []
        if students_response and students_response.json()["results"]:
            student_ids = [s["student"] for s in students_response.json()["results"][:3]]
        
        # Get sessions to mark attendance
        sessions_response = tester.test(
            "6.2 Get Teacher's Sessions",
            "GET",
            "/api/attendance/sessions/",
            headers=tester.tokens.get("teacher"),
            expected_status=200
        )
        
        if sessions_response and sessions_response.json()["results"]:
            session = sessions_response.json()["results"][0]
            session_id = session["id"]
            
            # Mark single attendance
            if student_ids:
                tester.test(
                    "6.3 Mark Single Attendance (Present)",
                    "POST",
                    "/api/attendance/attendance/mark_attendance/",
                    {
                        "student": student_ids[0],
                        "session": session_id,
                        "status": "present"
                    },
                    headers=tester.tokens.get("teacher"),
                    expected_status=201
                )
            
            # Mark multiple attendance
            if len(student_ids) > 1:
                tester.test(
                    "6.4 Mark Multiple Attendance",
                    "POST",
                    "/api/attendance/attendance/mark_multiple/",
                    {
                        "session": session_id,
                        "attendances": [
                            {"student": student_ids[1], "status": "absent"},
                            {"student": student_ids[2], "status": "late"}
                        ]
                    },
                    headers=tester.tokens.get("teacher"),
                    expected_status=201
                )
            
            # Get attendance statistics
            tester.test(
                "6.5 Get Attendance Statistics",
                "GET",
                f"/api/attendance/attendance/statistics/?session={session_id}",
                headers=tester.tokens.get("teacher"),
                expected_status=200
            )
    
    # ============= SECTION 7: ATTENDANCE CHANGES (HOD WORKFLOW) =============
    tester.print_section("7. ATTENDANCE CHANGE APPROVAL (HOD Workflow)")
    
    # Get attendance records
    attendance_response = tester.test(
        "7.1 Get Attendance Records",
        "GET",
        "/api/attendance/attendance/",
        headers=tester.tokens.get("hod"),
        expected_status=200
    )
    
    if attendance_response and attendance_response.json()["results"]:
        attendance = attendance_response.json()["results"][0]
        attendance_id = attendance["id"]
        
        # Request attendance change
        change_response = tester.test(
            "7.2 Request Attendance Change (Teacher)",
            "POST",
            "/api/attendance/attendance-changes/",
            {
                "attendance": attendance_id,
                "old_status": attendance["status"],
                "new_status": "present" if attendance["status"] != "present" else "absent",
                "reason": "Student was present but marked absent by mistake"
            },
            headers=tester.tokens.get("teacher"),
            expected_status=201
        )
        
        if change_response:
            change_id = change_response.json()["id"]
            
            # Get pending changes (HOD view)
            tester.test(
                "7.3 Get Pending Changes (HOD)",
                "GET",
                "/api/attendance/attendance-changes/pending/",
                headers=tester.tokens.get("hod"),
                expected_status=200
            )
            
            # HOD approves change
            tester.test(
                "7.4 Approve Attendance Change (HOD)",
                "POST",
                f"/api/attendance/attendance-changes/{change_id}/approve/",
                {},
                headers=tester.tokens.get("hod"),
                expected_status=200
            )
    
    # ============= SECTION 8: ATTENDANCE REPORTS =============
    tester.print_section("8. ATTENDANCE REPORTS")
    
    tester.test(
        "8.1 Get Attendance Reports",
        "GET",
        "/api/attendance/attendance-reports/",
        headers=tester.tokens.get("student"),
        expected_status=200
    )
    
    tester.test(
        "8.2 Get Low Attendance Students (HOD)",
        "GET",
        "/api/attendance/attendance-reports/low_attendance/?threshold=75",
        headers=tester.tokens.get("hod"),
        expected_status=200
    )
    
    # ============= SECTION 9: PERMISSIONS & ACCESS CONTROL =============
    tester.print_section("9. PERMISSIONS & ACCESS CONTROL")
    
    # Student trying to access departments (should fail)
    tester.test(
        "9.1 Student Access to Departments (should fail)",
        "GET",
        "/api/attendance/departments/",
        headers=tester.tokens.get("student"),
        expected_status=403
    )
    
    # Teacher trying to approve attendance changes (should fail)
    tester.test(
        "9.2 Teacher Approval of Changes (should fail)",
        "POST",
        "/api/attendance/attendance-changes/1/approve/",
        {},
        headers=tester.tokens.get("teacher"),
        expected_status=403
    )
    
    # ============= SECTION 10: NOTIFICATIONS =============
    tester.print_section("10. NOTIFICATIONS")
    
    tester.test(
        "10.1 Get Notifications (User-specific)",
        "GET",
        "/api/attendance/notifications/",
        headers=tester.tokens.get("teacher"),
        expected_status=200
    )
    
    tester.test(
        "10.2 Get Unread Count",
        "GET",
        "/api/attendance/notifications/unread_count/",
        headers=tester.tokens.get("teacher"),
        expected_status=200
    )
    
    # Print summary
    tester.print_summary()

if __name__ == "__main__":
    print(f"\nStarting Comprehensive API Tests...")
    print(f"Base URL: {BASE_URL}\n")
    main()
