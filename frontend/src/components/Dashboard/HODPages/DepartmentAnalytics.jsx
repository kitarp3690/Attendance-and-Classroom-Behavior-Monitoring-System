import React, { useState, useEffect } from 'react';
import { attendanceReportAPI, attendanceAPI, classAPI } from '../../../services/api';
import './HODPages.css';

const DepartmentAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analytics, setAnalytics] = useState({
        classStats: [],
        subjectStats: [],
        lowAttendanceStudents: [],
        trends: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all reports for department
            const reportsResponse = await attendanceReportAPI.getAll({ page_size: 1000 });
            const reports = reportsResponse.data.results || reportsResponse.data || [];

            // Fetch low attendance students
            const lowAttendanceResponse = await attendanceReportAPI.getLowAttendance(75);
            const lowStudents = lowAttendanceResponse.data.results || lowAttendanceResponse.data || [];

            // Group by class and subject
            const classStats = groupByClass(reports);
            const subjectStats = groupBySubject(reports);

            setAnalytics({
                classStats,
                subjectStats,
                lowAttendanceStudents: lowStudents.slice(0, 10),
                trends: generateTrends(reports)
            });
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const groupByClass = (reports) => {
        const grouped = {};
        reports.forEach(report => {
            const className = report.class_assigned?.name || 'Unknown';
            if (!grouped[className]) {
                grouped[className] = { total: 0, present: 0, absent: 0, late: 0 };
            }
            grouped[className].total++;
            grouped[className].present += report.present_count || 0;
            grouped[className].absent += report.absent_count || 0;
            grouped[className].late += report.late_count || 0;
        });

        return Object.entries(grouped).map(([className, stats]) => ({
            className,
            ...stats,
            percentage: stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0
        }));
    };

    const groupBySubject = (reports) => {
        const grouped = {};
        reports.forEach(report => {
            const subjectName = report.subject?.name || 'Unknown';
            if (!grouped[subjectName]) {
                grouped[subjectName] = { total: 0, present: 0, absent: 0, late: 0 };
            }
            grouped[subjectName].total++;
            grouped[subjectName].present += report.present_count || 0;
            grouped[subjectName].absent += report.absent_count || 0;
            grouped[subjectName].late += report.late_count || 0;
        });

        return Object.entries(grouped).map(([subjectName, stats]) => ({
            subjectName,
            ...stats,
            percentage: stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0
        }));
    };

    const generateTrends = (reports) => {
        // Group by month for trend analysis
        const grouped = {};
        reports.forEach(report => {
            const month = new Date(report.generated_at).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!grouped[month]) {
                grouped[month] = { present: 0, absent: 0, late: 0, total: 0 };
            }
            grouped[month].total++;
            grouped[month].present += report.present_count || 0;
            grouped[month].absent += report.absent_count || 0;
            grouped[month].late += report.late_count || 0;
        });

        return Object.entries(grouped).map(([month, data]) => ({
            month,
            attendance: data.total > 0 ? ((data.present / data.total) * 100).toFixed(1) : 0
        }));
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
                <h1><i className="fa fa-bar-chart"></i> Department Analytics</h1>
                <p>Comprehensive department attendance and performance analytics</p>
            </div>

            {error && (
                <div className="alert-banner alert-danger">
                    <i className="fa fa-exclamation-circle"></i>
                    <div>{error}</div>
                </div>
            )}

            {/* Class-wise Analytics */}
            <div className="section">
                <div className="section-header">
                    <h2><i className="fa fa-graduation-cap"></i> Class-wise Performance</h2>
                </div>
                <div className="analytics-grid">
                    {analytics.classStats.map((classData) => (
                        <div key={classData.className} className="analytics-card">
                            <div className="analytics-title">{classData.className}</div>
                            <div className="analytics-metric">
                                <span className="metric-label">Attendance:</span>
                                <span className="metric-value">{classData.percentage}%</span>
                            </div>
                            <div className="analytics-breakdown">
                                <span style={{color: 'var(--success)'}}>✓ {classData.present}</span>
                                <span style={{color: 'var(--danger)'}}>✗ {classData.absent}</span>
                                <span style={{color: 'var(--warning)'}}>⏰ {classData.late}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subject-wise Analytics */}
            <div className="section">
                <div className="section-header">
                    <h2><i className="fa fa-book"></i> Subject-wise Performance</h2>
                </div>
                <div className="analytics-grid">
                    {analytics.subjectStats.map((subjectData) => (
                        <div key={subjectData.subjectName} className="analytics-card">
                            <div className="analytics-title">{subjectData.subjectName}</div>
                            <div className="analytics-metric">
                                <span className="metric-label">Attendance:</span>
                                <span className="metric-value">{subjectData.percentage}%</span>
                            </div>
                            <div className="analytics-breakdown">
                                <span style={{color: 'var(--success)'}}>✓ {subjectData.present}</span>
                                <span style={{color: 'var(--danger)'}}>✗ {subjectData.absent}</span>
                                <span style={{color: 'var(--warning)'}}>⏰ {subjectData.late}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Low Attendance Students */}
            <div className="section">
                <div className="section-header">
                    <h2><i className="fa fa-exclamation-triangle"></i> Low Attendance Students</h2>
                </div>
                {analytics.lowAttendanceStudents.length > 0 ? (
                    <div className="students-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Roll No</th>
                                    <th>Class</th>
                                    <th>Subject</th>
                                    <th>Attendance %</th>
                                    <th>Present/Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.lowAttendanceStudents.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.student?.first_name} {student.student?.last_name}</td>
                                        <td>{student.student?.student_id}</td>
                                        <td>{student.class_assigned?.name}</td>
                                        <td>{student.subject?.name}</td>
                                        <td>
                                            <span className={student.percentage < 65 ? 'danger' : 'warning'}>
                                                {student.percentage}%
                                            </span>
                                        </td>
                                        <td>{student.present_count}/{student.total_classes_held}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <i className="fa fa-check-circle"></i>
                        <p>No students with low attendance</p>
                    </div>
                )}
            </div>

            {/* Trends */}
            <div className="section">
                <div className="section-header">
                    <h2><i className="fa fa-line-chart"></i> Attendance Trends</h2>
                </div>
                <div className="trends-list">
                    {analytics.trends.map((trend, index) => (
                        <div key={index} className="trend-item">
                            <div className="trend-month">{trend.month}</div>
                            <div className="trend-bar">
                                <div className="trend-fill" style={{width: `${trend.attendance}%`}}></div>
                            </div>
                            <div className="trend-value">{trend.attendance}%</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DepartmentAnalytics;
