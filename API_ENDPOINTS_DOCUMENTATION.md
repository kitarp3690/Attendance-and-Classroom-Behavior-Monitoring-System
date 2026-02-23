# Complete API Endpoints Documentation

## Base URL
`http://localhost:8000/api/`

## Authentication
All endpoints require JWT authentication except login/register.
Include in headers: `Authorization: Bearer <access_token>`

---

## 1. Authentication Endpoints

### POST /api/auth/login/
Login and get JWT tokens
```json
Request:
{
  "username": "teacher1",
  "password": "password123"
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "teacher1",
    "role": "teacher",
    "department": 1,
    "department_name": "Computer Engineering"
  }
}
```

### POST /api/auth/refresh/
Refresh access token
```json
Request:
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 2. Department Endpoints

### GET /api/attendance/departments/
List all departments (filtered by role)

### POST /api/attendance/departments/
Create new department (Admin only)
```json
{
  "name": "Computer Engineering",
  "code": "CE",
  "hod": 2,
  "contact_email": "ce@khwopa.edu.np"
}
```

### GET /api/attendance/departments/{id}/
Get department details

### PUT /api/attendance/departments/{id}/
Update department (Admin only)

### DELETE /api/attendance/departments/{id}/
Delete department (Admin only)

### GET /api/attendance/departments/{id}/statistics/
Get department statistics
```json
Response:
{
  "department": {...},
  "total_classes": 15,
  "total_subjects": 25,
  "total_students": 250,
  "total_teachers": 20
}
```

---

## 3. Subject Endpoints

### GET /api/attendance/subjects/
List all subjects (filtered by department)

### POST /api/attendance/subjects/
Create new subject
```json
{
  "name": "Data Structures and Algorithms",
  "code": "CE301",
  "description": "Learn about data structures",
  "department": 1,
  "credits": 3
}
```

### GET /api/attendance/subjects/{id}/
Get subject details

### PUT /api/attendance/subjects/{id}/
Update subject

### DELETE /api/attendance/subjects/{id}/
Delete subject

---

## 4. Class Endpoints

### GET /api/attendance/classes/
List all classes (filtered by department/role)

### POST /api/attendance/classes/
Create new class
```json
{
  "name": "CE 3rd Year",
  "section": "A",
  "description": "Computer Engineering 3rd year section A",
  "academic_year": "2024-2025",
  "department": 1,
  "semester": "Fall 2024",
  "subjects": [1, 2, 3]
}
```

### GET /api/attendance/classes/{id}/
Get class details (includes enrolled students)

### PUT /api/attendance/classes/{id}/
Update class

### DELETE /api/attendance/classes/{id}/
Delete class

---

## 5. Class Student (Enrollment) Endpoints

### GET /api/attendance/class-students/
List all enrollments

### POST /api/attendance/class-students/
Enroll student in class
```json
{
  "student": 5,
  "class_assigned": 2,
  "enrollment_status": "active"
}
```

### GET /api/attendance/class-students/{id}/
Get enrollment details

### PUT /api/attendance/class-students/{id}/
Update enrollment status

### DELETE /api/attendance/class-students/{id}/
Remove enrollment

---

## 6. Teacher Assignment Endpoints

### GET /api/attendance/teacher-assignments/
List all teacher assignments

### POST /api/attendance/teacher-assignments/
Assign teacher to subject/class
```json
{
  "teacher": 3,
  "subject": 5,
  "class_assigned": 2,
  "semester": "Fall 2024",
  "cross_department": false
}
```

### GET /api/attendance/teacher-assignments/{id}/
Get assignment details

### PUT /api/attendance/teacher-assignments/{id}/
Update assignment

### DELETE /api/attendance/teacher-assignments/{id}/
Remove assignment

---

## 7. Class Schedule Endpoints

### GET /api/attendance/class-schedules/
List all class schedules

### POST /api/attendance/class-schedules/
Create class schedule
```json
{
  "class_assigned": 2,
  "subject": 5,
  "day_of_week": 1,
  "scheduled_start_time": "09:00:00",
  "scheduled_end_time": "10:30:00"
}
```
Day codes: 0=Sunday, 1=Monday, ..., 5=Friday

### GET /api/attendance/class-schedules/{id}/
Get schedule details

### PUT /api/attendance/class-schedules/{id}/
Update schedule

### DELETE /api/attendance/class-schedules/{id}/
Delete schedule

### GET /api/attendance/class-schedules/by_day/?day=1
Get schedules for specific day (0-5)

---

## 8. Session Endpoints

### GET /api/attendance/sessions/
List all sessions (filtered by role)

### POST /api/attendance/sessions/start_session/
Start new attendance session (Teacher only)
```json
{
  "class_assigned": 2,
  "subject": 5
}

Response:
{
  "id": 10,
  "teacher": 3,
  "teacher_name": "John Doe",
  "subject": 5,
  "subject_name": "Data Structures",
  "class_assigned": 2,
  "department": 1,
  "start_time": "2024-12-08T10:00:00Z",
  "end_time": null,
  "is_active": true,
  "attendance_finalized": false,
  "total_students": 45,
  "camera_feed_id": null
}
```

### POST /api/attendance/sessions/{id}/end_session/
End active session (Teacher only)
```json
Response:
{
  "id": 10,
  "end_time": "2024-12-08T11:30:00Z",
  "is_active": false,
  "attendance_finalized": true
}
```
Automatically updates attendance reports when session ends.

### GET /api/attendance/sessions/active_sessions/
Get all active sessions

### GET /api/attendance/sessions/{id}/
Get session details

---

## 9. Attendance Endpoints

### GET /api/attendance/attendance/
List all attendance records (filtered by role)

### POST /api/attendance/attendance/mark_attendance/
Mark attendance for a student
```json
{
  "student_id": 5,
  "session_id": 10,
  "status": "present",
  "confidence_score": 0.95,
  "notes": "Detected by face recognition"
}

Response:
{
  "id": 150,
  "student": 5,
  "student_name": "Alice Johnson",
  "session": 10,
  "status": "present",
  "detected_time": "2024-12-08T10:05:00Z",
  "marked_at": "2024-12-08T10:05:00Z",
  "confidence_score": 0.95,
  "is_verified": false
}
```

### POST /api/attendance/attendance/mark_multiple/
Mark attendance for multiple students
```json
{
  "session_id": 10,
  "attendances": [
    {
      "student_id": 5,
      "status": "present",
      "confidence_score": 0.95
    },
    {
      "student_id": 6,
      "status": "late",
      "confidence_score": 0.88
    },
    {
      "student_id": 7,
      "status": "absent"
    }
  ]
}
```

### GET /api/attendance/attendance/{id}/
Get attendance record details

### PUT /api/attendance/attendance/{id}/
Update attendance record (creates AttendanceChange)

### GET /api/attendance/attendance/statistics/
Get attendance statistics
Query params: `subject_id`, `class_id`, `start_date`, `end_date`
```json
Response:
{
  "total": 100,
  "present": 85,
  "absent": 10,
  "late": 5,
  "percentage": 85.0
}
```

### GET /api/attendance/attendance/by_date/?date=2024-12-08
Get attendance records for specific date

---

## 10. Attendance Change Endpoints

### GET /api/attendance/attendance-changes/
List all attendance changes (filtered by role)

### POST /api/attendance/attendance-changes/
Create attendance change request
```json
{
  "attendance": 150,
  "old_status": "absent",
  "new_status": "present",
  "reason": "Student was present but not detected",
  "notes": "Verification by class representative"
}
```

### GET /api/attendance/attendance-changes/{id}/
Get change details

### POST /api/attendance/attendance-changes/{id}/approve/
Approve change (HOD only)
```json
Response:
{
  "id": 5,
  "approved_by": 2,
  "approved_by_name": "Dr. Smith (HOD)",
  "approved_at": "2024-12-08T15:00:00Z"
}
```

### POST /api/attendance/attendance-changes/{id}/reject/
Reject change (HOD only)

### GET /api/attendance/attendance-changes/pending/
Get all pending changes (HOD only)

---

## 11. Attendance Report Endpoints

### GET /api/attendance/attendance-reports/
List all attendance reports (filtered by role)

### GET /api/attendance/attendance-reports/{id}/
Get report details

### GET /api/attendance/attendance-reports/low_attendance/?threshold=75
Get students with attendance below threshold
```json
Response: [
  {
    "id": 25,
    "student": 10,
    "student_name": "Bob Wilson",
    "subject": 5,
    "subject_name": "Data Structures",
    "class_assigned": 2,
    "semester": "Fall 2024",
    "total_classes_held": 20,
    "present_count": 14,
    "absent_count": 5,
    "late_count": 1,
    "percentage": 70.0
  }
]
```

### POST /api/attendance/attendance-reports/regenerate/
Regenerate report for specific student/subject
```json
{
  "student_id": 10,
  "subject_id": 5,
  "class_id": 2,
  "semester": "Fall 2024"
}
```

---

## 12. Face Embedding Endpoints

### GET /api/attendance/embeddings/
List all face embeddings

### POST /api/attendance/embeddings/
Upload face embedding
```json
{
  "student": 10,
  "embedding_vector": [0.123, -0.456, ...],  // 512-dim array
  "image": <file upload>
}
```

### GET /api/attendance/embeddings/{id}/
Get embedding details

### PUT /api/attendance/embeddings/{id}/
Update embedding

### DELETE /api/attendance/embeddings/{id}/
Delete embedding

---

## 13. Notification Endpoints

### GET /api/attendance/notifications/
List all notifications for current user

### POST /api/attendance/notifications/
Create notification (Admin/System only)
```json
{
  "user": 10,
  "category": "alert",
  "title": "Low Attendance Alert",
  "message": "Your attendance in Data Structures is below 75%"
}
```

### GET /api/attendance/notifications/{id}/
Get notification details

### POST /api/attendance/notifications/{id}/mark_read/
Mark notification as read

### POST /api/attendance/notifications/mark_all_read/
Mark all notifications as read

### GET /api/attendance/notifications/unread_count/
Get unread notification count
```json
Response:
{
  "unread_count": 5
}
```

### GET /api/attendance/notifications/by_category/?category=alert
Get notifications by category

---

## 14. User Endpoints

### GET /api/users/
List all users (filtered by role)

### POST /api/users/register/
Register new user
```json
{
  "username": "student123",
  "email": "student@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "student",
  "department": 1,
  "phone": "9841234567"
}
```

### GET /api/users/me/
Get current user details

### PUT /api/users/me/
Update current user profile

### POST /api/users/change-password/
Change password
```json
{
  "old_password": "oldpass123",
  "new_password": "newpass456"
}
```

---

## Role-Based Access Control

### Admin
- Full access to all endpoints
- Can create/update/delete all resources
- Can manage departments, users, and system settings

### HOD (Head of Department)
- Access to all data within their department
- Can approve/reject attendance changes
- Can view all reports and statistics for their department
- Cannot modify enrollments or assignments

### Teacher
- Can start/end sessions for their assigned subjects
- Can mark/update attendance for their sessions
- Can view their own teaching assignments and schedules
- Can request attendance changes (requires HOD approval)

### Student
- Can view their own attendance records
- Can view their attendance reports and statistics
- Can view class schedules and session information
- Cannot modify any attendance data

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "details": {
    "field_name": ["Error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "An unexpected error occurred."
}
```

---

## Filtering and Pagination

Most list endpoints support:
- **Search**: `?search=query`
- **Ordering**: `?ordering=-created_at` (- for descending)
- **Pagination**: `?page=1&page_size=20`

Example:
```
GET /api/attendance/sessions/?search=Data&ordering=-start_time&page=1
```

---

## Notes

1. All datetime fields use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`
2. All endpoints require JWT authentication except auth endpoints
3. Department filtering is automatic based on user role
4. Attendance reports are automatically generated when sessions end
5. Face recognition confidence scores range from 0.0 to 1.0
6. Day codes for schedules: 0=Sunday, 1=Monday, ..., 5=Friday
