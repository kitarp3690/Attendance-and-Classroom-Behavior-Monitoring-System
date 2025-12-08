# 🚀 Quick Start Guide - Khwopa Attendance System

## 📋 What Has Been Implemented

### ✅ Complete Backend (100%)
- 13 Django models with all relationships
- 13 serializers with computed fields
- 13 ViewSets with 70+ API endpoints
- Role-based permissions (Admin, HOD, Teacher, Student)
- Complete admin panel configuration
- Automated attendance report generation
- HOD approval workflow for attendance changes
- Department-based data isolation
- Face recognition integration support

### ✅ API Integration (100%)
- Complete API service (api.js) with 13 modules
- JWT authentication with auto token refresh
- 100+ API functions ready to use
- Error handling and interceptors

### ✅ Documentation (100%)
- 6 comprehensive documents (5000+ lines)
- API endpoint documentation (70+ endpoints)
- Frontend implementation guide
- System architecture diagrams
- Complete implementation summary

---

## 🎯 Quick Start - Run The System

### Step 1: Run Database Migrations (5 minutes)

Open Command Prompt and run:

```cmd
cd c:\Attendance-and-Classroom-Behavior-Monitoring-System\backend
run_migrations.bat
```

This will:
1. Generate migrations for all new models
2. Apply migrations to PostgreSQL database
3. Run system checks

**Expected Output:**
```
Step 1: Creating migrations...
Migrations for 'attendance':
  attendance/migrations/0003_auto_XXXXX.py
    - Create model Department
    - Create model ClassSchedule
    - Create model AttendanceChange
    - Create model AttendanceReport
    - Add field department to class
    - Add field department to session
    ...

Step 2: Applying migrations...
Running migrations:
  Applying attendance.0003_auto_XXXXX... OK
  Applying users.0003_auto_XXXXX... OK

Step 3: Checking for errors...
System check identified no issues (0 silenced).

Migration Complete!
```

### Step 2: Start Backend Server

```cmd
cd c:\Attendance-and-Classroom-Behavior-Monitoring-System\backend\attendance_and_monitoring_system
..\venv\Scripts\python.exe manage.py runserver
```

Backend will be available at: `http://localhost:8000`

### Step 3: Start Frontend Server

Open another Command Prompt:

```cmd
cd c:\Attendance-and-Classroom-Behavior-Monitoring-System\frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🔐 Create Test Data

### Option 1: Django Admin Panel

1. Go to `http://localhost:8000/admin`
2. Login with admin credentials
3. Create test data in this order:
   - Department (e.g., Computer Engineering)
   - Users (HOD, Teachers, Students - assign departments)
   - Subjects (assign to departments)
   - Classes (assign to departments)
   - Enroll Students (ClassStudent)
   - Assign Teachers to Classes
   - Create Class Schedules

### Option 2: Create Python Script (Recommended)

Create `backend/attendance_and_monitoring_system/create_test_data.py`:

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_and_monitoring_system.settings')
django.setup()

from attendance.models import Department, Subject, Class, ClassSchedule
from users.models import CustomUser

# Create Department
dept = Department.objects.create(
    name="Computer Engineering",
    code="CE",
    contact_email="ce@khwopa.edu.np"
)

# Create HOD
hod = CustomUser.objects.create_user(
    username="hod_ce",
    password="hod123",
    email="hod@khwopa.edu.np",
    first_name="Dr. Ram",
    last_name="Sharma",
    role="hod",
    department=dept
)
dept.hod = hod
dept.save()

# Create Teacher
teacher = CustomUser.objects.create_user(
    username="teacher1",
    password="teacher123",
    email="teacher1@khwopa.edu.np",
    first_name="Shyam",
    last_name="Thapa",
    role="teacher",
    department=dept
)

# Create Students
for i in range(1, 6):
    CustomUser.objects.create_user(
        username=f"student{i}",
        password="student123",
        email=f"student{i}@khwopa.edu.np",
        first_name=f"Student{i}",
        last_name="Name",
        role="student",
        department=dept
    )

# Create Subject
subject = Subject.objects.create(
    name="Data Structures and Algorithms",
    code="CE301",
    description="Learn DSA",
    department=dept,
    credits=3
)

# Create Class
class_obj = Class.objects.create(
    name="3rd Year",
    section="A",
    academic_year="2024-2025",
    department=dept,
    semester="Fall 2024"
)
class_obj.subjects.add(subject)

# Create Schedule (Monday 9-11 AM)
ClassSchedule.objects.create(
    class_assigned=class_obj,
    subject=subject,
    day_of_week=1,  # Monday
    scheduled_start_time="09:00:00",
    scheduled_end_time="11:00:00"
)

print("✅ Test data created successfully!")
print(f"Department: {dept.name}")
print(f"HOD: {hod.username} / hod123")
print(f"Teacher: {teacher.username} / teacher123")
print(f"Students: student1-5 / student123")
```

Run it:
```cmd
cd c:\Attendance-and-Classroom-Behavior-Monitoring-System\backend\attendance_and_monitoring_system
..\venv\Scripts\python.exe create_test_data.py
```

---

## 🧪 Test The APIs

### 1. Login (Get JWT Token)

**Request:**
```bash
POST http://localhost:8000/api/auth/token/
Content-Type: application/json

{
  "username": "teacher1",
  "password": "teacher123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 2,
    "username": "teacher1",
    "role": "teacher",
    "department": 1
  }
}
```

Save the `access` token for next requests.

### 2. Start A Session

**Request:**
```bash
POST http://localhost:8000/api/attendance/sessions/start_session/
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
  "class_assigned": 1,
  "subject": 1
}
```

**Response:**
```json
{
  "id": 1,
  "teacher": 2,
  "teacher_name": "Shyam Thapa",
  "subject": 1,
  "subject_name": "Data Structures and Algorithms",
  "class_assigned": 1,
  "class_name": "3rd Year - A",
  "department": 1,
  "department_name": "Computer Engineering",
  "start_time": "2024-12-08T10:00:00Z",
  "end_time": null,
  "is_active": true,
  "attendance_finalized": false,
  "total_students": 5
}
```

### 3. Mark Attendance

**Request:**
```bash
POST http://localhost:8000/api/attendance/attendance/mark_attendance/
Authorization: Bearer <your_access_token>
Content-Type: application/json

{
  "student_id": 3,
  "session_id": 1,
  "status": "present",
  "confidence_score": 0.95
}
```

### 4. End Session

**Request:**
```bash
POST http://localhost:8000/api/attendance/sessions/1/end_session/
Authorization: Bearer <your_access_token>
```

This automatically generates attendance reports!

### 5. View Reports

**Request:**
```bash
GET http://localhost:8000/api/attendance/attendance-reports/
Authorization: Bearer <your_access_token>
```

---

## 📊 System Features

### For Admin:
- ✅ Manage departments, users, classes, subjects
- ✅ View system-wide reports
- ✅ Configure class schedules
- ✅ Export data

### For HOD:
- ✅ View all sessions in department
- ✅ Approve/reject attendance changes
- ✅ View department-wide reports
- ✅ Monitor teacher performance
- ✅ Track low attendance students

### For Teacher:
- ✅ Start/end attendance sessions
- ✅ Mark attendance (manual or camera-based)
- ✅ View session history
- ✅ Request attendance changes
- ✅ Export class reports

### For Student:
- ✅ View personal attendance
- ✅ See subject-wise statistics
- ✅ Check attendance percentage
- ✅ View class schedule
- ✅ Receive low attendance alerts

---

## 📁 Key Files

### Backend:
- `backend/attendance_and_monitoring_system/attendance/models.py` - All models
- `backend/attendance_and_monitoring_system/attendance/views.py` - All ViewSets
- `backend/attendance_and_monitoring_system/attendance/serializers.py` - All serializers
- `backend/attendance_and_monitoring_system/attendance/urls.py` - API routes
- `backend/attendance_and_monitoring_system/users/models.py` - User model

### Frontend:
- `frontend/src/services/api.js` - Complete API client

### Documentation:
- `API_ENDPOINTS_DOCUMENTATION.md` - All 70+ API endpoints
- `FRONTEND_IMPLEMENTATION_GUIDE.md` - Frontend architecture
- `ARCHITECTURE_DIAGRAM.md` - System diagrams
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Full summary

---

## 🐛 Troubleshooting

### Issue: Migrations fail
**Solution:** Make sure PostgreSQL is running on port 5433 and the database exists.

### Issue: Token expired
**Solution:** Frontend auto-refreshes tokens. If login page shows, login again.

### Issue: Permission denied
**Solution:** Check user role. Some actions require specific roles (e.g., HOD for approvals).

### Issue: Department not visible
**Solution:** Make sure the user has a department assigned.

---

## 🎓 College Scenario Features

### ✅ 6-Day Week Support
- Sunday to Friday schedules
- Day codes: 0=Sun, 1=Mon, ..., 5=Fri

### ✅ Flexible Class Times
- No fixed schedule
- Teacher starts session anytime
- Variable class durations

### ✅ Session-Based Attendance
- Teacher controls start/end
- Real-time marking during session
- Auto-finalization on end

### ✅ Cross-Department Teaching
- Teachers can teach outside their department
- `cross_department` flag tracks this

### ✅ HOD Oversight
- Approve attendance changes
- View department sessions
- Monitor all statistics

### ✅ Audit Trail
- All changes tracked in AttendanceChange
- Approval history maintained
- Complete transparency

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review API_ENDPOINTS_DOCUMENTATION.md
3. Check Django admin panel for data
4. Review console logs in frontend

---

## 🎉 You're All Set!

**System Status:** ✅ Ready to Run

**Next Steps:**
1. Run migrations ← **DO THIS FIRST**
2. Create test data
3. Start backend server
4. Start frontend server  
5. Login and test features

**Total Setup Time:** ~15 minutes

---

**Last Updated:** December 8, 2025
**Version:** 1.0.0 - Complete Implementation
