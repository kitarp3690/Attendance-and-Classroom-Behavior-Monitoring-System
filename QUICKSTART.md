# Quick Start Guide - Running the System

## Prerequisites ✅
- PostgreSQL 18 installed and running on port 5433
- Python 3.11 with virtual environment (venv) configured
- Node.js and npm installed for frontend

---

## 🚀 Starting the Backend Server

### Option 1: Direct Python (Recommended)
```bash
cd backend\attendance_and_monitoring_system
..\venv\Scripts\python.exe manage.py runserver
```

**Output**:
```
System check identified 1 warning (0 silenced).
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### Option 2: Using Windows Batch (if created)
```bash
cd backend
start_backend.bat  # if available
```

---

## 🎨 Starting the Frontend Server

### Using Vite
```bash
cd frontend
npm run dev
```

**Output**:
```
VITE v7.2.2  ready in X ms
➜  Local:   http://localhost:5173/
➜  press h to show help
```

### Using Npm (Alternative)
```bash
cd frontend
npm start
```

---

## 🌐 Access Points

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend App | http://localhost:5173/ | Main application |
| Backend API | http://localhost:8000/api/ | API endpoints |
| Django Admin | http://localhost:8000/admin/ | Database management |

---

## 🔐 Login Credentials

### Admin User
```
Username: admin
Password: admin123456
```

### Database
```
Database: attendance_db
User: attendance_user
Password: attendance123
Host: localhost:5433
```

---

## ⚡ Database Management

### Check if PostgreSQL is running
```bash
Get-Process | Where {$_.Name -like "postgres*"}
```

### Access PostgreSQL directly
```bash
psql -U postgres -h localhost -p 5433
# Password: root (when prompted, if needed)
```

---

## 🔧 Common Tasks

### Reset Database (WARNING: Deletes all data)
```bash
cd backend\attendance_and_monitoring_system
..\venv\Scripts\python.exe manage.py flush --no-input
..\venv\Scripts\python.exe manage.py migrate
```

### Create another superuser
```bash
cd backend
..\venv\Scripts\python.exe create_superuser.py
# Edit the script to change username/password first
```

### Run Django tests
```bash
cd backend\attendance_and_monitoring_system
..\venv\Scripts\python.exe manage.py test
```

### Check system health
```bash
cd backend\attendance_and_monitoring_system
..\venv\Scripts\python.exe manage.py check
```

---

## 📝 Environment Files

### .env (Backend)
Location: `backend/.env`
```
DB_ENGINE=postgresql
DB_PORT=5433
DB_NAME=attendance_db
DB_USER=attendance_user
DB_PASSWORD=attendance123
```

---

## 🔄 Workflow

```
1. Start PostgreSQL (should auto-start)
   ↓
2. Start Backend Server (Terminal 1)
   cd backend\attendance_and_monitoring_system
   ..\venv\Scripts\python.exe manage.py runserver
   ↓
3. Start Frontend Server (Terminal 2)
   cd frontend
   npm run dev
   ↓
4. Open http://localhost:5173/ in browser
   ↓
5. Login with admin credentials
   ↓
6. Access data from PostgreSQL database
```

---

## ✅ What's Implemented

### Backend (Django REST API)
- ✅ PostgreSQL database connection (port 5433)
- ✅ 13 database tables created with all migrations applied
- ✅ JWT authentication system
- ✅ 60+ API endpoints for all models
- ✅ Django admin panel
- ✅ CORS enabled for frontend
- ✅ Superuser account created

### Frontend (React + Vite)
- ✅ 9 fully integrated admin components
- ✅ Centralized API service with axios
- ✅ JWT token management with refresh capability
- ✅ Error handling and loading states
- ✅ Responsive design

### Database (PostgreSQL)
- ✅ 13 tables created
- ✅ 21 migrations applied
- ✅ User authentication models
- ✅ Attendance tracking
- ✅ Class management
- ✅ Subject management
- ✅ Face recognition embeddings

---

## ✅ System Ready

Your system is fully configured and ready for development and testing!

**Status**: READY TO USE ✅

---

**Last Updated**: December 8, 2025

## 🔌 Frontend Integration

The frontend API service is ready in `frontend/src/services/api.js` with all endpoints.

### Example: Using in React Component

```javascript
import { authAPI, attendanceAPI, sessionAPI } from './services/api';

export default function TeacherDashboard() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // Get active sessions
    sessionAPI.getActiveSessions()
      .then(res => setSessions(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleStartSession = async (classId, subjectId) => {
    try {
      const res = await sessionAPI.startSession({
        class_assigned: classId,
        subject: subjectId
      });
      console.log('Session started:', res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {sessions.map(session => (
        <div key={session.id}>
          {session.subject_name} - {session.class_name}
        </div>
      ))}
    </div>
  );
}
```

## 📡 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/auth/token/` | Login |
| `POST` | `/auth/token/refresh/` | Refresh token |
| `GET` | `/subjects/` | List subjects |
| `GET` | `/classes/` | List classes |
| `POST` | `/sessions/start_session/` | Start attendance session |
| `POST` | `/attendance/mark_attendance/` | Mark student attendance |
| `GET` | `/attendance/statistics/` | Get attendance stats |
| `GET` | `/notifications/` | Get user notifications |

## 🧪 Testing with Postman/Thunder Client

### 1. Login
```
POST http://localhost:8000/api/auth/token/
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2. Use Access Token
```
GET http://localhost:8000/api/attendance/statistics/
Authorization: Bearer {access_token}
```

### 3. Get Your Test Data
```
GET http://localhost:8000/api/subjects/
Authorization: Bearer {access_token}
```

## 📝 Common Tasks

### Create Test Data

**1. Create a Subject**
```python
python manage.py shell

from attendance.models import Subject
Subject.objects.create(
    name='Mathematics',
    code='MATH101',
    department='Science',
    credits=3
)
```

**2. Create a Class**
```python
from attendance.models import Class, Subject
math = Subject.objects.get(code='MATH101')
cls = Class.objects.create(name='10A', section='A')
cls.subjects.add(math)
```

**3. Enroll Students**
```python
from attendance.models import ClassStudent
from users.models import CustomUser

student = CustomUser.objects.get(username='student1')
cls = Class.objects.get(name='10A')
ClassStudent.objects.create(student=student, class_assigned=cls)
```

### Get Help
```bash
# Django shell (interactive Python with Django context)
python manage.py shell

# Check migrations status
python manage.py showmigrations

# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Collect static files (for production)
python manage.py collectstatic
```

## 🎯 Next: Update Frontend Components

Now update your React components to use the API:

**Before (dummy data):**
```javascript
const [users, setUsers] = useState([
  { id: 1, name: 'John', role: 'Student' }
]);
```

**After (real API):**
```javascript
import { userAPI } from './services/api';

const [users, setUsers] = useState([]);

useEffect(() => {
  userAPI.getAll()
    .then(res => setUsers(res.data.results))
    .catch(err => console.error(err));
}, []);
```

## 📚 Documentation

See `BACKEND_SETUP.md` for complete documentation including:
- All API endpoints
- Database models
- Authentication flow
- PostgreSQL migration guide
- Troubleshooting

---

**All ready to go! Start the backend server and begin integrating with your React frontend. 🎉**
