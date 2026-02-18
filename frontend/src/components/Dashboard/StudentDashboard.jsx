import React, { useState, useEffect } from "react";
import AttendanceChart from "../Charts/AttendanceChart";
import ViewAttendance from "./StudentPages/ViewAttendance";
import StudentNotifications from "./StudentPages/StudentNotifications";
import { attendanceAPI, authAPI, subjectAPI, notificationAPI } from "../../services/api";
import "./StudentDashboard.css";

const StudentDashboard = ({ currentPage = "dashboard" }) => {
    // Route pages based on currentPage
    if (currentPage === "view-attendance") return <ViewAttendance />;
    if (currentPage === "notifications") return <StudentNotifications />;

    // Default dashboard view
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChangeRequestModal, setShowChangeRequestModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    
    // State for API data
    const [studentInfo, setStudentInfo] = useState({ 
        name: "Loading...", 
        roll_no: "...", 
        semester: "...", 
        department: "...",
        email: ""
    });
    const [attendanceStats, setAttendanceStats] = useState({ 
        present: 0, 
        absent: 0, 
        late: 0, 
        total: 0, 
        percentage: 0 
    });
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [subjectBreakdown, setSubjectBreakdown] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [changeRequests, setChangeRequests] = useState([]);
    
    const attendancePercentage = attendanceStats.percentage || 0;
    const isLowAttendance = attendancePercentage < 75;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch current user info
            const userResponse = await authAPI.getCurrentUser();
            const user = userResponse.data;
            setStudentInfo({
                name: `${user.first_name} ${user.last_name}`,
                roll_no: user.student_id || user.id,
                semester: user.semester || "N/A",
                department: user.department_name || user.department || "N/A",
                email: user.email
            });

            // Fetch attendance statistics
            const statsResponse = await attendanceAPI.getStatistics();
            if (statsResponse.data) {
                const stats = statsResponse.data;
                setAttendanceStats({
                    present: stats.total_present || 0,
                    absent: stats.total_absent || 0,
                    late: stats.total_late || 0,
                    total: stats.total_classes || 0,
                    percentage: stats.attendance_percentage || 0
                });
            }

            // Fetch all attendance records
            const recordsResponse = await attendanceAPI.getAll();
            const records = recordsResponse.data.results || recordsResponse.data || [];
            setAttendanceRecords(records);

            // Fetch subjects (my enrolled subjects)
            const subjectsResponse = await subjectAPI.getAll();
            const subjectsData = subjectsResponse.data.results || subjectsResponse.data || [];
            setSubjects(subjectsData);

            // Fetch notifications
            const notifResponse = await notificationAPI.getAll();
            const notifsData = notifResponse.data.results || notifResponse.data || [];
            setNotifications(notifsData.slice(0, 5));

            // Calculate subject-wise breakdown
            calculateSubjectBreakdown(records, subjectsData);

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to load dashboard data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const calculateSubjectBreakdown = (records, subjectsList) => {
        const subjectMap = {};
        
        // Initialize all subjects
        subjectsList.forEach(subj => {
            subjectMap[subj.id] = {
                id: subj.id,
                name: subj.name,
                code: subj.code,
                present: 0,
                absent: 0,
                total: 0
            };
        });

        // Count attendance for each subject
        records.forEach(record => {
            const subjectId = record.session?.subject?.id || record.subject_id;
            const subjectName = record.session?.subject?.name || record.subject_name;
            
            if (subjectId && subjectMap[subjectId]) {
                subjectMap[subjectId].total++;
                if (record.status === "present") {
                    subjectMap[subjectId].present++;
                } else if (record.status === "absent") {
                    subjectMap[subjectId].absent++;
                }
            } else if (subjectName) {
                // Fallback to name matching
                const matchingSubject = Object.values(subjectMap).find(s => s.name === subjectName);
                if (matchingSubject) {
                    matchingSubject.total++;
                    if (record.status === "present") matchingSubject.present++;
                    else if (record.status === "absent") matchingSubject.absent++;
                }
            }
        });

        const breakdown = Object.values(subjectMap)
            .filter(subj => subj.total > 0)
            .map(subj => ({
                ...subj,
                percentage: subj.total > 0 ? ((subj.present / subj.total) * 100).toFixed(1) : 0
            }));

        setSubjectBreakdown(breakdown);
    };

    const handleRequestChange = (record) => {
        setSelectedRecord(record);
        setShowChangeRequestModal(true);
    };

    const submitChangeRequest = async (reason) => {
        try {
            await attendanceAPI.requestChange({
                attendance_id: selectedRecord.id,
                reason: reason,
                requested_status: 'present'
            });
            alert('Change request submitted successfully!');
            setShowChangeRequestModal(false);
            setSelectedRecord(null);
            fetchDashboardData(); // Refresh data
        } catch (err) {
            console.error('Error submitting change request:', err);
            alert('Failed to submit change request. Please try again.');
        }
    };

    const downloadReport = async () => {
        try {
            const response = await attendanceAPI.downloadReport();
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error downloading report:', err);
            alert('Failed to download report. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-dashboard">
                <div className="alert-banner alert-danger">
                    <i className="fa fa-exclamation-circle alert-icon"></i>
                    <div className="alert-content">
                        <h4>Error Loading Dashboard</h4>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="student-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="student-avatar">
                            {studentInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="student-info">
                            <h1>{studentInfo.name}</h1>
                            <div className="student-meta">
                                <span className="meta-item">
                                    <i className="fa fa-id-card"></i>
                                    Roll: {studentInfo.roll_no}
                                </span>
                                <span className="meta-item">
                                    <i className="fa fa-graduation-cap"></i>
                                    {studentInfo.semester} - {studentInfo.department}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="header-btn btn-secondary" onClick={() => window.location.reload()}>
                            <i className="fa fa-sync-alt"></i>
                            Refresh
                        </button>
                        <button className="header-btn btn-primary" onClick={downloadReport}>
                            <i className="fa fa-download"></i>
                            Download Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Low Attendance Warning */}
                {isLowAttendance && (
                    <div className="alert-banner alert-warning">
                        <i className="fa fa-exclamation-triangle alert-icon"></i>
                        <div className="alert-content">
                            <h4>Low Attendance Warning</h4>
                            <p>Your attendance is {attendancePercentage.toFixed(1)}% which is below the required 75%. Please maintain regular attendance to avoid academic penalties.</p>
                        </div>
                    </div>
                )}

                {/* Attendance Overview Card */}
                <div className="attendance-overview">
                    <div className="overview-header">
                        <h2 className="overview-title">Attendance Overview</h2>
                        <span className="semester-badge">{studentInfo.semester}</span>
                    </div>

                    <div className="attendance-circle-container">
                        <div className="attendance-circle">
                            <svg className="circle-svg" viewBox="0 0 100 100">
                                <circle className="circle-bg" cx="50" cy="50" r="45" />
                                <circle 
                                    className={`circle-progress ${isLowAttendance ? attendancePercentage < 65 ? 'danger' : 'warning' : ''}`}
                                    cx="50" 
                                    cy="50" 
                                    r="45"
                                    style={{
                                        strokeDashoffset: 283 - (283 * attendancePercentage / 100)
                                    }}
                                />
                            </svg>
                            <div className="circle-text">
                                <div className="circle-percentage">{attendancePercentage.toFixed(1)}%</div>
                                <div className="circle-label">Overall</div>
                            </div>
                        </div>
                    </div>

                    <div className="attendance-stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Present</div>
                            <div className="stat-value success">{attendanceStats.present}</div>
                            <div className="stat-percentage" style={{color: 'var(--success)'}}>
                                <i className="fa fa-check-circle"></i> Attended
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Absent</div>
                            <div className="stat-value danger">{attendanceStats.absent}</div>
                            <div className="stat-percentage" style={{color: 'var(--danger)'}}>
                                <i className="fa fa-times-circle"></i> Missed
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Late</div>
                            <div className="stat-value warning">{attendanceStats.late}</div>
                            <div className="stat-percentage" style={{color: 'var(--warning)'}}>
                                <i className="fa fa-clock"></i> Late Arrivals
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-label">Total Classes</div>
                            <div className="stat-value primary">{attendanceStats.total}</div>
                            <div className="stat-percentage" style={{color: 'var(--primary)'}}>
                                <i className="fa fa-calendar-check"></i> Scheduled
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="dashboard-grid">

                    {/* Subject-wise Breakdown Card */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fa fa-book"></i>
                                Subject-wise Breakdown
                            </h3>
                            <span className="card-action">View All</span>
                        </div>
                        
                        {subjectBreakdown.length === 0 ? (
                            <div className="empty-state">
                                <i className="fa fa-inbox"></i>
                                <p>No subject data available</p>
                            </div>
                        ) : (
                            <div className="subject-list">
                                {subjectBreakdown.map((subj, index) => {
                                    const isLow = parseFloat(subj.percentage) < 75;
                                    return (
                                        <div key={subj.id} className="subject-item">
                                            <div className="subject-info">
                                                <div className="subject-name">{subj.name}</div>
                                                <div className="subject-code">{subj.code}</div>
                                            </div>
                                            <div className="subject-stats">
                                                <div className="subject-attendance">
                                                    <div className={`attendance-percentage ${isLow ? 'danger' : 'success'}`}>
                                                        {subj.percentage}%
                                                    </div>
                                                    <div className="attendance-details">
                                                        {subj.present}/{subj.total} classes
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent Activity Card */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fa fa-history"></i>
                                Recent Activity
                            </h3>
                            <span className="card-action">View All</span>
                        </div>
                        
                        {attendanceRecords.length === 0 ? (
                            <div className="empty-state">
                                <i className="fa fa-calendar-times"></i>
                                <p>No recent attendance records</p>
                            </div>
                        ) : (
                            <div className="activity-list">
                                {attendanceRecords.slice(0, 8).map(record => (
                                    <div key={record.id} className="activity-item">
                                        <div className={`activity-icon ${record.status}`}>
                                            {record.status === 'present' && <i className="fa fa-check"></i>}
                                            {record.status === 'absent' && <i className="fa fa-times"></i>}
                                            {record.status === 'late' && <i className="fa fa-clock"></i>}
                                        </div>
                                        <div className="activity-details">
                                            <div className="activity-title">
                                                {record.session?.subject?.name || 'Unknown Subject'}
                                            </div>
                                            <div className="activity-meta">
                                                {new Date(record.marked_at || record.date).toLocaleDateString()} • 
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                {record.status === 'absent' && (
                                                    <button 
                                                        onClick={() => handleRequestChange(record)}
                                                        style={{
                                                            marginLeft: '10px',
                                                            padding: '2px 8px',
                                                            fontSize: '11px',
                                                            background: 'var(--primary)',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Request Change
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications Card - Full Width */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="fa fa-bell"></i>
                            Notifications
                        </h3>
                        <span className="card-action">Mark all as read</span>
                    </div>
                    
                    {notifications.length === 0 ? (
                        <div className="empty-state">
                            <i className="fa fa-bell-slash"></i>
                            <p>No new notifications</p>
                        </div>
                    ) : (
                        <div className="notification-list">
                            {notifications.map(notif => (
                                <div key={notif.id} className={`notification-item ${notif.is_read ? '' : 'unread'}`}>
                                    <div className="notification-header">
                                        <div className="notification-title">{notif.title || 'Notification'}</div>
                                        <div className="notification-time">
                                            {new Date(notif.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="notification-message">
                                        {notif.message || 'No message content'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Change Request Modal */}
            {showChangeRequestModal && (
                <div className="modal-overlay" onClick={() => setShowChangeRequestModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Request Attendance Change</h3>
                            <button className="modal-close" onClick={() => setShowChangeRequestModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Subject:</strong> {selectedRecord?.session?.subject?.name || 'Unknown'}</p>
                            <p><strong>Date:</strong> {selectedRecord && new Date(selectedRecord.marked_at || selectedRecord.date).toLocaleDateString()}</p>
                            <p><strong>Current Status:</strong> <span style={{color: 'var(--danger)', fontWeight: 600}}>Absent</span></p>
                            
                            <div style={{marginTop: '20px'}}>
                                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>
                                    Reason for Change Request:
                                </label>
                                <textarea 
                                    id="change-reason"
                                    rows="4"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        resize: 'vertical'
                                    }}
                                    placeholder="Please provide a valid reason for the change request..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-secondary"
                                onClick={() => setShowChangeRequestModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-primary"
                                onClick={() => {
                                    const reason = document.getElementById('change-reason').value;
                                    if (!reason.trim()) {
                                        alert('Please provide a reason');
                                        return;
                                    }
                                    submitChangeRequest(reason);
                                }}
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;