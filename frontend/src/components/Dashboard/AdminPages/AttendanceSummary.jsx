import React, { useState, useEffect } from "react";
import { classAPI, attendanceAPI } from "../../../services/api";
import "./AdminPages.css";

const AttendanceSummary = () => {
    const [classes, setClasses] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [classRes, attendanceRes] = await Promise.all([
                classAPI.getAll({ page_size: 1000 }),
                attendanceAPI.getAll({ page_size: 1000 })
            ]);
            const classList = classRes.data.results || classRes.data || [];
            setClasses(classList);
            if (classList.length > 0 && !selectedClass) {
                setSelectedClass(classList[0].id);
            }
            setAttendanceRecords(attendanceRes.data.results || attendanceRes.data || []);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load attendance summary. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics for a specific class
    const calculateClassStats = (classId) => {
        const classAttendance = attendanceRecords.filter(
            r => r.session?.class_assigned?.id === classId
        );
        const totalRecords = classAttendance.length;
        const present = classAttendance.filter(r => r.status?.toLowerCase() === 'present').length;
        const absent = classAttendance.filter(r => r.status?.toLowerCase() === 'absent').length;
        const late = classAttendance.filter(r => r.status?.toLowerCase() === 'late').length;
        
        return {
            total: totalRecords,
            present,
            absent,
            late,
            percentage: totalRecords > 0 ? ((present / totalRecords) * 100).toFixed(1) : 0
        };
    };

    // Calculate overall statistics
    const overallStats = {
        totalRecords: attendanceRecords.length,
        present: attendanceRecords.filter(r => r.status?.toLowerCase() === 'present').length,
        absent: attendanceRecords.filter(r => r.status?.toLowerCase() === 'absent').length,
        late: attendanceRecords.filter(r => r.status?.toLowerCase() === 'late').length,
    };
    const overallPercentage = overallStats.totalRecords > 0 
        ? ((overallStats.present / overallStats.totalRecords) * 100).toFixed(1) 
        : 0;

    const classData = selectedClass ? calculateClassStats(selectedClass) : null;
    const selectedClassName = classes.find(c => c.id === selectedClass)?.name || 'N/A';

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1><i className="fa fa-chart-bar"></i> Attendance Summary</h1>
                <button className="btn-primary" onClick={fetchData} disabled={loading}><i className="fa fa-refresh"></i> {loading ? 'Loading...' : 'Refresh'}</button>
            </div>

            {error && (
                <div className="error-message" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '4px', color: '#c33' }}>
                    {error}
                    <button onClick={() => setError(null)} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                </div>
            )}

            <div className="summary-container">
                <div className="overall-stats">
                    <h2>Overall Statistics</h2>
                    <div className="stats-grid-large">
                        <div className="summary-stat-card">
                            <div className="stat-icon">
                                <i className="fa fa-list"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{loading ? '-' : overallStats.totalRecords}</div>
                                <div className="stat-label">Total Records</div>
                            </div>
                        </div>
                        <div className="summary-stat-card success">
                            <div className="stat-icon">
                                <i className="fa fa-check-circle"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{loading ? '-' : overallStats.present}</div>
                                <div className="stat-label">Present</div>
                            </div>
                        </div>
                        <div className="summary-stat-card danger">
                            <div className="stat-icon">
                                <i className="fa fa-times-circle"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{loading ? '-' : overallStats.absent}</div>
                                <div className="stat-label">Absent</div>
                            </div>
                        </div>
                        <div className="summary-stat-card warning">
                            <div className="stat-icon">
                                <i className="fa fa-clock-o"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{loading ? '-' : overallStats.late}</div>
                                <div className="stat-label">Late</div>
                            </div>
                        </div>
                        <div className="summary-stat-card info">
                            <div className="stat-icon">
                                <i className="fa fa-percent"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{loading ? '-' : `${overallPercentage}%`}</div>
                                <div className="stat-label">Present Rate</div>
                            </div>
                        </div>
                    </div>
                </div>

                {classes.length > 0 && (
                <div className="class-wise-breakdown">
                    <h2>Class-wise Breakdown</h2>
                    <div className="class-selector">
                        {classes.map(c => (
                            <button 
                                key={c.id}
                                className={`class-btn ${selectedClass === c.id ? 'active' : ''}`}
                                onClick={() => setSelectedClass(c.id)}
                                disabled={loading}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>

                    {classData && (
                        <div className="class-details-card">
                            <div className="class-details-header">
                                <h3>{selectedClassName}</h3>
                                <div className="attendance-gauge">
                                    <div className="gauge-value">{classData.percentage}%</div>
                                </div>
                            </div>
                            <div className="class-stats-mini">
                                <div className="mini-stat">
                                    <span className="label">Total</span>
                                    <span className="value">{classData.total}</span>
                                </div>
                                <div className="mini-stat">
                                    <span className="label">Present</span>
                                    <span className="value" style={{color: 'var(--success)'}}>{classData.present}</span>
                                </div>
                                <div className="mini-stat">
                                    <span className="label">Absent</span>
                                    <span className="value" style={{color: 'var(--danger)'}}>{classData.absent}</span>
                                </div>
                                <div className="mini-stat">
                                    <span className="label">Late</span>
                                    <span className="value" style={{color: 'var(--warning)'}}>{classData.late}</span>
                                </div>
                            </div>
                            <div className="progress-sections">
                                <div className="progress-item">
                                    <div className="progress-label">Present</div>
                                    <div className="progress-bar-wrapper">
                                        <div className="progress-bar" style={{
                                            width: classData.total > 0 ? `${(classData.present / classData.total) * 100}%` : '0%',
                                            backgroundColor: 'var(--success)'
                                        }}></div>
                                    </div>
                                </div>
                                <div className="progress-item">
                                    <div className="progress-label">Absent</div>
                                    <div className="progress-bar-wrapper">
                                        <div className="progress-bar" style={{
                                            width: classData.total > 0 ? `${(classData.absent / classData.total) * 100}%` : '0%',
                                            backgroundColor: 'var(--danger)'
                                        }}></div>
                                    </div>
                                </div>
                                <div className="progress-item">
                                    <div className="progress-label">Late</div>
                                    <div className="progress-bar-wrapper">
                                        <div className="progress-bar" style={{
                                            width: classData.total > 0 ? `${(classData.late / classData.total) * 100}%` : '0%',
                                            backgroundColor: 'var(--warning)'
                                        }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {classes.length > 0 && (
                    <div className="all-classes-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Class</th>
                                    <th>Total Records</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Late</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td></tr>
                                ) : classes.length > 0 ? (
                                    classes.map(c => {
                                        const stats = calculateClassStats(c.id);
                                        return (
                                            <tr key={c.id}>
                                                <td><strong>{c.name}</strong></td>
                                                <td>{stats.total}</td>
                                                <td style={{color: 'var(--success)'}}>{stats.present}</td>
                                                <td style={{color: 'var(--danger)'}}>{stats.absent}</td>
                                                <td style={{color: 'var(--warning)'}}>{stats.late}</td>
                                                <td>{stats.percentage}%</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="6" style={{ textAlign: 'center' }}>No classes found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    )}
                </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceSummary;
