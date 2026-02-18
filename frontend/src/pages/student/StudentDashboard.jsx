import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { attendanceAPI } from '../../services/api';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    enrolledClasses: [],
    lastClass: null
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch student attendance data
      const attendanceResponse = await attendanceAPI.getAll();
      
      // Calculate stats
      const records = attendanceResponse.data || [];
      const present = records.filter(r => r.status === 'present').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const late = records.filter(r => r.status === 'late').length;
      const total = records.length || 1;
      const percentage = Math.round((present / total) * 100);
      
      setStats({
        attendancePercentage: percentage,
        presentCount: present,
        absentCount: absent,
        lateCount: late,
        enrolledClasses: [
          { id: 1, name: 'Data Structures & Algorithms', attendance: 87, credits: 3 },
          { id: 2, name: 'Database Management System', attendance: 92, credits: 3 },
          { id: 3, name: 'Operating Systems', attendance: 85, credits: 3 },
          { id: 4, name: 'Computer Networks', attendance: 88, credits: 3 },
        ],
        lastClass: records[0] || null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 85) return { text: 'EXCELLENT', color: 'green', icon: '✓' };
    if (percentage >= 75) return { text: 'GOOD', color: 'blue', icon: '✓' };
    if (percentage >= 65) return { text: 'WARNING', color: 'orange', icon: '⚠' };
    return { text: 'POOR', color: 'red', icon: '✗' };
  };

  const status = getAttendanceStatus(stats.attendancePercentage);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.first_name} 👋</h1>
        <p className="subtitle">Student ID: {user?.username || 'N/A'}</p>
      </div>

      {/* Attendance Overview Card */}
      <div className="attendance-hero">
        <div className="attendance-circle">
          <svg className="progress-ring" width="200" height="200">
            <circle
              className="progress-ring-bg"
              cx="100"
              cy="100"
              r="90"
            />
            <circle
              className="progress-ring-fill"
              cx="100"
              cy="100"
              r="90"
              style={{
                strokeDasharray: `${2 * Math.PI * 90}`,
                strokeDashoffset: `${2 * Math.PI * 90 * (1 - stats.attendancePercentage / 100)}`
              }}
            />
          </svg>
          <div className="attendance-percentage">
            <h2>{stats.attendancePercentage}%</h2>
            <p className={`status ${status.color}`}>
              {status.icon} {status.text}
            </p>
          </div>
        </div>
        
        <div className="attendance-breakdown">
          <h3>Your Attendance</h3>
          <div className="breakdown-item">
            <span className="icon">✓</span>
            <span className="label">Present:</span>
            <span className="value">{stats.presentCount} sessions</span>
          </div>
          <div className="breakdown-item">
            <span className="icon">✗</span>
            <span className="label">Absent:</span>
            <span className="value">{stats.absentCount} sessions</span>
          </div>
          <div className="breakdown-item">
            <span className="icon">⏰</span>
            <span className="label">Late:</span>
            <span className="value">{stats.lateCount} sessions</span>
          </div>
          {stats.lastClass && (
            <div className="last-class">
              <p><strong>Last Class:</strong></p>
              <p>{new Date(stats.lastClass.date).toLocaleString()}</p>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => navigate('/student/attendance')}>
            View Detailed Report
          </button>
        </div>
      </div>

      {/* Enrolled Classes */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>📚 Enrolled Classes</h2>
          <span className="badge">{stats.enrolledClasses.length} Classes</span>
        </div>
        <div className="classes-grid">
          {stats.enrolledClasses.map(classItem => (
            <div 
              key={classItem.id} 
              className="class-card"
              onClick={() => navigate(`/student/classes/${classItem.id}`)}
            >
              <div className="class-header">
                <h3>{classItem.name}</h3>
                <span className="credits">{classItem.credits} Credits</span>
              </div>
              <div className="class-attendance">
                <div className="attendance-bar">
                  <div 
                    className="attendance-fill" 
                    style={{ width: `${classItem.attendance}%` }}
                  ></div>
                </div>
                <p className="attendance-text">
                  <strong>{classItem.attendance}%</strong> Attendance
                </p>
              </div>
              <div className="class-status">
                {classItem.attendance >= 75 ? (
                  <span className="status-good">✓ Good Standing</span>
                ) : (
                  <span className="status-warning">⚠ Below Required</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>⚡ Quick Actions</h2>
        </div>
        <div className="quick-actions">
          <button className="action-btn" onClick={() => navigate('/student/attendance')}>
            <span className="icon">📊</span>
            <span className="text">View Attendance</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/student/notifications')}>
            <span className="icon">🔔</span>
            <span className="text">Notifications</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/student/dashboard')}>
            <span className="icon">📚</span>
            <span className="text">My Dashboard</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/student/dashboard')}>
            <span className="icon">⚙️</span>
            <span className="text">Settings</span>
          </button>
        </div>
      </div>

      {/* Attendance Warning */}
      {stats.attendancePercentage < 75 && (
        <div className="dashboard-section warning-section">
          <div className="warning-content">
            <div className="warning-icon">⚠️</div>
            <div>
              <h3>Attendance Warning</h3>
              <p>Your attendance is below the required 75% threshold. Please improve your attendance to avoid academic consequences.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
