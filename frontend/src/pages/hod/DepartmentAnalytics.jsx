import React, { useState, useEffect } from 'react';
import { classAPI, attendanceAPI } from '../../services/api';
import './HODPages.css';

export default function DepartmentAnalytics() {
  const [analytics, setAnalytics] = useState({
    classCount: 0,
    studentCount: 0,
    teacherCount: 0,
    avgAttendance: 0,
    classDetails: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [classRes, attendanceRes] = await Promise.all([
        classAPI.getAll({ page_size: 100 }),
        attendanceAPI.getAll({ page_size: 1000 })
      ]);

      const classes = classRes.data.results || classRes.data || [];
      const attendance = attendanceRes.data.results || attendanceRes.data || [];

      // Process data
      const classDetails = classes.map(cls => {
        const classAttendance = attendance.filter(a => a.class_name === cls.name);
        const presentCount = classAttendance.filter(a => a.status === 'present').length;
        const totalCount = classAttendance.length;
        const avgPercentage = totalCount > 0 ? (presentCount / totalCount * 100).toFixed(2) : 0;

        return {
          id: cls.id,
          name: cls.name,
          code: cls.code,
          records: totalCount,
          avgAttendance: avgPercentage
        };
      });

      const avgAttendance = classDetails.length > 0
        ? (classDetails.reduce((sum, c) => sum + parseFloat(c.avgAttendance), 0) / classDetails.length).toFixed(2)
        : 0;

      setAnalytics({
        classCount: classes.length,
        studentCount: attendance.length,
        teacherCount: 0, // Would need teacher API
        avgAttendance: avgAttendance,
        classDetails: classDetails
      });
    } catch (err) {
      setError('Error loading analytics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  return (
    <div className="hod-page">
      <div className="page-header">
        <h1>📈 Department Analytics</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Key Metrics */}
      <div className="stats-grid">
        <div className="stat-card info">
          <div className="stat-value">{analytics.classCount}</div>
          <div className="stat-label">Total Classes</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{analytics.studentCount}</div>
          <div className="stat-label">Total Records</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{analytics.avgAttendance}%</div>
          <div className="stat-label">Average Attendance</div>
        </div>
      </div>

      {/* Class-wise Analytics */}
      <div className="page-section">
        <h2>Class-wise Attendance</h2>
        {analytics.classDetails.length === 0 ? (
          <p className="empty-state">No data available</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Code</th>
                  <th>Records</th>
                  <th>Avg Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {analytics.classDetails.map(cls => (
                  <tr key={cls.id}>
                    <td><strong>{cls.name}</strong></td>
                    <td>{cls.code}</td>
                    <td>{cls.records}</td>
                    <td>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${cls.avgAttendance}%` }}
                        >
                          {cls.avgAttendance}%
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
