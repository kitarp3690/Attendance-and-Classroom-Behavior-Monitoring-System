# Frontend Structure Guide

Complete guide to frontend architecture, components, pages, routing, and state management.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.jsx                      # Main app router
│   ├── main.jsx                     # Entry point
│   ├── index.jsx
│   │
│   ├── pages/                       # Full page components
│   │   ├── LoginPage.jsx            # Login screen
│   │   ├── admin/                   # Admin pages
│   │   │   └── AdminDashboard.jsx
│   │   ├── teacher/                 # Teacher pages
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── StartSession.jsx
│   │   │   └── MarkAttendance.jsx
│   │   ├── hod/                     # HOD pages
│   │   │   ├── HODDashboard.jsx
│   │   │   └── ApproveRequests.jsx
│   │   └── student/                 # Student pages
│   │       ├── StudentDashboard.jsx
│   │       ├── ViewAttendance.jsx
│   │       └── RequestChange.jsx
│   │
│   ├── components/                  # Reusable components
│   │   ├── Navbar.jsx               # Top navigation
│   │   ├── Sidebar.jsx              # Side navigation
│   │   ├── AttendanceTable.jsx      # Data table
│   │   ├── DarkLightToggle.jsx      # Theme toggle
│   │   ├── Notifications.jsx        # Notifications panel
│   │   ├── AvatarDropdown.jsx       # User menu
│   │   │
│   │   ├── Dashboard/               # Dashboard components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── HODDashboard.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── AdminPages/          # Sub-pages
│   │   │   ├── TeacherPages/
│   │   │   ├── StudentPages/
│   │   │   └── HODPages/
│   │   │
│   │   ├── Charts/                  # Chart components
│   │   │   ├── AttendanceChart.jsx
│   │   │   ├── DepartmentChart.jsx
│   │   │   └── TrendChart.jsx
│   │   │
│   │   └── Modals/                  # Dialog components
│   │       ├── ConfirmModal.jsx
│   │       └── FormModal.jsx
│   │
│   ├── services/
│   │   ├── api.js                   # Axios instance + 70+ endpoints
│   │   └── auth.js                  # Auth helpers
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx          # Global auth state
│   │
│   ├── utils/
│   │   ├── dummyData.js             # Mock data
│   │   ├── filters.js               # Filter helpers
│   │   └── role.js                  # Role utilities
│   │
│   ├── styles/
│   │   ├── global.css               # Global styles
│   │   ├── themes.css               # Dark/Light themes
│   │   └── components/              # Component styles
│   │       ├── Navbar.css
│   │       ├── Sidebar.css
│   │       ├── AttendanceTable.css
│   │       └── ...
│   │
│   └── index.html                   # HTML entry point
│
├── .env                             # Environment variables
├── .env.example                     # Example env
├── package.json                     # Dependencies
├── package-lock.json
├── vite.config.js                   # Vite configuration
└── index.html
```

---

## 🧭 Routing Architecture

### Route Structure (App.jsx)
```jsx
<BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/login" element={<LoginPage />} />
    
    {/* Protected Routes */}
    <Route element={<ProtectedRoute />}>
      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminDashboard />} />
      
      {/* Teacher Routes */}
      <Route path="/teacher/*" element={<TeacherDashboard />} />
      
      {/* HOD Routes */}
      <Route path="/hod/*" element={<HODDashboard />} />
      
      {/* Student Routes */}
      <Route path="/student/*" element={<StudentDashboard />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### Sub-Routes (Dashboard Nested)
```jsx
// Inside each dashboard component
<Routes>
  <Route index element={<DashboardHome />} />
  <Route path="settings" element={<Settings />} />
  <Route path="reports" element={<Reports />} />
  <Route path="manage-users" element={<UserManagement />} />
  {/* ... more routes */}
</Routes>
```

---

## 🎨 Component Architecture

### Component Hierarchy
```
App
├── LoginPage
│   └── DarkLightToggle
│
├── ProtectedRoute
│   └── Dashboard (Admin/Teacher/HOD/Student)
│       ├── Navbar
│       │   ├── AvatarDropdown
│       │   └── Notifications
│       │
│       ├── Sidebar
│       │   └── Navigation Links (role-based)
│       │
│       └── Main Content
│           ├── Cards/Stats
│           ├── AttendanceTable
│           ├── Charts
│           └── Forms/Modals
```

### Core Components

#### **Navbar**
- Displays user name and role
- Theme toggle (dark/light)
- Notifications icon
- User dropdown menu
- Logout button

```jsx
<Navbar theme={theme} onToggleTheme={toggleTheme} />
```

#### **Sidebar**
- Role-based navigation menu
- Expandable/collapsible
- Active route highlighting
- Icons for each menu item

```jsx
<Sidebar role={userRole} currentPath={location.pathname} />
```

#### **AttendanceTable**
- Sortable columns
- Pagination
- Filters (by student, date, status)
- Inline edit/delete actions
- Export to CSV

```jsx
<AttendanceTable 
  data={attendanceRecords}
  onUpdate={handleUpdate}
  filters={filters}
/>
```

#### **AttendanceChart**
- Line chart for trends
- Bar chart for comparisons
- Pie chart for distribution
- Responsive design

```jsx
<AttendanceChart data={chartData} period="monthly" />
```

### Context API (AuthContext.jsx)

**State Management**:
```jsx
{
  user: {
    id, username, email, first_name, last_name, role, department
  },
  isAuthenticated: boolean,
  loading: boolean,
  error: string,
  tokens: {
    access: string,
    refresh: string
  }
}
```

**Actions**:
- `login(username, password)` → Get tokens, fetch user, save state
- `logout()` → Clear tokens, reset state
- `refreshToken()` → Get new access token
- `updateUser(data)` → Update user profile

---

## 📱 Page Components

### LoginPage
- Username input
- Password input (with show/hide)
- Remember me checkbox
- Demo quick access buttons
- Responsive design
- Dark/Light theme support

**Props**: `{ theme, onToggleTheme }`

### AdminDashboard
**Features**:
- System overview stats
- User management table
- Department management
- System logs viewer
- Configuration panel

**Sub-pages**:
- `/admin/users` - Manage all users
- `/admin/departments` - Manage departments
- `/admin/subjects` - Manage subjects
- `/admin/reports` - System reports
- `/admin/logs` - Audit logs

### TeacherDashboard
**Features**:
- My classes overview
- Today's sessions
- Attendance quick actions
- Class analytics

**Sub-pages**:
- `/teacher/classes` - My assigned classes
- `/teacher/attendance` - Mark attendance
- `/teacher/sessions` - Manage sessions
- `/teacher/reports` - Class reports

### HODDashboard
**Features**:
- Department overview
- Teacher statistics
- Attendance trends
- Pending approvals count

**Sub-pages**:
- `/hod/teachers` - Manage teachers
- `/hod/approvals` - Approve changes
- `/hod/statistics` - Department stats
- `/hod/schedules` - Class schedules

### StudentDashboard
**Features**:
- Personal attendance percentage
- Attendance records table
- Recent notifications
- Subject-wise breakdown
- Download reports

**Sub-pages**:
- `/student/attendance` - Full attendance history
- `/student/requests` - My change requests
- `/student/notifications` - All notifications
- `/student/reports` - Download reports

---

## 🔌 API Integration (api.js)

### Axios Instance Setup
```javascript
const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      // If successful, retry original request
      // If failed, logout
    }
    return Promise.reject(error);
  }
);
```

### 70+ Endpoints Organized by Category

**Auth** (5 endpoints)
```javascript
authAPI = {
  login: (credentials) => axios.post('/api/auth/login/', credentials),
  refreshToken: (refreshToken) => ...,
  logout: () => { /* clear storage */ },
  getMe: () => api.get('/api/auth/me/'),
  getCurrentUser: () => api.get('/api/auth/me/'), // alias
}
```

**Users** (6 endpoints)
```javascript
userAPI = {
  getAll: (params) => api.get('/api/users/', { params }),
  getById: (id) => api.get(`/api/users/${id}/`),
  create: (data) => api.post('/api/users/', data),
  update: (id, data) => api.put(`/api/users/${id}/`, data),
  delete: (id) => api.delete(`/api/users/${id}/`),
  getMe: () => api.get('/api/users/me/'),
}
```

**Attendance** (8 endpoints)
```javascript
attendanceAPI = {
  getAll: (params) => api.get('/api/attendance/attendance/', { params }),
  create: (data) => api.post('/api/attendance/attendance/', data),
  markAttendance: (data) => api.post('/api/attendance/attendance/mark_attendance/', data),
  markMultiple: (data) => api.post('/api/attendance/attendance/mark_multiple/', data),
  getStatistics: (params) => api.get('/api/attendance/attendance/statistics/', { params }),
  getByDate: (date) => api.get('/api/attendance/attendance/by_date/', { params: { date } }),
  filterBySubject: (subjectId, params) => ...,
  filterByClass: (classId, params) => ...,
}
```

*And more categories: departments, subjects, classes, sessions, embeddings, notifications, reports...*

---

## 🎨 Styling System

### Theme Variables (themes.css)
```css
/* Light Theme */
:root {
  --primary-color: #2563eb;
  --secondary-color: #f59e0b;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  
  --border-color: #e5e7eb;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
}

/* Dark Theme */
[data-theme="dark"] {
  --primary-color: #60a5fa;
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --text-primary: #f3f4f6;
  --text-secondary: #d1d5db;
}
```

### Component Styling Pattern
```css
.component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: var(--spacing-base);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow);
}
```

---

## 🔐 Protected Routes

### ProtectedRoute Component
```jsx
function ProtectedRoute() {
  const { user, isAuthenticated } = useContext(AuthContext);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <Outlet />;
}
```

### Role-Based Route Guards
```jsx
function RoleRoute({ role, element }) {
  const { user } = useContext(AuthContext);
  
  if (user?.role !== role) {
    return <Navigate to="/" />;
  }
  
  return element;
}
```

---

## 🧪 Component Testing

### Example Test
```jsx
import { render, screen } from '@testing-library/react';
import AttendanceTable from './AttendanceTable';

describe('AttendanceTable', () => {
  const mockData = [
    { id: 1, student: 'John', status: 'present' }
  ];
  
  test('renders table with data', () => {
    render(<AttendanceTable data={mockData} />);
    expect(screen.getByText('John')).toBeInTheDocument();
  });
  
  test('handles filters correctly', () => {
    // Test filter logic
  });
});
```

---

## 📦 State Management Patterns

### Using AuthContext
```jsx
const LoginPage = () => {
  const { login } = useContext(AuthContext);
  
  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      navigate(`/${userRole}`);
    } catch (error) {
      setError(error.message);
    }
  };
};
```

### Fetching Data with Hooks
```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await attendanceAPI.getAll();
      setData(response.data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

---

## 🚀 Performance Optimization

### Code Splitting
```jsx
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

<Suspense fallback={<Loading />}>
  <TeacherDashboard />
</Suspense>
```

### Memoization
```jsx
const AttendanceTable = memo(({ data, onUpdate }) => {
  return <table>{/* content */}</table>;
});
```

### Image Optimization
```jsx
<img src={image} alt="desc" loading="lazy" />
```

---

For backend integration details, see `BACKEND_STRUCTURE.md`
For design guidelines, see `DESIGN_GUIDE.md`
