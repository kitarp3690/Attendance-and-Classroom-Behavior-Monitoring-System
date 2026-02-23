# Frontend-Backend API Integration - Testing Guide

## Verification Status: ✅ COMPLETE

All 9 admin dashboard components have been successfully integrated with the Django backend API. The verification script confirms:
- ✅ All components have proper API imports
- ✅ All components use useEffect for data fetching
- ✅ All components have proper error handling (try-catch)
- ✅ All components manage loading states
- ✅ All components follow consistent patterns

---

## Quick Start Testing

### 1. Start the Backend
```bash
cd backend/attendance_and_monitoring_system
python manage.py runserver
```
Backend will be available at: http://127.0.0.1:8000

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
Frontend will be available at: http://localhost:5174

### 3. Access the Dashboard
1. Login with your credentials
2. Navigate to Admin Dashboard (if you have admin role)
3. Test each component

---

## Component Testing Checklist

### 1. **AttendanceTable** 
**Path**: Dashboard → Attendance → Attendance Table

- [ ] Load initial data (20 records per page)
- [ ] Test pagination (next/previous buttons)
- [ ] Test filter by status (Present/Absent/Late)
- [ ] Test search by student name
- [ ] Test date range filter
- [ ] Edit attendance record (click edit button)
- [ ] Save changes (should update API)
- [ ] Cancel edit (should discard changes)
- [ ] Delete record (should ask for confirmation)
- [ ] Verify loading spinner appears during operations
- [ ] Test error handling (unplug network, refresh)

**Expected Data Fields**:
- Student name
- Class name
- Subject name
- Date/Time
- Status (Present/Absent/Late)
- Confidence score (if available)

---

### 2. **AttendanceChart**
**Path**: Dashboard → Attendance → Charts

- [ ] Load statistics on page load
- [ ] Display bar chart with attendance counts
- [ ] Filter by class (if available)
- [ ] Filter by date range
- [ ] Filter by status
- [ ] Legend displays correctly
- [ ] Loading spinner appears while fetching
- [ ] Shows error message if API fails

**Expected Data**:
- Total present count
- Total absent count
- Total late count
- Percentage calculations

---

### 3. **ManageUsers**
**Path**: Dashboard → Admin → Manage Users

- [ ] Load all users on page load
- [ ] Search by username or name
- [ ] Filter by role (Student/Teacher/Admin)
- [ ] Click "New User" button (modal opens)
- [ ] Fill form fields:
  - [ ] Username (required)
  - [ ] Email (required)
  - [ ] First Name
  - [ ] Last Name
  - [ ] Role (dropdown)
  - [ ] Class (only for students)
- [ ] Click "Add User" (create new user)
- [ ] Click edit icon on existing user
- [ ] Modify user details
- [ ] Password field should be optional on edit
- [ ] Save changes
- [ ] Delete user (confirm dialog)
- [ ] Verify loading states
- [ ] Test error handling

**Expected Fields**:
- Username
- Email
- First Name
- Last Name
- Role badge (Student/Teacher/Admin)
- Class (if applicable)
- Created date

---

### 4. **ManageSubjects**
**Path**: Dashboard → Admin → Manage Subjects

- [ ] Load all subjects
- [ ] Search subjects by name
- [ ] Click "New Subject" button
- [ ] Fill form:
  - [ ] Subject Name (required)
  - [ ] Subject Code (required)
  - [ ] Credits
  - [ ] Description
- [ ] Click "Create Subject"
- [ ] Click edit icon on subject
- [ ] Modify subject details
- [ ] Save changes
- [ ] Delete subject (confirm dialog)
- [ ] Verify loading states
- [ ] Test error handling

**Expected Fields**:
- Subject name
- Subject code
- Credits
- Description
- Action buttons (edit, delete)

---

### 5. **AllAttendance**
**Path**: Dashboard → Reports → All Attendance

- [ ] Load all attendance records on page load
- [ ] Display summary statistics:
  - [ ] Total records
  - [ ] Present count
  - [ ] Absent count
  - [ ] Late count
  - [ ] Percentage
- [ ] Filter by class (dropdown from API)
- [ ] Filter by subject (dropdown from API)
- [ ] Filter by status
- [ ] Filter by date range
- [ ] Click "Export CSV" button
- [ ] Verify CSV contains:
  - [ ] Student name
  - [ ] Student username
  - [ ] Class name
  - [ ] Subject name
  - [ ] Date
  - [ ] Status
- [ ] Test pagination
- [ ] Test loading states
- [ ] Test error handling

**Expected Data**:
- Student info (name, username)
- Session info (class, subject)
- Attendance info (status, date)
- Statistics summary

---

### 6. **AssignSubjects** 
**Path**: Dashboard → Admin → Assign Subjects

- [ ] Load all assignments on page load
- [ ] Search by teacher name or subject
- [ ] Click "New Assignment" button
- [ ] Teacher dropdown populated from teachers only
- [ ] Subject dropdown populated from subjects
- [ ] Click "Create Assignment"
- [ ] Verify assignment appears in list
- [ ] Click delete button
- [ ] Confirm deletion dialog
- [ ] Verify loading states
- [ ] Test error handling

**Expected Fields**:
- Teacher name
- Subject name
- Subject code
- Number of classes assigned
- Delete action

---

### 7. **AttendanceSummary**
**Path**: Dashboard → Reports → Attendance Summary

- [ ] Load overall statistics:
  - [ ] Total records
  - [ ] Present count
  - [ ] Absent count
  - [ ] Late count
  - [ ] Percentage
- [ ] Display class buttons
- [ ] Click class button to view class-specific stats
- [ ] Class stats should show:
  - [ ] Total records in class
  - [ ] Present count
  - [ ] Absent count
  - [ ] Late count
  - [ ] Percentage
- [ ] Progress bars reflect correct percentages
- [ ] Table shows all classes with their stats
- [ ] Loading states appear
- [ ] Error handling works

**Expected Data**:
- Overall system statistics
- Per-class statistics
- Attendance rates and percentages

---

### 8. **Reports**
**Path**: Dashboard → Reports → Generate Reports

- [ ] Report type selector shows options
- [ ] Date range pickers have date inputs
- [ ] Class filter (optional) shows all classes
- [ ] Subject filter (optional) shows all subjects
- [ ] Format selector shows CSV/JSON options
- [ ] Click "Generate Report"
- [ ] Report results display:
  - [ ] Total records
  - [ ] Present count
  - [ ] Absent count
  - [ ] Late count
- [ ] Click "Download" button
- [ ] Verify CSV downloads with correct data
- [ ] Test error handling (missing dates, etc.)
- [ ] Loading states appear

**Expected Report Format (CSV)**:
```
Student,Username,Class,Subject,Date,Status
John Doe,johndoe,CSE A,Mathematics,2024-11-15,Present
...
```

---

### 9. **Settings**
**Path**: Dashboard → Admin → Settings

- [ ] Tab navigation works (General, Attendance, Notifications, Backup)
- [ ] Modify settings in General tab:
  - [ ] System Name
  - [ ] School Code
  - [ ] Academic Year
  - [ ] Session Timeout
- [ ] Modify Attendance tab settings
- [ ] Modify Notifications tab settings
- [ ] Modify Backup tab settings
- [ ] Click "Save Changes" button
- [ ] Success message appears
- [ ] Settings persist on page reload (localStorage)
- [ ] Click "Reset" button
- [ ] Confirmation dialog appears
- [ ] Settings reset to defaults
- [ ] Error handling works

**Expected Behavior**:
- All changes save to browser localStorage
- Settings persist across browser sessions
- Success/error messages display appropriately

---

## API Endpoints Being Tested

### Attendance API
```
GET    /api/attendance/ - List all attendance
POST   /api/attendance/ - Create attendance
PATCH  /api/attendance/{id}/ - Update attendance
DELETE /api/attendance/{id}/ - Delete attendance
GET    /api/attendance/statistics/ - Get statistics
```

### User API
```
GET    /api/users/ - List users (with role filter)
POST   /api/users/ - Create user
PATCH  /api/users/{id}/ - Update user
DELETE /api/users/{id}/ - Delete user
```

### Class API
```
GET    /api/classes/ - List classes
```

### Subject API
```
GET    /api/subjects/ - List subjects
POST   /api/subjects/ - Create subject
PATCH  /api/subjects/{id}/ - Update subject
DELETE /api/subjects/{id}/ - Delete subject
```

### Teacher Assignment API
```
GET    /api/teacher-assignments/ - List assignments
POST   /api/teacher-assignments/ - Create assignment
DELETE /api/teacher-assignments/{id}/ - Delete assignment
```

---

## Common Issues & Solutions

### Issue: "Failed to load data. Please try again."
**Cause**: Backend not running or API endpoint doesn't exist
**Solution**: 
1. Verify Django backend is running: `python manage.py runserver`
2. Check API endpoints: `http://127.0.0.1:8000/api/`
3. Check browser console for actual error

### Issue: CORS error
**Cause**: Backend CORS configuration incorrect
**Solution**:
1. Check `backend/attendance_and_monitoring_system/settings.py`
2. Verify `ALLOWED_HOSTS` includes localhost:5174
3. Check CORS headers are configured

### Issue: 401 Unauthorized
**Cause**: JWT token expired or missing
**Solution**:
1. Login again
2. Check localStorage for `access_token`
3. Verify token refresh mechanism works

### Issue: Data not appearing
**Cause**: API response format different than expected
**Solution**:
1. Check browser DevTools Network tab
2. Inspect API response structure
3. Verify `results` vs flat array handling
4. Check for null/undefined nested fields

### Issue: Form fields not populating
**Cause**: API response missing expected fields
**Solution**:
1. Log API response: `console.log(res.data)`
2. Verify field names match API schema
3. Use fallback values for missing fields
4. Check optional chaining (?.) is used

### Issue: Pagination not working
**Cause**: Page parameter not being sent
**Solution**:
1. Check `fetchData(page)` is called with page number
2. Verify API supports `?page=2` parameter
3. Check pagination controls are wired to state

### Issue: Export not downloading
**Cause**: Blob creation or download link issue
**Solution**:
1. Check CSV format is correct
2. Verify blob creation: `new Blob([csvContent], { type: "text/csv" })`
3. Check download link: `link.setAttribute("download", filename)`
4. Test in different browser

---

## Performance Testing

### Load Testing
- [ ] Load 1000+ attendance records
- [ ] Load 100+ users
- [ ] Load 50+ subjects
- [ ] Load 30+ classes

**Expected Performance**:
- Initial load: < 3 seconds
- Pagination: < 1 second
- Search: < 500ms
- CRUD operations: < 2 seconds

### Memory Testing
- [ ] Long session duration (30+ minutes)
- [ ] Multiple page switches
- [ ] Export large datasets
- [ ] No memory leaks

**Expected Behavior**:
- Memory usage stable
- No console errors
- Smooth performance

---

## Security Testing

- [ ] XSS protection (HTML sanitization)
- [ ] SQL injection not possible (using Django ORM)
- [ ] CSRF tokens working (if applicable)
- [ ] Proper error messages (no sensitive info)
- [ ] Authorization checks (admin-only pages)

---

## Browser Compatibility

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers (if responsive design)

---

## Final Checklist Before Production

- [ ] All 9 components verified
- [ ] All API endpoints tested
- [ ] CRUD operations work correctly
- [ ] Error handling tested
- [ ] Loading states appear properly
- [ ] Data persistence verified
- [ ] CSV export format correct
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security issues addressed
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsive (if required)

---

## Deployment Checklist

- [ ] Build frontend: `npm run build`
- [ ] Build output: `dist/` folder created
- [ ] Django collectstatic: `python manage.py collectstatic --noinput`
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] CORS headers configured correctly
- [ ] Static files served correctly
- [ ] API endpoints accessible from production domain

---

## Support & Debugging

### Enable Debug Logging
```javascript
// In component
useEffect(() => {
    console.log('[Component] Mounted');
    return () => console.log('[Component] Unmounted');
}, []);

// In API calls
console.log('API Call:', endpoint, params);
console.log('Response:', response.data);
```

### Check API Responses
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Make an action in the component
4. Click on the API request
5. Check Response tab for data structure
6. Verify data matches component expectations

### Verify JWT Token
```javascript
// In browser console
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
```

---

**Last Updated**: 2024
**Status**: Ready for Production Testing
