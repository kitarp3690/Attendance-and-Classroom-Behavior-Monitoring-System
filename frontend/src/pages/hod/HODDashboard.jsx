import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { attendanceChangeAPI, attendanceReportAPI, classAPI, userAPI } from '../../services/api';
import './HODDashboard.css';

export default function HODDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    departmentAttendance: 0,
    totalStudents: 0,
    totalTeachers: 0,
    recentApprovals: [],
    lowAttendanceStudents: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch pending approvals
      const approvalsResponse = await attendanceChangeAPI.getPending();
      const pendingApprovals = approvalsResponse.data.results || approvalsResponse.data || [];

      // Fetch low attendance students
      const lowAttendanceResponse = await attendanceReportAPI.getLowAttendance(75);
      const lowAttendanceStudents = lowAttendanceResponse.data.results || lowAttendanceResponse.data || [];

      // Fetch all classes to count students
      const classesResponse = await classAPI.getAll({ page_size: 100 });
      const classes = classesResponse.data.results || classesResponse.data || [];
      
      let totalStudents = 0;
      for (const classItem of classes) {
        totalStudents += classItem.strength || 0;
      }

      // Fetch all teachers
      const teachersResponse = await userAPI.getAll({ role: 'teacher', page_size: 1000 });
      const teachers = teachersResponse.data.results || teachersResponse.data || [];

      // Calculate department attendance
      const reportsResponse = await attendanceReportAPI.getAll({ page_size: 1000 });
      const reports = reportsResponse.data.results || reportsResponse.data || [];
      const avgAttendance = reports.length > 0 
        ? (reports.reduce((sum, r) => sum + (r.percentage || 0), 0) / reports.length).toFixed(1)
        : 0;

      setStats({
        pendingApprovals: pendingApprovals.length,
        departmentAttendance: parseFloat(avgAttendance),
        totalStudents: totalStudents,
        totalTeachers: teachers.length,
        recentApprovals: pendingApprovals.slice(0, 5),
        lowAttendanceStudents: lowAttendanceStudents.slice(0, 5)
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApprovals = () => {
    navigate('/hod/approvals');
  };

  const handleViewApproval = (approvalId) => {
    navigate(`/hod/approvals/${approvalId}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="hod-dashboard">
      <div className="dashboard-header">
        <h1>HOD Dashboard 🎓</h1>
        <p className="subtitle">Department Overview</p>
        <p className="subtitle">HOD: {user?.first_name} {user?.last_name}</p>
      </div>

      {error && (
        <div className="alert-banner alert-danger">
          <div className="alert-icon">❌</div>
          <div className="alert-content">
            <h3>Error Loading Data</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Pending Approvals Alert */}
      {stats.pendingApprovals > 0 && (
        <div className="alert-banner warning">
          <div className="alert-icon">⚠️</div>
          <div className="alert-content">
            <h3>You have {stats.pendingApprovals} pending approval{stats.pendingApprovals !== 1 ? 's' : ''}</h3>
            <p>Please review and approve or reject attendance change requests</p>
          </div>
          <button className="btn btn-primary" onClick={handleViewApprovals}>
            View Approvals
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.pendingApprovals}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>

        <div className="stat-card blue">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.departmentAttendance.toFixed(1)}%</h3>
            <p>Dept Attendance</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-content">
            <h3>{stats.totalTeachers}</h3>
            <p>Total Teachers</p>
          </div>
        </div>
      </div>

      {/* Recent Approval Requests */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>📋 Recent Approval Requests</h2>
          <button className="btn btn-outline" onClick={handleViewApprovals}>
            View All
          </button>
        </div>
        <div className="approvals-list">
          {stats.recentApprovals.length > 0 ? (
            stats.recentApprovals.map(approval => (
              <div key={approval.id} className="approval-item" onClick={() => handleViewApproval(approval.id)}>
                <div className="approval-badge pending">PENDING</div>
                <div className="approval-details">
                  <h4>Attendance Change Request</h4>
                  <p><strong>Student:</strong> {approval.student_name || 'N/A'}</p>
                  <p><strong>Subject:</strong> {approval.subject || 'N/A'}</p>
                  <p><strong>Requested by:</strong> {approval.teacher_name || 'N/A'}</p>
                  <p className="change-info">
                    <span className="old-status">ABSENT</span> 
                    <span className="arrow">→</span> 
                    <span className="new-status">PRESENT</span>
                  </p>
                </div>
                <div className="approval-actions">
                  <button className="btn-icon success" title="Approve">✓</button>
                  <button className="btn-icon danger" title="Reject">✗</button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>✅ No pending approvals - Great job!</p>
            </div>
          )}
        </div>
      </div>

      {/* Department Overview */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>🏢 Department Overview</h2>
        </div>
        <div className="overview-grid">
          <div className="overview-card">
            <h3>Classes Today</h3>
            <p className="big-number">12</p>
            <p className="small-text">Across all years</p>
          </div>
          <div className="overview-card">
            <h3>Active Sessions</h3>
            <p className="big-number">3</p>
            <p className="small-text">Currently running</p>
          </div>
          <div className="overview-card">
            <h3>Today's Attendance</h3>
            <p className="big-number">89%</p>
            <p className="small-text">140 out of 157 present</p>
          </div>
          <div className="overview-card">
            <h3>This Week</h3>
            <p className="big-number">86%</p>
            <p className="small-text">Average attendance</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>⚡ Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => navigate('/hod/approve-changes')}>
            <span className="icon">✅</span>
            <span className="text">Approve Changes</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/hod/analytics')}>
            <span className="icon">📊</span>
            <span className="text">View Analytics</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/hod/reports')}>
            <span className="icon">📄</span>
            <span className="text">Generate Reports</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/hod/dashboard')}>
            <span className="icon">🏢</span>
            <span className="text">Department Info</span>
          </button>
        </div>
      </div>
    </div>
  );
}
