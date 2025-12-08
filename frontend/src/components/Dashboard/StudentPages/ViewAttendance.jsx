import React, { useState } from "react";
import "./StudentPages.css";

const ViewAttendance = () => {
    const [attendanceData] = useState([
        { id: 1, subject: "Mathematics", date: "2024-11-14", status: "Present", remark: "On time" },
        { id: 2, subject: "Physics", date: "2024-11-14", status: "Present", remark: "On time" },
        { id: 3, subject: "Mathematics", date: "2024-11-13", status: "Absent", remark: "Sick" },
        { id: 4, subject: "Physics", date: "2024-11-13", status: "Late", remark: "Traffic" },
        { id: 5, subject: "Mathematics", date: "2024-11-12", status: "Present", remark: "On time" },
        { id: 6, subject: "Data Structures", date: "2024-11-12", status: "Present", remark: "On time" },
        { id: 7, subject: "Mathematics", date: "2024-11-11", status: "Late", remark: "Technical issue" },
        { id: 8, subject: "Physics", date: "2024-11-11", status: "Present", remark: "On time" },
    ]);

    const [filterSubject, setFilterSubject] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    const subjectList = ["all", "Mathematics", "Physics", "Data Structures", "Digital Logic"];

    const filteredData = attendanceData.filter(record => {
        const subjectMatch = filterSubject === "all" || record.subject === filterSubject;
        const statusMatch = filterStatus === "all" || record.status === filterStatus;
        return subjectMatch && statusMatch;
    });

    const stats = {
        total: attendanceData.length,
        present: attendanceData.filter(r => r.status === "Present").length,
        absent: attendanceData.filter(r => r.status === "Absent").length,
        late: attendanceData.filter(r => r.status === "Late").length,
    };

    const percentage = ((stats.present / stats.total) * 100).toFixed(1);

    return (
        <div className="student-page">
            <div className="page-header">
                <h1><i className="fa fa-book"></i> View My Attendance</h1>
            </div>

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
                    {subjectList.map(s => <option key={s} value={s}>{s === "all" ? "All Subjects" : s}</option>)}
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
