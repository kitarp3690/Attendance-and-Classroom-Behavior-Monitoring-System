import React, { useState, useEffect, useContext } from 'react';
import { attendanceChangeAPI, notificationAPI } from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import './HODPages.css';

export default function ApproveChanges() {
  const { user } = useContext(AuthContext);
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedChange, setSelectedChange] = useState(null);
  const [approvalReason, setApprovalReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(null);

  useEffect(() => {
    fetchChanges();
    const interval = setInterval(fetchChanges, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      const res = await attendanceChangeAPI.getPending({
        department: user?.department,
        page_size: 100
      });
      setChanges(res.data.results || res.data || []);
      setError(null);
    } catch (err) {
      setError('Error loading changes: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (changeId) => {
    try {
      setLoading(true);
      await attendanceChangeAPI.approve(changeId, {
        approval_reason: approvalReason
      });
      
      // Send notification to teacher and student
      const change = changes.find(c => c.id === changeId);
      if (change?.teacher_id) {
        await notificationAPI.create({
          user_id: change.teacher_id,
          type: 'approval',
          title: 'Attendance Change Approved',
          message: `Your attendance change request for ${change.student_name} has been approved.`,
          related_id: changeId
        }).catch(e => console.log('Notification error:', e));
      }
      if (change?.student_id) {
        await notificationAPI.create({
          user_id: change.student_id,
          type: 'approval',
          title: 'Attendance Change Approved',
          message: 'Your attendance change request has been approved by the HOD.',
          related_id: changeId
        }).catch(e => console.log('Notification error:', e));
      }

      setSuccess('✅ Attendance change approved successfully!');
      setApprovalReason('');
      setShowReasonModal(null);
      setTimeout(() => setSuccess(null), 3000);
      await fetchChanges();
    } catch (err) {
      setError('Error approving change: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (changeId) => {
    try {
      setLoading(true);
      await attendanceChangeAPI.reject(changeId, {
        rejection_reason: rejectionReason
      });
      
      // Send notification
      const change = changes.find(c => c.id === changeId);
      if (change?.teacher_id) {
        await notificationAPI.create({
          user_id: change.teacher_id,
          type: 'rejection',
          title: 'Attendance Change Rejected',
          message: `Your attendance change request for ${change.student_name} has been rejected.`,
          related_id: changeId
        }).catch(e => console.log('Notification error:', e));
      }

      setSuccess('❌ Attendance change rejected');
      setRejectionReason('');
      setShowReasonModal(null);
      setTimeout(() => setSuccess(null), 3000);
      await fetchChanges();
    } catch (err) {
      setError('Error rejecting change: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && changes.length === 0) {
    return <div className="loading-container"><p>Loading...</p></div>;
  }

  const filteredChanges = changes.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const pendingCount = changes.filter(c => c.status === 'pending').length;
  const approvedCount = changes.filter(c => c.status === 'approved').length;
  const rejectedCount = changes.filter(c => c.status === 'rejected').length;

  const statusBadgeStyle = (status) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    backgroundColor: 
      status === 'pending' ? '#fff3cd' :
      status === 'approved' ? '#d4edda' : '#f8d7da',
    color:
      status === 'pending' ? '#856404' :
      status === 'approved' ? '#155724' : '#721c24'
  });

  return (
    <div className="hod-page">
      <div className="page-header">
        <h1>✅ Approve Attendance Changes</h1>
        <div className="header-stats">
          <div className="stat-mini">
            <span className="stat-label">Pending</span>
            <span className="stat-value">{pendingCount}</span>
          </div>
          <div className="stat-mini">
            <span className="stat-label">Approved</span>
            <span className="stat-value">{approvedCount}</span>
          </div>
          <div className="stat-mini">
            <span className="stat-label">Rejected</span>
            <span className="stat-value">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
        <strong>❌ Error:</strong> {error}
      </div>}
      {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}>
        {success}
      </div>}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filterStatus === f ? 'active' : ''}`}
            onClick={() => setFilterStatus(f)}
            disabled={loading}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="page-section">
        {filteredChanges.length === 0 ? (
          <p className="empty-state">
            {filterStatus === 'pending' ? 'No pending changes' : 'No changes found'}
          </p>
        ) : (
          <div className="changes-list">
            {filteredChanges.map(change => (
              <div key={change.id} className="change-card">
                <div className="change-header">
                  <div className="change-title">
                    <h3>{change.student_name}</h3>
                    <p className="change-subtitle">
                      {change.class_name} • {new Date(change.session_date || change.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span style={statusBadgeStyle(change.status)}>
                    {change.status.toUpperCase()}
                  </span>
                </div>

                <div className="change-details">
                  <div className="detail-row">
                    <span className="detail-label">Request Date:</span>
                    <span className="detail-value">
                      {new Date(change.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Original Status:</span>
                    <span className="detail-value" style={{ 
                      fontWeight: 'bold',
                      color: change.original_status === 'present' ? '#28a745' : 
                             change.original_status === 'absent' ? '#dc3545' : '#ffc107'
                    }}>
                      {change.original_status?.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Requested Status:</span>
                    <span className="detail-value" style={{ 
                      fontWeight: 'bold',
                      color: change.new_status === 'present' ? '#28a745' : 
                             change.new_status === 'absent' ? '#dc3545' : '#ffc107'
                    }}>
                      {change.new_status?.toUpperCase()}
                    </span>
                  </div>
                  {change.reason && (
                    <div className="detail-row">
                      <span className="detail-label">Reason:</span>
                      <span className="detail-value">{change.reason}</span>
                    </div>
                  )}
                  {change.status !== 'pending' && change.approval_reason && (
                    <div className="detail-row">
                      <span className="detail-label">Approval Note:</span>
                      <span className="detail-value">{change.approval_reason}</span>
                    </div>
                  )}
                  {change.status === 'rejected' && change.rejection_reason && (
                    <div className="detail-row">
                      <span className="detail-label">Rejection Reason:</span>
                      <span className="detail-value">{change.rejection_reason}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Requested by:</span>
                    <span className="detail-value">{change.teacher_name}</span>
                  </div>
                </div>

                {change.status === 'pending' && (
                  <div className="change-actions">
                    <button
                      className="btn-success"
                      onClick={() => {
                        setSelectedChange(change.id);
                        setShowReasonModal('approve');
                      }}
                      disabled={loading}
                    >
                      ✓ Approve
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => {
                        setSelectedChange(change.id);
                        setShowReasonModal('reject');
                      }}
                      disabled={loading}
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

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="modal-overlay" onClick={() => {
          setShowReasonModal(null);
          setApprovalReason('');
          setRejectionReason('');
        }}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {showReasonModal === 'approve' ? '✅ Approve Request' : '❌ Reject Request'}
              </h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowReasonModal(null);
                  setApprovalReason('');
                  setRejectionReason('');
                }}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  {showReasonModal === 'approve' ? 'Approval Note (Optional)' : 'Rejection Reason (Optional)'}
                </label>
                <textarea
                  value={showReasonModal === 'approve' ? approvalReason : rejectionReason}
                  onChange={e => showReasonModal === 'approve' 
                    ? setApprovalReason(e.target.value)
                    : setRejectionReason(e.target.value)
                  }
                  placeholder={showReasonModal === 'approve' 
                    ? 'Enter any additional notes...'
                    : 'Please provide a reason for rejection...'
                  }
                  rows="4"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowReasonModal(null);
                  setApprovalReason('');
                  setRejectionReason('');
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={showReasonModal === 'approve' ? 'btn-success' : 'btn-danger'}
                onClick={() => {
                  if (showReasonModal === 'approve') {
                    handleApprove(selectedChange);
                  } else {
                    handleReject(selectedChange);
                  }
                }}
                disabled={loading}
              >
                {loading ? 'Processing...' : (showReasonModal === 'approve' ? '✓ Confirm Approval' : '✕ Confirm Rejection')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
