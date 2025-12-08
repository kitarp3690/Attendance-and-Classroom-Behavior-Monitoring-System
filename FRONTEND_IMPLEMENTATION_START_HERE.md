# FRONTEND IMPLEMENTATION - START HERE

## Quick Start (15 minutes to working frontend)

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

### Step 3: Login with Test Credentials
**Teacher**
- Username: `teacher1`
- Password: `password123`

**HOD**
- Username: `hod1`
- Password: `password123`

**Student**
- Username: `student1`
- Password: `password123`

**Admin**
- Username: `admin1`
- Password: `password123`

---

## File Creation Order

### PHASE 1: Core Setup (Create these first)

#### 1. `src/contexts/AuthContext.jsx`
- Authentication state management
- User data storage
- Login/logout functions

#### 2. `src/services/api.js`
- ✅ ALREADY EXISTS - API endpoint wrapper

#### 3. `src/components/Navbar.jsx`
- Top navigation bar
- User profile dropdown
- Notifications

#### 4. `src/components/Sidebar.jsx`
- Left navigation menu
- Role-based menu items
- Collapsible on mobile

#### 5. `src/pages/LoginPage.jsx`
- Login form
- Email/password input
- Form validation

#### 6. `src/styles/global.css`
- Global styling
- Color variables
- Typography

---

### PHASE 2: Reusable Components

#### 7. `src/components/DashboardCard.jsx`
```jsx
<DashboardCard 
  title="Today's Classes"
  icon="📚"
  value="5 Classes"
  color="blue"
/>
```

#### 8. `src/components/DataTable.jsx`
- Sortable columns
- Filterable rows
- Pagination
- Responsive

#### 9. `src/components/Modal.jsx`
- Generic modal component
- Close button
- Customizable content

#### 10. `src/components/Toast.jsx`
- Notification system
- Success/error/warning types
- Auto-dismiss

#### 11. `src/components/LoadingSpinner.jsx`
- Loading indicator
- Centered, full-screen option

#### 12. `src/components/ConfirmDialog.jsx`
- Confirmation modal
- OK/Cancel buttons

---

### PHASE 3: Teacher Pages

#### 13. `src/pages/teacher/TeacherDashboard.jsx`
- Today's classes overview
- Active sessions
- Quick actions
- Recent attendance data

#### 14. `src/pages/teacher/TeacherSessions.jsx`
- List all sessions
- Start new session button
- Session status
- Quick actions (end, view)

#### 15. `src/pages/teacher/SessionDetail.jsx`
- Session details
- Student list with attendance marking
- Quick mark all buttons
- Submit attendance button

#### 16. `src/pages/teacher/TeacherClasses.jsx`
- List assigned classes
- Class details
- Student count
- Edit option

#### 17. `src/pages/teacher/TeacherReports.jsx`
- Attendance reports
- Class-wise analysis
- Export to CSV/PDF
- Date range filter

#### 18. `src/pages/teacher/TeacherSettings.jsx`
- Profile information
- Change password
- Notification preferences
- Account settings

---

### PHASE 4: HOD Pages

#### 19. `src/pages/hod/HODDashboard.jsx`
- Department overview
- Pending approvals badge
- Department statistics
- Quick actions

#### 20. `src/pages/hod/HODApprovals.jsx`
- List pending approvals
- Filter by type (attendance, leave, etc.)
- Approval cards
- Bulk actions

#### 21. `src/pages/hod/ApprovalDetail.jsx`
- Single approval details
- Before/after comparison
- Comments section
- Approve/Reject buttons

#### 22. `src/pages/hod/HODAnalytics.jsx`
- Department attendance statistics
- Charts and graphs
- Class-wise analysis
- Teacher performance

#### 23. `src/pages/hod/HODDepartment.jsx`
- Department management
- Teachers list
- Students list
- Manage assignments

#### 24. `src/pages/hod/HODSettings.jsx`
- Department settings
- Notification preferences
- Export settings
- System preferences

---

### PHASE 5: Student Pages

#### 25. `src/pages/student/StudentDashboard.jsx`
- Attendance percentage
- Status (good/warning/poor)
- Present/Absent/Late count
- Enrolled classes overview
- Last class attended

#### 26. `src/pages/student/StudentClasses.jsx`
- List enrolled classes
- Attendance % per class
- Class details
- View class schedule

#### 27. `src/pages/student/StudentAttendance.jsx`
- Detailed attendance records
- Filterable by class/date
- Request approval if absent
- Export attendance

#### 28. `src/pages/student/AttendanceCalendar.jsx`
- Visual calendar
- Color-coded attendance (green/red/yellow)
- Click to view details
- Month/year navigation

#### 29. `src/pages/student/StudentSettings.jsx`
- Profile information
- Change password
- Notification preferences
- Download documents

---

### PHASE 6: Admin Pages

#### 30. `src/pages/admin/AdminDashboard.jsx`
- System overview
- User count by role
- Department count
- Active sessions count
- System health

#### 31. `src/pages/admin/AdminUsers.jsx`
- User management table
- Search and filter
- Add/Edit/Delete users
- Bulk actions (deactivate, export)

#### 32. `src/pages/admin/AdminDepartments.jsx`
- Department list
- Add/Edit department
- Assign HOD
- View department stats

#### 33. `src/pages/admin/AdminSettings.jsx`
- System configuration
- Email settings
- Attendance rules
- System parameters

#### 34. `src/pages/admin/AdminLogs.jsx`
- Activity logs
- Filter by date/user/action
- Search logs
- Export logs

---

### PHASE 7: Styling

#### 35. `src/styles/themes.css`
- Color variables
- Font sizes
- Spacing scale

#### 36. `src/styles/responsive.css`
- Mobile breakpoints
- Tablet breakpoints
- Desktop breakpoints

#### 37. Component-specific CSS files
- `components/Navbar.css`
- `components/Sidebar.css`
- `pages/Dashboard.css`
- etc.

---

## API Integration

### Key Endpoints to Use

**Authentication**
```javascript
POST /api/users/login/
POST /api/users/logout/
GET /api/users/profile/
```

**Attendance**
```javascript
POST /api/attendance/start-session/
POST /api/attendance/mark-attendance/
GET /api/attendance/sessions/
GET /api/attendance/records/
```

**Approvals**
```javascript
GET /api/approvals/
POST /api/approvals/{id}/approve/
POST /api/approvals/{id}/reject/
```

**Users & Departments**
```javascript
GET /api/users/
POST /api/users/
GET /api/users/{id}/
PUT /api/users/{id}/
DELETE /api/users/{id}/

GET /api/departments/
POST /api/departments/
GET /api/departments/{id}/
```

---

## Component Code Structure Template

Each component should follow this structure:

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { attendanceAPI } from '../../services/api';
import './ComponentName.css';

export default function ComponentName() {
  // State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Context
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // API call here
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleAction = async () => {
    // Implementation
  };

  // Loading & Error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  // Render
  return (
    <div className="component-container">
      {/* Content */}
    </div>
  );
}
```

---

## Testing Plan

### 1. Test Each Page Individually
- [ ] Page loads without errors
- [ ] API calls work
- [ ] Data displays correctly
- [ ] Buttons/forms work

### 2. Test Role-Based Access
- [ ] Teacher sees only teacher pages
- [ ] HOD sees only HOD pages
- [ ] Student sees only student pages
- [ ] Admin sees all pages

### 3. Test API Integration
- [ ] Login/logout works
- [ ] Data fetches correctly
- [ ] Forms submit successfully
- [ ] Error messages display

### 4. Test UI/UX
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop responsive
- [ ] All buttons clickable
- [ ] Forms validate input

### 5. Test Performance
- [ ] Pages load in < 2 seconds
- [ ] No console errors
- [ ] No memory leaks
- [ ] Images optimized

---

## Troubleshooting

### Problem: "Cannot find module"
**Solution**: Check import paths are correct relative to file location

### Problem: "API returns 401 Unauthorized"
**Solution**: Check token is stored in localStorage after login

### Problem: "Blank page appears"
**Solution**: Check console for errors. Verify AuthContext is wrapping App component

### Problem: "Styles not applying"
**Solution**: Verify CSS file import path. Check CSS class names match

### Problem: "Data not showing"
**Solution**: Check API endpoint is correct. Verify response structure in console

---

## Success Checklist

- [ ] All files created in correct directories
- [ ] All imports working (no red squiggles)
- [ ] AuthContext wrapping App in main entry point
- [ ] LoginPage displays and logs in
- [ ] Correct dashboard shows based on role
- [ ] All pages load without errors
- [ ] Sidebar menu works correctly
- [ ] Logout returns to login
- [ ] Responsive design works on mobile
- [ ] No console errors or warnings

---

## Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Environment Variables
Create `.env` file:
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

---

This document gives you a complete roadmap. Start with Phase 1, then follow each phase in order!
