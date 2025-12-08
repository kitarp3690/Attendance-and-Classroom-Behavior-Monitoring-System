# Frontend Implementation Guide - Khwopa Attendance System

## Technology Stack
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.2
- **HTTP Client**: Axios
- **Routing**: React Router
- **State Management**: React Context API + useState/useEffect
- **Styling**: CSS Modules + Global Themes

---

## Project Structure

```
frontend/src/
├── components/
│   ├── Dashboard/
│   │   ├── AdminDashboard.jsx
│   │   ├── HODDashboard.jsx
│   │   ├── TeacherDashboard.jsx
│   │   └── StudentDashboard.jsx
│   ├── Sessions/
│   │   ├── SessionManager.jsx
│   │   ├── ActiveSession.jsx
│   │   ├── SessionHistory.jsx
│   │   └── StartSessionModal.jsx
│   ├── Attendance/
│   │   ├── AttendanceTable.jsx
│   │   ├── AttendanceMarker.jsx
│   │   ├── AttendanceStats.jsx
│   │   └── AttendanceCalendar.jsx
│   ├── Reports/
│   │   ├── AttendanceReports.jsx
│   │   ├── LowAttendanceAlert.jsx
│   │   ├── DepartmentReports.jsx
│   │   └── ExportReport.jsx
│   ├── Schedule/
│   │   ├── ClassSchedule.jsx
│   │   ├── WeeklySchedule.jsx
│   │   └── ScheduleEditor.jsx
│   ├── Approvals/
│   │   ├── PendingChanges.jsx
│   │   ├── ChangeRequestCard.jsx
│   │   └── ApprovalHistory.jsx
│   ├── Management/
│   │   ├── DepartmentManager.jsx
│   │   ├── SubjectManager.jsx
│   │   ├── ClassManager.jsx
│   │   ├── UserManager.jsx
│   │   └── TeacherAssignments.jsx
│   ├── Common/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── DataTable.jsx
│   │   ├── FilterBar.jsx
│   │   ├── StatCard.jsx
│   │   ├── Modal.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorBoundary.jsx
│   └── Charts/
│       ├── AttendanceChart.jsx
│       ├── DepartmentChart.jsx
│       └── TrendChart.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── Dashboard.jsx
│   ├── AttendancePage.jsx
│   ├── ReportsPage.jsx
│   ├── SchedulePage.jsx
│   ├── ApprovalsPage.jsx
│   ├── ManagementPage.jsx
│   └── ProfilePage.jsx
├── services/
│   ├── api.js
│   ├── auth.js
│   ├── attendance.js
│   ├── sessions.js
│   ├── reports.js
│   ├── departments.js
│   ├── subjects.js
│   ├── classes.js
│   └── users.js
├── context/
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── NotificationContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useApi.js
│   ├── useNotifications.js
│   └── useDebounce.js
├── utils/
│   ├── formatters.js
│   ├── validators.js
│   ├── constants.js
│   └── helpers.js
└── styles/
    ├── global.css
    ├── themes.css
    └── variables.css
```

---

## Page Specifications

### 1. Admin Dashboard
**Components:**
- System Overview Cards (Total Users, Departments, Classes, Active Sessions)
- Recent Activity Timeline
- Department Statistics Chart
- Quick Actions (Create Dept, Add User, View Reports)

**Features:**
- Full system management
- User CRUD operations
- Department configuration
- System-wide reports
- Audit logs

**Key Functions:**
```javascript
- fetchSystemStats()
- createDepartment()
- manageUsers()
- viewAuditLogs()
- exportSystemReport()
```

---

### 2. HOD Dashboard
**Components:**
- Department Overview Cards
- Pending Approval Notifications (Badge Count)
- Low Attendance Alerts
- Department Statistics Charts
- Session Activity Log

**Features:**
- View all sessions in department
- Approve/reject attendance changes
- View department-wide reports
- Monitor teacher performance
- Track student attendance trends

**Key Functions:**
```javascript
- fetchDepartmentStats()
- getPendingChanges()
- approveAttendanceChange()
- rejectAttendanceChange()
- viewDepartmentReports()
- exportDepartmentData()
```

---

### 3. Teacher Dashboard
**Components:**
- Active Session Panel (if session running)
- Today's Schedule Card
- My Assignments List
- Recent Sessions Table
- Quick Start Session Button

**Features:**
- Start/end attendance sessions
- Mark attendance (manual/camera)
- View session history
- Edit attendance (creates change request)
- View class rosters
- Export class reports

**Key Functions:**
```javascript
- startSession(classId, subjectId)
- endSession(sessionId)
- markAttendance(studentId, status)
- markMultipleAttendance(attendances[])
- requestAttendanceChange(attendanceId, newStatus, reason)
- viewSessionDetails(sessionId)
- exportSessionReport(sessionId)
```

---

### 4. Student Dashboard
**Components:**
- Attendance Summary Cards (Overall %, Present, Absent, Late)
- Subject-wise Attendance Table
- Attendance Calendar View
- Recent Notifications
- Low Attendance Warnings

**Features:**
- View personal attendance
- Filter by subject/date range
- See attendance percentage per subject
- View session details
- Check class schedule

**Key Functions:**
```javascript
- fetchMyAttendance()
- getAttendanceBySubject(subjectId)
- getAttendanceCalendar(month, year)
- viewSessionDetails(sessionId)
- checkMySchedule()
```

---

## Component Specifications

### Session Manager (Teacher)
```javascript
<SessionManager>
  - If active session exists:
    <ActiveSession>
      - Session Info (Subject, Class, Start Time)
      - Student List with Status
      - Quick Mark Buttons (Present/Absent/Late)
      - End Session Button
      - Camera Feed Integration
    </ActiveSession>
  
  - If no active session:
    <StartSessionModal>
      - Select Class Dropdown
      - Select Subject Dropdown
      - Confirm Button
    </StartSessionModal>
  
  <SessionHistory>
    - Past Sessions Table
    - Filter by Date/Class/Subject
    - View Details Button
    - Export Button
  </SessionHistory>
</SessionManager>
```

### Attendance Marker
```javascript
<AttendanceMarker session={currentSession}>
  - Student List (from ClassStudent)
  - Each Row:
    - Student Name
    - Student Photo
    - Status Buttons (Present/Absent/Late)
    - Confidence Score (if AI detected)
    - Manual Override Checkbox
    - Notes Field
  
  - Bulk Actions:
    - Mark All Present
    - Mark All Absent
    - Save Changes Button
  
  - Face Recognition Panel:
    - Camera Feed View
    - Auto-detect Toggle
    - Detection Confidence Slider
</AttendanceMarker>
```

### Pending Changes (HOD)
```javascript
<PendingChanges>
  - Filter Bar (By Teacher, Date, Subject)
  - Change Request Cards:
    <ChangeRequestCard change={item}>
      - Student Name & Photo
      - Subject & Date
      - Old Status → New Status
      - Reason & Notes
      - Requested By
      - Timestamp
      - Action Buttons:
        - Approve (Green)
        - Reject (Red)
        - View Details
    </ChangeRequestCard>
  
  - Pagination
  - Bulk Approve/Reject
</PendingChanges>
```

### Class Schedule
```javascript
<ClassSchedule>
  - Week View (Sun-Fri)
  - For each day:
    <DayColumn day={dayIndex}>
      - Schedule Items (sorted by time)
      <ScheduleItem schedule={item}>
        - Time Range
        - Subject Name
        - Teacher Name
        - Room/Location
        - Edit Button (Admin/HOD only)
      </ScheduleItem>
    </DayColumn>
  
  - Add Schedule Button (Admin/HOD)
  - Export Schedule Button
</ClassSchedule>
```

### Attendance Reports
```javascript
<AttendanceReports role={userRole}>
  - Filter Panel:
    - Department (HOD/Admin only)
    - Class
    - Subject
    - Date Range
    - Attendance Threshold
  
  - Report View:
    <ReportTable>
      - Student Name
      - Subject
      - Total Classes
      - Present Count
      - Absent Count
      - Late Count
      - Percentage
      - Status Badge (Low/Medium/Good)
    </ReportTable>
  
  - Charts:
    - Attendance Trend Line Chart
    - Subject-wise Bar Chart
    - Department Comparison (Admin/HOD)
  
  - Export Options:
    - PDF
    - Excel
    - CSV
</AttendanceReports>
```

---

## API Integration Patterns

### Authentication Flow
```javascript
// services/auth.js
export const login = async (username, password) => {
  const response = await axios.post('/api/auth/login/', {
    username,
    password
  });
  
  // Store tokens
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  return response.data;
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh_token');
  const response = await axios.post('/api/auth/refresh/', { refresh });
  localStorage.setItem('access_token', response.data.access);
  return response.data.access;
};
```

### Session Management
```javascript
// services/sessions.js
export const startSession = async (classId, subjectId) => {
  return await api.post('/api/attendance/sessions/start_session/', {
    class_assigned: classId,
    subject: subjectId
  });
};

export const endSession = async (sessionId) => {
  return await api.post(`/api/attendance/sessions/${sessionId}/end_session/`);
};

export const getActiveSessions = async () => {
  return await api.get('/api/attendance/sessions/active_sessions/');
};
```

### Attendance Operations
```javascript
// services/attendance.js
export const markAttendance = async (studentId, sessionId, status, confidence = null) => {
  return await api.post('/api/attendance/attendance/mark_attendance/', {
    student_id: studentId,
    session_id: sessionId,
    status: status,
    confidence_score: confidence
  });
};

export const markMultiple = async (sessionId, attendances) => {
  return await api.post('/api/attendance/attendance/mark_multiple/', {
    session_id: sessionId,
    attendances: attendances
  });
};

export const getMyAttendance = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  return await api.get(`/api/attendance/attendance/?${params}`);
};
```

---

## State Management

### AuthContext
```javascript
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  
  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser(data.user);
  };
  
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### NotificationContext
```javascript
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const fetchNotifications = async () => {
    const data = await api.get('/api/attendance/notifications/');
    setNotifications(data.data);
  };
  
  const fetchUnreadCount = async () => {
    const data = await api.get('/api/attendance/notifications/unread_count/');
    setUnreadCount(data.data.unread_count);
  };
  
  const markAsRead = async (notificationId) => {
    await api.post(`/api/attendance/notifications/${notificationId}/mark_read/`);
    fetchNotifications();
    fetchUnreadCount();
  };
  
  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
```

---

## UI/UX Patterns

### Loading States
```javascript
{loading ? (
  <LoadingSpinner message="Loading attendance..." />
) : error ? (
  <ErrorMessage message={error} onRetry={fetchData} />
) : (
  <DataComponent data={data} />
)}
```

### Form Validation
```javascript
const validateSessionForm = (values) => {
  const errors = {};
  
  if (!values.class_assigned) {
    errors.class_assigned = 'Class is required';
  }
  
  if (!values.subject) {
    errors.subject = 'Subject is required';
  }
  
  return errors;
};
```

### Confirmation Dialogs
```javascript
<ConfirmDialog
  open={showConfirm}
  title="End Session?"
  message="Are you sure you want to end this session? This action cannot be undone."
  onConfirm={handleEndSession}
  onCancel={() => setShowConfirm(false)}
/>
```

---

## Responsive Design

### Breakpoints
```css
/* variables.css */
:root {
  --breakpoint-mobile: 480px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
  --breakpoint-wide: 1440px;
}
```

### Mobile-First Approach
```css
/* Default (Mobile) */
.dashboard-grid {
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}
```

---

## Accessibility

- Use semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader support
- Color contrast compliance (WCAG AA)

---

## Performance Optimization

1. **Code Splitting**: Lazy load pages and components
```javascript
const AdminDashboard = lazy(() => import('./components/Dashboard/AdminDashboard'));
```

2. **Memoization**: Use React.memo for expensive components
```javascript
export default React.memo(AttendanceTable);
```

3. **Debouncing**: Debounce search inputs
```javascript
const debouncedSearch = useDebounce(searchTerm, 500);
```

4. **Virtual Scrolling**: For large lists (use react-window)

5. **Image Optimization**: Lazy load images, use appropriate formats

---

This guide provides the complete frontend architecture and implementation patterns for the Khwopa Attendance System.
