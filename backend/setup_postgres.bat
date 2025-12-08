@echo off
REM PostgreSQL Setup Script
REM This script creates the database, user, and grants permissions

setlocal enabledelayedexpansion

set PGPASSWORD=
set PGHOST=localhost
set PGPORT=5433
set PGUSER=postgres

echo.
echo ========================================
echo PostgreSQL Database Setup Script
echo ========================================
echo.
echo Setting up PostgreSQL on port 5433...
echo.

REM Create database
echo Creating attendance_db database...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h %PGHOST% -p %PGPORT% -U %PGUSER% -c "CREATE DATABASE attendance_db;" 2>&1

REM Create user
echo Creating attendance_user...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h %PGHOST% -p %PGPORT% -U %PGUSER% -c "CREATE USER attendance_user WITH PASSWORD 'attendance123';" 2>&1

REM Grant permissions on database
echo Granting permissions on database...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h %PGHOST% -p %PGPORT% -U %PGUSER% -c "GRANT ALL PRIVILEGES ON DATABASE attendance_db TO attendance_user;" 2>&1

REM Connect to the database and grant schema permissions
echo Granting schema permissions...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h %PGHOST% -p %PGPORT% -U %PGUSER% -d attendance_db -c "GRANT ALL PRIVILEGES ON SCHEMA public TO attendance_user;" 2>&1

REM Set default privileges
echo Setting default privileges...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h %PGHOST% -p %PGPORT% -U %PGUSER% -d attendance_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO attendance_user;" 2>&1

echo.
echo ========================================
echo PostgreSQL setup completed!
echo ========================================
echo.
echo Database: attendance_db
echo User: attendance_user
echo Password: attendance123
echo Host: localhost
echo Port: 5433
echo.
pause
