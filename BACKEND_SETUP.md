# Database & Backend Implementation Guide

## ✅ Completed Setup

### 1. **Django REST Framework API**
- ✅ Django 5.2.9 configured
- ✅ Django REST Framework with JWT authentication
- ✅ CORS enabled for React frontend
- ✅ Custom user model (CustomUser) with roles

### 2. **Database Models Created**

#### User Model (users/models.py)
- `CustomUser` - Extended Django user with roles (admin, teacher, student), phone, avatar, DOB, address

#### Attendance App Models (attendance/models.py)
- `Subject` - Course/subject with code, credits, department
- `Class` - Class/section with students and subjects
- `ClassStudent` - Student enrollment in classes
- `TeacherAssignment` - Teacher to subject and class assignment
- `Session` - Attendance session (class period)
- `Attendance` - Attendance records with status (present, absent, late), confidence score
- `FaceEmbedding` - Face recognition embeddings for students
- `Notification` - User notifications with categories

### 3. **REST API Endpoints**

#### Authentication
```
POST   /api/auth/token/           - Login (get access & refresh tokens)
POST   /api/auth/token/refresh/   - Refresh access token
```

#### Subjects
```
GET    /api/subjects/             - List all subjects (searchable)
POST   /api/subjects/             - Create subject
GET    /api/subjects/{id}/        - Get subject details
PUT    /api/subjects/{id}/        - Update subject
DELETE /api/subjects/{id}/        - Delete subject
```

#### Classes
```
GET    /api/classes/              - List all classes (searchable)
POST   /api/classes/              - Create class
GET    /api/classes/{id}/         - Get class with students
PUT    /api/classes/{id}/         - Update class
DELETE /api/classes/{id}/         - Delete class
```

#### Teacher Assignments
```
GET    /api/teacher-assignments/  - List assignments
POST   /api/teacher-assignments/  - Create assignment
GET    /api/teacher-assignments/{id}/ - Get assignment
PUT    /api/teacher-assignments/{id}/ - Update assignment
DELETE /api/teacher-assignments/{id}/ - Delete assignment
```

#### Sessions
```
GET    /api/sessions/                    - List sessions
POST   /api/sessions/                    - Create session
GET    /api/sessions/{id}/               - Get session details
POST   /api/sessions/start_session/      - Start new session
POST   /api/sessions/{id}/end_session/   - End session
GET    /api/sessions/active_sessions/    - Get active sessions only
```

#### Attendance
```
GET    /api/attendance/                  - List attendance records
POST   /api/attendance/                  - Create attendance
GET    /api/attendance/{id}/             - Get attendance record
PUT    /api/attendance/{id}/             - Update attendance
DELETE /api/attendance/{id}/             - Delete attendance
POST   /api/attendance/mark_attendance/  - Mark/update single attendance
POST   /api/attendance/mark_multiple/    - Mark multiple students at once
GET    /api/attendance/statistics/       - Get attendance statistics
GET    /api/attendance/by_date/          - Get attendance by date
```

#### Face Embeddings
```
GET    /api/embeddings/            - List embeddings
POST   /api/embeddings/            - Create embedding with image
GET    /api/embeddings/{id}/       - Get embedding
PUT    /api/embeddings/{id}/       - Update embedding
DELETE /api/embeddings/{id}/       - Delete embedding
```

#### Notifications
```
GET    /api/notifications/                   - List user notifications
POST   /api/notifications/                   - Create notification
GET    /api/notifications/{id}/              - Get notification
DELETE /api/notifications/{id}/              - Delete notification
POST   /api/notifications/{id}/mark_read/    - Mark as read
POST   /api/notifications/mark_all_read/     - Mark all as read
GET    /api/notifications/unread_count/      - Get unread count
GET    /api/notifications/by_category/       - Filter by category
```

### 4. **Frontend API Service (frontend/src/services/api.js)**

Created comprehensive API client with:
- Axios instance with JWT token injection
- Automatic token refresh on 401
- All API endpoint functions organized by resource
- Error handling and logout on token expiration
- Utility functions for auth management

**Usage Example:**
```javascript
import { authAPI, attendanceAPI } from './services/api';

// Login
const response = await authAPI.login({ 
    username: 'teacher1', 
    password: 'password123' 
});
localStorage.setItem('access_token', response.data.access);
localStorage.setItem('refresh_token', response.data.refresh);

// Get attendance statistics
const stats = await attendanceAPI.getStatistics({ 
    subject_id: 1, 
    start_date: '2024-12-01' 
});

// Mark attendance
await attendanceAPI.markAttendance({
    student_id: 5,
    session_id: 12,
    status: 'present',
    confidence_score: 0.95
});
```

### 5. **Project Structure**

```
backend/
├── venv/                                    # Virtual environment
├── attendance_and_monitoring_system/
│   ├── manage.py
│   ├── attendance/
│   │   ├── models.py                       # All models
│   │   ├── serializers.py                  # DRF serializers
│   │   ├── views.py                        # ViewSets with custom actions
│   │   ├── urls.py                         # Router configuration
│   │   ├── admin.py
│   │   └── migrations/
│   ├── users/
│   │   ├── models.py                       # CustomUser model
│   │   ├── serializers.py                  # User serializers
│   │   ├── urls.py                         # JWT token endpoints
│   │   └── migrations/
│   ├── attendance_and_monitoring_system/
│   │   ├── settings.py                     # Django configuration (DRF, JWT, CORS)
│   │   ├── urls.py                         # Main URL configuration
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── db.sqlite3                          # SQLite database (dev)
│   └── media/                              # User uploads
├── .env                                    # Environment variables
└── requirements.txt
```

## 🚀 How to Run

### Backend (Django)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt python-dotenv django-cors-headers pillow

# Navigate to project directory
cd attendance_and_monitoring_system

# Run migrations
python manage.py migrate

# Create superuser (if needed)
python manage.py createsuperuser

# Start development server
python manage.py runserver 0.0.0.0:8000
```

The API will be available at: `http://localhost:8000/api/`

Admin panel: `http://localhost:8000/admin/`

### Frontend (React)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:5173/`

## 🔐 Authentication Flow

1. **User Login**
   ```javascript
   POST /api/auth/token/
   Body: { "username": "user", "password": "pass" }
   Response: { "access": "...", "refresh": "..." }
   ```

2. **Token Storage**
   - Access token stored in `localStorage` (1 hour expiry)
   - Refresh token stored in `localStorage` (7 days expiry)

3. **API Requests**
   - All requests include `Authorization: Bearer {access_token}` header
   - Token automatically added by axios interceptor

4. **Token Refresh**
   - When 401 received, automatically use refresh token
   - New access token obtained and stored
   - Original request retried

## 📊 Database Switching (PostgreSQL)

### To Use PostgreSQL Instead of SQLite:

**1. Install PostgreSQL**
```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# Or use: choco install postgresql
```

**2. Create Database**
```sql
CREATE DATABASE attendance_db;
CREATE USER attendance_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE attendance_db TO attendance_user;
```

**3. Update .env**
```
DB_ENGINE=postgresql
DB_NAME=attendance_db
DB_USER=attendance_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432
```

**4. Install PostgreSQL Adapter**
```bash
pip install psycopg2-binary
```

**5. Run Migrations**
```bash
python manage.py migrate
```

## 🔑 Default Admin Credentials

- **Username:** admin
- **Password:** admin123
- **Email:** admin@example.com

Change these credentials in production!

## 📝 Key Features

### Permission System
- **Admin**: Full access to all resources
- **Teacher**: Can only see/modify their own sessions, assignments, and attendance
- **Student**: Can only see their own attendance and notifications

### Pagination
- Default 20 items per page
- Configurable via `?page=2` query parameter

### Search & Filtering
- Most resources support search
- Examples: `/api/subjects/?search=math`, `/api/attendance/?status=present`

### File Uploads
- Profile avatars (users)
- Face embedding images (up to 10MB)
- Automatic path organization: `media/avatars/`, `media/embeddings/`

### Logging
- Logs created in `backend/attendance_and_monitoring_system/logs/` directory
- Includes console and file logging

## 🛠️ Common Debugging

**Port Already in Use:**
```bash
# Kill process using port 8000
lsof -ti:8000 | xargs kill -9   # Mac/Linux
netstat -ano | findstr :8000   # Windows
```

**Migration Issues:**
```bash
# Show migration status
python manage.py showmigrations

# Roll back last migration
python manage.py migrate [app] [migration_number]
```

**Clear Database (Development Only):**
```bash
# Delete db.sqlite3 and migrations, then:
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## 📚 Next Steps

1. **Test All Endpoints** - Use Postman/Thunder Client with the admin credentials
2. **Update Frontend Pages** - Replace dummy data with real API calls from `frontend/src/services/api.js`
3. **Deploy** - Configure for production (PostgreSQL, secure SECRET_KEY, DEBUG=False)
4. **AI Integration** - Connect face recognition models from `ai/` folder to the Face Embedding API

---

**All database and backend setup is now complete! ✅**
