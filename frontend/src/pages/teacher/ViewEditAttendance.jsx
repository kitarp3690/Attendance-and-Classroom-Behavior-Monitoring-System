import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { attendanceAPI, attendanceChangeAPI, sessionAPI } from '../../services/api';
import './TeacherPages.css';

export default function ViewEditAttendance() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchSessions();
      fetchAttendance();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      fetchAttendance();
    }
  }, [selectedSession, filter]);

  const fetchSessions = async () => {
    try {
      const res = await sessionAPI.getAll({ teacher: user.id, page_size: 100 });
      setSessions(res.data.results || res.data || []);
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = { teacher: user.id, page_size: 200 };
      if (selectedSession) {
        params.session = selectedSession;
      }
      const res = await attendanceAPI.getAll(params);
      setRecords(res.data.results || res.data || []);
    } catch (err) {
      setError('Error loading attendance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveChange = async (changeId) => {
    try {
      await attendanceChangeAPI.approve(changeId);
      fetchAttendance();
      alert('Change approved!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  const filteredRecords = records.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="teacher-page">
      <div className="page-header">
        <h1>📋 View & Edit Attendance</h1>
        <p className="subtitle">Only showing attendance for your sessions</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="page-section">
        <div className="filter-bar" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div>
            <label style={{ marginRight: '10px' }}>Session:</label>
            <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)}>
              <option value="">All Sessions</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.subject_name} - {s.class_name} ({new Date(s.start_time).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ marginRight: '10px' }}>Status:</label>
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <p className="empty-state">No attendance records found</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Session</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Confidence</th>
                  <th>Marked By</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id} className={`status-${record.status}`}>
                    <td>{record.student_name || 'N/A'}</td>
                    <td>{record.session_subject || 'N/A'}</td>
                    <td>{new Date(record.date || record.marked_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-${record.status}`}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {record.confidence_score ? (
                        <span style={{ color: record.confidence_score > 0.8 ? 'green' : 'orange' }}>
                          {(record.confidence_score * 100).toFixed(1)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td>{record.marked_by_name || 'Manual'}</td>
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
