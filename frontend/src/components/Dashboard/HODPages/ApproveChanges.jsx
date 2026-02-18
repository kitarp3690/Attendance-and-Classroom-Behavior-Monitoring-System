import React, { useState, useEffect } from 'react';
import { attendanceChangeAPI } from '../../../services/api';
import './HODPages.css';

const ApproveChanges = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [filterStatus, setFilterStatus] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [actionNotes, setActionNotes] = useState('');
    const [actionType, setActionType] = useState('approve');

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [requests, filterStatus]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await attendanceChangeAPI.getPending();
            const data = response.data.results || response.data || [];
            setRequests(data);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        if (filterStatus === 'pending') {
            setFilteredRequests(requests.filter(r => !r.approved_at));
        } else if (filterStatus === 'approved') {
            setFilteredRequests(requests.filter(r => r.approved_at && r.approved_by));
        } else {
            setFilteredRequests(requests);
        }
    };

    const handleAction = (request, action) => {
        setSelectedRequest(request);
        setActionType(action);
        setActionNotes('');
        setShowModal(true);
    };

    const submitAction = async () => {
        try {
            if (actionType === 'approve') {
                await attendanceChangeAPI.approve(selectedRequest.id, { notes: actionNotes });
                alert('Request approved!');
            } else {
                await attendanceChangeAPI.reject(selectedRequest.id, { notes: actionNotes });
                alert('Request rejected!');
            }
            setShowModal(false);
            fetchRequests();
        } catch (err) {
            console.error('Error processing request:', err);
            alert('Failed to process request');
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1><i className="fa fa-check-square"></i> Approve Change Requests</h1>
                <p>Review and approve attendance change requests from students and teachers</p>
            </div>

            <div className="filters-section">
                <div className="filter-group">
                    <label>Filter by Status:</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="all">All</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="alert-banner alert-danger">
                    <i className="fa fa-exclamation-circle"></i>
                    <div>{error}</div>
                </div>
            )}

            <div className="requests-container">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                        <div key={request.id} className="request-card">
                            <div className="request-header">
                                <div>
                                    <h3>
                                        {request.attendance?.student?.first_name} {request.attendance?.student?.last_name}
                                    </h3>
                                    <p className="request-meta">
                                        <i className="fa fa-calendar"></i> {new Date(request.changed_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`status-badge status-${request.old_status}`}>
                                    {request.old_status?.toUpperCase()}
                                </span>
                            </div>

                            <div className="request-body">
                                <div className="change-info">
                                    <div className="change-from">
                                        <strong>From:</strong>
                                        <span>{request.old_status}</span>
                                    </div>
                                    <div className="change-arrow">→</div>
                                    <div className="change-to">
                                        <strong>To:</strong>
                                        <span>{request.new_status}</span>
                                    </div>
                                </div>

                                <div className="request-details">
                                    <div className="detail-row">
                                        <strong>Reason:</strong>
                                        <span>{request.reason}</span>
                                    </div>
                                    <div className="detail-row">
                                        <strong>Subject:</strong>
                                        <span>{request.attendance?.session?.subject?.name}</span>
                                    </div>
                                    {request.notes && (
                                        <div className="detail-row">
                                            <strong>Notes:</strong>
                                            <span>{request.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {!request.approved_at && (
                                <div className="request-actions">
                                    <button 
                                        className="btn-sm btn-success"
                                        onClick={() => handleAction(request, 'approve')}
                                    >
                                        <i className="fa fa-check"></i> Approve
                                    </button>
                                    <button 
                                        className="btn-sm btn-danger"
                                        onClick={() => handleAction(request, 'reject')}
                                    >
                                        <i className="fa fa-times"></i> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <i className="fa fa-inbox"></i>
                        <p>No requests to display</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{actionType === 'approve' ? 'Approve Request' : 'Reject Request'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Student: {selectedRequest?.attendance?.student?.first_name} {selectedRequest?.attendance?.student?.last_name}</label>
                            </div>
                            <div className="form-group">
                                <label>Change: {selectedRequest?.old_status} → {selectedRequest?.new_status}</label>
                            </div>
                            <div className="form-group">
                                <label htmlFor="notes">Additional Notes:</label>
                                <textarea 
                                    id="notes"
                                    value={actionNotes}
                                    onChange={(e) => setActionNotes(e.target.value)}
                                    rows="3"
                                    placeholder="Add any notes about this decision..."
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className={actionType === 'approve' ? 'btn-success' : 'btn-danger'} 
                                onClick={submitAction}
                            >
                                {actionType === 'approve' ? 'Approve' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApproveChanges;
