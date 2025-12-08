# Khwopa Engineering College - Camera-Based Attendance System
## System Design & Implementation Plan

**Date**: December 8, 2025  
**Status**: Design Review & Database Schema Update

---

## 📋 Executive Summary

This document outlines the complete system design for a camera-based automated attendance system for Khwopa Engineering College. The system supports:
- ✅ Session-based attendance (teacher-controlled start/end)
- ✅ Multi-department support with role-based access
- ✅ Flexible scheduling (6-day weeks, variable class times)
- ✅ HOD oversight capabilities
- ✅ Student attendance transparency
- ✅ Face recognition integration (AI/ML ready)

---

## 🏗️ Database Schema Design

### 1. User Roles & Hierarchy

```
CustomUser (Extended User Model)
├── Admin (System Administrator)
├── HOD (Head of Department) - NEW ROLE
├── Teacher (Faculty Member)
└── Student (Enrolled Student)
```

### 2. Core Models & Relationships

```
Organization Structure
├── Department (NEW)
│   ├── name
│   ├── hod (FK: Teacher)
│   └── created_at
│
├── Class/Section
│   ├── name
│   ├── section
│   ├── department (FK: Department)
│   ├── academic_year
│   ├── semester
│   └── subjects (M2M: Subject)
│
└── ClassStudent (Enrollment)
    ├── student (FK: Student)
    ├── class_assigned (FK: Class)
    ├── enrollment_date
    └── enrollment_status

Subject Management
├── Subject/Course
│   ├── name
│   ├── code
│   ├── department (FK: Department)
│   ├── credits
│   └── description
│
├── TeacherAssignment (NEW: Session-aware)
│   ├── teacher (FK: Teacher)
│   ├── subject (FK: Subject)
│   ├── class_assigned (FK: Class)
│   ├── department (FK: Department) - For cross-dept teaching
│   ├── semester
│   └── assignment_status
│
└── ClassSchedule (NEW: Define available class times)
    ├── class_assigned (FK: Class)
    ├── subject (FK: Subject)
    ├── day_of_week (0=Sun, 1=Mon, ..., 5=Fri)
    ├── scheduled_start_time
    ├── scheduled_end_time
    ├── is_active
    └── notes

Attendance System
├── Session (Teacher-controlled)
│   ├── teacher (FK: Teacher)
│   ├── subject (FK: Subject)
│   ├── class_assigned (FK: Class)
│   ├── department (FK: Department)
│   ├── start_time (DateTime - when teacher starts)
│   ├── end_time (DateTime - when teacher ends)
│   ├── is_active (Boolean)
│   ├── camera_feed_id (For video tracking) - NEW
│   ├── total_students (Count at session start)
│   ├── attendance_finalized (Boolean)
│   └── created_at
│
├── Attendance (Per-student per-session)
│   ├── student (FK: Student)
│   ├── session (FK: Session)
│   ├── status (present/absent/late)
│   ├── marked_at (DateTime)
│   ├── marked_by (FK: User - teacher/system)
│   ├── face_recognition_score (0-1)
│   ├── detected_time (When camera detected student)
│   ├── notes
│   └── is_verified (Manual verification flag)
│
├── AttendanceChange (NEW: Track modifications)
│   ├── attendance (FK: Attendance)
│   ├── changed_by (FK: Teacher/Admin)
│   ├── old_status
│   ├── new_status
│   ├── reason
│   └── changed_at
│
└── FaceEmbedding (AI/ML)
    ├── student (FK: Student)
    ├── embedding_vector (JSON - 512D)
    ├── image (Profile image)
    ├── captured_at
    └── updated_at

Reporting & Analytics
├── AttendanceReport (NEW: For caching)
│   ├── student (FK: Student)
│   ├── subject (FK: Subject)
│   ├── class_assigned (FK: Class)
│   ├── semester
│   ├── total_classes_held
│   ├── present_count
│   ├── absent_count
│   ├── late_count
│   ├── percentage
│   └── generated_at
│
└── Notification
    ├── user (FK: User)
    ├── category
    ├── title
    ├── message
    ├── is_read
    ├── read_at
    ├── related_attendance (FK: Attendance)
    └── created_at
```

---

## 🔄 Required Schema Changes

### New Models to Create

```python
# 1. Department Model
class Department(models.Model):
    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=50, unique=True)
    hod = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_department',
        limit_choices_to={'role': 'teacher'}  # HOD is a teacher
    )
    description = models.TextField(blank=True)
    contact_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

# 2. ClassSchedule Model
class ClassSchedule(models.Model):
    DAY_CHOICES = [
        (0, 'Sunday'),
        (1, 'Monday'),
        (2, 'Tuesday'),
        (3, 'Wednesday'),
        (4, 'Thursday'),
        (5, 'Friday'),
    ]
    
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='schedules')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)  # 0-5 for Sun-Fri
    scheduled_start_time = models.TimeField()  # HH:MM format
    scheduled_end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('class_assigned', 'subject', 'day_of_week')
        indexes = [
            models.Index(fields=['day_of_week']),
            models.Index(fields=['class_assigned']),
        ]

    def __str__(self):
        return f"{self.get_day_of_week_display()} - {self.subject.code} ({self.scheduled_start_time})"

# 3. AttendanceChange Model
class AttendanceChange(models.Model):
    REASON_CHOICES = [
        ('manual_correction', 'Manual Correction'),
        ('late_entry', 'Late Entry'),
        ('medical_excuse', 'Medical Excuse'),
        ('teacher_request', 'Teacher Request'),
        ('hod_approval', 'HOD Approval'),
        ('other', 'Other'),
    ]
    
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE, related_name='changes')
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='attendance_changes'
    )
    old_status = models.CharField(max_length=20, choices=Attendance.STATUS_CHOICES)
    new_status = models.CharField(max_length=20, choices=Attendance.STATUS_CHOICES)
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    notes = models.TextField(blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['changed_by']),
            models.Index(fields=['changed_at']),
        ]

    def __str__(self):
        return f"{self.attendance.student.username} - {self.old_status} → {self.new_status}"

# 4. AttendanceReport Model (for performance)
class AttendanceReport(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendance_reports',
        limit_choices_to={'role': 'student'}
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE)
    semester = models.CharField(max_length=20)
    total_classes_held = models.IntegerField(default=0)
    present_count = models.IntegerField(default=0)
    absent_count = models.IntegerField(default=0)
    late_count = models.IntegerField(default=0)
    percentage = models.FloatField(default=0.0)
    generated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'subject', 'class_assigned', 'semester')
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['subject']),
        ]

    def __str__(self):
        return f"{self.student.username} - {self.subject.code} ({self.percentage}%)"
```

### Modifications to Existing Models

```python
# Update CustomUser Model
class CustomUser(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('hod', 'Head of Department'),  # NEW ROLE
        ('teacher', 'Teacher'),
        ('student', 'Student')
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    department = models.ForeignKey(
        'Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'  # NEW: Link users to departments
    )
    phone = models.CharField(max_length=15, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True)
    is_active_staff = models.BooleanField(default=True)  # For teacher/hod status
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Update Class Model
class Class(models.Model):
    name = models.CharField(max_length=100)
    section = models.CharField(max_length=50)
    department = models.ForeignKey(
        'Department',
        on_delete=models.CASCADE,
        related_name='classes',
        null=True,
        blank=True  # NEW: Link to department
    )
    academic_year = models.CharField(max_length=20, default='2024-2025')
    semester = models.CharField(
        max_length=20,
        choices=[('1', 'First'), ('2', 'Second'), ('3', 'Third'), ('4', 'Fourth'), 
                 ('5', 'Fifth'), ('6', 'Sixth'), ('7', 'Seventh'), ('8', 'Eighth')],
        default='1'  # NEW: Add semester
    )
    subjects = models.ManyToManyField(Subject, related_name='classes', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Update Session Model
class Session(models.Model):
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='sessions')
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='sessions')
    department = models.ForeignKey(
        'Department',
        on_delete=models.CASCADE,
        related_name='sessions',
        null=True,
        blank=True  # NEW: For reporting by HOD
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    attendance_finalized = models.BooleanField(default=False)  # NEW
    total_students = models.IntegerField(default=0)
    camera_feed_id = models.CharField(max_length=100, blank=True)  # NEW: For ML pipeline
    created_at = models.DateTimeField(auto_now_add=True)

# Update Attendance Model
class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]
    
    student = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attendances')
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='attendances')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='absent')
    marked_at = models.DateTimeField(auto_now_add=True)
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='marked_attendances'
    )
    detected_time = models.DateTimeField(null=True, blank=True)  # NEW: When ML detected student
    face_recognition_score = models.FloatField(null=True, blank=True)  # NEW
    confidence_score = models.FloatField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)  # NEW: Manual verification flag
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Update TeacherAssignment Model
class TeacherAssignment(models.Model):
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subject_assignments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_assignments')
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='teacher_assignments')
    department = models.ForeignKey(
        'Department',
        on_delete=models.CASCADE,
        null=True,
        blank=True  # NEW: For cross-department teaching
    )
    semester = models.CharField(max_length=20, default='Spring 2024')
    is_cross_department = models.BooleanField(default=False)  # NEW: Flag for cross-dept
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## 👥 Access Control & Permissions

### Admin
- ✅ Full system access
- ✅ Create/manage all users, classes, subjects
- ✅ View all attendance records
- ✅ Generate system reports
- ✅ Configure system settings

### HOD (Head of Department)
- ✅ View all attendance for their department
- ✅ View all students, teachers, classes in department
- ✅ View attendance statistics and reports
- ✅ Approve/modify attendance records (with audit trail)
- ✅ Generate departmental reports
- ✅ Cannot modify student enrollment

### Teacher
- ✅ Start/end class sessions
- ✅ View attendance for their subjects
- ✅ View attendance history for their classes
- ✅ Manually adjust attendance (with reason)
- ✅ View student face recognition confidence
- ✅ Export attendance reports for their classes
- ✅ Can teach across departments (if assigned)

### Student
- ✅ View own attendance records only
- ✅ View attendance status per subject
- ✅ View attendance percentage
- ✅ View daily attendance history
- ❌ Cannot modify any records
- ❌ Cannot view other students' data

---

## 🎨 Frontend Components Required

### Teacher Components (Session Management)
```
Teacher Dashboard
├── Active Sessions Card
│   ├── Current Session Display
│   ├── Start Session Button
│   ├── End Session Button
│   └── Attendees Live Count
│
├── Session History
│   ├── Sessions List
│   ├── Filter by Subject/Date
│   └── Session Details View
│
├── Attendance Management
│   ├── Real-time Attendance Viewer
│   ├── Manual Status Adjustment
│   ├── Notes/Reason Entry
│   └── Finalize Session Button
│
└── Reports
    ├── Subject-wise Report
    ├── Class-wise Report
    └── Export to CSV
```

### HOD Components (Department Overview)
```
HOD Dashboard
├── Department Statistics
│   ├── Total Students
│   ├── Attendance Percentage
│   ├── Present/Absent Breakdown
│   └── Semester-wise Stats
│
├── Department Management
│   ├── Classes List (with department filter)
│   ├── Teachers List
│   ├── Subjects List
│   └── Class Schedules View
│
├── Attendance Oversight
│   ├── All Sessions View
│   ├── Attendance by Class/Subject
│   ├── Attendance by Student
│   ├── Approve Changes
│   └── View Audit Trail
│
├── Reports
│   ├── Departmental Report
│   ├── Teacher Performance Report
│   ├── Student Attendance Report
│   └── Attendance Trend Analysis
│
└── Class Schedules
    ├── View Schedule Calendar
    ├── Create/Edit Schedule
    └── Manage Schedule Exceptions
```

### Student Components (Personal Attendance)
```
Student Dashboard
├── Overall Attendance Summary
│   ├── Total Classes
│   ├── Present/Absent/Late
│   └── Attendance Percentage
│
├── Subject-wise Attendance
│   ├── Attendance per Subject
│   ├── Attendance Percentage
│   ├── Latest Status
│   └── Trend Graph
│
├── Detailed Attendance Records
│   ├── Date-wise Attendance
│   ├── Subject Filter
│   ├── Status Display (Present/Absent/Late)
│   └── Confidence Score (if available)
│
└── Notifications
    ├── Low Attendance Alerts
    ├── Attendance Updates
    └── Important Announcements
```

---

## 🔄 Workflow Processes

### Session Workflow
```
1. Teacher Login
   ↓
2. Select Subject & Class
   ↓
3. Click "Start Session"
   - Session created in DB
   - Camera starts capturing
   - System logs start_time
   ↓
4. System Auto-Detects Attendance
   - ML model identifies faces
   - Records as Present/Absent/Late
   - Stores confidence score
   ↓
5. Teacher Reviews Attendance (Optional)
   - Can manually adjust status
   - Add notes/reasons
   - Mark as verified
   ↓
6. Click "End Session"
   - Session marked inactive
   - Attendance finalized
   - Notifications sent
   - Reports generated
```

### HOD Review Workflow
```
1. HOD Login
   ↓
2. Select Department/Class/Subject
   ↓
3. View Sessions & Attendance
   ↓
4. Review Changes (if any)
   ↓
5. Approve/Reject with reason
   ↓
6. Generate Reports
```

### Student View Workflow
```
1. Student Login
   ↓
2. Dashboard shows overall stats
   ↓
3. Filter by Subject
   ↓
4. View Detailed Records
   ↓
5. Track Attendance Percentage
```

---

## 🗄️ Database Normalization Analysis

### Current State
- ✅ First Normal Form (1NF) - No repeating groups
- ✅ Second Normal Form (2NF) - No partial dependencies
- ⚠️ Third Normal Form (3NF) - Minor improvements needed

### Improvements Made
```
Before: TeacherAssignment → Class/Subject
        No explicit department reference
        
After:  TeacherAssignment → Department
        TeacherAssignment → Class → Department
        Allows cross-department teaching tracking
        
Benefit: Better normalization
        Supports cross-department teaching rule
        Clearer audit trail
```

### Indexing Strategy
```
High-priority indexes:
├── Session: (teacher, start_time, is_active)
├── Attendance: (student, session, status)
├── ClassSchedule: (class, day_of_week)
├── AttendanceChange: (changed_by, changed_at)
└── Class: (department, academic_year)
```

---

## 📊 API Endpoints Required

### Teacher Endpoints
```
POST   /api/sessions/                    - Create session
PATCH  /api/sessions/{id}/end/          - End session
GET    /api/sessions/active/            - Get active sessions
GET    /api/sessions/{id}/               - Get session details
GET    /api/sessions/{id}/attendances/  - Get attendance for session
PATCH  /api/attendance/{id}/            - Modify attendance status
POST   /api/attendance/{id}/verify/     - Verify attendance
GET    /api/reports/subject-wise/       - Subject-wise report
```

### HOD Endpoints
```
GET    /api/departments/{id}/sessions/   - All sessions in dept
GET    /api/departments/{id}/students/   - All students in dept
GET    /api/departments/{id}/teachers/   - All teachers in dept
GET    /api/departments/{id}/attendance/ - All attendance in dept
PATCH  /api/attendance-changes/{id}/approve/ - Approve changes
GET    /api/attendance-changes/          - View audit trail
GET    /api/class-schedules/             - View schedules
POST   /api/class-schedules/             - Create schedule
GET    /api/reports/departmental/       - Department report
```

### Student Endpoints
```
GET    /api/students/me/attendance/      - My attendance
GET    /api/students/me/attendance/{subject}/ - Subject-wise
GET    /api/students/me/statistics/      - My statistics
GET    /api/students/me/notifications/   - My notifications
```

---

## 🔐 Security Considerations

1. **Session Verification**
   - Only assigned teacher can start/end session
   - Session must have valid end_time before finalizing
   - Cannot modify finalized sessions without audit trail

2. **Face Recognition**
   - Store confidence scores for verification
   - Manual verification flag for low-confidence detections
   - HOD can review before finalizing

3. **Audit Trail**
   - All attendance changes logged in AttendanceChange model
   - Who, when, what, why recorded
   - HOD approval required for certain changes

4. **Department Isolation**
   - HOD can only see department data
   - Cross-department teaching tracked separately
   - Reports filtered by department

5. **Data Privacy**
   - Students can only see own attendance
   - Face embeddings stored securely
   - Images deleted after processing (optional)

---

## 🎯 Implementation Roadmap

### Phase 1: Database Updates (Current)
- [ ] Create Department model
- [ ] Create ClassSchedule model
- [ ] Create AttendanceChange model
- [ ] Create AttendanceReport model
- [ ] Update CustomUser model (add HOD role, department)
- [ ] Update Class model (add department, semester)
- [ ] Update Session model (add department, finalization)
- [ ] Update Attendance model (add verification flags)
- [ ] Update TeacherAssignment model (cross-dept support)

### Phase 2: Backend API (Next)
- [ ] Update serializers for new models
- [ ] Create new ViewSets for Department, Schedule, etc.
- [ ] Implement session start/end logic
- [ ] Add attendance finalization logic
- [ ] Create approval workflow for attendance changes
- [ ] Add HOD-specific endpoints
- [ ] Implement comprehensive filtering & reporting

### Phase 3: Frontend Components (Next)
- [ ] Update Teacher Dashboard
- [ ] Create HOD Dashboard
- [ ] Update Student Dashboard
- [ ] Session management UI
- [ ] Attendance verification UI
- [ ] Department schedule management

### Phase 4: Integration & Testing (Final)
- [ ] Integrate ML/face recognition pipeline
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] User acceptance testing

---

## 📈 Scalability Considerations

1. **Database**
   - Partitioning attendance records by semester/year
   - Archive old records after academic year
   - Regular backups of face embeddings

2. **API Caching**
   - Cache HOD reports (refreshed every 6 hours)
   - Cache class schedules (refreshed daily)
   - Cache attendance statistics

3. **ML Pipeline**
   - Process face recognition asynchronously
   - Queue system for batch processing
   - Cache embeddings for faster matching

4. **Session Management**
   - Auto-finalize sessions after 24 hours
   - Prevent stale active sessions
   - Automatic cleanup of old data

---

## ✅ Compliance with Scenario Requirements

| Requirement | Implementation |
|-------------|-----------------|
| 6-day week (Sun-Fri) | ClassSchedule.day_of_week (0-5) |
| Variable class times | ClassSchedule with flexible start/end times |
| Teacher controls session | Session model with teacher FK |
| Camera-based attendance | Session.is_active, FaceEmbedding integration |
| Cross-department teaching | TeacherAssignment.is_cross_department flag |
| HOD oversight | Department model + HOD role access control |
| Student transparency | Student endpoints for own attendance only |
| Audit trail | AttendanceChange model for all modifications |
| Late detection | Attendance.detected_time vs Session.start_time |
| Flexible scheduling | No fixed class times, teacher-initiated |

---

## 📝 Next Steps

1. **Backup Current Database**
   ```bash
   pg_dump -U attendance_user -h localhost -p 5433 -d attendance_db > backup_before_schema_update.sql
   ```

2. **Create New Models** (models.py updates)

3. **Create Migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Update Serializers & ViewSets**

5. **Create New API Endpoints**

6. **Update Frontend Components**

---

**Document Status**: READY FOR IMPLEMENTATION  
**Last Updated**: December 8, 2025  
**Next Review**: After Phase 1 completion
