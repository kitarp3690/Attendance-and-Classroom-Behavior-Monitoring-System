# Khwopa Attendance System - Visual Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         KHWOPA ATTENDANCE SYSTEM                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER (React)                          │
├──────────────────────┬─────────────────┬──────────────────┬─────────────┤
│   Admin Dashboard    │  Teacher Module │   HOD Dashboard  │ Student View│
│  ├─ User Mgmt       │ ├─ Start Session │ ├─ Dept Stats    │├─ My Attend │
│  ├─ Dept Config     │ ├─ End Session   │ ├─ Sessions      │├─ By Subject│
│  ├─ Reports         │ ├─ Attendance Mgr│ ├─ Approval      │├─ Percentage│
│  └─ System Logs     │ ├─ Adjust Status │ ├─ Changes       │└─ Alerts    │
│                     │ ├─ Notes         │ ├─ Reports       │             │
│                     │ └─ Reports       │ └─ Audit Trail   │             │
└──────────────────────┴─────────────────┴──────────────────┴─────────────┘
                           │
                    API Service Layer (Axios)
                           │
┌──────────────────────────────────────────────────────────────────────────┐
│                       BACKEND LAYER (Django REST)                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  API Routes:                                                            │
│  ├─ /api/departments/         ────────┐                                │
│  ├─ /api/users/               ────────┤                                │
│  ├─ /api/classes/             ────────┤                                │
│  ├─ /api/subjects/            ────────┤                                │
│  ├─ /api/class-schedules/     ────────┤                                │
│  ├─ /api/teacher-assignments/ ────────┤                                │
│  ├─ /api/sessions/            ────────┼─► ViewSets & Serializers      │
│  ├─ /api/attendance/          ────────┤                                │
│  ├─ /api/attendance-changes/  ────────┤                                │
│  ├─ /api/attendance-reports/  ────────┤                                │
│  ├─ /api/notifications/       ────────┤                                │
│  └─ /api/reports/             ────────┘                                │
│                                                                          │
│  Business Logic:                                                        │
│  ├─ Session Management (Start/End)                                     │
│  ├─ Attendance Recording & Verification                                │
│  ├─ Attendance Change Approval                                         │
│  ├─ Department-based Filtering                                         │
│  └─ Report Generation                                                  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                           │
                    Django ORM / psycopg2
                           │
┌──────────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER (PostgreSQL)                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Core Tables:                                                           │
│  ┌─ Department                                                          │
│  ├─ CustomUser (Admin/HOD/Teacher/Student)                            │
│  ├─ Class (with Department + Semester)                                │
│  ├─ Subject (with Department)                                         │
│  ├─ ClassStudent (Enrollment)                                         │
│  ├─ TeacherAssignment (with cross-dept flag)                         │
│  └─ ClassSchedule (6-day, flexible times)                            │
│                                                                          │
│  Attendance Tables:                                                     │
│  ┌─ Session (Teacher initiated)                                       │
│  ├─ Attendance (Per-student per-session)                             │
│  ├─ AttendanceChange (Audit trail)                                   │
│  ├─ AttendanceReport (Cached stats)                                  │
│  ├─ FaceEmbedding (ML/AI data)                                       │
│  └─ Notification                                                      │
│                                                                          │
│  Performance: Indexed on frequently accessed fields                    │
│  Scalability: Partitioning by semester/year possible                 │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Session Creation & Attendance Recording Flow

```
Teacher Logs In
    │
    ▼
┌──────────────────────────┐
│  Select Subject & Class  │
│   for Today's Lecture    │
└──────────────┬───────────┘
               │
               ▼
         ┌──────────────────┐
         │ Click START      │
         │  SESSION Button  │
         └────────┬─────────┘
                  │
                  ▼
    ┌─────────────────────────────┐
    │  CREATE SESSION             │
    │  ├─ Teacher: logged-in user │
    │  ├─ Subject: selected       │
    │  ├─ Class: selected         │
    │  ├─ Start_time: NOW()       │
    │  ├─ Is_active: true         │
    │  └─ Department: auto-filled │
    └────────────┬────────────────┘
                 │
                 ▼
      ┌──────────────────────────┐
      │  CAMERA STARTS           │
      │  Capture & Detect Faces  │
      │  ├─ Get embeddings       │
      │  ├─ Match with DB        │
      │  ├─ Record status        │
      │  └─ Store confidence     │
      └────────────┬─────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   PRESENT            ABSENT/LATE
   └──────┬──────────────┬────────┘
          │              │
          ▼              ▼
    ┌──────────────┐ ┌──────────────┐
    │ CREATE       │ │ CREATE       │
    │ ATTENDANCE   │ │ ATTENDANCE   │
    │ (Present)    │ │ (Absent/Late)│
    │ confidence:  │ │ confidence:  │
    │ 0.95         │ │ 0.65         │
    │ is_verified: │ │ is_verified: │
    │ false        │ │ false (low)   │
    └──────────────┘ └──────────────┘
          │              │
          │    Teacher Reviews (Optional)
          │    ├─ Adjust status if needed
          │    ├─ Add notes
          │    └─ Verify records
          │              │
          └──────┬───────┘
                 │
                 ▼
         ┌──────────────────┐
         │  Click END       │
         │   SESSION        │
         └─────────┬────────┘
                   │
         ┌─────────▼─────────┐
         │ UPDATE SESSION    │
         │ ├─ End_time: NOW()│
         │ ├─ is_active: f   │
         │ └─ finalized: t   │
         └─────────┬─────────┘
                   │
         ┌─────────▼─────────────────┐
         │ UPDATE ATTENDANCE_REPORT  │
         │ ├─ total_classes_held +1  │
         │ ├─ present_count +X       │
         │ ├─ absent_count +Y        │
         │ └─ percentage recalc      │
         └─────────┬─────────────────┘
                   │
         ┌─────────▼──────────────┐
         │ SEND NOTIFICATIONS     │
         │ ├─ To Students (daily) │
         │ ├─ To Parents (if low) │
         │ └─ To HOD (if needed)  │
         └────────────────────────┘
```

### HOD Review & Approval Flow

```
HOD Logs In
    │
    ▼
┌──────────────────────────┐
│  Select Department       │
│  & Time Range            │
└──────────────┬───────────┘
               │
               ▼
      ┌────────────────────────┐
      │  VIEW SESSIONS         │
      │  ├─ All teacher sessions│
      │  ├─ Filter by class    │
      │  ├─ Filter by subject  │
      │  └─ Filter by date     │
      └─────────┬──────────────┘
                │
                ▼
      ┌─────────────────────────┐
      │  VIEW ATTENDANCE        │
      │  ├─ By Student          │
      │  ├─ By Subject          │
      │  ├─ By Date Range       │
      │  └─ Statistics          │
      └────────┬────────────────┘
               │
        ┌──────┴─────────┐
        ▼                ▼
   LOW CONFIDENCE    NORMAL RECORDS
   RECORDS           │
   ├─ List           │
   ├─ Review Details │
   │  │              │
   │  ├─ Student Name│
   │  ├─ Subject     │
   │  ├─ Confidence  │
   │  ├─ Status      │
   │  └─ Image       │
   │                 │
   └─ APPROVE/       REVIEW
      REJECT         CHANGES
   │                 │
   │                 ▼
   │         ┌──────────────────┐
   │         │ ATTENDANCE_CHANGE│
   │         │ ├─ Old status    │
   │         │ ├─ New status    │
   │         │ ├─ Reason        │
   │         │ ├─ Changed by    │
   │         │ └─ Timestamp     │
   │         └────────┬─────────┘
   │                  │
   ▼                  ▼
CREATE         ┌─────────────────┐
CHANGE LOG     │ APPROVE/REJECT  │
│              │ CHANGE          │
│              │ ├─ Approve      │
│              │ ├─ Add Notes    │
│              │ └─ Timestamp    │
│              └────────┬────────┘
│                       │
└───────┬───────────────┘
        │
        ▼
  UPDATE ATTENDANCE
  ├─ New status confirmed
  └─ Update report cache
```

### Student View Flow

```
Student Logs In
    │
    ▼
┌────────────────────────────────┐
│  ATTENDANCE DASHBOARD          │
│  ├─ Total Classes (This Sem)   │
│  ├─ Present Count              │
│  ├─ Absent Count               │
│  ├─ Late Count                 │
│  └─ Overall Percentage (%)     │
└─────────────┬──────────────────┘
              │
              ▼
        ┌──────────────────┐
        │ SUBJECT-WISE     │
        │ BREAKDOWN        │
        │ ├─ Subject List  │
        │ ├─ % per subject │
        │ └─ Status count  │
        └────────┬─────────┘
                 │
                 ▼
        ┌────────────────────────┐
        │ DETAILED RECORDS       │
        │ ├─ Date Filter         │
        │ ├─ Subject Filter      │
        │ └─ Records             │
        │   ├─ Date              │
        │   ├─ Subject           │
        │   ├─ Status            │
        │   │  (Present/Late)    │
        │   └─ Confidence (opt)  │
        └──────────────────────┘

        All data visible: OWN ONLY
        Cannot see: Other students' data
```

---

## Database Schema Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        DEPARTMENT                                    │
│  ┌─ id (PK)                                                         │
│  ├─ name (unique)                                                   │
│  ├─ code (unique)                                                   │
│  ├─ hod (FK to Teacher)                                            │
│  └─ contact_email                                                   │
└────────┬─────────────────────────────────────────────────────────────┘
         │
    ┌────┴────┬──────────────┐
    │         │              │
    ▼         ▼              ▼
 ┌──────┐ ┌──────────┐ ┌─────────────────┐
 │Users │ │  Class   │ │    Subject      │
 └──────┘ └──────────┘ └─────────────────┘
    │         │              │
    │         ├─ name        ├─ code
    │         ├─ section     ├─ name
    │         ├─ semester    └─ credits
    │         └─ dept_fk
    │
    ├─ CustomUser
    │  ├─ id (PK)
    │  ├─ role (admin/hod/teacher/student)
    │  ├─ department_fk
    │  ├─ username
    │  ├─ email
    │  ├─ first_name
    │  ├─ last_name
    │  └─ is_active
    │
    └─ Relationships:
       ├─ Teacher (1) ──► (Many) TeacherAssignment
       ├─ Teacher (1) ──► (Many) Session
       ├─ Student (1) ──► (Many) ClassStudent
       └─ Student (1) ──► (Many) Attendance


┌──────────────────────────────────────────────────────────────────────┐
│                    SCHEDULING LAYER                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ClassSchedule (Reference Schedule)                                 │
│  ├─ id (PK)                                                         │
│  ├─ class_fk                                                        │
│  ├─ subject_fk                                                      │
│  ├─ day_of_week (0-5: Sun-Fri)                                    │
│  ├─ scheduled_start_time (HH:MM)                                  │
│  └─ scheduled_end_time (HH:MM)                                    │
│     [Flexible - not fixed]                                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘


┌──────────────────────────────────────────────────────────────────────┐
│                    ATTENDANCE LAYER                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Session (Teacher-Controlled)                                       │
│  ├─ id (PK)                                                         │
│  ├─ teacher_fk                                                      │
│  ├─ subject_fk                                                      │
│  ├─ class_fk                                                        │
│  ├─ department_fk (for HOD reporting)                             │
│  ├─ start_time (DATETIME: when teacher starts)                   │
│  ├─ end_time (DATETIME: when teacher ends, nullable)             │
│  ├─ is_active (boolean)                                            │
│  ├─ attendance_finalized (boolean)                                 │
│  ├─ camera_feed_id (optional, for ML pipeline)                   │
│  └─ total_students (count at session start)                      │
│                                                                      │
│  1 Session ──────────► Many Attendances                            │
│                                                                      │
│  Attendance (Per-Student Per-Session)                               │
│  ├─ id (PK)                                                         │
│  ├─ student_fk                                                      │
│  ├─ session_fk (unique together with student)                    │
│  ├─ status (present/absent/late)                                  │
│  ├─ detected_time (when ML detected student)                     │
│  ├─ face_recognition_score (0-1)                                │
│  ├─ is_verified (boolean, manual verification)                   │
│  ├─ marked_at (DATETIME)                                           │
│  └─ notes (text)                                                    │
│                                                                      │
│  Attendance ──────────► Many AttendanceChanges (audit)            │
│                                                                      │
│  AttendanceChange (Audit Trail)                                    │
│  ├─ id (PK)                                                         │
│  ├─ attendance_fk                                                   │
│  ├─ changed_by_fk (teacher/HOD)                                  │
│  ├─ old_status                                                      │
│  ├─ new_status                                                      │
│  ├─ reason (enum: correction, excuse, etc.)                      │
│  ├─ notes (text)                                                    │
│  ├─ changed_at (DATETIME)                                          │
│  ├─ approved_by_fk (HOD) [nullable]                             │
│  └─ approved_at (DATETIME) [nullable]                            │
│                                                                      │
│  AttendanceReport (Cached Statistics)                              │
│  ├─ id (PK)                                                         │
│  ├─ student_fk                                                      │
│  ├─ subject_fk                                                      │
│  ├─ class_fk                                                        │
│  ├─ semester                                                        │
│  ├─ total_classes_held                                             │
│  ├─ present_count                                                   │
│  ├─ absent_count                                                    │
│  ├─ late_count                                                      │
│  ├─ percentage                                                      │
│  └─ generated_at (DATETIME)                                        │
│     [Unique together: student, subject, class, semester]           │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Access Control Hierarchy

```
┌────────────────────────────────────────────┐
│           SYSTEM ADMIN                     │
│                                            │
│  Full Access to Everything                │
│  ├─ User Management (all roles)          │
│  ├─ Department Configuration              │
│  ├─ Class & Subject Configuration         │
│  ├─ View All Data                         │
│  └─ System Settings                       │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│    HOD (Head of Department)                │
│                                            │
│  Department-Level Access                  │
│  ├─ View all classes in dept             │
│  ├─ View all teachers in dept            │
│  ├─ View all students in dept            │
│  ├─ View all sessions in dept            │
│  ├─ View all attendance in dept          │
│  ├─ Approve attendance changes           │
│  ├─ Generate dept reports                │
│  └─ Cannot modify student enrollment     │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│           TEACHER                          │
│                                            │
│  Session & Personal Access                │
│  ├─ Start/end own sessions               │
│  ├─ View own attendance records          │
│  ├─ Adjust own session attendance        │
│  ├─ View own subject reports             │
│  ├─ Cannot view other teachers' data    │
│  ├─ Cannot approve changes (HOD only)   │
│  └─ Teach across departments (if assigned)
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│           STUDENT                          │
│                                            │
│  Personal Read-Only Access                │
│  ├─ View own attendance records          │
│  ├─ View own subject-wise attendance     │
│  ├─ View own attendance percentage       │
│  ├─ Receive alerts if attendance low     │
│  └─ Cannot modify any data               │
└────────────────────────────────────────────┘
```

---

## Technology Stack

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND                                  │
│  React 19.2.0                                               │
│  ├─ Vite 7.2.2 (Build tool)                                │
│  ├─ Axios (HTTP Client with JWT)                           │
│  └─ Component-based Architecture                           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    BACKEND                                   │
│  Django 5.2.9                                               │
│  ├─ Django REST Framework 3.16.1 (API)                     │
│  ├─ Simple JWT 5.5.1 (Authentication)                      │
│  ├─ CORS Headers 4.9.0 (Cross-origin)                      │
│  └─ Class-based Views & ViewSets                           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    DATABASE                                  │
│  PostgreSQL 18 (Port 5433)                                  │
│  ├─ 11 Models (all normalized)                             │
│  ├─ Indexed for performance                                │
│  └─ Ready for scaling                                      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    ML/AI INTEGRATION                         │
│  Face Recognition Pipeline (Ready)                          │
│  ├─ FaceNet embeddings                                      │
│  ├─ MTCNN for face detection                               │
│  ├─ Confidence scoring                                     │
│  └─ Stored in FaceEmbedding table                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  CLIENT BROWSER                             │
│              (React Application)                            │
│           http://localhost:5173/                            │
└──────────────┬────────────────────────────────────────────┘
               │
        HTTPS / HTTP
               │
┌──────────────▼────────────────────────────────────────────┐
│                   WEB SERVER                               │
│            (Django Development Server)                     │
│             http://localhost:8000/                         │
│  ├─ Nginx (or similar for production)                      │
│  ├─ Static file serving                                    │
│  └─ API routing                                            │
└──────────────┬────────────────────────────────────────────┘
               │
        Django ORM
               │
┌──────────────▼────────────────────────────────────────────┐
│                  APPLICATION SERVER                        │
│                  (Django + DRF)                            │
│  ├─ Serializers                                            │
│  ├─ ViewSets                                               │
│  ├─ Permissions & Authentication                          │
│  ├─ Business Logic                                         │
│  └─ API Endpoints                                          │
└──────────────┬────────────────────────────────────────────┘
               │
        psycopg2 adapter
               │
┌──────────────▼────────────────────────────────────────────┐
│                   DATABASE SERVER                          │
│              PostgreSQL 18 (Port 5433)                     │
│  ├─ attendance_db database                                 │
│  ├─ attendance_user account                                │
│  └─ 11 normalized tables                                   │
└────────────────────────────────────────────────────────────┘
```

---

**Architecture Document Complete**  
**Status**: Ready for Implementation  
**Last Updated**: December 8, 2025
