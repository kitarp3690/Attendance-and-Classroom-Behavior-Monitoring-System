import React, { useState } from "react";
import "./TeacherPages.css";

const AttendanceReports = () => {
    const [reportType, setReportType] = useState("student");
    const [selectedClass, setSelectedClass] = useState("CSE A");
    const [dateRange, setDateRange] = useState({ from: "2024-11-01", to: "2024-11-30" });

    const studentReports = [
        { id: 1, name: "John Doe", rollNo: "2025001", present: 22, absent: 2, late: 1, total: 25, percentage: 88 },
        { id: 2, name: "Jane Smith", rollNo: "2025002", present: 24, absent: 0, late: 1, total: 25, percentage: 96 },
        { id: 3, name: "Mike Johnson", rollNo: "2025003", present: 20, absent: 4, late: 1, total: 25, percentage: 80 },
        { id: 4, name: "Sarah Williams", rollNo: "2025004", present: 23, absent: 1, late: 1, total: 25, percentage: 92 },
        { id: 5, name: "David Brown", rollNo: "2025005", present: 25, absent: 0, late: 0, total: 25, percentage: 100 },
    ];

    const classReport = {
        total: 125,
        present: 110,
        absent: 10,
        late: 5,
        percentage: 88.0,
    };

    return (
        <div className="teacher-page">
            <div className="page-header">
                <h1><i className="fa fa-chart-bar"></i> Attendance Reports</h1>
                <button className="btn-primary"><i className="fa fa-print"></i> Print</button>
            </div>

            <div className="report-controls">
                <div className="control-group">
                    <label>Report Type</label>
                    <div className="report-type-selector">
                        <button 
                            className={`type-btn ${reportType === 'student' ? 'active' : ''}`}
                            onClick={() => setReportType('student')}
                        >
                            <i className="fa fa-user"></i> Student-wise
                        </button>
                        <button 
                            className={`type-btn ${reportType === 'class' ? 'active' : ''}`}
                            onClick={() => setReportType('class')}
                        >
                            <i className="fa fa-users"></i> Class Summary
                        </button>
                    </div>
                </div>

                <div className="date-range-selector">
                    <label>Date Range</label>
                    <input type="date" value={dateRange.from} onChange={(e) => setDateRange({...dateRange, from: e.target.value})} />
                    <span>to</span>
                    <input type="date" value={dateRange.to} onChange={(e) => setDateRange({...dateRange, to: e.target.value})} />
                </div>
            </div>

            {reportType === 'student' ? (
                <div className="student-reports">
                    <h2>Student Attendance Report</h2>
                    <div className="reports-table-wrapper">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Roll No</th>
                                    <th>Student Name</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Late</th>
                                    <th>Total Classes</th>
                                    <th>Percentage</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentReports.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.rollNo}</td>
                                        <td>{student.name}</td>
                                        <td style={{color: 'var(--success)'}}>{student.present}</td>
                                        <td style={{color: 'var(--danger)'}}>{student.absent}</td>
                                        <td style={{color: 'var(--warning)'}}>{student.late}</td>
                                        <td>{student.total}</td>
                                        <td>
                                            <strong>{student.percentage}%</strong>
                                            <div className="progress-mini">
                                                <div className="progress-fill" style={{width: `${student.percentage}%`}}></div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-indicator ${student.percentage >= 75 ? 'good' : 'warning'}`}>
                                                {student.percentage >= 75 ? 'Good' : 'Low'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="class-report">
                    <h2>Class Summary Report</h2>
                    <div className="class-stats-grid">
                        <div className="class-stat-card total">
                            <div className="stat-icon"><i className="fa fa-users"></i></div>
                            <div className="stat-info">
                                <div className="stat-value">{classReport.total}</div>
                                <div className="stat-label">Total Students</div>
                            </div>
                        </div>
                        <div className="class-stat-card present">
                            <div className="stat-icon"><i className="fa fa-check-circle"></i></div>
                            <div className="stat-info">
                                <div className="stat-value">{classReport.present}</div>
                                <div className="stat-label">Present</div>
                            </div>
                        </div>
                        <div className="class-stat-card absent">
                            <div className="stat-icon"><i className="fa fa-times-circle"></i></div>
                            <div className="stat-info">
                                <div className="stat-value">{classReport.absent}</div>
                                <div className="stat-label">Absent</div>
                            </div>
                        </div>
                        <div className="class-stat-card late">
                            <div className="stat-icon"><i className="fa fa-clock-o"></i></div>
                            <div className="stat-info">
                                <div className="stat-value">{classReport.late}</div>
                                <div className="stat-label">Late</div>
                            </div>
                        </div>
                    </div>

                    <div className="class-summary-card">
                        <h3>Overall Statistics</h3>
                        <div className="summary-content">
                            <div className="summary-item">
                                <span className="label">Attendance Rate</span>
                                <span className="value">{classReport.percentage}%</span>
                            </div>
                            <div className="progress-bar-large">
                                <div className="progress-fill" style={{width: `${classReport.percentage}%`}}></div>
                            </div>
                            <div className="summary-breakdown">
                                <div className="breakdown-item">
                                    <span>Present</span>
                                    <div className="breakdown-bar">
                                        <div className="breakdown-fill present" style={{width: `${(classReport.present / classReport.total) * 100}%`}}></div>
                                    </div>
                                </div>
                                <div className="breakdown-item">
                                    <span>Absent</span>
                                    <div className="breakdown-bar">
                                        <div className="breakdown-fill absent" style={{width: `${(classReport.absent / classReport.total) * 100}%`}}></div>
                                    </div>
                                </div>
                                <div className="breakdown-item">
                                    <span>Late</span>
                                    <div className="breakdown-bar">
                                        <div className="breakdown-fill late" style={{width: `${(classReport.late / classReport.total) * 100}%`}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceReports;
