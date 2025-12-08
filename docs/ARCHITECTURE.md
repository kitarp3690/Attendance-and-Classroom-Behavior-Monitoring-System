# System Architecture

Complete system architecture including database design, API structure, and component relationships.

## 📐 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                       │
│  Login → Teacher/HOD/Student/Admin Dashboards → API Calls        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                BACKEND (Django REST Framework)                    │
│  Authentication → Views/Serializers → Database Operations        │
│  - JWT Token-based auth                                          │
│  - Role-based access control (RBAC)                              │
│  - 70+ API endpoints                                             │
└────────────────────────────┬────────────────────────────────────┘
                             │ SQL
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│             DATABASE (PostgreSQL)                                 │
│  13 Core Tables + Relationships                                  │
│  - Users (Auth), Departments, Classes                            │
│  - Attendance, Sessions, Embeddings                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Core Tables

#### 1. **CustomUser** (Authentication)
```sql
- id: UUID (Primary Key)
- username: CharField (Unique)
- email: EmailField (Unique)
- first_name, last_name: CharField
- password: PasswordField (Hashed)
- role: CharField (CHOICES: admin, hod, teacher, student)
- department: ForeignKey → Department
- is_active, is_staff: BooleanField
- created_at, updated_at: DateTimeField
```

#### 2. **Department**
```sql
- id: AutoField (Primary Key)
- name: CharField (Unique)
- code: CharField
- head_of_department: ForeignKey → CustomUser (nullable)
- description: TextField
- created_at, updated_at: DateTimeField
```

#### 3. **Subject**
```sql
- id: AutoField (Primary Key)
- name: CharField
- code: CharField (Unique)
- credits: IntegerField
- department: ForeignKey → Department
- description: TextField
- created_at, updated_at: DateTimeField
```

#### 4. **Class**
```sql
- id: AutoField (Primary Key)
- name: CharField (e.g., "BIT-1A")
- department: ForeignKey → Department
- semester: IntegerField (1-8)
- created_at, updated_at: DateTimeField
```

#### 5. **ClassStudent**
```sql
- id: AutoField (Primary Key)
- student: ForeignKey → CustomUser
- class: ForeignKey → Class
- roll_number: CharField
- enrolled_date: DateField
```

#### 6. **TeacherAssignment**
```sql
- id: AutoField (Primary Key)
- teacher: ForeignKey → CustomUser
- subject: ForeignKey → Subject
- class: ForeignKey → Class
- academic_year: CharField
- semester: IntegerField
```

#### 7. **ClassSchedule**
```sql
- id: AutoField (Primary Key)
- class: ForeignKey → Class
- subject: ForeignKey → Subject
- teacher: ForeignKey → CustomUser
- day_of_week: CharField (Monday-Friday)
- start_time: TimeField
- end_time: TimeField
```

#### 8. **Session** (Attendance Session)
```sql
- id: AutoField (Primary Key)
- class_assigned: ForeignKey → Class
- subject: ForeignKey → Subject
- start_time: DateTimeField
- end_time: DateTimeField (nullable - session ongoing)
- date: DateField
- status: CharField (CHOICES: active, completed, cancelled)
- created_by: ForeignKey → CustomUser (Teacher)
```

#### 9. **Attendance**
```sql
- id: AutoField (Primary Key)
- student: ForeignKey → CustomUser
- session: ForeignKey → Session
- status: CharField (CHOICES: present, absent, late)
- marked_by: ForeignKey → CustomUser (Teacher)
- marked_at: DateTimeField
- face_match_confidence: FloatField (0.0-1.0)
```

#### 10. **FaceEmbedding** (ML Data)
```sql
- id: AutoField (Primary Key)
- student: ForeignKey → CustomUser
- embedding_vector: JSONField (512-dim vector)
- image: ImageField
- created_at: DateTimeField
- updated_at: DateTimeField
```

#### 11. **AttendanceChange** (Change Requests)
```sql
- id: AutoField (Primary Key)
- attendance: ForeignKey → Attendance
- requested_by: ForeignKey → CustomUser (Student)
- reason: TextField
- new_status: CharField
- status: CharField (CHOICES: pending, approved, rejected)
- approved_by: ForeignKey → CustomUser (HOD)
- approved_at: DateTimeField (nullable)
```

#### 12. **AttendanceReport** (Analytics)
```sql
- id: AutoField (Primary Key)
- student: ForeignKey → CustomUser
- period_start, period_end: DateField
- total_classes: IntegerField
- present_count: IntegerField
- absent_count: IntegerField
- late_count: IntegerField
- percentage: FloatField
```

#### 13. **Notification**
```sql
- id: AutoField (Primary Key)
- user: ForeignKey → CustomUser (Recipient)
- title, message: CharField/TextField
- category: CharField (attendance, system, alert)
- is_read: BooleanField
- created_at: DateTimeField
```

---

## 📊 Data Relationships

```
CustomUser (1) ──┬── Department (1..many)
                  ├── ClassStudent (1..many) ──── Class
                  ├── TeacherAssignment (1..many) ──┬─ Subject
                  │                                 └─ Class
                  └── Session (Created by teacher)
                  
Session ─┬── Class
         ├── Subject
         └── Attendance (1..many) ──┬── Student (CustomUser)
                                    └── FaceEmbedding (ML data)

Attendance ── AttendanceChange (Requests to modify status)

Student ── AttendanceReport (Periodic statistics)

User ── Notification (1..many) for all roles
```

---

## 🔐 Authentication Flow

### Login Process
1. **Frontend** sends username/password to `/api/auth/login/`
2. **Backend** validates credentials against CustomUser
3. **Backend** generates JWT tokens (access + refresh)
4. **Frontend** stores tokens in localStorage
5. **Frontend** calls `/api/auth/me/` to fetch user role
6. **Frontend** routes to appropriate dashboard based on role

### Token Usage
```
Header: Authorization: Bearer {access_token}
        Content-Type: application/json

Response: 200 OK → Access granted
          401 Unauthorized → Token expired (use refresh_token)
          403 Forbidden → Insufficient role permissions
```

### Refresh Token Flow
- Access token expires in 5 minutes
- Refresh token used to get new access token
- Old tokens invalidated on logout

---

## 🎯 Role-Based Access Control (RBAC)

### Admin
- ✅ Manage all users (create, edit, delete)
- ✅ Manage departments, classes, subjects
- ✅ View all attendance records
- ✅ Generate system reports
- ✅ System configuration

### HOD (Head of Department)
- ✅ Manage teachers in their department
- ✅ View department statistics
- ✅ Approve attendance change requests
- ✅ Monitor class schedules
- ⛔ Cannot delete users

### Teacher
- ✅ Start/end attendance sessions
- ✅ Mark student attendance
- ✅ View assigned classes/subjects
- ✅ View own attendance teaching history
- ⛔ Cannot modify other teachers' data

### Student
- ✅ View own attendance records
- ✅ Request attendance changes
- ✅ View dashboard statistics
- ✅ Receive notifications
- ⛔ Cannot view other students' data

---

## 🔄 Attendance Workflow

### Teacher Flow
```
1. Teacher logs in → Teacher Dashboard
2. Selects class/subject → Start Session
3. System creates Session record
4. Students appear for facial recognition
5. Face matched → Create Attendance (present)
6. Face not matched → Create Attendance (absent)
7. Teacher marks manual corrections (late, etc.)
8. Teacher clicks "End Session"
9. Session marked as completed
```

### Student Flow
```
1. Student logs in → Student Dashboard
2. View attendance records (by session/subject)
3. If attendance incorrect:
   a. Submit AttendanceChange request
   b. Provide reason
4. HOD reviews request
5. If approved: Attendance record updated
6. If rejected: Notification sent to student
```

### HOD Flow
```
1. HOD logs in → HOD Dashboard
2. Review pending AttendanceChange requests
3. Approve/Reject with comment
4. View department-wide statistics
5. Monitor class schedules
6. Send notifications to students/teachers
```

---

## 🌐 API Architecture

### Endpoint Categories

**Authentication** (5 endpoints)
- POST /api/auth/login/
- POST /api/auth/token/refresh/
- POST /api/auth/logout/
- GET /api/auth/me/
- POST /api/users/change-password/

**User Management** (6 endpoints)
- GET /api/users/
- POST /api/users/
- GET /api/users/{id}/
- PUT /api/users/{id}/
- DELETE /api/users/{id}/
- GET /api/users/me/

**Department** (5 endpoints)
- GET, POST, GET {id}, PUT {id}, DELETE {id}
- GET /api/attendance/departments/{id}/statistics/

**Subject** (5 endpoints)
- GET, POST, GET {id}, PUT {id}, DELETE {id}
- GET /api/attendance/subjects/?search=...

**Class** (5 endpoints)
- GET, POST, GET {id}, PUT {id}, DELETE {id}
- GET /api/attendance/classes/?search=...

**Attendance** (8 endpoints)
- GET, POST, GET {id}, PUT {id}, DELETE {id}
- POST /api/attendance/mark_attendance/
- POST /api/attendance/mark_multiple/
- GET /api/attendance/statistics/
- GET /api/attendance/by_date/?date=2024-01-15

**Session** (7 endpoints)
- GET, POST, GET {id}, PUT {id}, DELETE {id}
- POST /api/attendance/sessions/start_session/
- POST /api/attendance/sessions/{id}/end_session/
- GET /api/attendance/sessions/active_sessions/

**Face Embeddings** (5 endpoints)
- GET, POST, GET {id}, PUT {id}, DELETE {id}
- Multi-part form data for image + vector

**Notifications** (6 endpoints)
- GET, POST, GET {id}, PUT {id}, DELETE {id}
- POST /api/attendance/notifications/{id}/mark_read/
- POST /api/attendance/notifications/mark_all_read/
- GET /api/attendance/notifications/unread_count/

**Reports** (3 endpoints)
- GET /api/attendance/attendance-reports/
- GET /api/attendance/attendance-reports/low_attendance/?threshold=75
- POST /api/attendance/attendance-reports/regenerate/

---

## 🚀 Deployment Architecture

### Development
```
Local Machine
├── Backend: localhost:8000
├── Frontend: localhost:5173
└── Database: PostgreSQL localhost:5433
```

### Production (Future)
```
Cloud Server (AWS/Azure/DigitalOcean)
├── Frontend: Nginx static hosting + CDN
├── Backend: Gunicorn + Nginx reverse proxy
├── Database: PostgreSQL managed service
├── Cache: Redis for sessions/cache
└── Storage: S3 for images/embeddings
```

---

## 📈 Scalability Considerations

### Current (20% Progress)
- ✅ Single-server deployment
- ✅ PostgreSQL direct connection
- ✅ JWT stateless authentication
- ✅ Basic pagination (20 items/page)

### Future (Full Release)
- Horizontal scaling with load balancer
- Database replication & read replicas
- Caching layer (Redis)
- Asynchronous tasks (Celery)
- Microservices architecture option
- CDN for static assets

---

## 🔌 Integration Points

### Face Recognition System
- **Input**: Student image from camera
- **Processing**: FaceNet/ResNet embedding model
- **Output**: 512-dimensional vector stored in FaceEmbedding
- **Matching**: Compare with stored embeddings (cosine similarity > 0.6)

### Notification System
- **Triggers**: Low attendance, change request approved/rejected, system alerts
- **Channels**: In-app notifications (frontend), Email (future)

### Analytics Engine
- **Data Source**: Attendance records
- **Reports**: Per-student, per-class, per-department
- **Metrics**: Attendance %, trends, patterns

---

## 📝 Version History

| Version | Date | Status | Progress |
|---------|------|--------|----------|
| 1.0.0 | Dec 2024 | Development | 20% |
| 0.9.0 | TBD | Beta | - |
| 1.0.0-RC1 | TBD | Release Candidate | - |
| 1.0.0 | TBD | Production | - |

---

For implementation details, see:
- `BACKEND_STRUCTURE.md` - Backend models/views/serializers
- `FRONTEND_STRUCTURE.md` - Frontend components/pages
- `DATABASE_SCHEMA.md` - Detailed migrations & indexes
- `DEVELOPMENT_ROADMAP.md` - Feature roadmap & milestones
