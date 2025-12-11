import React, { useState, useEffect } from 'react';
import { attendanceAPI, attendanceChangeAPI } from '../../services/api';
import './TeacherPages.css';

export default function ViewEditAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceAPI.getAll({ page_size: 100 });
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
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="page-section">
        <div className="filter-bar">
          <label>Filter by Status:</label>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>

        {filteredRecords.length === 0 ? (
          <p className="empty-state">No attendance records</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Pending Changes</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id} className={`status-${record.status}`}>
                    <td>{record.student_name}</td>
                    <td>{record.class_name}</td>
                    <td>{new Date(record.date || record.created_at).toLocaleDateString()}</td>
                    <td className={`badge badge-${record.status}`}>{record.status.toUpperCase()}</td>
                    <td>
                      {record.pending_changes ? (
                        <span className="badge badge-warning">⏳ {record.pending_changes} change(s)</span>
                      ) : (
                        '—'
                      )}
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
