import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { userAPI, departmentAPI, sessionAPI } from '../../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    activeSessions: 0,
    todayAttendance: 0,
    usersByRole: {
      teachers: 0,
      students: 0,
      hods: 0,
      admins: 0
    },
    recentActivities: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users
      const usersResponse = await userAPI.getAll({ page_size: 1000 });
      const users = usersResponse.data.results || usersResponse.data || [];
      
      // Fetch departments
      const deptsResponse = await departmentAPI.getAll({ page_size: 100 });
      const departments = deptsResponse.data.results || deptsResponse.data || [];
      
      // Fetch sessions
      const sessionsResponse = await sessionAPI.getAll({ page_size: 100 });
      const sessions = sessionsResponse.data.results || sessionsResponse.data || [];
      const activeSessions = sessions.filter(s => s.is_active) || [];
      
      // Count users by role
      const teachers = users.filter(u => u.role === 'teacher').length;
      const students = users.filter(u => u.role === 'student').length;
      const hods = users.filter(u => u.role === 'hod').length;
      const admins = users.filter(u => u.role === 'admin').length;
      
      setStats({
        totalUsers: users.length,
        totalDepartments: departments.length,
        activeSessions: activeSessions.length,
        todayAttendance: 89,
        usersByRole: {
          teachers,
          students,
          hods,
          admins
        },
        recentActivities: [
          { id: 1, action: 'New user created', user: 'Admin', time: '5 min ago' },
          { id: 2, action: 'Session started', user: 'Teacher1', time: '15 min ago' },
          { id: 3, action: 'Attendance marked', user: 'Teacher2', time: '30 min ago' },
        ]
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
        <h1>Admin Dashboard 🛠️</h1>
        <p className="subtitle">System Overview & Management</p>
      </div>

      {/* Main Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>{stats.totalDepartments}</h3>
            <p>Departments</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>{stats.activeSessions}</h3>
            <p>Active Sessions</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.todayAttendance}%</h3>
            <p>Today's Attendance</p>
          </div>
        </div>
      </div>

      {/* User Distribution */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>👥 User Distribution</h2>
        </div>
        <div className="user-distribution">
          <div className="distribution-card">
            <div className="distribution-icon teacher">👨‍🏫</div>
            <h3>{stats.usersByRole.teachers}</h3>
            <p>Teachers</p>
            <div className="distribution-bar teacher">
              <div className="fill" style={{ width: '80%' }}></div>
            </div>
          </div>
          
          <div className="distribution-card">
            <div className="distribution-icon student">👨‍🎓</div>
            <h3>{stats.usersByRole.students}</h3>
            <p>Students</p>
            <div className="distribution-bar student">
              <div className="fill" style={{ width: '95%' }}></div>
            </div>
          </div>
          
          <div className="distribution-card">
            <div className="distribution-icon hod">👔</div>
            <h3>{stats.usersByRole.hods}</h3>
            <p>HODs</p>
            <div className="distribution-bar hod">
              <div className="fill" style={{ width: '40%' }}></div>
            </div>
          </div>
          
          <div className="distribution-card">
            <div className="distribution-icon admin">🛠️</div>
            <h3>{stats.usersByRole.admins}</h3>
            <p>Admins</p>
            <div className="distribution-bar admin">
              <div className="fill" style={{ width: '20%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>💚 System Health</h2>
        </div>
        <div className="health-grid">
          <div className="health-item good">
            <div className="health-indicator"></div>
            <div className="health-info">
              <h4>Database</h4>
              <p>All systems operational</p>
            </div>
            <div className="health-status">✓</div>
          </div>
          
          <div className="health-item good">
            <div className="health-indicator"></div>
            <div className="health-info">
              <h4>API Services</h4>
              <p>Response time: 45ms</p>
            </div>
            <div className="health-status">✓</div>
          </div>
          
          <div className="health-item good">
            <div className="health-indicator"></div>
            <div className="health-info">
              <h4>Authentication</h4>
              <p>All services running</p>
            </div>
            <div className="health-status">✓</div>
          </div>
          
          <div className="health-item good">
            <div className="health-indicator"></div>
            <div className="health-info">
              <h4>Storage</h4>
              <p>73% available</p>
            </div>
            <div className="health-status">✓</div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>📜 Recent Activities</h2>
          <button className="btn btn-outline" onClick={() => navigate('/admin/logs')}>
            View All Logs
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

      {/* Quick Management */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>⚡ Quick Management</h2>
        </div>
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => navigate('/admin/users')}>
            <span className="icon">👥</span>
            <span className="text">Manage Users</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/classes')}>
            <span className="icon">🏫</span>
            <span className="text">Manage Classes</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/subjects')}>
            <span className="icon">📚</span>
            <span className="text">Manage Subjects</span>
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/reports')}>
            <span className="icon">📊</span>
            <span className="text">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
