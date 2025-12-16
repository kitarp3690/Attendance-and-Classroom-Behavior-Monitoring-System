import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { userAPI, departmentAPI, sessionAPI, attendanceAPI, notificationAPI } from '../../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    activeSessions: 0,
    usersByRole: {
      teachers: 0,
      students: 0,
      hods: 0,
      admins: 0
    },
    departmentsWithoutHod: 0,
    attendanceToday: {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      percentage: 0
    },
    recentActivities: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const todayISO = new Date().toISOString().split('T')[0];

      const [
        usersResponse,
        deptsResponse,
        activeSessionsResponse,
        attendanceStatsResponse,
        notificationsResponse
      ] = await Promise.all([
        userAPI.getAll({ page_size: 1000 }),
        departmentAPI.getAll({ page_size: 200 }),
        sessionAPI.getActiveSessions(),
        attendanceAPI.getStatistics({ start_date: todayISO, end_date: todayISO }),
        notificationAPI.getAll({ page_size: 10 })
      ]);

      const users = usersResponse.data.results || usersResponse.data || [];
      const departments = deptsResponse.data.results || deptsResponse.data || [];
      const activeSessions = activeSessionsResponse.data.results || activeSessionsResponse.data || [];
      const attendanceStats = attendanceStatsResponse.data || {};
      const notifications = notificationsResponse.data.results || notificationsResponse.data || [];

      const teachers = users.filter(u => u.role === 'teacher').length;
      const students = users.filter(u => u.role === 'student').length;
      const hods = users.filter(u => u.role === 'hod').length;
      const admins = users.filter(u => u.role === 'admin').length;
      const departmentsWithoutHod = departments.filter(d => !d.hod).length;

      const recentActivities = notifications.slice(0, 5).map(item => ({
        id: item.id,
        action: item.title || 'Notification',
        user: item.user_name || 'System',
        time: item.created_at ? new Date(item.created_at).toLocaleString() : '—'
      }));

      setStats({
        totalUsers: users.length,
        totalDepartments: departments.length,
        activeSessions: activeSessions.length,
        usersByRole: {
          teachers,
          students,
          hods,
          admins
        },
        departmentsWithoutHod,
        attendanceToday: {
          total: attendanceStats.total || 0,
          present: attendanceStats.present || 0,
          absent: attendanceStats.absent || 0,
          late: attendanceStats.late || 0,
          percentage: attendanceStats.percentage || 0
        },
        recentActivities
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Admin overview</p>
          <h1>Welcome back{user?.first_name ? `, ${user.first_name}` : ''} 👋</h1>
          <p className="subtitle">Monitor the college-wide attendance system and act fast on bottlenecks.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate('/admin/reports')}>View Reports</button>
          <button className="btn-primary" onClick={() => navigate('/admin/users')}>Add User</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <p className="label">Total Users</p>
            <h3>{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <p className="label">Departments</p>
            <h3>{stats.totalDepartments}</h3>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <p className="label">Teachers</p>
            <h3>{stats.usersByRole.teachers}</h3>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">👨‍🎓</div>
          <div className="stat-content">
            <p className="label">Students</p>
            <h3>{stats.usersByRole.students}</h3>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <p className="label">Active Sessions</p>
            <h3>{stats.activeSessions}</h3>
          </div>
        </div>
      </div>

      {/* Attention & Quick Tasks */}
      <div className="two-column">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Attention</p>
              <h2>Action Items</h2>
            </div>
          </div>
          <div className="attention-grid">
            <div className="attention-card warning">
              <div>
                <p className="eyebrow">HOD Assignment</p>
                <h3>{stats.departmentsWithoutHod}</h3>
                <p className="small">Departments without a HOD</p>
              </div>
              <button className="btn-link" onClick={() => navigate('/admin/assign-hod')}>Assign now →</button>
            </div>
            <div className="attention-card info">
              <div>
                <p className="eyebrow">Sessions</p>
                <h3>{stats.activeSessions}</h3>
                <p className="small">Classes currently running</p>
              </div>
              <button className="btn-link" onClick={() => navigate('/admin/sessions')}>View sessions →</button>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Shortcuts</p>
              <h2>Quick Management</h2>
            </div>
          </div>
          <div className="quick-actions">
            <button className="action-btn" onClick={() => navigate('/admin/users')}>
              <span className="icon">👥</span>
              <span className="text">Users</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/departments')}>
              <span className="icon">🏫</span>
              <span className="text">Departments</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/subjects')}>
              <span className="icon">📘</span>
              <span className="text">Subjects</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/semesters')}>
              <span className="icon">🗓️</span>
              <span className="text">Semesters</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/assign-hod')}>
              <span className="icon">👔</span>
              <span className="text">Assign HOD</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/assign-teachers')}>
              <span className="icon">👨‍🏫</span>
              <span className="text">Assign Teachers</span>
            </button>
            <button className="action-btn" onClick={() => navigate('/admin/reports')}>
              <span className="icon">📊</span>
              <span className="text">Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">People</p>
            <h2>User Distribution</h2>
          </div>
        </div>
        <div className="user-distribution">
          {[
            { label: 'Teachers', value: stats.usersByRole.teachers, className: 'teacher' },
            { label: 'Students', value: stats.usersByRole.students, className: 'student' },
            { label: 'HODs', value: stats.usersByRole.hods, className: 'hod' },
            { label: 'Admins', value: stats.usersByRole.admins, className: 'admin' }
          ].map(item => {
            const total = Math.max(stats.totalUsers, 1);
            const pct = Math.round((item.value / total) * 100);
            return (
              <div className="distribution-card" key={item.label}>
                <div className={`distribution-icon ${item.className}`}>👤</div>
                <div className="distribution-details">
                  <div className="distribution-header">
                    <h3>{item.value}</h3>
                    <span className="pill">{pct}%</span>
                  </div>
                  <p>{item.label}</p>
                  <div className={`distribution-bar ${item.className}`}>
                    <div className="fill" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Latest</p>
            <h2>Recent Activities</h2>
          </div>
          <button className="btn-link" onClick={() => navigate('/admin/logs')}>
            View all logs →
          </button>
        </div>
        <div className="activities-list">
          {stats.recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">📌</div>
              <div className="activity-details">
                <p className="activity-action">{activity.action}</p>
                <p className="activity-meta">by {activity.user} • {activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
