 # SYSTEM REQUIREMENT SPECIFICATION
## AI-Powered Attendance System (Camera-Based)

**Document Version:** 1.0  
**Date:** December 10, 2025  
**Project:** Attendance and Classroom Behavior Monitoring System

---

## 1. COLLEGE STRUCTURE

### Departments (4)
1. **Computer**
2. **Civil**
3. **Architecture**
4. **Electronics, Communication & Automation**

### Department Hierarchy
Each Department Has:
- **1 HOD** (Head of Department)
- **Multiple Teachers**
- **Students across 8 Semesters**
- **Multiple Subjects per Semester**

### Cross-Department Teaching
- Teachers can teach subjects even outside their own department
- Subject assignments are flexible across departments
- HODs manage all subjects in their department regardless of which teacher teaches them

---

## 2. USER ROLES & PERMISSIONS

### (A) ADMIN - God User

**Admin is the supreme user with complete system control.**

#### Admin Can:
- ✅ Create/Edit/Delete Departments
- ✅ Create/Edit/Delete Semesters
- ✅ Create/Edit/Delete Users (HOD/Teacher/Student)
- ✅ Assign HOD to department
- ✅ Create subjects for each semester
- ✅ Assign teachers to subjects
- ✅ View attendance of ANY:
  - Department
  - Semester
  - Subject
  - Teacher
  - Student

#### Admin Capabilities:
- **User Management:** Full CRUD operations on all user types
- **Department Management:** Complete control over department structure
- **Subject Assignment:** Assign any teacher to any subject (cross-department)
- **Global Reports:** Access all attendance data system-wide
- **System Configuration:** Configure all system settings

---

### (B) HOD (Head of Department)

**HOD can control only their department.**

#### HOD Can:
- ✅ Manage subjects of ALL semesters of their department
- ✅ Manage attendance of (each semester):
  - All students
  - All teachers
  - All semesters
  - All subjects (even if taught by teacher from another department)
- ✅ View and export reports
- ✅ Monitor low-attendance students
- ✅ Approve/reject attendance change requests
- ✅ Generate department-wide analytics

#### HOD Cannot:
- ❌ Manage other departments
- ❌ View data from other departments
- ❌ Create/delete departments
- ❌ Assign HODs to other departments

#### HOD Scope:
- **Department-Level Only:** All operations limited to their assigned department
- **Cross-Teacher Visibility:** Can see all subjects in their department regardless of which teacher teaches
- **Semester Management:** Oversee all 8 semesters within their department

---

### (C) TEACHER

**Teacher can control only what they teach.**

#### Teacher Can:
- ✅ **Start/End live class session** (CRITICAL for AI camera activation)
- ✅ See the list of students enrolled in each subject they teach
- ✅ See attendance history of their subject
- ✅ Manually adjust attendance (only for their subject)
- ✅ View per-day attendance logs
- ✅ View attendance percentage of each student
- ✅ Mark attendance manually if AI camera fails
- ✅ Review and confirm AI-detected attendance
- ✅ Export attendance reports for their subjects

#### Teacher Cannot:
- ❌ View other subjects they don't teach
- ❌ View students from other subjects
- ❌ See entire department data
- ❌ Approve attendance change requests (only HOD can)
- ❌ Modify attendance of other teachers' subjects

#### Teacher Scope:
- **Subject-Level Only:** Limited to subjects assigned to them
- **Session Control:** Must manually start/end sessions for AI camera
- **Cross-Department Teaching:** Can teach in multiple departments but only see their assigned subjects

---

### (D) STUDENT

**Student can ONLY see their own data.**

#### Student Can:
- ✅ View their attendance % for each subject
- ✅ View day-to-day presence/absence/late status
- ✅ View total classes conducted per subject
- ✅ Download attendance history
- ✅ See which teacher took the class
- ✅ See warnings if attendance falls below threshold (e.g., 75%)
- ✅ Request attendance corrections (pending HOD approval)
- ✅ View notifications about attendance issues

#### Student Cannot:
- ❌ View other students' attendance
- ❌ Modify their own attendance directly
- ❌ Access teacher or HOD panels
- ❌ See department-level data

#### Student Scope:
- **Self-Only:** Complete isolation to their own records
- **Read-Only (mostly):** Can view data, request changes, but cannot directly modify
- **Alerts:** Receive automated warnings for low attendance

---

## 3. AI CAMERA-BASED ATTENDANCE LOGIC

### Camera Setup
- Camera will be mounted at the corner of the classroom
- AI-powered face detection and recognition
- Real-time attendance logging
- Automatic late entry detection

### How Attendance is Taken

#### Step 1: Session Initialization
**Teacher opens the system → picks subject → presses Start Session**

Backend records:
- ✅ Start time
- ✅ Subject
- ✅ Teacher
- ✅ Classroom
- ✅ Expected student list

#### Step 2: AI Camera Activation
**AI Camera activates scanning:**
- 🔍 Detects faces in classroom
- 🤖 Matches with student database (face embeddings)
- 📝 Logs attendance automatically
- ⏰ Detects late entry (timestamp comparison)
- 🔄 Updates attendance in real time

#### Step 3: Real-Time Monitoring
- Students entering late are automatically marked as "Late"
- System continuously updates attendance status
- Teacher can view live attendance list during session

#### Step 4: Session Closure
**Teacher presses End Session**
- Final attendance is saved & locked
- Late entries after end time are not counted
- Attendance summary generated
- Students and HOD can view final data

### Why Start/End Session is Required

**Critical Reasons:**
1. **Different subjects have different time slots** → System cannot predict schedule
2. **Time is not fixed** → Classes may start early or late
3. **The system cannot auto-guess which class is running** → Multiple subjects possible
4. **Teacher must intentionally confirm that the class has started** → Prevents false attendance
5. **Break timings differ** → System needs explicit boundaries
6. **Class duration changes per subject** → No fixed duration assumption

**Manual Control is Essential:**
- Prevents AI camera from running 24/7
- Ensures correct subject is being tracked
- Allows flexibility in class scheduling
- Gives teacher control over attendance boundaries

---

## 4. CLASS SCHEDULE RULES

### College Schedule
- **Operating Days:** Sunday to Friday (6 days/week)
- **Weekly Off:** Saturday

### Schedule Complexity
- ❌ **No Fixed Timetable Automation** due to:
  - Each day has different time frames
  - Break timings differ daily
  - Class duration changes per subject
  - Different subjects taught at different times
  - Teachers can teach across departments
  - Room assignments may vary

### System Logic
**Because of this complexity:**
- ✅ System **CANNOT** rely on timetable for attendance
- ✅ System **MUST** rely on Teacher "Start/End Session" button
- ✅ AI camera activates **ONLY** when teacher starts session
- ✅ Attendance is tied to **live sessions**, not scheduled slots

### Flexibility Benefits
- Teachers can start class at any time
- No rigid time constraints
- Accommodates makeup classes
- Handles schedule changes dynamically
- Works with guest lectures

---

## 5. FEATURES (PER ROLE)

### ADMIN PANEL FEATURES

#### Dashboard
- 📊 Total departments
- 👥 Total teachers
- 🎓 Total students
- 📚 Total subjects
- 📈 Attendance summaries (system-wide)
- ⚠️ Low-attendance alerts across all departments
- 📅 Recent sessions log

#### Management
**Department Management:**
- Create/Edit/Delete departments
- View department statistics
- Assign HODs to departments

**Semester Management:**
- Create/Edit/Delete semesters (1-8)
- Associate semesters with departments

**Subject Management:**
- Create/Edit/Delete subjects
- Assign subjects to semesters
- Set subject codes and descriptions

**User Management:**
- Create teacher/student/HOD accounts
- Assign roles and permissions
- Manage user status (active/inactive)
- Reset passwords
- Assign subjects to teachers
- Assign students to semesters

#### Reports
- 📊 Department-wise attendance
- 📊 Semester-wise attendance
- 📊 Subject-wise attendance
- 📊 Teacher-wise session statistics
- 📊 Student-wise attendance records
- 💾 Export to PDF/Excel
- 📅 Date range filtering
- 🔍 Advanced search and filtering

---

### HOD PANEL FEATURES

#### Dashboard
- 📊 Overview of department attendance
- ⚠️ Low-attendance students list
- 📈 Semester-wise statistics
- 👥 Teacher performance metrics
- 📅 Recent sessions in department

#### Department Management
- ✅ Manage ALL semesters (1-8) of their department
- ✅ Manage ALL subjects in their department
- ✅ Manage attendance of all students in their department
- ✅ View all teachers teaching in their department
- ✅ Monitor cross-department teachers

#### Attendance Management
- View attendance by:
  - Semester
  - Subject
  - Student
  - Teacher
  - Date range
- Approve/Reject attendance change requests
- View pending change requests
- Export attendance data

#### Reports & Analytics
- 📊 Department-level analytics
- 📊 Semester-wise breakdown
- 📊 Subject-wise analysis
- 📊 Student performance reports
- 📊 Low-attendance tracking
- 💾 Export reports (PDF/Excel)

---

### TEACHER PANEL FEATURES

#### Dashboard
- 📅 Today's schedule (if added)
- 📚 Subjects taught by teacher
- 📊 Recent sessions
- 📈 Attendance statistics for their subjects
- ⏰ Upcoming classes (if scheduled)

#### Core Feature: Session Management
**Start Session:**
- Select subject
- Select classroom
- Confirm student list
- Activate AI camera
- Begin attendance tracking

**End Session:**
- Stop AI camera
- Finalize attendance
- Review detected students
- Manually adjust if needed
- Save and lock attendance

#### Attendance Management
- 📋 Real-time Attendance List during session
- ✏️ Manually mark/adjust attendance
- 👥 View student enrollment per subject
- 📊 View attendance percentage per student
- 📅 Per-day attendance logs
- 📈 Attendance history for each subject
- 💾 Export attendance (PDF/Excel)

#### Student Management
- View students enrolled in each subject they teach
- View student details (name, roll number, semester)
- View student attendance trends
- Identify low-attendance students

---

### STUDENT PANEL FEATURES

#### Dashboard
- 📊 Attendance % per subject
- 🎯 Overall attendance health indicator:
  - 🟢 **Good** (≥75%)
  - 🟡 **Average** (60-74%)
  - 🔴 **Low** (<60%)
- ⚠️ Attendance warnings
- 📚 Subjects enrolled
- 📅 Recent attendance records

#### Attendance Details
- 📅 Day-by-day attendance timeline
- 📊 Summary per subject:
  - Total classes conducted
  - Classes attended
  - Classes missed
  - Late entries
  - Attendance percentage
- 👨‍🏫 Which teacher took the class
- ⏰ Class date and time
- 📝 Attendance status (Present/Absent/Late)

#### Features
- 💾 Download attendance history (PDF/Excel)
- 📧 Request attendance corrections (pending HOD approval)
- 🔔 View notifications about attendance issues
- 📊 View attendance trends over time
- ⚠️ Automatic warnings if attendance falls below threshold

---

## 6. DATABASE STRUCTURE (Explained Normally)

### Core Entities

#### Departments
The system stores information about each department:
- Department name (Computer, Civil, Architecture, ECA)
- Department code
- Assigned HOD
- Creation date
- Status (active/inactive)

#### Semesters
Each semester record includes:
- Semester number (1-8)
- Department it belongs to
- Academic year
- Start and end dates
- Status

#### Subjects
For each subject, store:
- Subject name
- Subject code
- Semester it belongs to
- Department
- Credits/hours
- Description
- Assigned teachers

#### Users (All Roles)
Store user information:
- Username
- Email
- Password (encrypted)
- Role (admin/HOD/teacher/student)
- First name, last name
- Department (for HOD, teacher, student)
- Semester (for students)
- Status (active/inactive)
- Face embedding (for students - AI recognition)
- Profile picture

#### Teacher-to-Subject Assignment
Track which teachers teach which subjects:
- Teacher
- Subject
- Department (can be different from teacher's home department)
- Assignment date
- Status (active/inactive)

#### Student Enrollment per Semester
Track student enrollment:
- Student
- Semester
- Department
- Enrollment date
- Status

#### Attendance Records
Store each attendance entry:
- Student
- Session (links to live session)
- Subject
- Date and time
- Status (Present/Absent/Late)
- Marked by (teacher or AI)
- Is AI-detected (true/false)
- Late entry time (if applicable)

#### Live Session Logs
Record every class session:
- Teacher who started session
- Subject
- Classroom
- Start time
- End time
- Is active (true/false)
- Total students expected
- Total students present
- AI camera status

#### Attendance Change Requests
Track correction requests:
- Student who requested
- Attendance record to modify
- Current status
- Requested status
- Reason for change
- Request date
- Approval status (pending/approved/rejected)
- HOD who approved/rejected
- Approval date

#### Notifications
Store system notifications:
- Recipient (student/teacher/HOD)
- Title
- Message
- Type (attendance warning, low attendance, approval, etc.)
- Is read (true/false)
- Created date

#### Face Embeddings
Store AI recognition data:
- Student
- Embedding vector (AI face data)
- Image file
- Upload date
- Is active (true/false)

---

## 7. CAMERA-AI MODULE WORKFLOW

### Step-by-Step Process

#### Step 1: Teacher Starts Class Session
**Action:** Teacher logs in → Selects subject → Clicks "Start Session"

**Backend Processing:**
- Create session record in database
- Capture start time
- Link teacher, subject, classroom
- Fetch enrolled student list
- Activate AI camera module
- Set session status to "Active"

#### Step 2: System Activates Classroom Camera
**Action:** Camera begins real-time face detection

**Technical Process:**
- AI camera module starts video stream
- Frame extraction begins (multiple frames per second)
- Face detection algorithm runs on each frame
- Detected faces extracted as embeddings

#### Step 3: AI Detects Faces
**Action:** Face detection and extraction

**Processing:**
- Uses computer vision algorithms (OpenCV, dlib, or similar)
- Detects all faces in frame
- Extracts face region
- Generates face embedding (512-dimensional vector)
- Handles multiple faces simultaneously

#### Step 4: Matches with Known Student Faces
**Action:** Face recognition matching

**Matching Process:**
- Compare detected face embedding with stored student embeddings
- Use cosine similarity or Euclidean distance
- Set confidence threshold (e.g., 95%)
- Identify student if match confidence is high
- Reject if no match or low confidence

#### Step 5: Logs Attendance
**Action:** Automatic attendance recording

**System Logs:**
- ✅ **Present:** Student detected within first 10 minutes of session start
- ⏰ **Late:** Student detected after 10 minutes of session start
- ❌ **Absent:** Student not detected throughout session

**Real-Time Updates:**
- Update attendance record in database
- Display on teacher's live attendance screen
- Timestamp each detection
- Handle multiple detections (use first detection time)

#### Step 6: Detects Late Entry
**Action:** Late arrival detection

**Logic:**
- Check detection time vs session start time
- If detection time > (start time + grace period [10 mins]), mark as "Late"
- Record exact late entry time
- Update attendance status
- Notify teacher of late arrival

#### Step 7: Updates Attendance in Real Time
**Action:** Live dashboard updates

**Real-Time Features:**
- Teacher sees live list of detected students
- Green checkmark for present
- Yellow indicator for late
- Red/gray for not detected yet
- Update without page refresh (WebSocket or polling)

#### Step 8: Teacher Ends Class
**Action:** Teacher clicks "End Session"

**Backend Processing:**
- Capture end time
- Stop AI camera module
- Finalize attendance records
- Mark all undetected students as "Absent"
- Lock attendance (prevent AI changes)
- Set session status to "Completed"

#### Step 9: Attendance is Stored
**Action:** Data persistence

**Storage:**
- All attendance records saved to database
- Session summary generated
- Statistics calculated (present count, absent count, late count)
- Notification sent to students with low attendance

#### Step 10: Teacher Can Review & Adjust
**Action:** Manual review and correction

**Teacher Actions:**
- View final attendance list
- Manually correct if AI made mistakes
- Mark student present if AI missed them
- Change status from late to present (with reason)
- Add notes/comments
- Confirm and finalize

#### Step 11: Students & HOD Can See Final Data
**Action:** Data visibility

**Access:**
- Students: View their own attendance status
- HOD: View entire session attendance
- Admin: View all session data
- Reports generated automatically

---

## 8. AI CAMERA MODULE - TECHNICAL SPECIFICATIONS

### Face Detection
- **Algorithm:** Haar Cascade, MTCNN, or RetinaFace
- **Processing:** Real-time frame processing
- **Frame Rate:** 5-10 FPS (sufficient for attendance)

### Face Recognition
- **Algorithm:** FaceNet, ArcFace, or DeepFace
- **Embedding Size:** 512-dimensional vectors
- **Similarity Metric:** Cosine similarity or Euclidean distance
- **Threshold:** 95% confidence for positive match

### Hardware Requirements
- **Camera:** 1080p HD camera with good lighting
- **Processing:** GPU recommended (NVIDIA CUDA for faster processing)
- **Storage:** Store face embeddings, not raw images (privacy)

### Privacy & Security
- Store face embeddings only, not raw face images
- Encrypt stored embeddings
- GDPR compliance for face data
- Students can opt-out (manual attendance alternative)

---

## 9. SYSTEM WORKFLOW SUMMARY

### Admin Workflow
1. Create departments
2. Create semesters (1-8) for each department
3. Create subjects for each semester
4. Create user accounts (HOD, teachers, students)
5. Assign HOD to departments
6. Assign teachers to subjects
7. Assign students to semesters
8. Monitor system-wide attendance
9. Generate global reports

### HOD Workflow
1. View department dashboard
2. Monitor low-attendance students
3. Review attendance change requests
4. Approve/reject change requests
5. Generate department reports
6. Manage subjects in their department
7. Export attendance data

### Teacher Workflow
1. View assigned subjects
2. Start class session
3. Select subject
4. AI camera activates
5. Monitor real-time attendance
6. End session
7. Review and adjust attendance
8. Finalize attendance
9. Generate subject reports

### Student Workflow
1. View dashboard
2. Check attendance % per subject
3. View day-by-day attendance
4. Receive low-attendance warnings
5. Request attendance corrections (if needed)
6. Download attendance history

---

## 10. CRITICAL REQUIREMENTS

### Must-Have Features
- ✅ Role-based access control (Admin/HOD/Teacher/Student)
- ✅ AI camera-based face recognition
- ✅ Manual session start/end by teacher
- ✅ Real-time attendance updates
- ✅ Cross-department teaching support
- ✅ Attendance change request workflow
- ✅ Low-attendance warnings
- ✅ Report generation (PDF/Excel)
- ✅ Dashboard for each role

### Performance Requirements
- AI face recognition: < 2 seconds per face
- Real-time updates: < 1 second delay
- Session start: < 3 seconds
- Dashboard load: < 2 seconds

### Security Requirements
- Password encryption (bcrypt or similar)
- JWT-based authentication
- Role-based authorization
- API rate limiting
- Face data encryption

---

## 11. IMPLEMENTATION NOTES FOR DEV TEAM

### Backend Requirements
- **Framework:** Django REST Framework (already implemented)
- **Database:** SQLite (dev) / PostgreSQL (production)
- **AI Module:** Python (OpenCV, TensorFlow/PyTorch)
- **APIs:** RESTful APIs for all operations

### Frontend Requirements
- **Framework:** React.js (already implemented)
- **State Management:** React Context API
- **UI Library:** Custom CSS with design tokens
- **Real-Time:** WebSocket or polling for live attendance

### AI Module Requirements
- **Language:** Python
- **Libraries:** OpenCV, dlib, face_recognition, TensorFlow
- **Storage:** Face embeddings in database (not raw images)
- **Processing:** GPU acceleration recommended

### Deployment
- **Backend:** Deploy on AWS/Azure/DigitalOcean
- **Frontend:** Deploy on Vercel/Netlify
- **AI Module:** Separate service or integrated with backend
- **Camera:** Local network camera or cloud-connected camera

---

## 12. FINAL DELIVERABLES FOR DEV TEAM

### What This Document Provides
- ✅ Full user roles and permissions
- ✅ Complete data flow
- ✅ Camera-AI workflow
- ✅ Attendance logic
- ✅ System structure
- ✅ College structure
- ✅ Feature specifications per role
- ✅ Database requirements (explained in plain language)
- ✅ Technical specifications for AI module

### Next Steps
1. Review this document with the team
2. Create detailed database schema
3. Implement AI face recognition module
4. Integrate AI module with backend
5. Test camera-based attendance flow
6. Deploy and test with real users

---

**End of System Requirement Specification**

