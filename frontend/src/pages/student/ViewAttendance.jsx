import React, { useState, useEffect } from 'react';
import { attendanceAPI, attendanceChangeAPI } from '../../services/api';
import './StudentPages.css';

export default function ViewAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [requestReason, setRequestReason] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [viewMode, setViewMode] = useState('all'); // all, bySubject, pending

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceAPI.getStudentAttendance();
      setAttendance(res.data || []);
      setError(null);
    } catch (err) {
      setError('Error loading attendance: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChange = async () => {
    if (!selectedRecord || !requestReason.trim()) {
      setError('Please select a record and provide a reason');
      return;
    }

    try {
      setLoading(true);
      await attendanceChangeAPI.create({
        attendance: selectedRecord.id,
        requested_status: selectedRecord.status === 'absent' ? 'present' : 'absent',
        reason: requestReason
      });
      setSuccess('✅ Change request submitted successfully!');
      setShowRequestModal(false);
      setSelectedRecord(null);
      setRequestReason('');
      setTimeout(() => setSuccess(null), 3000);
      await fetchAttendance();
    } catch (err) {
      setError('Error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && attendance.length === 0) {
    return <div className="loading-container"><p>Loading...</p></div>;
  }

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;
  const totalCount = attendance.length;
  const attendancePercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Calculate per-subject statistics
  const subjectStats = {};
  attendance.forEach(record => {
    const subject = record.subject_name || 'Unknown';
    if (!subjectStats[subject]) {
      subjectStats[subject] = { present: 0, absent: 0, late: 0, total: 0 };
    }
    subjectStats[subject].total++;
    if (record.status === 'present') subjectStats[subject].present++;
    else if (record.status === 'absent') subjectStats[subject].absent++;
    else if (record.status === 'late') subjectStats[subject].late++;
  });

  // Health indicator color
  const getHealthColor = (percentage) => {
    if (percentage >= 90) return { color: '#28a745', label: '🟢 Excellent', emoji: '✅' };
    if (percentage >= 75) return { color: '#ffc107', label: '🟡 Good', emoji: '⚠️' };
    return { color: '#dc3545', label: '🔴 At Risk', emoji: '⛔' };
  };

  const health = getHealthColor(attendancePercentage);

  // Filter records
  let displayRecords = attendance;
  if (filterSubject !== 'all') {
    displayRecords = attendance.filter(a => a.subject_name === filterSubject);
  }

  const subjects = ['all', ...Object.keys(subjectStats)];

  return (
    <div className="student-page">
      <div className="page-header">
        <h1>📊 My Attendance</h1>
        <div style={{ 
          padding: '12px 20px', 
          borderRadius: '8px',
          backgroundColor: health.color + '20',
          border: `2px solid ${health.color}`,
          textAlign: 'center'
        }}>
          <div style={{ color: health.color, fontWeight: 'bold', fontSize: '14px' }}>
            {health.label}
          </div>
          <div style={{ color: health.color, fontSize: '24px', fontWeight: 'bold' }}>
            {attendancePercentage}% {health.emoji}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
        <strong>❌ Error:</strong> {error}
      </div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}>
        {success}
      </div>}

      {/* Overall Statistics */}
      <div className="stats-grid">
        <div className="stat-card present">
          <div className="stat-value">{presentCount}</div>
          <div className="stat-label">Present</div>
          <div className="stat-percentage">{totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%</div>
        </div>
        <div className="stat-card absent">
          <div className="stat-value">{absentCount}</div>
          <div className="stat-label">Absent</div>
          <div className="stat-percentage">{totalCount > 0 ? Math.round((absentCount / totalCount) * 100) : 0}%</div>
        </div>
        <div className="stat-card late">
          <div className="stat-value">{lateCount}</div>
          <div className="stat-label">Late</div>
          <div className="stat-percentage">{totalCount > 0 ? Math.round((lateCount / totalCount) * 100) : 0}%</div>
        </div>
        <div className="stat-card total">
          <div className="stat-value">{totalCount}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="filter-tabs" style={{ marginBottom: '20px' }}>
        <button
          className={`filter-btn ${viewMode === 'all' ? 'active' : ''}`}
          onClick={() => setViewMode('all')}
          disabled={loading}
        >
          📋 All Records
        </button>
        <button
          className={`filter-btn ${viewMode === 'bySubject' ? 'active' : ''}`}
          onClick={() => setViewMode('bySubject')}
          disabled={loading}
        >
          📚 By Subject
        </button>
      </div>

      {viewMode === 'all' && (
        <div className="page-section">
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>📋 Attendance Records</h2>
            <select 
              value={filterSubject} 
              onChange={e => setFilterSubject(e.target.value)}
              disabled={loading}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: '#fff',
                cursor: 'pointer'
              }}
            >
              {subjects.map(s => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Subjects' : s}
                </option>
              ))}
            </select>
          </div>

          {displayRecords.length === 0 ? (
            <p className="empty-state">No attendance records</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRecords.map(record => (
                    <tr key={record.id} className={`status-${record.status}`}>
                      <td>{new Date(record.session_date || record.created_at).toLocaleDateString()}</td>
                      <td>{record.subject_name || 'N/A'}</td>
                      <td>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: 
                            record.status === 'present' ? '#d4edda' :
                            record.status === 'absent' ? '#f8d7da' : '#fff3cd',
                          color:
                            record.status === 'present' ? '#155724' :
                            record.status === 'absent' ? '#721c24' : '#856404'
                        }}>
                          {record.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {record.status !== 'present' && (
                          <button
                            className="btn-sm btn-info"
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowRequestModal(true);
                            }}
                            disabled={loading}
                          >
                            Request Change
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewMode === 'bySubject' && (
        <div className="page-section">
          <h2>📚 Attendance by Subject</h2>
          {Object.keys(subjectStats).length === 0 ? (
            <p className="empty-state">No attendance data by subject</p>
          ) : (
            <div className="subject-stats-grid">
              {Object.keys(subjectStats).map(subject => {
                const stats = subjectStats[subject];
                const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
                const health = getHealthColor(percentage);
                
                return (
                  <div key={subject} className="subject-stat-card" style={{
                    border: `2px solid ${health.color}`,
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: health.color + '05'
                  }}>
                    <h3 style={{ color: health.color, marginBottom: '10px' }}>
                      {health.emoji} {subject}
                    </h3>
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: health.color }}>
                        {percentage}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        ({stats.present}/{stats.total} sessions)
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-around' }}>
                      <span>🟢 Present: {stats.present}</span>
                      <span>🔴 Absent: {stats.absent}</span>
                      <span>🟡 Late: {stats.late}</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '4px',
                      marginTop: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: health.color,
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Request Change Modal */}
      {showRequestModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📝 Request Attendance Change</h2>
              <button className="close-btn" onClick={() => setShowRequestModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: '#f8f9fa',
                marginBottom: '20px'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>📅 Date:</strong> {new Date(selectedRecord.session_date || selectedRecord.created_at).toLocaleDateString()}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>📚 Subject:</strong> {selectedRecord.subject_name}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Current Status:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: selectedRecord.status === 'absent' ? '#f8d7da' : '#fff3cd',
                    color: selectedRecord.status === 'absent' ? '#721c24' : '#856404',
                    fontWeight: 'bold'
                  }}>
                    {selectedRecord.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <strong>Requesting:</strong>
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    fontWeight: 'bold'
                  }}>
                    {selectedRecord.status === 'absent' ? 'PRESENT' : 'ABSENT'}
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Reason for Request <span style={{ color: 'red' }}>*</span></label>
                <textarea
                  value={requestReason}
                  onChange={e => setRequestReason(e.target.value)}
                  placeholder="Explain why you're requesting this change (e.g., Medical reason, Instructor error, Emergency)..."
                  rows="4"
                  disabled={loading}
                />
                <small style={{ color: '#666' }}>Your request will be reviewed by the Head of Department</small>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowRequestModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleRequestChange}
                disabled={loading || !requestReason.trim()}
              >
                {loading ? 'Submitting...' : '✓ Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
