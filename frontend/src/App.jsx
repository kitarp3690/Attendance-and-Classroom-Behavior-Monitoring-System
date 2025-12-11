import React, { useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from "./contexts/AuthContext";

// Pages
import LoginPage from "./pages/LoginPage";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import HODDashboard from "./pages/hod/HODDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Teacher Sub-pages
import SessionManagement from "./pages/teacher/SessionManagement";
import MarkAttendance from "./pages/teacher/MarkAttendance";
import ViewEditAttendance from "./pages/teacher/ViewEditAttendance";
import TeacherViewReports from "./pages/teacher/ViewReports";

// Student Sub-pages
import StudentViewAttendance from "./pages/student/ViewAttendance";
import ViewNotifications from "./pages/student/ViewNotifications";

// Admin Sub-pages
import ManageUsers from "./pages/admin/ManageUsers";
import ManageClasses from "./pages/admin/ManageClasses";
import ManageSubjects from "./pages/admin/ManageSubjects";
import ManageSemesters from "./pages/admin/ManageSemesters";
import AdminViewReports from "./pages/admin/ViewReports";

// HOD Sub-pages
import ApproveChanges from "./pages/hod/ApproveChanges";
import DepartmentAnalytics from "./pages/hod/DepartmentAnalytics";
import HODViewReports from "./pages/hod/ViewReports";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

// Styles
import "./styles/global.css";
import "./styles/themes.css";

function ProtectedRoute({ children, requiredRole = null, theme, onToggleTheme }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="app-wrapper">
      <Navbar theme={theme} onToggleTheme={onToggleTheme} />
      <div className="app-container">
        <Sidebar user={user} />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

function AppContent({ theme, onToggleTheme }) {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage theme={theme} onToggleTheme={onToggleTheme} />} />

      {/* Teacher Routes */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute requiredRole="teacher" theme={theme} onToggleTheme={onToggleTheme}>
            <TeacherRoutes />
          </ProtectedRoute>
        }
      />

      {/* HOD Routes */}
      <Route
        path="/hod/*"
        element={
          <ProtectedRoute requiredRole="hod" theme={theme} onToggleTheme={onToggleTheme}>
            <HODRoutes />
          </ProtectedRoute>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute requiredRole="student" theme={theme} onToggleTheme={onToggleTheme}>
            <StudentRoutes />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin" theme={theme} onToggleTheme={onToggleTheme}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

// Teacher Routes with nested sub-routes
function TeacherRoutes() {
  return (
    <Routes>
      <Route index element={<TeacherDashboard />} />
      <Route path="dashboard" element={<TeacherDashboard />} />
      <Route path="sessions" element={<SessionManagement />} />
      <Route path="mark-attendance/:sessionId" element={<MarkAttendance />} />
      <Route path="view-attendance" element={<ViewEditAttendance />} />
      <Route path="reports" element={<TeacherViewReports />} />
    </Routes>
  );
}

// Student Routes with nested sub-routes
function StudentRoutes() {
  return (
    <Routes>
      <Route index element={<StudentDashboard />} />
      <Route path="dashboard" element={<StudentDashboard />} />
      <Route path="attendance" element={<StudentViewAttendance />} />
      <Route path="notifications" element={<ViewNotifications />} />
    </Routes>
  );
}

// Admin Routes with nested sub-routes
function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<ManageUsers />} />
      <Route path="classes" element={<ManageClasses />} />
      <Route path="subjects" element={<ManageSubjects />} />
      <Route path="semesters" element={<ManageSemesters />} />
      <Route path="reports" element={<AdminViewReports />} />
    </Routes>
  );
}

// HOD Routes with nested sub-routes
function HODRoutes() {
  return (
    <Routes>
      <Route index element={<HODDashboard />} />
      <Route path="dashboard" element={<HODDashboard />} />
      <Route path="approve-changes" element={<ApproveChanges />} />
      <Route path="analytics" element={<DepartmentAnalytics />} />
      <Route path="reports" element={<HODViewReports />} />
    </Routes>
  );
}

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    // Apply theme on component mount and when theme changes
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    htmlElement.setAttribute('data-theme', theme);
    bodyElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <Router>
      <AuthProvider>
        <AppContent theme={theme} onToggleTheme={handleToggleTheme} />
      </AuthProvider>
    </Router>
  );
}

export default App;