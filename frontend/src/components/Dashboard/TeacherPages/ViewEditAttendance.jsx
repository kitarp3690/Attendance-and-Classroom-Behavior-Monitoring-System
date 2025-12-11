import React, { useState, useEffect } from "react";
import { attendanceAPI, attendanceChangeAPI, subjectAPI } from "../../../services/api";
import "./TeacherPages.css";

const ViewEditAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [editingId, setEditingId] = useState(null);
    const [editStatus, setEditStatus] = useState("");
    const [editReason, setEditReason] = useState("");
    const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterSubject, setFilterSubject] = useState("all");
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedForChange, setSelectedForChange] = useState(null);

    useEffect(() => {
        fetchAttendanceData();
        fetchSubjects();
    }, [filterDate, filterSubject]);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await attendanceAPI.getAll({ page_size: 1000 });
            const data = response.data.results || response.data || [];
            
            let filtered = data.map(record => ({
                id: record.id,
                student: record.student?.first_name + ' ' + record.student?.last_name,
                studentId: record.student?.id,
                rollNo: record.student?.student_id,
                date: new Date(record.session?.date || record.created_at).toISOString().split('T')[0],
                status: record.status,
                subject: record.session?.subject?.name || 'Unknown',
                sessionId: record.session?.id
            }));

            if (filterDate) {
                filtered = filtered.filter(r => r.date === filterDate);
            }
            if (filterSubject !== 'all') {
                filtered = filtered.filter(r => r.subject === filterSubject);
            }

            setAttendanceData(filtered);
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError('Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await subjectAPI.getAll({ page_size: 100 });
            setSubjects(response.data.results || response.data || []);
        } catch (err) {
            console.error('Error fetching subjects:', err);
        }
    };

    const handleEdit = (record) => {
        setSelectedForChange(record);
        setEditStatus(record.status);
        setEditReason("");
        setShowRequestModal(true);
    };

    const handleRequestChange = async () => {
        if (!editReason.trim()) {
            alert('Please provide a reason for the change');
            return;
        }

        try {
            await attendanceChangeAPI.create({
                attendance: selectedForChange.id,
                old_status: selectedForChange.status,
                new_status: editStatus,
                reason: editReason
            });
            alert('Change request submitted for approval');
            setShowRequestModal(false);
            fetchAttendanceData();
        } catch (err) {
            console.error('Error:', err);
            alert('Failed to submit change request');
        }
    };

    const handleCancel = () => {
        setShowRequestModal(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                await attendanceAPI.delete(id);
                alert('Record deleted');
                fetchAttendanceData();
            } catch (err) {
                console.error('Error:', err);
                alert('Failed to delete record');
            }
        }
    };

    const filteredData = attendanceData.filter(record => record.date === filterDate);

    const stats = {
        total: filteredData.length,
        present: filteredData.filter(d => d.status === 'present').length,
        absent: filteredData.filter(d => d.status === 'absent').length,
        late: filteredData.filter(d => d.status === 'late').length
    };

    return (
        <div className="teacher-page">
            <div className="page-header">
                <h1><i className="fa fa-edit"></i> View/Edit Attendance</h1>
                <button className="btn-primary"><i className="fa fa-download"></i> Export</button>
            </div>

            {error && (
                <div className="alert-banner alert-danger">
                    <i className="fa fa-exclamation-circle"></i>
                    {error}
                </div>
            )}

            <div className="filters-section">
                <div className="filter-item">
                    <label>Filter by Date</label>
                    <input 
                        type="date" 
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                <div className="filter-item">
                    <label>Filter by Subject</label>
                    <select 
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                    >
                        <option value="all">All Subjects</option>
                        {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                </div>
                <div className="filter-stats">
                    <div className="stat">
                        <strong>{stats.total}</strong> Total Records
                    </div>
                    <div className="stat">
                        <strong style={{color: 'var(--success)'}}>{stats.present}</strong> Present
                    </div>
                    <div className="stat">
                        <strong style={{color: 'var(--danger)'}}>{stats.absent}</strong> Absent
                    </div>
                    <div className="stat">
                        <strong style={{color: 'var(--warning)'}}>{stats.late}</strong> Late
                    </div>
                </div>
            </div>

            <div className="attendance-edit-table-wrapper">
                <table className="attendance-edit-table">
                    <thead>
                        <tr>
                            <th>Roll No</th>
                            <th>Student Name</th>
                            <th>Subject</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map(record => (
                                <tr key={record.id}>
                                    <td>{record.rollNo}</td>
                                    <td>{record.student}</td>
                                    <td>{record.subject}</td>
                                    <td>{record.date}</td>
                                    <td>
                                        <span className={`status-badge status-${record.status.toLowerCase()}`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-icon btn-edit"
                                                onClick={() => handleEdit(record)}
                                                title="Request Change"
                                            >
                                                <i className="fa fa-edit"></i>
                                            </button>
                                            <button 
                                                className="btn-icon btn-delete"
                                                onClick={() => handleDelete(record.id)}
                                                title="Delete"
                                            >
                                                <i className="fa fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="empty-message">No attendance records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Change Request Modal */}
            {showRequestModal && selectedForChange && (
                <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Request Attendance Change</h2>
                            <button className="btn-close" onClick={() => setShowRequestModal(false)}>×</button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); handleRequestChange(); }}>
                            <div className="form-group">
                                <label>Student</label>
                                <input type="text" value={selectedForChange.student} disabled />
                            </div>
                            <div className="form-group">
                                <label>Current Status</label>
                                <input type="text" value={selectedForChange.status} disabled />
                            </div>
                            <div className="form-group">
                                <label>New Status</label>
                                <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Reason for Change *</label>
                                <textarea 
                                    value={editReason}
                                    onChange={(e) => setEditReason(e.target.value)}
                                    placeholder="Explain why you're requesting this change..."
                                    rows="4"
                                    required
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
                                <button type="submit" className="btn-primary">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewEditAttendance;
                                                    title="Cancel"
                                                >
                                                    <i className="fa fa-times"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-icon btn-edit"
                                                    onClick={() => handleEdit(record.id, record.status)}
                                                    title="Edit"
                                                >
                                                    <i className="fa fa-edit"></i>
                                                </button>
                                                <button 
                                                    className="btn-icon btn-delete"
                                                    onClick={() => handleDelete(record.id)}
                                                    title="Delete"
                                                >
                                                    <i className="fa fa-trash"></i>
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="empty-message">No attendance records for this date</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewEditAttendance;
