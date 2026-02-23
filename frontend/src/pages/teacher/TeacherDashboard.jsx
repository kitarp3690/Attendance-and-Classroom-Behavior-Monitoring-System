import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { sessionAPI, attendanceAPI } from '../../services/api';
import './TeacherDashboard.css';

export default function TeacherDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayClasses: [],
    activeSessions: [],
    totalClasses: 0,
    totalStudents: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch teacher's classes and sessions
      const sessionsResponse = await sessionAPI.getAll();
      const activeSessions = sessionsResponse.data.filter(s => s.status === 'active');
      
      setStats({
        todayClasses: sessionsResponse.data.slice(0, 5) || [],
        activeSessions: activeSessions || [],
        totalClasses: sessionsResponse.data.length || 0,
        totalStudents: 0 // Calculate from classes
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = () => {
    navigate('/teacher/sessions/new');
  };

  const handleViewSession = (sessionId) => {
    navigate(`/teacher/sessions/${sessionId}`);
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
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.first_name || 'Teacher'} 👋</h1>
        <p className="subtitle">Here's what's happening today</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.totalClasses}</h3>
            <p>Total Classes</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.activeSessions.length}</h3>
            <p>Active Sessions</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>87%</h3>
            <p>Avg Attendance</p>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      {stats.activeSessions.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>🟢 Active Sessions</h2>
            <span className="badge">{stats.activeSessions.length}</span>
          </div>
          <div className="sessions-grid">
            {stats.activeSessions.map(session => (
              <div key={session.id} className="session-card active">
                <div className="session-header">
                  <h3>{session.class_name || 'Class'}</h3>
                  <span className="status-badge active">Active</span>
                </div>
                <div className="session-info">
                  <p><strong>Subject:</strong> {session.subject}</p>
                  <p><strong>Started:</strong> {new Date(session.start_time).toLocaleTimeString()}</p>
                  <div className="attendance-summary">
                    <span className="present">✓ {session.present_count || 0} Present</span>
                    <span className="absent">✗ {session.absent_count || 0} Absent</span>
                  </div>
                </div>
                <div className="session-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleViewSession(session.id)}
                  >
                    Mark Attendance
                  </button>
                  <button className="btn btn-danger">End Session</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Classes */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>📅 Recent Sessions</h2>
        </div>
        <div className="classes-list">
          {stats.todayClasses.length > 0 ? (
            stats.todayClasses.map(classItem => (
              <div key={classItem.id} className="class-item">
                <div className="class-time">
                  <span className="time">{new Date(classItem.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="class-details">
                  <h4>{classItem.subject}</h4>
                  <p>{classItem.class_name || 'Class'}</p>
                </div>
                <div className="class-status">
                  <span className={`status ${classItem.status}`}>
                    {classItem.status === 'active' ? '🟢 Active' : 
                     classItem.status === 'completed' ? '✅ Completed' : '⏰ Scheduled'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No sessions found</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>⚡ Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <button className="action-btn primary" onClick={handleStartSession}>
            <span className="icon">➕</span>
            <span className="text">Start New Session</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/teacher/sessions')}>
            <span className="icon">📋</span>
            <span className="text">View All Sessions</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/teacher/reports')}>
            <span className="icon">📊</span>
            <span className="text">View Reports</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/teacher/classes')}>
            <span className="icon">📚</span>
            <span className="text">Manage Classes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
