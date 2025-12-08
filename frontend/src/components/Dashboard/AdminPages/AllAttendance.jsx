import React, { useState, useEffect } from "react";
import { attendanceAPI, classAPI, subjectAPI } from "../../../services/api";
import "./AdminPages.css";

const AllAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        class_assigned: "",
        status: "all",
        date: new Date().toISOString().split('T')[0],
        subject: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [attendanceRes, classRes, subjectRes] = await Promise.all([
                attendanceAPI.getAll({ page_size: 1000 }),
                classAPI.getAll({ page_size: 1000 }),
                subjectAPI.getAll({ page_size: 1000 })
            ]);
            setAttendanceData(attendanceRes.data.results || attendanceRes.data || []);
            setClasses(classRes.data.results || classRes.data || []);
            setSubjects(subjectRes.data.results || subjectRes.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load attendance data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredAttendance = attendanceData.filter(record => {
        const classMatch = !filters.class_assigned || record.session?.class_assigned?.id === Number(filters.class_assigned);
        const statusMatch = filters.status === "all" || (record.status || "").toLowerCase() === filters.status.toLowerCase();
        const subjectMatch = !filters.subject || record.session?.subject?.id === Number(filters.subject);
        return classMatch && statusMatch && subjectMatch;
    });

    const stats = {
        total: filteredAttendance.length,
        present: filteredAttendance.filter(r => (r.status || "").toLowerCase() === "present").length,
        absent: filteredAttendance.filter(r => (r.status || "").toLowerCase() === "absent").length,
        late: filteredAttendance.filter(r => (r.status || "").toLowerCase() === "late").length,
    };

    const presentPercentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

    const handleExport = () => {
        const csv = [
            ['Student', 'Username', 'Class', 'Subject', 'Date', 'Status'],
            ...filteredAttendance.map(r => [
                `${r.student?.first_name || ''} ${r.student?.last_name || ''}`,
                r.student?.username || 'N/A',
                r.session?.class_assigned?.name || 'N/A',
                r.session?.subject?.name || 'N/A',
                new Date(r.marked_at).toLocaleDateString(),
                r.status || 'N/A'
            ])
        ].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1><i className="fa fa-list"></i> View All Attendance</h1>
                <button className="btn-primary" onClick={handleExport} disabled={loading || filteredAttendance.length === 0}><i className="fa fa-download"></i> Export Report</button>
            </div>

            <div className="stats-grid-small">
                <div className="stat-card stat-total">
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Records</div>
                </div>
                <div className="stat-card stat-present">
                    <div className="stat-value">{stats.present}</div>
                    <div className="stat-label">Present</div>
                </div>
                <div className="stat-card stat-absent">
                    <div className="stat-value">{stats.absent}</div>
                    <div className="stat-label">Absent</div>
                </div>
                <div className="stat-card stat-late">
                    <div className="stat-value">{stats.late}</div>
                    <div className="stat-label">Late</div>
                </div>
                <div className="stat-card stat-percentage">
                    <div className="stat-value">{presentPercentage}%</div>
                    <div className="stat-label">Present Rate</div>
                </div>
            </div>

            <div className="filters-bar">
                <select 
                    value={filters.class_assigned}
                    onChange={(e) => setFilters({...filters, class_assigned: e.target.value})}
                    className="filter-select"
                    disabled={loading}
                >
                    <option value="">All Classes</option>
                    {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </select>
                <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="filter-select"
                    disabled={loading}
                >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                </select>
                <select 
                    value={filters.subject}
                    onChange={(e) => setFilters({...filters, subject: e.target.value})}
                    className="filter-select"
                    disabled={loading}
                >
                    <option value="">All Subjects</option>
                    {subjects.map(subj => <option key={subj.id} value={subj.id}>{subj.name}</option>)}
                </select>
                <button
                    onClick={fetchData}
                    className="btn-secondary"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {error && (
                <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
                    {error}
                    <button onClick={() => setError(null)} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            <div className="attendance-table-wrapper">
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Username</th>
                            <th>Class</th>
                            <th>Subject</th>
                            <th>Date & Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && attendanceData.length === 0 ? (
                            <tr><td colSpan="7" className="empty-message">Loading...</td></tr>
                        ) : filteredAttendance.length > 0 ? (
                            filteredAttendance.map(record => (
                                <tr key={record.id}>
                                    <td>{`${record.student?.first_name || ''} ${record.student?.last_name || ''}`.trim() || 'Unknown'}</td>
                                    <td>{record.student?.username || 'N/A'}</td>
                                    <td>{record.session?.class_assigned?.name || 'N/A'}</td>
                                    <td>{record.session?.subject?.name || 'N/A'}</td>
                                    <td>{new Date(record.marked_at).toLocaleDateString()} {new Date(record.marked_at).toLocaleTimeString()}</td>
                                    <td>
                                        <span className={`status-badge status-${(record.status || 'unknown').toLowerCase()}`}>
                                            {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-icon btn-view" title="View" disabled={loading}><i className="fa fa-eye"></i></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="empty-message">No attendance records found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllAttendance;
