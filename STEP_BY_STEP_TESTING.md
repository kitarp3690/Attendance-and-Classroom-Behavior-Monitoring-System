# 🧪 STEP-BY-STEP TEST EXECUTION GUIDE

**Purpose:** Walk through testing the entire system from login to each role's features  
**Duration:** 2-3 hours of focused testing  
**Date:** December 10, 2025

---

## SETUP (10 minutes)

### Step 0: Verify Everything is Running

```bash
# Terminal 1: Backend
cd backend/attendance_and_monitoring_system
venv\Scripts\activate
python manage.py runserver

# Terminal 2: Frontend (should already be running)
# Check: http://localhost:5173/
```

### Step 1: Create Test Users

If users don't exist, create them:

```bash
cd backend/attendance_and_monitoring_system
python manage.py shell
```

Copy-paste this into the shell:
```python
from users.models import CustomUser

try:
    # Admin
    CustomUser.objects.create_superuser(
        username='admin',
        email='admin@test.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    print("✓ Admin created")
except:
    print("✓ Admin already exists")

try:
    # Teacher
    CustomUser.objects.create_user(
        username='teacher1',
        email='teacher1@test.com',
        password='password123',
        first_name='John',
        last_name='Teacher',
        role='teacher'
    )
    print("✓ Teacher created")
except:
    print("✓ Teacher already exists")

try:
    # HOD
    CustomUser.objects.create_user(
        username='hod1',
        email='hod1@test.com',
        password='password123',
        first_name='Sarah',
        last_name='HOD',
        role='hod'
    )
    print("✓ HOD created")
except:
    print("✓ HOD already exists")

try:
    # Student
    CustomUser.objects.create_user(
        username='student1',
        email='student1@test.com',
        password='password123',
        first_name='Mike',
        last_name='Student',
        role='student'
    )
    print("✓ Student created")
except:
    print("✓ Student already exists")

exit()
```

---

## PHASE 1: LOGIN & AUTHENTICATION (15 minutes)

### Test 1.1: Admin Login

**Steps:**
1. Open http://localhost:5173/
2. Enter: `admin` / `admin123`
3. Click "Sign In"

**Expected Result:** ✅
- Page redirects to `/admin` dashboard
- Greeting shows: "Welcome, Admin"
- Admin dashboard displays with stats
- No console errors (F12 → Console)

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 1.2: Teacher Login

**Steps:**
1. Open http://localhost:5173/
2. Logout if needed (navbar → Logout)
3. Enter: `teacher1` / `password123`
4. Click "Sign In"

**Expected Result:** ✅
- Page redirects to `/teacher` dashboard
- Greeting shows: "Welcome, John"
- Teacher dashboard displays
- Stats visible (Total Classes, Students, Avg Attendance, Active Sessions)

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 1.3: HOD Login

**Steps:**
1. Logout current user
2. Enter: `hod1` / `password123`
3. Click "Sign In"

**Expected Result:** ✅
- Page redirects to `/hod` dashboard
- Greeting shows: "Welcome, Sarah"
- HOD dashboard displays
- Shows pending approvals, department stats

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 1.4: Student Login

**Steps:**
1. Logout current user
2. Enter: `student1` / `password123`
3. Click "Sign In"

**Expected Result:** ✅
- Page redirects to `/student` dashboard
- Greeting shows: "Welcome, Mike"
- Student dashboard displays
- Shows attendance percentage, breakdown, enrolled classes

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 1.5: Invalid Login

**Steps:**
1. Logout if needed
2. Enter: `admin` / `wrongpassword`
3. Click "Sign In"

**Expected Result:** ✅
- Error message displays: "Invalid credentials. Please check your username and password."
- Stays on login page
- Can try again

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 1.6: Remember Me Feature

**Steps:**
1. Clear browser data
2. Enter: `teacher1` / `password123`
3. CHECK "Remember me" checkbox
4. Click "Sign In"
5. Close browser completely
6. Open http://localhost:5173 again
7. Check if username is pre-filled

**Expected Result:** ✅
- Username `teacher1` appears in username field
- Can click Sign In without re-typing

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

## PHASE 2: TEACHER CRITICAL WORKFLOW (45 minutes)

**This is the most important test - core functionality**

### Test 2.1: Teacher Accesses Class Session Page

**Steps:**
1. Login as teacher1 / password123
2. Look for "Start/End Session" or similar page
3. Navigate to it (from navbar or dashboard button)

**Expected Result:** ✅
- Page loads with title "Start/End Class Session"
- "Select Class" dropdown populated with classes
- "Select Subject" dropdown present
- Session control panel visible
- No console errors

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 2.2: Select Class and Subject

**Steps:**
1. On "Start/End Session" page
2. Click "Select Class" dropdown
3. Choose first available class (e.g., "Class 1A")
4. Click "Select Subject" dropdown
5. Choose available subject (e.g., "CS301")

**Expected Result:** ✅
- Classes dropdown shows available classes
- Can select one
- Subjects dropdown shows for that class
- Can select one
- Both remain selected

**Actual Result:**
- [ ] ✅ Success - Selected: Class _______, Subject _______
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 2.3: Start Session ⭐ CRITICAL

**Steps:**
1. With class and subject selected
2. Click "Start Session" button
3. Wait 2 seconds
4. Check if status changes to "Active"

**Expected Result:** ✅
- Button changes text or becomes disabled
- Status shows "Session Active" with green dot
- Timer starts counting up (00:00:01, 00:00:02...)
- Class and Subject dropdowns become DISABLED
- No console errors
- **Check Database:** Session record created with `is_active=true`

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Database Check:**
```bash
# In PostgreSQL:
SELECT * FROM attendance_session WHERE is_active=true;
# Should show 1 record with class and subject
```

**Notes:** _________________________________

---

### Test 2.4: Mark Attendance ⭐ CRITICAL

**Steps:**
1. Session is active (from Step 2.3)
2. Scroll down or look for "Mark Attendance" section
3. You should see list of students from the class
4. Toggle each student's attendance:
   - Mark 3-4 students as "Present" (click button)
   - Leave 1-2 as "Absent"
5. Look for attendance count (e.g., "3 Present / 5 Total")

**Expected Result:** ✅
- Student list loads with all class students
- Each student has action buttons (Present/Absent/Late)
- Clicking toggles the status
- Highlights change color
- Count updates: "X students marked present"
- No console errors

**Actual Result:**
- [ ] ✅ Success - Marked: 3 Present, 2 Absent
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 2.5: Submit Attendance ⭐ CRITICAL

**Steps:**
1. With students marked (from Step 2.4)
2. Look for "Mark Attendance" or "Submit" button at bottom
3. Click it
4. Wait for confirmation

**Expected Result:** ✅
- Page shows: "Attendance marked successfully"
- Attendance records appear in history
- **Check Database:** Attendance records created with correct status
- **For each "Present" student:** Record has `status='present'`
- **For each "Absent" student:** Record has `status='absent'`

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Database Check:**
```bash
# In PostgreSQL:
SELECT * FROM attendance_attendance 
WHERE session_id = [session_id_from_step_2_3];
# Should show 5 records (one per student) with correct status
```

**Notes:** _________________________________

---

### Test 2.6: End Session ⭐ CRITICAL

**Steps:**
1. Session still active (from previous steps)
2. Look for "End Session" button
3. Click it
4. Wait 1-2 seconds

**Expected Result:** ✅
- Button shows confirmation: "Session ended. X students marked present."
- Status changes to "Session Inactive"
- Timer stops
- Class and Subject dropdowns ENABLED again
- Ready to start new session
- **Check Database:** Session has `is_active=false` and `end_time` set

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Database Check:**
```bash
# In PostgreSQL:
SELECT * FROM attendance_session WHERE id = [session_id];
# Should have is_active=false and end_time NOT NULL
```

**Notes:** _________________________________

---

### Test 2.7: View Attendance Records (Teacher)

**Steps:**
1. Go to "View/Edit Attendance" page
2. Look for attendance records from the session you just created
3. Find today's date records

**Expected Result:** ✅
- Can see attendance records marked in Steps 2.4-2.5
- Shows: Date, Student Name, Subject, Status (Present/Absent/Late)
- Can filter by subject or date
- Records match what was marked
- Database counts match

**Actual Result:**
- [ ] ✅ Success - Found __ records
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

## PHASE 3: STUDENT VIEWS MARKED ATTENDANCE (20 minutes)

### Test 3.1: Student Dashboard Shows New Attendance

**Steps:**
1. Logout from teacher account
2. Login as student1 / password123
3. Look at Student Dashboard

**Expected Result:** ✅
- Dashboard shows updated statistics:
  - Total attendance percentage (may have changed)
  - Present count increased
  - Attendance breakdown updated
- Enrolled classes show correct attendance %
- Stats match what teacher marked
- No console errors

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 3.2: Student Views Attendance Records

**Steps:**
1. On Student Dashboard
2. Go to "View Attendance" page
3. Look for today's attendance record

**Expected Result:** ✅
- Can see today's attendance record
- Status matches what teacher marked:
  - Shows "Present" if teacher marked present
  - Shows "Absent" if teacher marked absent
  - Shows "Late" if teacher marked late
- Date and subject correct
- Can filter by subject or date
- No console errors

**Actual Result:**
- [ ] ✅ Success - Attendance shows as: _______
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 3.3: Student Requests Attendance Change

**Steps:**
1. On "View Attendance" page
2. Find an "Absent" record
3. Look for "Request Change" button
4. Click it
5. Modal opens with form:
   - Reason dropdown
   - Notes field
6. Select reason (e.g., "Sick Leave")
7. Add note: "Had fever, provide medical certificate"
8. Click "Submit"

**Expected Result:** ✅
- Modal closes
- Request appears in pending list
- Status shows "Pending"
- Request saved to database with `status='pending'`
- **Check Database:** AttendanceChange record created

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Database Check:**
```bash
# In PostgreSQL:
SELECT * FROM attendance_attendancechange 
WHERE status='pending' AND student_id=[student_id];
# Should show the request you just made
```

**Notes:** _________________________________

---

### Test 3.4: Student Sees Pending Request

**Steps:**
1. On "View Attendance" page
2. Look for "Pending Requests" or similar section
3. Should see the request from Step 3.3

**Expected Result:** ✅
- Request appears in pending list
- Shows: Date, Reason, Status (Pending), Notes
- Can see details of the request
- No console errors

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

## PHASE 4: HOD APPROVES REQUEST (20 minutes)

### Test 4.1: HOD Sees Pending Requests

**Steps:**
1. Logout from student account
2. Login as hod1 / password123
3. Go to "Approve Changes" page

**Expected Result:** ✅
- Page loads with pending requests list
- Can see the request submitted by student in Step 3.3
- Shows: Student Name, Date, Reason, Status
- Request is in list
- No console errors

**Actual Result:**
- [ ] ✅ Success - Found request from: _______
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 4.2: HOD Approves Request ⭐ CRITICAL

**Steps:**
1. On "Approve Changes" page
2. Find the student's request
3. Click "Approve" button
4. Modal might appear with notes field
5. Click "Confirm Approve"

**Expected Result:** ✅
- Request disappears from pending list
- Status changes to "Approved"
- **Check Database:** AttendanceChange record has:
  - `status='approved'`
  - `approved_at` timestamp set
  - `approved_by` pointing to HOD user
- Notification created for student
- No console errors

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Database Check:**
```bash
# In PostgreSQL:
SELECT * FROM attendance_attendancechange WHERE id=[request_id];
# Should have status='approved' and approved_at NOT NULL
```

**Notes:** _________________________________

---

### Test 4.3: Student Sees Approved Status

**Steps:**
1. Logout from HOD
2. Login back as student1 / password123
3. Go to "View Attendance" page
4. Look at the request you submitted

**Expected Result:** ✅
- Request now shows status: "Approved"
- HOD notes visible (if any)
- Can see approval date/time
- Dashboard statistics may have updated

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

## PHASE 5: ADMIN USER MANAGEMENT (20 minutes)

### Test 5.1: Admin Accesses User Management

**Steps:**
1. Logout from student
2. Login as admin / admin123
3. Go to "Manage Users" page

**Expected Result:** ✅
- User list displays with columns:
  - Name, Username, Role, Email, Status
- All 4 test users visible in list
- Search/filter working
- Pagination if >10 users
- No console errors

**Actual Result:**
- [ ] ✅ Success - Showing __ users
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 5.2: Admin Creates New User

**Steps:**
1. On "Manage Users" page
2. Click "Add New User" button
3. Fill form:
   - First Name: "Test"
   - Last Name: "Teacher"
   - Username: "testteacher"
   - Email: "test@example.com"
   - Password: "test123456"
   - Role: "Teacher"
4. Click "Create User"

**Expected Result:** ✅
- Form submits without error
- Modal/form closes
- New user appears in list
- Username "testteacher" visible
- Role shows "Teacher"
- **Check Database:** New user record created with role='teacher'
- No console errors

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Database Check:**
```bash
# In PostgreSQL:
SELECT * FROM users_customuser WHERE username='testteacher';
# Should exist with role='teacher'
```

**Notes:** _________________________________

---

### Test 5.3: New User Can Login

**Steps:**
1. Logout from admin
2. Login with new user: testteacher / test123456
3. Should go to teacher dashboard

**Expected Result:** ✅
- Login succeeds
- Redirected to `/teacher` dashboard
- Greeting shows: "Welcome, Test"
- Teacher dashboard loads correctly
- No console errors

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 5.4: Admin Edits User

**Steps:**
1. Logout from test user
2. Login as admin
3. Go to "Manage Users"
4. Find "testteacher" user
5. Click "Edit" button
6. Change:
   - First Name: "Updated"
   - Email: "updated@example.com"
7. Click "Save"

**Expected Result:** ✅
- Form submits successfully
- User list updates
- Name shows "Updated"
- Email shows "updated@example.com"
- **Check Database:** User record updated

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

### Test 5.5: Admin Deletes User

**Steps:**
1. On "Manage Users" page
2. Find "testteacher" user
3. Click "Delete" button
4. Confirmation dialog appears
5. Click "Confirm Delete"

**Expected Result:** ✅
- User disappears from list
- Cannot find "testteacher" anymore
- **Check Database:** User record deleted or marked inactive
- No console errors

**Actual Result:**
- [ ] ✅ Success
- [ ] ❌ Failed - Error: _____________________

**Notes:** _________________________________

---

## FINAL VERIFICATION

### Checklist: All Critical Features Working

- [ ] ✅ Login for all 4 roles works
- [ ] ✅ Teacher can start session
- [ ] ✅ Teacher can mark attendance
- [ ] ✅ Teacher can end session
- [ ] ✅ Attendance saves to database
- [ ] ✅ Student sees marked attendance
- [ ] ✅ Student can request change
- [ ] ✅ HOD can approve requests
- [ ] ✅ Request status updates for student
- [ ] ✅ Admin can create users
- [ ] ✅ Admin can edit users
- [ ] ✅ Admin can delete users
- [ ] ✅ New users can login and use system
- [ ] ✅ No critical console errors
- [ ] ✅ All API calls returning correct status codes
- [ ] ✅ Database has all records

---

## TEST SUMMARY

**Total Tests Executed:** ______ / 15  
**Passed:** ______ (__%)  
**Failed:** ______ (__%)  

**Critical Issues Found:**
1. ___________________________________
2. ___________________________________
3. ___________________________________

**Medium Issues Found:**
1. ___________________________________
2. ___________________________________

**Low Issues Found:**
1. ___________________________________
2. ___________________________________

**Tester Name:** ________________________  
**Date:** ________________________________  
**Time Started:** __________ **Time Ended:** __________  
**Browser:** ____________________________  
**Device:** _____________________________  

---

**STATUS:** 
- [ ] ✅ PASS - Ready for Production
- [ ] ⚠️ PASS WITH ISSUES - Needs Fixes
- [ ] ❌ FAIL - Major Issues Found

---

**Next Steps:**
1. If PASS: Prepare deployment
2. If PASS WITH ISSUES: Create bug tickets and re-test
3. If FAIL: Fix critical issues and re-test all

Good luck with testing! 🎯
