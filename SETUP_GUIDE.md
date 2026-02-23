# Attendance & Classroom Behavior Monitoring System - Setup Guide

Complete setup guide for developers to get the system running locally.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Setup](#database-setup)
5. [Running the System](#running-the-system)
6. [Testing](#testing)

---

## Prerequisites

- **Python 3.9+** installed
- **Node.js 16+** and npm installed
- **PostgreSQL 12+** installed and running
- **Git** for version control

---

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables
Create `.env` file in `backend/attendance_and_monitoring_system/`:
```env
DB_ENGINE=postgresql
DB_NAME=attendance_db
DB_USER=attendance_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5433
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### 6. Run Database Migrations
```bash
cd attendance_and_monitoring_system
python manage.py migrate
```

### 7. Create Superuser
```bash
python manage.py createsuperuser
```

### 8. Run Backend Server
```bash
python manage.py runserver 8000
```

Backend will run at: `http://localhost:8000`

---

## Database Setup

### PostgreSQL Installation

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run installer and follow prompts
3. Remember the password you set for postgres user
4. Default port: 5432

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### Create Database & User

Connect to PostgreSQL:
```bash
psql -U postgres
```

Execute:
```sql
CREATE DATABASE attendance_db;
CREATE USER attendance_user WITH PASSWORD 'attendance123';
ALTER ROLE attendance_user SET client_encoding TO 'utf8';
ALTER ROLE attendance_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE attendance_user SET default_transaction_deferrable TO on;
ALTER ROLE attendance_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE attendance_db TO attendance_user;
\q
```

---

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env` file in `frontend/`:
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=Khwopa Attendance System
VITE_APP_VERSION=1.0.0
```

### 4. Run Development Server
```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## Running the System

### Terminal 1 - Backend Server
```bash
cd backend/attendance_and_monitoring_system
python manage.py runserver 8000
```

### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
```

### Access the Application
Open browser and go to: `http://localhost:5173`

---

## Testing

### Login Credentials

**Admin:**
- Username: `admin`
- Password: `admin123456`

**Teacher:**
- Username: `teacher`
- Password: `demo`

**Student:**
- Username: `student`
- Password: `demo`

### Test API Endpoints
Use provided test scripts in `backend/scripts/`:
```bash
cd backend/scripts
python comprehensive_api_test.py
```

---

## Troubleshooting

### Backend Won't Start
- Check if port 8000 is in use: `netstat -ano | findstr :8000`
- Ensure PostgreSQL is running
- Verify `.env` variables

### Frontend Won't Start
- Delete `node_modules` and reinstall: `npm install`
- Clear npm cache: `npm cache clean --force`
- Check if port 5173 is available

### Database Connection Issues
- Verify PostgreSQL is running
- Check credentials in `.env`
- Ensure database exists: `psql -U attendance_user -d attendance_db`

### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` in backend `.env` includes your frontend URL

---

## Next Steps

1. Create test data using Django admin or API scripts
2. Configure face recognition models
3. Set up automated attendance sessions
4. Configure notifications and alerts

For detailed API documentation, see `API_ENDPOINTS_DOCUMENTATION.md`
