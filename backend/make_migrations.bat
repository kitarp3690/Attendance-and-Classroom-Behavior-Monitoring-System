@echo off
cd /d %~dp0attendance_and_monitoring_system
..\venv\Scripts\python.exe manage.py makemigrations
pause
