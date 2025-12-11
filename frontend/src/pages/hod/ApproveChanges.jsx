import React, { useState, useEffect } from 'react';
import { attendanceChangeAPI } from '../../services/api';
import './HODPages.css';

export default function ApproveChanges() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    fetchChanges();
  }, []);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      const res = await attendanceChangeAPI.getAll({ page_size: 100 });
      setChanges(res.data.results || res.data || []);
    } catch (err) {
      setError('Error loading changes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (changeId) => {
    try {
      await attendanceChangeAPI.approve(changeId);
      fetchChanges();
      alert('Change approved successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleReject = async (changeId) => {
    try {
      await attendanceChangeAPI.reject(changeId);
      fetchChanges();
      alert('Change rejected successfully!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) return <div className="loading-container"><p>Loading...</p></div>;

  const filteredChanges = changes.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const pendingCount = changes.filter(c => c.status === 'pending').length;

  return (
    <div className="hod-page">
      <div className="page-header">
        <h1>✅ Approve Attendance Changes</h1>
        {pendingCount > 0 && (
          <span className="badge badge-danger">{pendingCount} Pending</span>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="page-section">
        <div className="filter-bar">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>

        {filteredChanges.length === 0 ? (
          <p className="empty-state">
            {filterStatus === 'pending' ? 'No pending changes' : 'No changes found'}
          </p>
        ) : (
          <div className="changes-list">
            {filteredChanges.map(change => (
              <div key={change.id} className={`change-card status-${change.status}`}>
                <div className="change-header">
                  <h3>{change.student_name}</h3>
                  <span className={`badge badge-${change.status}`}>
                    {change.status.toUpperCase()}
                  </span>
                </div>
                <div className="change-content">
                  <p><strong>Class:</strong> {change.class_name}</p>
                  <p><strong>Date:</strong> {new Date(change.created_at).toLocaleDateString()}</p>
                  <p><strong>Current Status:</strong> {change.current_status}</p>
                  <p><strong>Requested Status:</strong> {change.requested_status}</p>
                  <p><strong>Reason:</strong> {change.reason}</p>
                </div>
                {change.status === 'pending' && (
                  <div className="change-actions">
                    <button
                      className="btn-sm btn-success"
                      onClick={() => handleApprove(change.id)}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => handleReject(change.id)}
                    >
                      ✕ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
