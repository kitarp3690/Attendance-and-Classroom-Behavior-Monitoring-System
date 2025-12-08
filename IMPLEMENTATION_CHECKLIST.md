# Khwopa Attendance System - Implementation Checklist

## 📋 Phase 1: Backend Schema & Models (Ready to Implement)

### Database Changes
- [ ] Update `users/models.py` with HOD role and department field
- [ ] Replace `attendance/models.py` with new schema (all 11 models)
- [ ] Create migration: `python manage.py makemigrations`
- [ ] Apply migration: `python manage.py migrate`
- [ ] Update `attendance/admin.py` with new model admins
- [ ] Update `users/admin.py` with enhanced user admin

### Data Considerations
- [ ] Backup database before migration
- [ ] Create migration script for existing users
- [ ] Assign departments to existing teachers
- [ ] Create HOD assignments

---

## 🎯 Key Features by Role

### Admin Dashboard
```
✅ User Management (all roles)
✅ Department Management
✅ Subject Management
✅ Class Configuration
✅ System Configuration
✅ Report Generation
✅ System Audit Log
```

### HOD Dashboard
```
✅ Department Overview
  - Total students
  - Attendance statistics
  - Semester breakdown
  
✅ Class Management
  - View all classes in department
  - View class schedules
  - Manage class schedules
  
✅ Teacher Management
  - List all teachers in department
  - View assignments
  - Monitor performance
  
✅ Attendance Oversight
  - View all sessions in department
  - View attendance by student
  - View attendance by subject
  - Approve attendance changes
  - View audit trail of changes
  
✅ Reports
  - Department attendance summary
  - Subject-wise report
  - Student-wise report
  - Teacher performance report
  - Trend analysis
```

### Teacher Dashboard
```
✅ Session Management
  - Start/end class session
  - View active sessions
  - View session history
  - Finalize attendance
  
✅ Attendance Management
  - Real-time attendance viewer
  - Manual status adjustment
  - Add notes/reasons
  - Verify face recognition results
  
✅ Reports
  - Subject-wise attendance
  - Class-wise attendance
  - Daily attendance
  - Export to CSV/PDF
```

### Student Dashboard
```
✅ Personal Attendance
  - Overall attendance summary
  - Subject-wise attendance
  - Daily attendance records
  - Attendance percentage
  - Trend graph
  
✅ Status Tracking
  - Present/Absent/Late count
  - Attendance by date
  - Attendance by subject
  
✅ Notifications
  - Low attendance alerts
  - Attendance updates
  - Important announcements
```

---

## 📊 Database Relationships Summary

```
Department ◄──────────► HOD (Teacher)
    ▲
    │
    ├──► Teachers (CustomUser)
    ├──► Classes
    │     ├──► Subjects
    │     ├──► ClassStudents (Student enrollment)
    │     └──► ClassSchedules
    │
    └──► TeacherAssignments
         ├──► Teacher
         ├──► Subject
         └──► Class
         
Session (Teacher initiated)
    ├──► Teacher
    ├──► Subject
    ├──► Class
    ├──► Department (for HOD reporting)
    └──► Attendances (one per student)
         ├──► Student
         ├──► Face Recognition Data
         ├──► Attendance Changes (audit)
         └──► Verified by Teacher/HOD

ClassSchedule (Reference for actual classes)
    ├──► Class
    ├──► Subject
    ├──► Day of Week (0-5)
    └──► Time (flexible)
```

---

## 🔄 Attendance Flow

### Teacher Perspective
```
1. Teacher Login
   ↓
2. Select Subject & Class
   ↓
3. Click "Start Session"
   - Session created with current timestamp
   - Camera starts capturing
   - System ready for face recognition
   ↓
4. Students Arrive
   - Camera detects faces
   - ML model identifies students
   - Status recorded: Present/Absent/Late
   ↓
5. Teacher Reviews (Optional)
   - Check auto-detected attendance
   - Manually adjust if needed
   - Add notes/reasons
   ↓
6. Click "End Session"
   - Finalize attendance
   - Send notifications
   - Trigger HOD alerts if needed
```

### HOD Perspective
```
1. HOD Login
   ↓
2. View Department Sessions
   - Filter by class/subject/date
   - See all teacher sessions
   ↓
3. View Attendance Records
   - By student
   - By subject
   - By date range
   ↓
4. Review Changes
   - See audit trail
   - Approve/reject modifications
   - Add approval notes
   ↓
5. Generate Reports
   - Department summary
   - Subject-wise breakdown
   - Student-wise breakdown
```

### Student Perspective
```
1. Student Login
   ↓
2. View Attendance Summary
   - Overall stats
   - Attendance %
   - Status breakdown
   ↓
3. View By Subject
   - Attendance per subject
   - Status per subject
   - % per subject
   ↓
4. View Daily Records
   - Date-wise view
   - Subject-wise filter
   - Status display
```

---

## 🎨 Frontend Components Structure

### Teacher Components (NEW/UPDATED)
```
TeacherDashboard/
├── SessionManager/
│   ├── StartSessionButton
│   ├── ActiveSessionCard
│   │   ├── Timer
│   │   ├── AttendeeCount
│   │   ├── EndSessionButton
│   │   └── FinalizeButton
│   └── SessionHistory
│       ├── SessionsList
│       └── SessionDetails
│
├── AttendanceManager/
│   ├── RealTimeAttendanceViewer
│   │   ├── StudentList
│   │   ├── StatusDisplay
│   │   └── ConfidenceScoreIndicator
│   ├── ManualAdjustment
│   │   ├── StudentSelector
│   │   ├── StatusDropdown
│   │   ├── ReasonSelector
│   │   └── NotesField
│   └── VerificationPanel
│       ├── LowConfidenceList
│       └── ApproveButton
│
└── Reports/
    ├── SubjectWiseReport
    ├── ClassWiseReport
    └── ExportButton
```

### HOD Components (NEW)
```
HODDashboard/
├── DepartmentOverview/
│   ├── StatisticsCards
│   │   ├── TotalStudents
│   │   ├── AttendancePercentage
│   │   └── SemesterBreakdown
│   └── TrendChart
│
├── ClassManagement/
│   ├── ClassesList
│   ├── ScheduleViewer
│   └── ScheduleEditor
│
├── AttendanceOversight/
│   ├── SessionsList
│   │   ├── Filters (Class/Subject/Date)
│   │   └── SessionDetails
│   ├── AttendanceByStudent
│   │   ├── StudentSelector
│   │   ├── SubjectFilter
│   │   └── Records
│   ├── AttendanceBySubject
│   └── ChangeApproval
│       ├── PendingChanges
│       ├── ReviewDetails
│       └── ApproveRejectButton
│
├── AuditTrail/
│   ├── ChangeLog
│   ├── Filters
│   └── Details
│
└── Reports/
    ├── DepartmentalReport
    ├── SubjectWiseReport
    ├── StudentWiseReport
    └── TrendAnalysis
```

### Student Components (UPDATED)
```
StudentDashboard/
├── AttendanceSummary/
│   ├── OverallStats
│   │   ├── TotalClasses
│   │   ├── PresentCount
│   │   ├── AbsentCount
│   │   └── LateCount
│   ├── AttendancePercentage
│   └── TrendGraph
│
├── SubjectWiseView/
│   ├── SubjectList
│   ├── SubjectDetails
│   │   ├── AttendancePercentage
│   │   ├── StatusBreakdown
│   │   └── Records
│   └── SubjectFilter
│
├── DetailedRecords/
│   ├── DateFilter
│   ├── SubjectFilter
│   └── RecordsList
│       ├── Date
│       ├── Subject
│       ├── Status
│       └── Confidence (if available)
│
└── Notifications/
    ├── LowAttendanceAlert
    ├── AttendanceUpdate
    └── Important Announcements
```

---

## 🔐 Access Control Matrix

| Feature | Admin | HOD | Teacher | Student |
|---------|-------|-----|---------|---------|
| **User Management** | ✅ Full | ❌ | ❌ | ❌ |
| **Create Department** | ✅ | ❌ | ❌ | ❌ |
| **Assign HOD** | ✅ | ❌ | ❌ | ❌ |
| **View Dept Data** | ✅ | ✅ Own | ❌ | ❌ |
| **Start Session** | ❌ | ❌ | ✅ Own | ❌ |
| **End Session** | ❌ | ❌ | ✅ Own | ❌ |
| **View Attendance** | ✅ All | ✅ Dept | ✅ Own | ✅ Own |
| **Modify Attendance** | ✅ | ✅ Approve | ✅ Own | ❌ |
| **Approve Changes** | ✅ | ✅ | ❌ | ❌ |
| **View Reports** | ✅ All | ✅ Dept | ✅ Own | ✅ Own |
| **System Config** | ✅ | ❌ | ❌ | ❌ |

---

## 📈 API Endpoints Overview

### Department Endpoints
```
GET    /api/departments/              - List all departments
POST   /api/departments/              - Create department
GET    /api/departments/{id}/         - Get department details
PATCH  /api/departments/{id}/         - Update department
DELETE /api/departments/{id}/         - Delete department
```

### Class Schedule Endpoints
```
GET    /api/class-schedules/          - List schedules
POST   /api/class-schedules/          - Create schedule
GET    /api/class-schedules/{id}/     - Get schedule
PATCH  /api/class-schedules/{id}/     - Update schedule
DELETE /api/class-schedules/{id}/     - Delete schedule
GET    /api/class-schedules/?day=0    - Get schedules for day
```

### Session Endpoints
```
POST   /api/sessions/                 - Start session
GET    /api/sessions/                 - List sessions
GET    /api/sessions/{id}/            - Get session details
PATCH  /api/sessions/{id}/end/        - End session
PATCH  /api/sessions/{id}/finalize/   - Finalize attendance
GET    /api/sessions/active/          - Get active sessions
GET    /api/sessions/{id}/attendances/ - Get attendance records
```

### Attendance Endpoints
```
GET    /api/attendance/               - List attendance
POST   /api/attendance/               - Create record (auto)
PATCH  /api/attendance/{id}/          - Update status
POST   /api/attendance/{id}/verify/   - Verify record
GET    /api/attendance/{id}/changes/  - Get change history
```

### Attendance Change (Audit) Endpoints
```
GET    /api/attendance-changes/       - List all changes
GET    /api/attendance-changes/?approved=false - Pending approval
PATCH  /api/attendance-changes/{id}/approve/ - Approve change
PATCH  /api/attendance-changes/{id}/reject/  - Reject change
```

### Report Endpoints
```
GET    /api/reports/attendance/summary/     - Attendance summary
GET    /api/reports/attendance/subject/     - Subject-wise
GET    /api/reports/attendance/student/     - Student-wise
GET    /api/reports/department/             - Department report
GET    /api/reports/teacher-performance/    - Teacher report
GET    /api/reports/export/                 - Export to CSV/PDF
```

---

## 🚀 Implementation Timeline

### Week 1: Backend Foundation
- [ ] Update database models
- [ ] Create and run migrations
- [ ] Update admin interface
- [ ] Create serializers for new models
- [ ] Create basic ViewSets

### Week 2: Teacher Backend
- [ ] Session management API
- [ ] Attendance recording API
- [ ] Attendance modification API
- [ ] Audit trail implementation
- [ ] Teacher report endpoints

### Week 3: HOD Backend
- [ ] Department filters
- [ ] HOD-specific endpoints
- [ ] Approval workflow
- [ ] Department reports
- [ ] Access control

### Week 4: Frontend - Teacher & HOD
- [ ] Teacher dashboard redesign
- [ ] Session manager component
- [ ] Attendance viewer component
- [ ] HOD dashboard creation
- [ ] Reports interface

### Week 5: Frontend - Student & Testing
- [ ] Update student dashboard
- [ ] Notification system
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit

---

## ✅ Success Criteria

- [ ] All models migrated successfully
- [ ] Teacher can start/end sessions
- [ ] Attendance auto-records from camera
- [ ] HOD can view department data
- [ ] Students see only own data
- [ ] Audit trail for all changes
- [ ] Reports generate correctly
- [ ] Access control enforced
- [ ] Performance acceptable
- [ ] No security vulnerabilities

---

## 📞 Quick Reference

**Database**: PostgreSQL on port 5433  
**User**: attendance_user  
**Database**: attendance_db  

**Backend**: http://localhost:8000/  
**Frontend**: http://localhost:5173/  

**Admin User**: admin / admin123456  

---

**Status**: READY FOR PHASE 1 IMPLEMENTATION  
**Last Updated**: December 8, 2025
