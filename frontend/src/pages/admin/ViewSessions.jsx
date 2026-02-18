import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../../services/api';
import './AdminPages.css';

export default function ViewSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, ended

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await sessionAPI.getAll({ page_size: 200 });
      setSessions(res.data.results || res.data || []);
      setError(null);
    } catch (err) {
      setError('Error loading sessions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSessions = () => {
    if (filterStatus === 'all') return sessions;
    if (filterStatus === 'active') return sessions.filter(s => s.is_active);
    if (filterStatus === 'ended') return sessions.filter(s => !s.is_active);
    return sessions;
  };

  if (loading) return <div className="loading-container"><p>⏳ Loading...</p></div>;

  const filteredSessions = getFilteredSessions();
  const activeCount = sessions.filter(s => s.is_active).length;
  const endedCount = sessions.filter(s => !s.is_active).length;

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>📚 All Sessions</h1>
          <p className="subtitle">View and monitor all class sessions</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter */}
      <div className="page-section">
        <div className="form-group">
          <label>Filter by Status</label>
          <select 
            className="form-control"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All Sessions ({sessions.length})</option>
            <option value="active">🟢 Active ({activeCount})</option>
            <option value="ended">⚫ Ended ({endedCount})</option>
          </select>
        </div>
      </div>

      <div className="page-section">
        <h2>Sessions ({filteredSessions.length})</h2>
        {filteredSessions.length === 0 ? (
          <p className="empty-state">
            {filterStatus === 'all' 
              ? 'No sessions found' 
              : `No ${filterStatus} sessions`}
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Teacher</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Department</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map(session => {
                  const startTime = new Date(session.start_time);
                  const endTime = session.end_time ? new Date(session.end_time) : null;
                  const now = new Date();
                  const durationMs = endTime 
                    ? (endTime - startTime)
                    : (session.is_active ? (now - startTime) : 0);
                  const durationMin = Math.floor(durationMs / 60000);

                  return (
                    <tr key={session.id}>
                      <td>
                        <span className={`status-badge ${session.is_active ? 'success' : 'secondary'}`}>
                          {session.is_active ? '🟢 Active' : '⚫ Ended'}
                        </span>
                      </td>
                      <td>{session.teacher_name || 'N/A'}</td>
                      <td>
                        <strong>{session.subject_name || 'N/A'}</strong>
                        <br />
                        <small>{session.subject_code || ''}</small>
                      </td>
                      <td>
                        {session.class_name || 'N/A'}
                        {session.class_section && ` - ${session.class_section}`}
                      </td>
                      <td>{session.department_name || '-'}</td>
                      <td>{startTime.toLocaleString()}</td>
                      <td>{endTime ? endTime.toLocaleString() : '-'}</td>
                      <td>
                        <strong>{durationMin}</strong> min
                        {session.is_active && <span style={{ color: 'green' }}> (ongoing)</span>}
                      </td>
                      <td>
                        <span className="badge badge-success">{session.present_count || 0} Present</span>
                        <span className="badge badge-danger">{session.absent_count || 0} Absent</span>
                        {session.late_count > 0 && (
                          <span className="badge badge-warning">{session.late_count} Late</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
