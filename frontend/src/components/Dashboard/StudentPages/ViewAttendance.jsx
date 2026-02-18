import React, { useState, useEffect } from "react";
import { attendanceReportAPI, attendanceAPI, subjectAPI } from "../../../services/api";
import "./StudentPages.css";

const ViewAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterSubject, setFilterSubject] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        fetchAttendanceData();
        fetchSubjects();
    }, []);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await attendanceAPI.getAll({ page_size: 1000 });
            const data = response.data.results || response.data || [];
            setAttendanceData(data.map(record => ({
                id: record.id,
                subject: record.session?.subject?.name || "Unknown",
                date: new Date(record.session?.date || record.created_at).toISOString().split('T')[0],
                status: record.status,
                remark: record.remarks || "-"
            })));
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError('Failed to load attendance data');
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

    const filteredData = attendanceData.filter(record => {
        const subjectMatch = filterSubject === "all" || record.subject === filterSubject;
        const statusMatch = filterStatus === "all" || record.status === filterStatus;
        return subjectMatch && statusMatch;
    });

    const stats = {
        total: attendanceData.length,
        present: attendanceData.filter(r => r.status === "present").length,
        absent: attendanceData.filter(r => r.status === "absent").length,
        late: attendanceData.filter(r => r.status === "late").length,
    };

    const percentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

    if (loading) {
        return (
            <div className="student-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading attendance...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="student-page">
            <div className="page-header">
                <h1><i className="fa fa-book"></i> View My Attendance</h1>
            </div>

            {error && (
                <div className="alert-banner alert-danger">
                    <i className="fa fa-exclamation-circle"></i>
                    {error}
                </div>
            )}

            <div className="stats-overview">
                <div className="overview-card">
                    <div className="stat-dot total"></div>
                    <div className="stat-text">
                        <span className="stat-label">Total Classes</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
                <div className="overview-card">
                    <div className="stat-dot present"></div>
                    <div className="stat-text">
                        <span className="stat-label">Present</span>
                        <span className="stat-value">{stats.present}</span>
                    </div>
                </div>
                <div className="overview-card">
                    <div className="stat-dot absent"></div>
                    <div className="stat-text">
                        <span className="stat-label">Absent</span>
                        <span className="stat-value">{stats.absent}</span>
                    </div>
                </div>
                <div className="overview-card">
                    <div className="stat-dot late"></div>
                    <div className="stat-text">
                        <span className="stat-label">Late</span>
                        <span className="stat-value">{stats.late}</span>
                    </div>
                </div>
                <div className="overview-card percentage">
                    <div className="stat-dot"></div>
                    <div className="stat-text">
                        <span className="stat-label">Percentage</span>
                        <span className="stat-value">{percentage}%</span>
                    </div>
                </div>
            </div>

            <div className="filters">
                <select 
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Subjects</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Status</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                </select>
            </div>

            <div className="attendance-list">
                {filteredData.length > 0 ? (
                    filteredData.map(record => (
                        <div key={record.id} className={`attendance-item ${record.status.toLowerCase()}`}>
                            <div className="item-content">
                                <div className="item-header">
                                    <h4>{record.subject}</h4>
                                    <span className={`status-badge status-${record.status.toLowerCase()}`}>
                                        {record.status}
                                    </span>
                                </div>
                                <div className="item-details">
                                    <span className="date"><i className="fa fa-calendar"></i> {record.date}</span>
                                    <span className="remark"><i className="fa fa-note"></i> {record.remark}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <i className="fa fa-inbox"></i>
                        <p>No attendance records match your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewAttendance;
