import React, { useState, useEffect } from "react";
import AttendanceChart from "../Charts/AttendanceChart";
import { dummyStudentData } from "../../utils/dummyData";
import ViewAttendance from "./StudentPages/ViewAttendance";
import StudentNotifications from "./StudentPages/StudentNotifications";
import { attendanceAPI, authAPI, subjectAPI, notificationAPI } from "../../services/api";
import "./StudentDashboard.css";

const StudentDashboard = ({ currentPage = "dashboard" }) => {
    // Route pages based on currentPage
    if (currentPage === "view-attendance") return <ViewAttendance />;
    if (currentPage === "notifications") return <StudentNotifications />;

    // Default dashboard view
    const [subject, setSubject] = useState("all");
    const [viewMode, setViewMode] = useState('calendar');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for API data
    const [studentInfo, setStudentInfo] = useState({ name: "Loading...", roll_no: "...", class_name: "..." });
    const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0, total: 0, percentage: 0 });
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [subjectBreakdown, setSubjectBreakdown] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [chartData, setChartData] = useState(dummyStudentData.charts);
    
    const attendancePercentage = attendanceStats.percentage.toFixed(1);
    const isLowAttendance = attendancePercentage < 75;

    useEffect(() => {
        fetchDashboardData();
    }, [subject]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch current user info
            const userResponse = await authAPI.getCurrentUser();
            setStudentInfo({
                name: `${userResponse.data.first_name} ${userResponse.data.last_name}`,
                roll_no: userResponse.data.id,
                class_name: userResponse.data.email || "N/A"
            });

            // Fetch attendance statistics
            const statsResponse = await attendanceAPI.getStatistics();
            if (statsResponse.data) {
                const stats = statsResponse.data;
                setAttendanceStats({
                    present: stats.total_present || 0,
                    absent: stats.total_absent || 0,
                    late: 0, // Add late count if backend provides it
                    total: stats.total_classes || 0,
                    percentage: stats.attendance_percentage || 0
                });
            }

            // Fetch all attendance records
            const recordsResponse = await attendanceAPI.getAll();
            setAttendanceRecords(recordsResponse.data.results || []);

            // Fetch subjects
            const subjectsResponse = await subjectAPI.getAll();
            setSubjects(subjectsResponse.data.results || []);

            // Fetch notifications
            const notifResponse = await notificationAPI.getAll();
            setNotifications(notifResponse.data.results?.slice(0, 3) || []);

            // Calculate subject-wise breakdown
            calculateSubjectBreakdown(recordsResponse.data.results || []);

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to load dashboard data. Please try again.");
            // Fallback to dummy data on error
            setAttendanceStats({
                present: dummyStudentData.summary.present,
                absent: dummyStudentData.summary.absent,
                late: dummyStudentData.summary.late,
                total: dummyStudentData.summary.totalClasses,
                percentage: (dummyStudentData.summary.present / dummyStudentData.summary.totalClasses) * 100
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateSubjectBreakdown = (records) => {
        const subjectMap = {};
        records.forEach(record => {
            const subjectName = record.session?.subject?.name || "Unknown";
            if (!subjectMap[subjectName]) {
                subjectMap[subjectName] = { present: 0, total: 0 };
            }
            subjectMap[subjectName].total++;
            if (record.status === "present") {
                subjectMap[subjectName].present++;
            }
        });

        const breakdown = Object.keys(subjectMap).map(name => ({
            name,
            present: subjectMap[name].present,
            total: subjectMap[name].total,
            percentage: ((subjectMap[name].present / subjectMap[name].total) * 100).toFixed(0)
        }));

        setSubjectBreakdown(breakdown);
    };

    return (
        <div className="student-dashboard">
            <div className="student-header">
                <div className="student-profile">
                    <div className="profile-avatar">
                        <i className="fa fa-user-graduate"></i>
                    </div>
                    <div className="profile-info">
                        <h1>{studentInfo.name}</h1>
                        <p>ID: {studentInfo.roll_no} | {studentInfo.class_name}</p>
                    </div>
                </div>
                <div className="attendance-badge-container">
                    <div className={`attendance-percentage-badge ${isLowAttendance ? 'low' : 'good'}`}>
                        <div className="percentage-circle">
                            <svg viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" className="circle-bg"/>
                                <circle 
                                    cx="50" 
                                    cy="50" 
                                    r="45" 
                                    className="circle-progress"
                                    style={{strokeDashoffset: `${283 - (283 * attendancePercentage / 100)}`}}
                                />
                            </svg>
                            <div className="percentage-text">
                                <span className="number">{attendancePercentage}%</span>
                                <span className="label">Attendance</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isLowAttendance && (
                <div className="warning-alert">
                    <i className="fa fa-exclamation-triangle"></i>
                    <div>
                        <h4>Low Attendance Warning</h4>
                        <p>Your attendance is below 75%. Please maintain regular attendance to avoid academic penalties.</p>
                    </div>
                </div>
            )}

            <div className="student-stats-grid">
                <div className="student-stat-box present">
                    <div className="stat-icon"><i className="fa fa-check-circle"></i></div>
                    <div className="stat-content">
                        <h3>{loading ? "..." : attendanceStats.present}</h3>
                        <p>Classes Attended</p>
                    </div>
                </div>

                <div className="student-stat-box absent">
                    <div className="stat-icon"><i className="fa fa-times-circle"></i></div>
                    <div className="stat-content">
                        <h3>{loading ? "..." : attendanceStats.absent}</h3>
                        <p>Classes Missed</p>
                    </div>
                </div>

                <div className="student-stat-box late">
                    <div className="stat-icon"><i className="fa fa-clock"></i></div>
                    <div className="stat-content">
                        <h3>{loading ? "..." : attendanceStats.late}</h3>
                        <p>Late Arrivals</p>
                    </div>
                </div>

                <div className="student-stat-box total">
                    <div className="stat-icon"><i className="fa fa-calendar-check"></i></div>
                    <div className="stat-content">
                        <h3>{loading ? "..." : attendanceStats.total}</h3>
                        <p>Total Classes</p>
                    </div>
                </div>
            </div>

            <div className="subject-filter-section">
                <div className="filter-header">
                    <div className="filter-label">
                        <i className="fa fa-filter"></i>
                        <span>Filter by Subject:</span>
                    </div>
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="subject-select">
                        <option value="all">All Subjects</option>
                        {subjects.map(subj => <option key={subj.id} value={subj.id}>{subj.name}</option>)}
                    </select>
                </div>
                <div className="view-mode-toggle">
                    <button 
                        className={viewMode === 'calendar' ? 'active' : ''} 
                        onClick={() => setViewMode('calendar')}
                    >
                        <i className="fa fa-calendar"></i> Calendar View
                    </button>
                    <button 
                        className={viewMode === 'list' ? 'active' : ''} 
                        onClick={() => setViewMode('list')}
                    >
                        <i className="fa fa-list"></i> List View
                    </button>
                </div>
            </div>

            <div className="attendance-sections">
                <div className="section-card">
                    <div className="card-header">
                        <h2><i className="fa fa-calendar-alt"></i> Attendance Calendar</h2>
                        <span className="month-label">November 2025</span>
                    </div>
                    <div className="attendance-calendar">
                        <div className="calendar-legend">
                            <span className="legend-item present">
                                <span className="dot"></span> Present
                            </span>
                            <span className="legend-item absent">
                                <span className="dot"></span> Absent
                            </span>
                            <span className="legend-item late">
                                <span className="dot"></span> Late
                            </span>
                        </div>
                        <div className="calendar-grid">
                            {loading ? (
                                <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '20px'}}>Loading...</div>
                            ) : attendanceRecords.length === 0 ? (
                                <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '20px'}}>No attendance records found</div>
                            ) : (
                                attendanceRecords.slice(0, 30).map((record, index) => (
                                    <div 
                                        key={record.id} 
                                        className={`calendar-day ${record.status.toLowerCase()}`}
                                        title={`${new Date(record.marked_at).toLocaleDateString()} - ${record.status}`}
                                    >
                                        <span className="day-number">{index + 1}</span>
                                        <span className="day-status">
                                            {record.status === 'present' && <i className="fa fa-check"></i>}
                                            {record.status === 'absent' && <i className="fa fa-times"></i>}
                                            {record.status === 'late' && <i className="fa fa-clock"></i>}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {viewMode === 'list' && (
                        <div className="attendance-list">
                            {loading ? (
                                <div style={{textAlign: 'center', padding: '20px'}}>Loading...</div>
                            ) : attendanceRecords.length === 0 ? (
                                <div style={{textAlign: 'center', padding: '20px'}}>No attendance records found</div>
                            ) : (
                                attendanceRecords.map(record => (
                                    <div key={record.id} className={`attendance-list-item ${record.status.toLowerCase()}`}>
                                        <div className="list-date">
                                            <i className="fa fa-calendar-day"></i>
                                            <span>{new Date(record.marked_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className={`list-status status-${record.status.toLowerCase()}`}>
                                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="section-card">
                    <div className="card-header">
                        <h2><i className="fa fa-chart-line"></i> Attendance Trends</h2>
                    </div>
                    <AttendanceChart data={dummyStudentData.charts} role="student" />
                    
                    <div className="insights-section">
                        <h3><i className="fa fa-lightbulb"></i> Insights</h3>
                        <div className="insight-item">
                            <i className="fa fa-trending-up"></i>
                            <p>Your attendance improved by 5% this month!</p>
                        </div>
                        <div className="insight-item">
                            <i className="fa fa-trophy"></i>
                            <p>You've maintained 100% attendance for Mathematics.</p>
                        </div>
                    </div>
                </div>

                <div className="section-card">
                    <div className="card-header">
                        <h2><i className="fa fa-book-open"></i> Subject-wise Breakdown</h2>
                    </div>
                    <div className="subject-breakdown">
                        {loading ? (
                            <div style={{textAlign: 'center', padding: '20px'}}>Loading subjects...</div>
                        ) : subjectBreakdown.length === 0 ? (
                            <div style={{textAlign: 'center', padding: '20px'}}>No subject data available</div>
                        ) : (
                            subjectBreakdown.map((subj, index) => {
                                const icons = ['fa-calculator', 'fa-flask', 'fa-atom', 'fa-laptop-code', 'fa-book'];
                                return (
                                    <div key={index} className="subject-row">
                                        <div className="subject-name">
                                            <i className={`fa ${icons[index % icons.length]}`}></i>
                                            <span>{subj.name}</span>
                                        </div>
                                        <div className="subject-stats">
                                            <span className="stat-value">{subj.present}/{subj.total}</span>
                                            <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width: `${subj.percentage}%`}}></div>
                                            </div>
                                            <span className="percentage">{subj.percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="section-card">
                    <div className="card-header">
                        <h2><i className="fa fa-bell"></i> Recent Notifications</h2>
                    </div>
                    <div className="notifications-list">
                        {loading ? (
                            <div style={{textAlign: 'center', padding: '20px'}}>Loading notifications...</div>
                        ) : notifications.length === 0 ? (
                            <div style={{textAlign: 'center', padding: '20px'}}>No new notifications</div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`notification-item ${notif.is_read ? '' : 'new'}`}>
                                    <div className="notif-icon">
                                        <i className={`fa ${notif.type === 'attendance' ? 'fa-check-circle' : notif.type === 'alert' ? 'fa-exclamation-circle' : 'fa-calendar-plus'}`}></i>
                                    </div>
                                    <div className="notif-content">
                                        <h4>{notif.title}</h4>
                                        <p>{notif.message}</p>
                                        <span className="notif-time">{new Date(notif.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;