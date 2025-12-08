@echo off
echo Installing frontend dependencies...
call npm install

echo.
echo Starting frontend development server...
call npm run dev
