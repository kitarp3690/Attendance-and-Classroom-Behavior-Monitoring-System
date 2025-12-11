import React, { useState, useEffect } from 'react';
import { attendanceAPI, attendanceChangeAPI } from '../../services/api';
import './StudentPages.css';

export default function ViewAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [requestReason, setRequestReason] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceAPI.getStudentAttendance();
      setAttendance(res.data || []);
    } catch (err) {
      setError('Error loading attendance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestChange = async () => {
    if (!selectedRecord || !requestReason.trim()) {
      alert('Please select a record and provide a reason');
      return;
    }

    try {
      await attendanceChangeAPI.create({
        attendance: selectedRecord.id,
        requested_status: selectedRecord.status === 'absent' ? 'present' : 'absent',
        reason: requestReason
      });
      setShowRequestModal(false);
      setSelectedRecord(null);
      setRequestReason('');
      fetchAttendance();
      alert('Change request submitted successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;

  return (
    <div className="student-page">
      <div className="page-header">
        <h1>📊 My Attendance</h1>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card present">
          <div className="stat-value">{presentCount}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card absent">
          <div className="stat-value">{absentCount}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card late">
          <div className="stat-value">{lateCount}</div>
          <div className="stat-label">Late</div>
        </div>
        <div className="stat-card total">
          <div className="stat-value">{attendance.length}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="page-section">
        <h2>Attendance Records</h2>
        {attendance.length === 0 ? (
          <p className="empty-state">No attendance records</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Class</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map(record => (
                  <tr key={record.id} className={`status-${record.status}`}>
                    <td>{new Date(record.created_at).toLocaleDateString()}</td>
                    <td>{record.class_name}</td>
                    <td>{record.subject_name}</td>
                    <td>
                      <span className={`badge badge-${record.status}`}>
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

      {/* Request Change Modal */}
      {showRequestModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Attendance Change</h2>
              <button className="close-btn" onClick={() => setShowRequestModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p><strong>Date:</strong> {new Date(selectedRecord.created_at).toLocaleDateString()}</p>
              <p><strong>Current Status:</strong> {selectedRecord.status.toUpperCase()}</p>
              <p><strong>Requested Status:</strong> {selectedRecord.status === 'absent' ? 'PRESENT' : 'ABSENT'}</p>
              
              <div className="form-group">
                <label>Reason for Request *</label>
                <textarea
                  value={requestReason}
                  onChange={e => setRequestReason(e.target.value)}
                  placeholder="Explain why you're requesting this change..."
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRequestModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleRequestChange}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
