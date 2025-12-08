# PostgreSQL Setup Guide

## ✅ Configuration Already Updated

Your `.env` file has been configured for PostgreSQL with:
```
DB_ENGINE=postgresql
DB_NAME=attendance_db
DB_USER=attendance_user
DB_PASSWORD=attendance123
DB_HOST=localhost
DB_PORT=5432
```

---

## Step 1: Install PostgreSQL

### Windows Installation

**Option A: Direct Download (Recommended)**
1. Download from: https://www.postgresql.org/download/windows/
2. Download the latest version (15.x or 16.x)
3. Run the installer
4. During installation:
   - Set a password for `postgres` superuser (remember this!)
   - Port: 5432 (default)
   - Locale: Your system locale
5. Complete the installation

**Option B: Using Chocolatey (if installed)**
```bash
choco install postgresql
```

---

## Step 2: Create Database and User

After PostgreSQL is installed, open **pgAdmin** (comes with PostgreSQL) or use **psql** command line.

### Using pgAdmin (GUI - Easier)
1. Open pgAdmin from Start Menu
2. Login with your postgres password
3. Right-click "Databases" → Create → Database
   - Name: `attendance_db`
   - Owner: postgres (for now)
4. Right-click "Login/Group Roles" → Create → Login/Group Role
   - Name: `attendance_user`
   - Password: `attendance123`
   - Privileges: 
     - Can login: ✓
     - Superuser: ✗
     - Create databases: ✗

### Using psql (Command Line)
Open Command Prompt and run:

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# In psql, run these commands:
CREATE DATABASE attendance_db;
CREATE USER attendance_user WITH PASSWORD 'attendance123';
GRANT ALL PRIVILEGES ON DATABASE attendance_db TO attendance_user;
\q
```

---

## Step 3: Grant Proper Permissions

**In pgAdmin or psql, grant permissions:**

```sql
-- Connect to the attendance_db database
\c attendance_db

-- Grant schema permissions
GRANT ALL PRIVILEGES ON SCHEMA public TO attendance_user;

-- Grant table permissions (after migrations)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO attendance_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO attendance_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO attendance_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO attendance_user;
```

---

## Step 4: Install Python PostgreSQL Driver

The driver is already listed in requirements.txt, but ensure it's installed:

```bash
cd backend
pip install psycopg2-binary
```

---

## Step 5: Run Django Migrations

This creates all database tables:

```bash
cd backend/attendance_and_monitoring_system
python manage.py migrate
```

Expected output:
```
Operations to perform:
  Apply all migrations: admin, auth, attendance, contenttypes, sessions, users
Running migrations:
  Applying users.0001_initial... OK
  Applying admin.0001_initial... OK
  ...
```

---

## Step 6: Create Superuser (Admin Account)

```bash
python manage.py createsuperuser
```

Follow the prompts:
- Username: `admin`
- Email: `admin@example.com`
- Password: `your_secure_password`

---

## Step 7: Verify Connection

Start the Django server and check the database:

```bash
python manage.py runserver
```

Then in another terminal, connect to the database:

```bash
psql -U attendance_user -d attendance_db -h localhost
```

If you can connect, PostgreSQL is working! ✓

---

## Troubleshooting

### Error: "psycopg2: FATAL:  Ident authentication failed"
**Solution**: 
1. Open PostgreSQL pgAdmin
2. Edit the user `attendance_user`
3. Set password again (or use the password from `.env`)

### Error: "could not connect to server: No such file or directory"
**Solution**: 
- PostgreSQL service not running
- Windows: Start → Services → Find PostgreSQL → Start it
- Command: `net start PostgreSQL14` (or your version)

### Error: "database attendance_db does not exist"
**Solution**: 
- Create the database first (Step 2)
- Check capitalization: should be lowercase `attendance_db`

### Error: "permission denied for schema public"
**Solution**: Run the SQL permissions commands in Step 3

### Error: "column ... does not exist"
**Solution**: 
- Migrations not run yet
- Run: `python manage.py migrate`

---

## Verify PostgreSQL is Working

### In pgAdmin:
1. Expand "Servers" → postgres
2. Expand "Databases"
3. You should see `attendance_db`
4. Click it, expand "Schemas" → public
5. You should see "Tables" with Django tables

### In psql:
```bash
psql -U attendance_user -d attendance_db -h localhost
```

Then run:
```sql
\dt  # List all tables
\d users_customuser  # Show a specific table structure
SELECT COUNT(*) FROM users_customuser;  # Count users
\q  # Quit
```

---

## Important Passwords to Remember

| Username | Password | Purpose |
|----------|----------|---------|
| postgres | (you set) | PostgreSQL superuser |
| attendance_user | attendance123 | Django app user |
| admin | (you set) | Django superuser |

---

## Next Steps

1. ✅ Update `.env` → DONE
2. → Install PostgreSQL (if not installed)
3. → Create database and user
4. → Run migrations
5. → Create superuser
6. → Start backend server
7. → Start frontend and test

---

## Quick Command Reference

```bash
# Check PostgreSQL status
pg_isready -h localhost -U attendance_user -d attendance_db

# Connect to database
psql -U attendance_user -d attendance_db

# Backup database
pg_dump -U attendance_user -d attendance_db > backup.sql

# Restore database
psql -U attendance_user -d attendance_db < backup.sql

# Django migrations
python manage.py migrate              # Apply migrations
python manage.py makemigrations       # Create migrations
python manage.py showmigrations       # Show migration status
```

---

**Status**: Configuration file updated ✓
**Next**: Install PostgreSQL and create database
