import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { attendanceChangeAPI } from '../../services/api';
import './HODDashboard.css';

export default function HODDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    departmentAttendance: 0,
    totalStudents: 0,
    totalTeachers: 0,
    recentApprovals: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch HOD dashboard data
      const approvalsResponse = await attendanceChangeAPI.getPending();
      
      setStats({
        pendingApprovals: approvalsResponse.data?.length || 0,
        departmentAttendance: 87,
        totalStudents: 150,
        totalTeachers: 20,
        recentApprovals: approvalsResponse.data?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
        <p className="subtitle">Department: Computer Engineering</p>
        <p className="subtitle">HOD: {user?.first_name} {user?.last_name}</p>
      </div>

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
            <h3>{stats.departmentAttendance}%</h3>
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
          <button className="action-btn primary" onClick={handleViewApprovals}>
            <span className="icon">📝</span>
            <span className="text">Review Approvals</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/hod/analytics')}>
            <span className="icon">📊</span>
            <span className="text">View Analytics</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/hod/department')}>
            <span className="icon">🏢</span>
            <span className="text">Manage Department</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/hod/reports')}>
            <span className="icon">📄</span>
            <span className="text">Generate Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
