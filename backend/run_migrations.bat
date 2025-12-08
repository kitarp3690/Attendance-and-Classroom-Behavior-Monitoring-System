@echo off
echo ========================================
echo  Running Django Migrations
echo ========================================
echo.

cd /d %~dp0attendance_and_monitoring_system

echo Step 1: Creating migrations...
..\venv\Scripts\python.exe manage.py makemigrations

echo.
echo Step 2: Applying migrations...
..\venv\Scripts\python.exe manage.py migrate

echo.
echo Step 3: Checking for errors...
..\venv\Scripts\python.exe manage.py check

echo.
echo ========================================
echo  Migration Complete!
echo ========================================
pause
