# Priority 2 Features - Quick Reference Guide

## 🎯 Feature Overview

| Feature | Component | Location | Status |
|---------|-----------|----------|--------|
| **Teacher Session Workflow** | SessionManagement | `/teacher/SessionManagement.jsx` | ✅ Ready |
| **HOD Approval System** | ApproveChanges | `/hod/ApproveChanges.jsx` | ✅ Ready |
| **Student Attendance Portal** | ViewAttendance | `/student/ViewAttendance.jsx` | ✅ Ready |
| **Department Filtering** | Multiple | API + Dashboard | ✅ Ready |

---

## 🔧 How to Use Each Feature

### 1️⃣ Teacher Session Workflow

**Who Can Access:** Teachers only  
**Navigation:** Sidebar → Teacher Dashboard → Session Management

**Main Actions:**
```
Step 1: Click "+ Start New Session"
Step 2: Select Class and Subject (required)
Step 3: Optional - Set custom date/time
Step 4: Optional - Configure grace period (default: 15 min)
Step 5: Click "Start Session"
Step 6: Session becomes active and visible in "🟢 Active Sessions"
Step 7: Click "Mark Attendance" to record attendance
Step 8: Click "End Session" when done
```

**Grace Period Indicator:**
- 🟡 **Active** - Students can still be marked as "Late"
- ✓ **Closed** - All new entries marked as "Absent"

**Features:**
- Real-time session duration display
- Multiple active sessions support
- Session history with duration calculation
- One-click attendance marking
- Session end confirmation

---

### 2️⃣ HOD Approval Workflow

**Who Can Access:** HOD only  
**Navigation:** Sidebar → HOD Dashboard → Approve Changes

**Main Actions:**
```
Step 1: View pending change requests (yellow badge)
Step 2: Review change details (original vs. requested status)
Step 3: Click "Approve" or "Reject"
Step 4: Enter optional note (approval) or required reason (rejection)
Step 5: Confirm action
Step 6: Notifications automatically sent to teacher and student
```

**Filter Tabs:**
- **Pending** - Awaiting HOD decision
- **Approved** - Already approved by HOD
- **Rejected** - Already rejected by HOD
- **All** - Show everything

**Information Displayed:**
- Student name and ID
- Class and subject
- Original attendance status
- Requested new status
- Reason for change request
- Date/time of request
- Requested by (teacher name)

**Automatic Actions on Approval/Rejection:**
- 📧 Email notification to teacher
- 📧 Email notification to student
- 💾 Status updated in database
- 🔄 Auto-refresh updates display

---

### 3️⃣ Student Attendance View

**Who Can Access:** Students only  
**Navigation:** Sidebar → Student Dashboard → My Attendance

**Two View Modes:**

#### 📋 **All Records Tab**
```
View 1: Table of all attendance records
Features:
- Filter by subject dropdown
- Status badges (PRESENT/ABSENT/LATE)
- "Request Change" button for non-present entries
- Date, subject, and action columns
- Sortable records
```

#### 📚 **By Subject Tab**
```
View 2: Card-based breakdown per subject
Features:
- Attendance percentage per subject
- Health indicator (🟢/🟡/🔴)
- Count of present/absent/late
- Visual progress bar
- Color-coded card border
```

**Health Indicators:**
```
🟢 GREEN  - Excellent (≥90%)    - "✅ Keep it up!"
🟡 YELLOW - Good (75-90%)       - "⚠️ Be careful!"
🔴 RED    - At Risk (<75%)      - "⛔ Needs attention"
```

**Request Change Process:**
```
Step 1: Click "Request Change" on an absent/late entry
Step 2: Review change details (shows date, subject, current status)
Step 3: Enter reason (required) - e.g., "Medical reason", "Instructor error"
Step 4: Click "Submit Request"
Step 5: Request sent to HOD for review
Step 6: Student can see request status in change records
```

---

### 4️⃣ Department Filtering (HOD)

**Automatic Filtering:**
- All HOD dashboard data shows only their department's information
- No manual selection needed - filters applied based on user's assigned department
- Works on:
  - Pending approval requests
  - Low attendance reports
  - Classes list
  - Teachers list
  - Department reports

**HOD Cannot See:**
- Other departments' attendance data
- Other departments' change requests
- Classes outside their department
- Teachers from other departments

---

## 📊 Data Flow Diagrams

### Session Workflow
```
Teacher: "Start Session"
    ↓
System: Create session record (active = true)
    ↓
Display: Show in "Active Sessions"
    ↓
Teacher: "Mark Attendance" → MarkAttendance.jsx
    ↓
Teacher: Select Present/Absent/Late for each student
    ↓
System: Save attendance records
    ↓
Teacher: "End Session"
    ↓
System: Mark session as inactive (end_time set)
    ↓
Display: Move to "Past Sessions" table
```

### Approval Workflow
```
Student/Teacher: "Request Change"
    ↓
System: Create attendance_change record (status = pending)
    ↓
HOD: Sees in "Pending" tab
    ↓
HOD: Reviews and decides
    ↓
HOD: "Approve" or "Reject" with reason
    ↓
System: Update change status
    ↓
System: Create notifications for teacher & student
    ↓
Display: Shows in "Approved" or "Rejected" tab
```

### Attendance View Workflow
```
Student: Navigate to "My Attendance"
    ↓
System: Fetch all attendance records
    ↓
System: Calculate statistics
    ↓
Display: Overall stats + health indicator
    ↓
Student: "View by Subject" tab
    ↓
System: Group by subject, calculate per-subject percentages
    ↓
Display: Subject cards with health color coding
    ↓
Student: Click "Request Change"
    ↓
Display: Modal with change details
    ↓
Student: Enter reason and submit
    ↓
System: Create request (visible in "Pending")
```

---

## 🎨 Color Coding Reference

### Status Colors
| Status | Color | Meaning |
|--------|-------|---------|
| 🟢 Present | Green | Student was present |
| 🔴 Absent | Red | Student was absent |
| 🟡 Late | Yellow | Student was late (within grace period) |

### Action Colors
| Action | Color | Meaning |
|--------|-------|---------|
| ✅ Approve | Green | Accept the change request |
| ❌ Reject | Red | Deny the change request |
| ⏱ Pending | Yellow | Awaiting decision |

### Health Indicators
| Percentage | Color | Status |
|------------|-------|--------|
| ≥90% | 🟢 Green | Excellent attendance |
| 75-90% | 🟡 Yellow | Good attendance |
| <75% | 🔴 Red | At risk (needs attention) |

---

## ⚙️ Technical Details

### API Endpoints Used

**Session Management:**
```
POST   /api/attendance/sessions/            (Create)
GET    /api/attendance/sessions/            (List all)
POST   /api/attendance/sessions/{id}/end/   (End session)
```

**Attendance Change:**
```
GET    /api/attendance/attendance-changes/pending/        (Get pending)
POST   /api/attendance/attendance-changes/                (Create request)
POST   /api/attendance/attendance-changes/{id}/approve/   (Approve)
POST   /api/attendance/attendance-changes/{id}/reject/    (Reject)
```

**Attendance:**
```
GET    /api/attendance/attendance/?student={id}  (Get student's records)
POST   /api/attendance/attendance/               (Create record)
```

**Notifications:**
```
POST   /api/attendance/notifications/  (Create notification)
GET    /api/attendance/notifications/  (Get notifications)
```

### Department Filtering Parameters
```javascript
// Automatically added to all requests
{ department: user.department }

// Example API calls
GET /api/attendance/attendance-changes/pending/?department=5
GET /api/attendance/attendance-reports/low_attendance/?threshold=75&department=5
GET /api/attendance/classes/?department=5&page_size=100
```

---

## 🔄 Auto-Refresh Settings

All pages auto-refresh every **30 seconds**:
- SessionManagement.jsx
- ApproveChanges.jsx
- ViewAttendance.jsx
- HODDashboard.jsx

This ensures real-time data without manual refresh.

---

## ⚠️ Important Notes

### For Teachers
- ✅ Can start unlimited sessions
- ✅ Can mark attendance for students in their classes
- ✅ Can view their sessions and attendance records
- ❌ Cannot approve/reject change requests
- ❌ Cannot see other teachers' sessions

### For HOD
- ✅ Can approve/reject change requests
- ✅ Can see department-specific data only
- ✅ Can view attendance analytics
- ❌ Cannot start sessions
- ❌ Cannot mark attendance
- ❌ Cannot see other departments' data

### For Students
- ✅ Can view their own attendance
- ✅ Can request attendance changes
- ✅ Can see change request status
- ❌ Cannot create attendance records
- ❌ Cannot approve/reject requests
- ❌ Cannot see other students' records

---

## 🐛 Troubleshooting

### Issue: "No sessions visible"
**Solution:** 
- Make sure you're logged in as a teacher
- Check that you have classes assigned
- Wait for auto-refresh (30 seconds) or refresh page

### Issue: "Pending changes not showing"
**Solution:**
- Verify you're logged in as HOD
- Check that you have a department assigned
- Make sure change requests exist for your department

### Issue: "Can't request attendance change"
**Solution:**
- Only absent/late entries can be changed
- Make sure you're logged in as a student
- Enter a reason before submitting

### Issue: "Health indicator shows wrong color"
**Solution:**
- Colors based on: (present_count / total_count) * 100
- 🟢 ≥90% | 🟡 75-90% | 🔴 <75%
- Percentage calculated from actual attendance data

---

## 📱 Mobile Compatibility

All features are fully responsive:
- ✅ Mobile phones (< 480px)
- ✅ Tablets (480px - 768px)
- ✅ Laptops (> 768px)

**Mobile-Specific Adjustments:**
- Single-column layout on small screens
- Stacked buttons in cards
- Horizontal scrollable tables
- Touch-friendly button sizes
- Readable font sizes

---

## 🎯 Success Criteria

✅ **All Priority 2 Features Complete:**
- [x] Teacher can start/end sessions with grace period
- [x] Teacher can mark attendance with different statuses
- [x] Student can view attendance and request changes
- [x] HOD can approve/reject changes with notifications
- [x] Department filtering works correctly
- [x] Auto-refresh updates in real-time
- [x] Error handling with user messages
- [x] Responsive design across devices

---

## 📞 Support & Documentation

**For More Details:**
- See `PRIORITY_2_IMPLEMENTATION_COMPLETE.md` for full documentation
- Check component files for inline code comments
- Review API documentation for endpoint details

**Last Updated:** December 14, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
