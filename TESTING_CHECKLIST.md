# 🧪 Complete Testing Checklist
## Attendance & Classroom Behavior Monitoring System

**Last Updated:** December 10, 2025  
**Status:** Ready for End-to-End Testing  
**Frontend:** Running on http://localhost:5173/  
**Backend:** Running on http://localhost:8000/

---

## 📋 TEST OVERVIEW

This checklist covers:
- ✅ Login & Authentication
- ✅ All 4 Role-Based Dashboards (Admin, HOD, Teacher, Student)
- ✅ Sub-pages & Features for each role
- ✅ Backend API Connectivity
- ✅ Database Integration
- ✅ Missing Features & Known Issues

**Total Test Cases:** 100+  
**Estimated Testing Time:** 3-4 hours (manual)

---

## 🔐 PHASE 1: AUTHENTICATION & LOGIN

### 1.1 Login Page Functionality
- [ ] **Test Login Form Elements**
  - [ ] Username input field accepts text
  - [ ] Password input field accepts text
  - [ ] Password visibility toggle works (eye icon)
  - [ ] "Remember me" checkbox is functional
  - [ ] Theme toggle (Dark/Light) works on login page

- [ ] **Test Login Validation**
  - [ ] Empty username shows error: "Username required"
  - [ ] Empty password shows error: "Password required"
  - [ ] Invalid credentials show: "Invalid credentials. Please check your username and password."
  - [ ] Correct credentials redirect to appropriate dashboard
  - [ ] Loading state shows during login (disabled button, spinner)

- [ ] **Test Remember Me Feature**
  - [ ] Check "Remember me" checkbox
  - [ ] Login successfully
  - [ ] Close browser/clear session
  - [ ] Return to login page
  - [ ] Username should be pre-filled

- [ ] **Test Password Toggle**
  - [ ] Click eye icon, password changes to visible text
  - [ ] Click again, password changes to dots
  - [ ] Works smoothly without re-rendering

### 1.2 Test All 4 Login Credentials

| Role | Username | Password | Expected Dashboard |
|------|----------|----------|-------------------|
| Admin | `admin` | `admin123` | Admin Dashboard |
| Teacher | `teacher1` | `password123` | Teacher Dashboard |
| HOD | `hod1` | `password123` | HOD Dashboard |
| Student | `student1` | `password123` | Student Dashboard |

- [ ] **Admin Login** → Should go to `/admin`
- [ ] **Teacher Login** → Should go to `/teacher`
- [ ] **HOD Login** → Should go to `/hod`
- [ ] **Student Login** → Should go to `/student`

### 1.3 Token Management
- [ ] Access token is stored in localStorage
- [ ] Refresh token is stored in localStorage
- [ ] User role is stored in sessionStorage
- [ ] Tokens are sent in Authorization header: `Bearer <token>`
- [ ] Token refresh works when token expires (401 response)

### 1.4 Logout Functionality
- [ ] Logout button in navbar clears tokens
- [ ] After logout, accessing protected routes redirects to login
- [ ] Browser back button doesn't allow access to protected pages

---

## 👨‍💼 PHASE 2: ADMIN DASHBOARD & MANAGEMENT

### 2.1 Admin Dashboard Overview
- [ ] **Dashboard Loads Successfully**
  - [ ] Page loads without errors
  - [ ] All stats cards display data
  - [ ] No console errors

- [ ] **Dashboard Stats Display**
  - [ ] Total Users count is displayed
  - [ ] Users by role breakdown (Admin, Teacher, HOD, Student)
  - [ ] Department statistics shown
  - [ ] Active sessions count shown
  - [ ] Today's date/time displayed correctly

- [ ] **Quick Actions Available**
  - [ ] "Create User" button navigates to user creation
  - [ ] "Manage Classes" button navigates to classes
  - [ ] "Manage Subjects" button navigates to subjects
  - [ ] "View Reports" button navigates to reports

### 2.2 User Management Page
- [ ] **User List Loads**
  - [ ] All users from database are displayed
  - [ ] User list shows columns: Name, Username, Role, Email, Status
  - [ ] Pagination works (if >10 users)
  - [ ] Search functionality filters users by name/username

- [ ] **Create User**
  - [ ] "Add New User" button opens form
  - [ ] Form has fields: First Name, Last Name, Username, Email, Password, Role
  - [ ] Form validation works:
    - [ ] Username must be unique
    - [ ] Email must be valid format
    - [ ] Password has minimum length
    - [ ] Required fields show error if empty
  - [ ] After submit, user appears in list
  - [ ] Backend database is updated (verify with API call)

- [ ] **Edit User**
  - [ ] Click edit icon on user row
  - [ ] Form pre-fills with current user data
  - [ ] Can update: First Name, Last Name, Email, Role, Status
  - [ ] Changes save to backend and update list
  - [ ] Verify in database

- [ ] **Delete User**
  - [ ] Click delete icon on user row
  - [ ] Confirmation modal appears
  - [ ] Confirm deletion removes user from list
  - [ ] User no longer appears in API responses
  - [ ] Verify in database

- [ ] **User Roles**
  - [ ] Can create admin users
  - [ ] Can create teacher users
  - [ ] Can create student users
  - [ ] Can create HOD users
  - [ ] Role field updates correctly in database

### 2.3 Subject Management Page
- [ ] **Subject List Loads**
  - [ ] All subjects from database displayed
  - [ ] Columns: Code, Name, Department, Credits
  - [ ] Search functionality works
  - [ ] Department filter works

- [ ] **Create Subject**
  - [ ] Form opens with: Code, Name, Department, Credits
  - [ ] Subject saves to backend
  - [ ] Appears in list immediately
  - [ ] Appears in teacher dropdowns for assignment

- [ ] **Edit Subject**
  - [ ] Can modify subject details
  - [ ] Changes reflected in database
  - [ ] Dropdown lists update

- [ ] **Delete Subject**
  - [ ] Can remove subjects
  - [ ] Verification it's removed from backend

### 2.4 Class Management Page
- [ ] **Class List Loads**
  - [ ] All classes from database displayed
  - [ ] Columns: Name, Department, Section, Capacity, Status
  - [ ] Filter by department works
  - [ ] Filter by section (A, B) works

- [ ] **Create Class**
  - [ ] Form opens with: Name, Department, Section, Capacity, Year
  - [ ] Class saves to backend
  - [ ] Appears in list and teacher dropdowns

- [ ] **Edit Class**
  - [ ] Can modify class details
  - [ ] Changes reflected

- [ ] **Delete Class**
  - [ ] Can remove classes

- [ ] **Assign Subjects to Class**
  - [ ] Can add subjects to class
  - [ ] Can remove subjects from class
  - [ ] Changes reflected in backend

### 2.5 Reports Page
- [ ] **View Attendance Reports**
  - [ ] Can filter by date range
  - [ ] Can filter by class
  - [ ] Can filter by subject
  - [ ] Report data matches database

- [ ] **Low Attendance Report**
  - [ ] Shows students with <75% attendance
  - [ ] Can export to CSV/PDF (if feature implemented)

- [ ] **Department Statistics**
  - [ ] Breakdown by department
  - [ ] Average attendance per department

---

## 👨‍🏫 PHASE 3: TEACHER DASHBOARD & FEATURES

### 3.1 Teacher Dashboard Overview
- [ ] **Dashboard Loads Successfully**
  - [ ] Page loads without errors
  - [ ] All widgets display correctly
  - [ ] User name displayed: "Welcome, [Teacher Name]"

- [ ] **Dashboard Statistics**
  - [ ] Total Classes assigned shown
  - [ ] Total Students across classes shown
  - [ ] Average Attendance percentage shown
  - [ ] Active Sessions count shown
  - [ ] All numbers are correct (verify via API)

- [ ] **Active Sessions Widget**
  - [ ] Shows currently active sessions (if any)
  - [ ] Displays: Class Name, Subject, Start Time
  - [ ] "Mark Attendance" button available for active session
  - [ ] Session timer shows duration

- [ ] **Recent Sessions/Classes**
  - [ ] Last 5 sessions listed
  - [ ] Shows Subject, Class, Time, Status
  - [ ] Can click to view details

### 3.2 Start/End Session Page
- [ ] **Session Control Panel**
  - [ ] "Select Class" dropdown populated with assigned classes
  - [ ] "Select Subject" dropdown populated with subjects for that class
  - [ ] Both dropdowns fetch from backend correctly

- [ ] **Start Session**
  - [ ] Click "Start Session" button
  - [ ] Backend API called: `POST /api/attendance/sessions/start_session/`
  - [ ] Session status changes to "Active"
  - [ ] Timer starts counting elapsed time
  - [ ] Dropdowns become disabled

- [ ] **Session Display**
  - [ ] Status shows "Session Active" with green dot
  - [ ] Timer display: HH:MM:SS format
  - [ ] Session info shows: Class, Subject, Start Time

- [ ] **End Session**
  - [ ] "End Session" button appears when session active
  - [ ] Click button to end session
  - [ ] Backend API called: `POST /api/attendance/sessions/{id}/end_session/`
  - [ ] Confirmation: "Session ended. X students marked present."
  - [ ] Dropdowns become enabled again
  - [ ] Timer stops

### 3.3 Mark Attendance Page
**CRITICAL: This is core functionality**

- [ ] **Student List Display**
  - [ ] After starting session, students list loads
  - [ ] Shows: Student Name, Student ID, Avatar
  - [ ] All students from class are listed
  - [ ] Student count matches class enrollment

- [ ] **Attendance Marking Interface**
  - [ ] Each student has status buttons: Present/Absent/Late
  - [ ] Can toggle status with button clicks
  - [ ] Selected status highlighted
  - [ ] Count updates: "X students marked"

- [ ] **Mark Attendance Submit**
  - [ ] "Mark Attendance" button available
  - [ ] Click button to submit attendance
  - [ ] Backend API called: `POST /api/attendance/attendance/mark_attendance/`
  - [ ] Records saved to database
  - [ ] Success confirmation shown
  - [ ] Attendance records appear in history

- [ ] **Attendance Data Integrity**
  - [ ] Only students marked as "present" saved with status='present'
  - [ ] Absent students saved with status='absent'
  - [ ] Late students saved with status='late'
  - [ ] Verify in database

- [ ] **Bulk Marking**
  - [ ] Can mark all as present (if bulk button exists)
  - [ ] Can clear all selections
  - [ ] Shortcuts for common marking patterns

### 3.4 View/Edit Attendance Page
- [ ] **Attendance Records List**
  - [ ] All attendance records for teacher's classes displayed
  - [ ] Can filter by: Class, Subject, Date Range
  - [ ] Shows: Date, Student Name, Subject, Status
  - [ ] Pagination works if >20 records

- [ ] **Change Request Workflow**
  - [ ] "Request Change" button visible for absence/late records
  - [ ] Click opens modal:
    - [ ] Reason dropdown (menu, sick, emergency, etc.)
    - [ ] Additional notes field
    - [ ] Submit button
  - [ ] Request saves to backend: `POST /api/attendance/attendance-changes/`
  - [ ] Request status = "pending"
  - [ ] Can see pending requests in list

- [ ] **Pending Approvals**
  - [ ] Can view requests waiting for HOD approval
  - [ ] Shows requestor, reason, date, status
  - [ ] Cannot approve own requests (teacher only submits)

- [ ] **Edit Attendance**
  - [ ] Can change status: Present → Absent → Late
  - [ ] Changes saved to backend
  - [ ] Update reflected in records
  - [ ] Verify in database

### 3.5 Attendance Reports
- [ ] **Subject-wise Report**
  - [ ] Attendance percentage per subject
  - [ ] Shows total classes, present count
  - [ ] Calculates: (Present / Total) * 100

- [ ] **Class-wise Report**
  - [ ] Attendance per class
  - [ ] Student breakdown
  - [ ] Attendance trends

- [ ] **Export Functionality** (if implemented)
  - [ ] Can export to CSV
  - [ ] Can print reports
  - [ ] Data integrity in export

---

## 🧑‍🎓 PHASE 4: STUDENT DASHBOARD & FEATURES

### 4.1 Student Dashboard Overview
- [ ] **Dashboard Loads Successfully**
  - [ ] Page loads without errors
  - [ ] User greeting: "Welcome, [Student Name]"
  - [ ] Student ID displayed

- [ ] **Attendance Statistics**
  - [ ] Overall attendance percentage shown (0-100%)
  - [ ] Status indicator: EXCELLENT (85%+), GOOD (75%+), WARNING (65%+), POOR (<65%)
  - [ ] Color coded appropriately (Green/Blue/Orange/Red)

- [ ] **Attendance Breakdown**
  - [ ] Present count shown
  - [ ] Absent count shown
  - [ ] Late count shown
  - [ ] Total classes count shown
  - [ ] All calculated correctly from database

- [ ] **Enrolled Classes**
  - [ ] List of all enrolled classes shown
  - [ ] Shows: Class Name, Attendance %, Credits
  - [ ] Can filter by subject
  - [ ] Subject dropdown filters correctly

### 4.2 View Attendance Page
- [ ] **Attendance Records Display**
  - [ ] All attendance records for student listed
  - [ ] Shows: Date, Subject, Class, Status, Notes
  - [ ] Can filter by: Date Range, Subject, Status
  - [ ] Pagination for large lists

- [ ] **Status Indicators**
  - [ ] Present: Green ✓
  - [ ] Absent: Red ✗
  - [ ] Late: Orange ⏰
  - [ ] Each status shown correctly

- [ ] **Download Report**
  - [ ] Can download attendance as CSV/PDF
  - [ ] Data integrity in export (if feature exists)

### 4.3 Request Attendance Change Page
- [ ] **Change Request Form**
  - [ ] Can select attendance record to change
  - [ ] Reason dropdown includes:
    - [ ] Sick Leave
    - [ ] Medical Emergency
    - [ ] Urgent Work
    - [ ] Other
  - [ ] Additional notes field for details
  - [ ] Submit button sends request

- [ ] **Request Submission**
  - [ ] Request saved: `POST /api/attendance/attendance-changes/`
  - [ ] Status = "pending"
  - [ ] Confirmation message shown
  - [ ] Request appears in pending list

- [ ] **Pending Requests View**
  - [ ] Can see submitted requests
  - [ ] Shows: Date, Reason, Status (Pending/Approved/Rejected), Notes
  - [ ] If approved: Status changes to "approved"
  - [ ] If rejected: Status shows "rejected" with HOD notes

- [ ] **Approved Changes Reflect**
  - [ ] When HOD approves, status on dashboard updates
  - [ ] Attendance percentage recalculated
  - [ ] Dashboard refreshes to show new percentage

### 4.4 Notifications
- [ ] **Notification Center**
  - [ ] Notifications displayed on dashboard
  - [ ] Shows recent notifications:
    - [ ] Attendance change approved
    - [ ] Attendance change rejected
    - [ ] Low attendance warning
    - [ ] System announcements
  - [ ] Can click to view full message

- [ ] **Notification Icons**
  - [ ] Badge shows unread count
  - [ ] Clicking bell icon opens notification panel
  - [ ] Can mark as read
  - [ ] Can clear notification

---

## 👔 PHASE 5: HOD DASHBOARD & FEATURES

### 5.1 HOD Dashboard Overview
- [ ] **Dashboard Loads Successfully**
  - [ ] Page loads without errors
  - [ ] All widgets load with data
  - [ ] User greeting: "Welcome, [HOD Name]"

- [ ] **Department Statistics**
  - [ ] Total teachers in department
  - [ ] Total students in department
  - [ ] Total classes in department
  - [ ] Average attendance percentage
  - [ ] Active sessions count
  - [ ] Pending approval requests count

- [ ] **Quick Metrics**
  - [ ] Low attendance students count (with threshold setting)
  - [ ] Pending approvals badge
  - [ ] Department attendance trend

- [ ] **Quick Actions**
  - [ ] "Approve Changes" button links to approval page
  - [ ] "View Analytics" button links to analytics
  - [ ] "Manage Classes" button (if permission)
  - [ ] "View Reports" button

### 5.2 Approve Attendance Changes Page
**CRITICAL: This is HOD's main workflow**

- [ ] **Pending Requests List**
  - [ ] All pending attendance change requests displayed
  - [ ] Shows: Student Name, Date, Reason, Status, Submitted Date
  - [ ] Can filter by: Status (Pending/Approved/Rejected), Student, Date
  - [ ] Pagination for large lists
  - [ ] Records fetched from: `GET /api/attendance/attendance-changes/pending/`

- [ ] **Approve Request**
  - [ ] Click "Approve" button on request
  - [ ] Modal appears with:
    - [ ] Request details displayed
    - [ ] Optional notes field for HOD comment
    - [ ] "Approve" and "Cancel" buttons
  - [ ] Click "Approve"
  - [ ] Backend API called: `POST /api/attendance/attendance-changes/{id}/approve/`
  - [ ] Request status changes to "approved"
  - [ ] Removed from pending list
  - [ ] Student notified (notification created)

- [ ] **Reject Request**
  - [ ] Click "Reject" button on request
  - [ ] Modal appears with:
    - [ ] Reason dropdown (Already Present/Incomplete Info/Not Eligible/Other)
    - [ ] Notes field (mandatory when rejecting)
    - [ ] "Reject" and "Cancel" buttons
  - [ ] Click "Reject"
  - [ ] Backend API called: `POST /api/attendance/attendance-changes/{id}/reject/`
  - [ ] Request status changes to "rejected"
  - [ ] Reason/notes stored in database
  - [ ] Student notified

- [ ] **Bulk Actions** (if implemented)
  - [ ] Can select multiple requests
  - [ ] Bulk approve/reject available
  - [ ] Confirmation before bulk action

### 5.3 Department Analytics Page
- [ ] **Class-wise Analytics**
  - [ ] List of all classes in department
  - [ ] Shows per class:
    - [ ] Class name and section
    - [ ] Total strength
    - [ ] Current attendance %
    - [ ] Attendance trend (up/down arrow)
    - [ ] Last updated date

- [ ] **Subject-wise Analytics**
  - [ ] List of all subjects offered
  - [ ] Shows per subject:
    - [ ] Subject code and name
    - [ ] Average attendance across all classes
    - [ ] Number of sessions held
    - [ ] Number of students enrolled

- [ ] **Low Attendance Students**
  - [ ] List of students with attendance < 75% (configurable threshold)
  - [ ] Shows: Name, Class, Current Attendance %, Gap from threshold
  - [ ] Can click to view detailed attendance
  - [ ] Can take action (notify, warning letter, etc.)

- [ ] **Teacher Performance**
  - [ ] Statistics per teacher:
    - [ ] Classes assigned
    - [ ] Total sessions held
    - [ ] Average student attendance in their classes
    - [ ] Number of attendance changes submitted

- [ ] **Charts & Visualizations** (if implemented)
  - [ ] Attendance trend over time (line chart)
  - [ ] Department vs college average (comparison)
  - [ ] Class-wise comparison (bar chart)
  - [ ] Status distribution (pie chart)

- [ ] **Export Analytics** (if implemented)
  - [ ] Can export charts to PDF
  - [ ] Can download data as CSV
  - [ ] Can print reports

### 5.4 Additional HOD Features
- [ ] **Manage Classes** (if permission)
  - [ ] Can view/edit classes in department
  - [ ] Can assign subjects to classes
  - [ ] Can manage class sections

- [ ] **Manage Teachers** (if permission)
  - [ ] Can view teachers in department
  - [ ] Can assign classes to teachers
  - [ ] Can view teacher workload

---

## 🔗 PHASE 6: BACKEND API & DATABASE VERIFICATION

### 6.1 API Connectivity
- [ ] **All API Endpoints Responding**
  - [ ] Auth endpoints: Login, Refresh Token, Get Current User
  - [ ] User endpoints: List, Create, Read, Update, Delete
  - [ ] Session endpoints: List, Create, Start, End, Get Active
  - [ ] Attendance endpoints: Mark, List, Update, Statistics
  - [ ] Attendance Change endpoints: List, Create, Approve, Reject, Get Pending
  - [ ] All endpoints returning correct status codes (200, 201, 400, 401, 404, etc.)

- [ ] **API Error Handling**
  - [ ] 401 Unauthorized when no token
  - [ ] 403 Forbidden when insufficient permissions
  - [ ] 400 Bad Request for invalid data
  - [ ] 404 Not Found for non-existent resources
  - [ ] 500 Server Error with meaningful message

- [ ] **API Response Format**
  - [ ] All responses are JSON
  - [ ] List endpoints include pagination (results, count, next, previous)
  - [ ] Error responses include error message
  - [ ] Timestamps in ISO 8601 format

### 6.2 Database Integrity
- [ ] **User Records**
  - [ ] All test users created in database
  - [ ] Passwords hashed (not stored as plaintext)
  - [ ] Roles correctly assigned
  - [ ] Email unique constraint enforced

- [ ] **Class Records**
  - [ ] Classes have department foreign key
  - [ ] Class name, section, capacity stored correctly
  - [ ] Relationships to students working

- [ ] **Subject Records**
  - [ ] Subjects linked to department
  - [ ] Subject code unique
  - [ ] Credits stored correctly

- [ ] **Session Records**
  - [ ] Sessions linked to teacher, class, subject
  - [ ] Start/end times recorded correctly
  - [ ] is_active flag updates correctly
  - [ ] Total students calculated from class

- [ ] **Attendance Records**
  - [ ] Linked to session, student, subject
  - [ ] Status values: present, absent, late
  - [ ] Marked timestamp recorded
  - [ ] Cannot have duplicate attendance for same student in same session

- [ ] **Attendance Change Records**
  - [ ] Linked to attendance record, student, approver (HOD)
  - [ ] Status: pending, approved, rejected
  - [ ] Reason stored
  - [ ] Notes/comments stored
  - [ ] Timestamps for request and decision

### 6.3 Authentication & Authorization
- [ ] **JWT Token Generation**
  - [ ] Login returns access token + refresh token
  - [ ] Tokens have correct expiration times
  - [ ] Token claims include user ID, username, role

- [ ] **Token Validation**
  - [ ] Invalid token rejected with 401
  - [ ] Expired token triggers refresh flow
  - [ ] Refresh token works when access expires

- [ ] **Role-based Access Control**
  - [ ] Admin can access all endpoints
  - [ ] Teacher can only access own classes/sessions
  - [ ] Student can only access own records
  - [ ] HOD can access department data
  - [ ] 403 returned when access denied

---

## 📊 PHASE 7: CROSS-FUNCTIONAL FEATURES

### 7.1 Multi-role Workflow: Student Request → HOD Approval
This test ensures end-to-end integration works

**Scenario: Student requests attendance change for absent day**

1. **Student Action**
   - [ ] Student logs in (student1 / password123)
   - [ ] Goes to "View/Edit Attendance"
   - [ ] Finds an absent record
   - [ ] Clicks "Request Change"
   - [ ] Enters reason: "Sick Leave"
   - [ ] Adds note: "Had fever"
   - [ ] Submits request
   - [ ] Request saved with status="pending"

2. **Notification**
   - [ ] Student receives notification of submitted request
   - [ ] HOD receives notification of pending request

3. **HOD Action**
   - [ ] HOD logs in (hod1 / password123)
   - [ ] Goes to "Approve Changes"
   - [ ] Sees student's pending request
   - [ ] Clicks "Approve"
   - [ ] Adds HOD note: "Approved with documentation"
   - [ ] Confirms approval
   - [ ] Request status → "approved"

4. **Student Sees Update**
   - [ ] Student logs back in
   - [ ] Attendance record still shows marked date
   - [ ] Request status shows "approved"
   - [ ] Attendance percentage updates if applicable
   - [ ] Receives notification of approval

5. **Database Verification**
   - [ ] AttendanceChange record in DB has:
     - [ ] status="approved"
     - [ ] approved_at timestamp
     - [ ] approved_by pointing to HOD user
     - [ ] notes from HOD

### 7.2 Multi-role Workflow: Teacher Session → Student Views
**Scenario: Teacher starts session, marks attendance, student sees it**

1. **Teacher Starts Session**
   - [ ] Teacher logs in (teacher1 / password123)
   - [ ] Goes to "Start/End Session"
   - [ ] Selects class and subject
   - [ ] Clicks "Start Session"
   - [ ] Session created in backend

2. **Teacher Marks Attendance**
   - [ ] Selects students
   - [ ] Marks present/absent/late
   - [ ] Clicks "Mark Attendance"
   - [ ] Records saved to database

3. **Student Views Attendance**
   - [ ] Student logs in
   - [ ] Goes to "View Attendance"
   - [ ] Today's attendance record visible
   - [ ] Status shows correctly (present/absent/late)
   - [ ] Date and subject match

4. **Statistics Update**
   - [ ] Student dashboard attendance % updated
   - [ ] Breakdown count updated
   - [ ] If marked present: percentage increases
   - [ ] If marked absent: count increases

### 7.3 Multi-role Workflow: Admin Creates User → User Logs In
**Scenario: Admin creates teacher account, teacher can login**

1. **Admin Creates User**
   - [ ] Admin logs in
   - [ ] Goes to "Manage Users"
   - [ ] Clicks "Add New User"
   - [ ] Fills: Name="John", Username="john_teacher", Role="Teacher", Password="test123"
   - [ ] Submits form
   - [ ] User appears in list

2. **New User Login**
   - [ ] Logout from admin
   - [ ] Login as john_teacher / test123
   - [ ] Successfully authenticated
   - [ ] Redirected to teacher dashboard
   - [ ] Can access all teacher features

3. **Database Verification**
   - [ ] User record in database with correct role
   - [ ] Password hashed
   - [ ] Email validation passed
   - [ ] User can access role-specific endpoints only

---

## ⚠️ PHASE 8: KNOWN ISSUES & MISSING FEATURES

### 8.1 Known Limitations
- [ ] **Face Recognition Not Implemented**
  - [ ] Backend infrastructure ready
  - [ ] Frontend integration pending
  - [ ] ML model not deployed
  - **Impact:** Manual attendance marking required

- [ ] **Pagination Not Fully Implemented**
  - [ ] API supports pagination (page_size parameter)
  - [ ] Frontend may not implement it for all list views
  - [ ] **Impact:** Large datasets may load slowly
  - **Fix:** Implement pagination UI in list components

- [ ] **Performance Optimization Pending**
  - [ ] Could use React Query / SWR for caching
  - [ ] Could optimize API calls with debouncing
  - [ ] Could implement lazy loading
  - **Impact:** Dashboard may be slow with lots of data

### 8.2 Missing Features to Implement

| Feature | Status | Priority | Impact |
|---------|--------|----------|--------|
| Bulk attendance marking | Not implemented | Medium | Teachers want quick import |
| SMS/Email notifications | Not implemented | Low | Students/staff need updates |
| Offline mode | Not implemented | Low | Work without internet |
| Mobile app | Not implemented | Medium | Access from phone |
| Advanced search | Partially | Low | Find specific records |
| Bulk user import | Not implemented | Medium | Import 100+ users at once |
| Attendance export to PDF | Not implemented | Low | Print formatted reports |
| Student app (Flutter/React Native) | Not implemented | High | For students to check attendance |
| Biometric/RFID integration | Not implemented | High | Automated attendance |
| Camera integration | Partially | High | Live face detection |
| Department approval workflow | Implemented | - | HOD can approve changes |
| Class schedule management | Partially | Medium | Manage timetable |
| Holiday/leave management | Not implemented | Medium | Mark holidays |

### 8.3 Error Scenarios to Test

- [ ] **Network Failure During Login**
  - [ ] Show appropriate error message
  - [ ] Can retry login

- [ ] **Token Expiry During Session**
  - [ ] Automatically refresh token
  - [ ] Continue without interruption
  - [ ] If refresh fails, logout and redirect to login

- [ ] **Concurrent Session from Different Device**
  - [ ] Both sessions valid (or allow logout from other)
  - [ ] No data corruption

- [ ] **Mark Attendance After Session Ended**
  - [ ] Cannot mark after session finalized
  - [ ] Error message: "Session already closed"

- [ ] **Delete User with Active Sessions**
  - [ ] Cannot delete (or cascade delete)
  - [ ] Error or warning message

- [ ] **Database Connection Loss**
  - [ ] Frontend shows error
  - [ ] Retry mechanism
  - [ ] Graceful degradation

---

## 📋 PHASE 9: PERFORMANCE & LOAD TESTING

### 9.1 Frontend Performance
- [ ] **Page Load Times**
  - [ ] Login page: <2 seconds
  - [ ] Dashboard: <3 seconds
  - [ ] List pages: <4 seconds
  - [ ] Modal openings: <0.5 seconds

- [ ] **Responsiveness**
  - [ ] Buttons respond to clicks within 200ms
  - [ ] Forms submit within 1 second
  - [ ] Dropdowns open within 300ms
  - [ ] No UI freezing

### 9.2 Browser Compatibility
- [ ] **Chrome** (Latest)
  - [ ] All features work
  - [ ] No console errors
  - [ ] Responsive design working

- [ ] **Firefox** (Latest)
  - [ ] All features work
  - [ ] No compatibility issues

- [ ] **Safari** (Latest)
  - [ ] All features work
  - [ ] CSS rendering correct

- [ ] **Edge** (Latest)
  - [ ] All features work

### 9.3 Mobile Responsiveness
- [ ] **Mobile View** (375px width)
  - [ ] Navigation collapse to hamburger menu
  - [ ] Forms stack vertically
  - [ ] Tables scroll horizontally
  - [ ] Touch targets at least 44x44px

- [ ] **Tablet View** (768px width)
  - [ ] Two-column layouts
  - [ ] Cards responsive
  - [ ] Grid adjusts properly

---

## 🔒 PHASE 10: SECURITY TESTING

### 10.1 Authentication Security
- [ ] **Password Security**
  - [ ] Passwords not stored plaintext in database
  - [ ] Passwords not logged
  - [ ] Minimum password length enforced
  - [ ] Cannot use simple passwords (e.g., "123456")

- [ ] **Token Security**
  - [ ] Tokens not stored in URL
  - [ ] Tokens use HTTPS only (in production)
  - [ ] CORS properly configured
  - [ ] Token expiration enforced

- [ ] **Session Security**
  - [ ] Sessions cannot be hijacked
  - [ ] Logout clears all tokens
  - [ ] Cannot access protected routes without token

### 10.2 Data Validation
- [ ] **Input Validation**
  - [ ] HTML injection prevented (sanitized input)
  - [ ] SQL injection prevented (parameterized queries)
  - [ ] XSS attacks prevented

- [ ] **Authorization**
  - [ ] Users cannot access other users' data
  - [ ] Students cannot modify attendance
  - [ ] Teachers cannot create other teachers
  - [ ] Proper role-based access control

---

## ✅ TEST EXECUTION SUMMARY

### Test Execution Tracking

```
Phase 1: Authentication ............ [ ] Not Started [ ] In Progress [ ] Complete
Phase 2: Admin Dashboard ........... [ ] Not Started [ ] In Progress [ ] Complete
Phase 3: Teacher Dashboard ......... [ ] Not Started [ ] In Progress [ ] Complete
Phase 4: Student Dashboard ......... [ ] Not Started [ ] In Progress [ ] Complete
Phase 5: HOD Dashboard ............. [ ] Not Started [ ] In Progress [ ] Complete
Phase 6: Backend & Database ........ [ ] Not Started [ ] In Progress [ ] Complete
Phase 7: Cross-functional Workflows [ ] Not Started [ ] In Progress [ ] Complete
Phase 8: Known Issues .............. [ ] Not Started [ ] In Progress [ ] Complete
Phase 9: Performance Testing ....... [ ] Not Started [ ] In Progress [ ] Complete
Phase 10: Security Testing ......... [ ] Not Started [ ] In Progress [ ] Complete
```

### Overall Results

**Total Test Cases:** _____ / 150+  
**Passed:** _____ (____%)  
**Failed:** _____ (____%)  
**Blocked:** _____ (____%)  
**Not Tested:** _____ (____%)  

**Critical Issues Found:** _____  
**High Priority Issues:** _____  
**Medium Priority Issues:** _____  
**Low Priority Issues:** _____  

---

## 📝 TESTING NOTES & OBSERVATIONS

### Environment Details
- **Frontend URL:** http://localhost:5173/
- **Backend URL:** http://localhost:8000/
- **Database:** PostgreSQL (assumed)
- **Test Date:** _____________
- **Tester Name:** _____________
- **Test Device:** _____________
- **Browser:** _____________
- **Network:** _____________

### Issue Tracker

| # | Issue | Severity | Phase | Status | Notes |
|---|-------|----------|-------|--------|-------|
| 1 | | | | [ ] Open [ ] Fixed [ ] Verified | |
| 2 | | | | [ ] Open [ ] Fixed [ ] Verified | |
| 3 | | | | [ ] Open [ ] Fixed [ ] Verified | |

### Recommendations for Next Testing Cycle
1. ___________________________
2. ___________________________
3. ___________________________

---

## 🎯 NEXT STEPS

### After Testing Completion
1. [ ] Create bug report for any failures
2. [ ] Prioritize issues by severity
3. [ ] Assign fixes to developers
4. [ ] Schedule regression testing
5. [ ] Prepare deployment checklist
6. [ ] Create user documentation
7. [ ] Plan training sessions

### Before Production Deployment
- [ ] All critical/high issues resolved
- [ ] Regression testing completed
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] User acceptance testing approved
- [ ] Data migration tested
- [ ] Backup/restore tested
- [ ] Disaster recovery plan verified

---

**Testing Checklist Version:** 1.0  
**Last Updated:** December 10, 2025  
**Status:** Ready for Use  
**Next Review:** After completion of first test cycle
