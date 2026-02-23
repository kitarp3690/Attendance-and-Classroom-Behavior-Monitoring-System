import React, { useState, useEffect } from "react";
import { attendanceAPI, userAPI, classAPI, subjectAPI } from "../services/api";
import "./AttendanceTable.css";

export default function AttendanceTable({ filterOptions, data, role, onDataChange }) {
    const [filters, setFilters] = useState({});
    const [search, setSearch] = useState("");
    const [attendanceData, setAttendanceData] = useState(data || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingRecord, setEditingRecord] = useState(null);
    const [editForm, setEditForm] = useState({ status: '', notes: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!data) {
            fetchAttendanceData(currentPage);
        } else {
            setAttendanceData(data);
        }
    }, [data, currentPage]);

    useEffect(() => {
        if (!data) {
            setCurrentPage(1);
            fetchAttendanceData(1);
        }
    }, [filters, data]);

    const fetchAttendanceData = async (page = currentPage) => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                ...filters
            };

            const response = await attendanceAPI.getAll(params);
            const results = response.data.results || response.data;
            const totalCount = response.data.count || results.length || 0;
            setAttendanceData(results || []);
            setTotalPages(Math.max(1, Math.ceil(totalCount / 20)));
            setCurrentPage(page);
        } catch (err) {
            console.error("Error fetching attendance data:", err);
            setError("Failed to load attendance data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record.id);
        setEditForm({
            status: record.status,
            notes: record.notes || ''
        });
    };

    const handleSaveEdit = async () => {
        try {
            setLoading(true);
            await attendanceAPI.update(editingRecord, editForm);
            setEditingRecord(null);
            fetchAttendanceData();
            if (onDataChange) onDataChange();
        } catch (err) {
            console.error("Error updating attendance:", err);
            setError("Failed to update attendance record.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (recordId) => {
        if (!window.confirm("Are you sure you want to delete this attendance record?")) {
            return;
        }

        try {
            setLoading(true);
            await attendanceAPI.delete(recordId);
            fetchAttendanceData();
            if (onDataChange) onDataChange();
        } catch (err) {
            console.error("Error deleting attendance:", err);
            setError("Failed to delete attendance record.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingRecord(null);
        setEditForm({ status: '', notes: '' });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'present': return 'present';
            case 'absent': return 'absent';
            case 'late': return 'late';
            default: return 'unknown';
        }
    };

    const filteredData = attendanceData.filter(record => {
        if (!search) return true;

        const studentName = record.student?.first_name + ' ' + record.student?.last_name || '';
        const subjectName = record.session?.subject?.name || '';
        const className = record.session?.class_assigned?.name || '';
        const teacherName = record.session?.teacher?.first_name + ' ' + record.session?.teacher?.last_name || '';

        const searchLower = search.toLowerCase();
        return studentName.toLowerCase().includes(searchLower) ||
               subjectName.toLowerCase().includes(searchLower) ||
               className.toLowerCase().includes(searchLower) ||
               teacherName.toLowerCase().includes(searchLower);
    });

    if (loading && attendanceData.length === 0) {
        return <div className="loading">Loading attendance data...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">{error}</div>
                <button onClick={fetchAttendanceData} className="retry-btn">Retry</button>
            </div>
        );
    }

    return (
        <div className="attendance-table-container">
            <div className="table-filters">
                {filterOptions && Object.keys(filterOptions).map((filter) => (
                    <select
                        key={filter}
                        style={{ marginRight: 7 }}
                        onChange={e => setFilters({ ...filters, [filter]: e.target.value })}
                        disabled={loading}
                    >
                        <option value="">All {filter}</option>
                        {filterOptions[filter].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ))}
                <input
                    type="text"
                    placeholder="Search students, subjects, classes..."
                    value={search}
                    style={{ marginLeft: 10 }}
                    onChange={e => setSearch(e.target.value)}
                    disabled={loading}
                />
                <button
                    onClick={fetchAttendanceData}
                    className="refresh-btn"
                    disabled={loading}
                    style={{ marginLeft: 10 }}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            <div className="attendance-table-wrapper">
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Class</th>
                            <th>Subject</th>
                            <th>Teacher</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                            <th>Confidence</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                                    {loading ? 'Loading...' : 'No attendance records found'}
                                </td>
                            </tr>
                        ) : (
                            filteredData.map(record => (
                                <tr key={record.id}>
                                    <td>
                                        {record.student ?
                                            `${record.student.first_name} ${record.student.last_name}` :
                                            'Unknown Student'
                                        }
                                    </td>
                                    <td>
                                        {record.session?.class_assigned?.name || 'N/A'}
                                    </td>
                                    <td>
                                        {record.session?.subject?.name || 'N/A'}
                                    </td>
                                    <td>
                                        {record.session?.teacher ?
                                            `${record.session.teacher.first_name} ${record.session.teacher.last_name}` :
                                            'N/A'
                                        }
                                    </td>
                                    <td>{formatDate(record.marked_at)}</td>
                                    <td>
                                        {editingRecord === record.id ? (
                                            <select
                                                value={editForm.status}
                                                onChange={e => setEditForm({...editForm, status: e.target.value})}
                                                className="status-select"
                                            >
                                                <option value="present">Present</option>
                                                <option value="absent">Absent</option>
                                                <option value="late">Late</option>
                                            </select>
                                        ) : (
                                            <span className={`status ${getStatusClass(record.status)}`}>
                                                {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {record.confidence ? `${(record.confidence * 100).toFixed(1)}%` : 'N/A'}
                                    </td>
                                    <td>
                                        {role !== "student" && (
                                            <>
                                                {editingRecord === record.id ? (
                                                    <>
                                                        <button
                                                            className="save-btn"
                                                            onClick={handleSaveEdit}
                                                            disabled={loading}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            className="cancel-btn"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => handleEdit(record)}
                                                            disabled={loading}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => handleDelete(record.id)}
                                                            disabled={loading}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button
                    onClick={() => fetchAttendanceData(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => fetchAttendanceData(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || loading}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
