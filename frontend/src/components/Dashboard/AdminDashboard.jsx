import React, { useState, useEffect } from "react";
import AttendanceTable from "../AttendanceTable";
import AttendanceChart from "../Charts/AttendanceChart";
import { dummyAdminData } from "../../utils/dummyData";
import ManageUsers from "./AdminPages/ManageUsers";
import ManageSubjects from "./AdminPages/ManageSubjects";
import AssignSubjects from "./AdminPages/AssignSubjects";
import AllAttendance from "./AdminPages/AllAttendance";
import AttendanceSummary from "./AdminPages/AttendanceSummary";
import Reports from "./AdminPages/Reports";
import Settings from "./AdminPages/Settings";
import { userAPI, classAPI, subjectAPI, attendanceAPI } from "../../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard({ currentPage = "dashboard" }) {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        attendanceToday: 0
    });
    const [timeFilter, setTimeFilter] = useState('today');
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [chartData, setChartData] = useState(dummyAdminData.charts);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all users and filter by role
            const usersResponse = await userAPI.getAll();
            const allUsers = usersResponse.data.results || [];
            const students = allUsers.filter(u => u.role === 'student');
            const teachers = allUsers.filter(u => u.role === 'teacher');

            // Fetch classes
            const classesResponse = await classAPI.getAll();
            const allClasses = classesResponse.data.results || [];

            // Fetch attendance records
            const attendanceResponse = await attendanceAPI.getAll();
            const allRecords = attendanceResponse.data.results || [];
            setAttendanceRecords(allRecords);

            // Calculate today's attendance
            const today = new Date().toISOString().split('T')[0];
            const todayRecords = allRecords.filter(r => r.marked_at?.startsWith(today));
            const presentToday = todayRecords.filter(r => r.status === 'present').length;

            // Animate counters
            const animateCounter = (key, target) => {
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
                }, 20);
            };

            animateCounter('totalStudents', students.length);
            animateCounter('totalTeachers', teachers.length);
            animateCounter('totalClasses', allClasses.length);
            animateCounter('attendanceToday', presentToday);

        } catch (err) {
            console.error("Error fetching admin dashboard data:", err);
            setError("Failed to load dashboard data.");
            // Fallback to dummy data
            setStats({
                totalStudents: dummyAdminData.totalStudents,
                totalTeachers: dummyAdminData.totalTeachers,
                totalClasses: dummyAdminData.totalClasses,
                attendanceToday: dummyAdminData.attendanceToday
            });
        } finally {
            setLoading(false);
        }
    };

    // Route pages based on currentPage
    if (currentPage === "manage-users") return <ManageUsers />;
    if (currentPage === "manage-subjects") return <ManageSubjects />;
    if (currentPage === "assign-subjects-to-teachers") return <AssignSubjects />;
    if (currentPage === "view-all-attendance") return <AllAttendance />;
    if (currentPage === "attendance-summary") return <AttendanceSummary />;
    if (currentPage === "reports") return <Reports />;
    if (currentPage === "settings") return <Settings />;

    // Default dashboard view
    const attendanceRate = ((stats.attendanceToday / stats.totalStudents) * 100).toFixed(1);

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1 className="dashboard-title">
                        <i className="fa fa-chart-line"></i> Admin Dashboard
                    </h1>
                    <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="header-actions">
                    <button className="action-btn primary" onClick={() => setShowQuickActions(!showQuickActions)}>
                        <i className="fa fa-bolt"></i> Quick Actions
                    </button>
                    <button className="action-btn">
                        <i className="fa fa-download"></i> Export Report
                    </button>
                </div>
            </div>

            {showQuickActions && (
                <div className="quick-actions-panel">
                    <button className="quick-action-btn">
                        <i className="fa fa-user-plus"></i>
                        <span>Add Student</span>
                    </button>
                    <button className="quick-action-btn">
                        <i className="fa fa-chalkboard-teacher"></i>
                        <span>Add Teacher</span>
                    </button>
                    <button className="quick-action-btn">
                        <i className="fa fa-book"></i>
                        <span>Add Subject</span>
                    </button>
                    <button className="quick-action-btn">
                        <i className="fa fa-door-open"></i>
                        <span>Create Class</span>
                    </button>
                    <button className="quick-action-btn">
                        <i className="fa fa-bell"></i>
                        <span>Send Notice</span>
                    </button>
                    <button className="quick-action-btn">
                        <i className="fa fa-calendar-alt"></i>
                        <span>Schedule</span>
                    </button>
                </div>
            )}

            <div className="dashboard-stats">
                <div className="stat-card students">
                    <div className="stat-icon">
                        <i className="fa fa-user-graduate"></i>
                    </div>
                    <div className="stat-info">
                        <h3 className="stat-number">{stats.totalStudents}</h3>
                        <p className="stat-label">Total Students</p>
                        <span className="stat-change positive">
                            <i className="fa fa-arrow-up"></i> 12% from last month
                        </span>
                    </div>
                </div>

                <div className="stat-card teachers">
                    <div className="stat-icon">
                        <i className="fa fa-chalkboard-teacher"></i>
                    </div>
                    <div className="stat-info">
                        <h3 className="stat-number">{stats.totalTeachers}</h3>
                        <p className="stat-label">Total Teachers</p>
                        <span className="stat-change positive">
                            <i className="fa fa-arrow-up"></i> 5% from last month
                        </span>
                    </div>
                </div>

                <div className="stat-card classes">
                    <div className="stat-icon">
                        <i className="fa fa-door-open"></i>
                    </div>
                    <div className="stat-info">
                        <h3 className="stat-number">{stats.totalClasses}</h3>
                        <p className="stat-label">Total Classes</p>
                        <span className="stat-change neutral">
                            <i className="fa fa-minus"></i> No change
                        </span>
                    </div>
                </div>

                <div className="stat-card attendance">
                    <div className="stat-icon">
                        <i className="fa fa-check-circle"></i>
                    </div>
                    <div className="stat-info">
                        <h3 className="stat-number">{stats.attendanceToday}</h3>
                        <p className="stat-label">Present Today</p>
                        <span className="stat-change positive">
                            <i className="fa fa-percentage"></i> {attendanceRate}% attendance rate
                        </span>
                    </div>
                </div>
            </div>

            {stats.attendanceToday > 0 && stats.totalStudents > 0 && (stats.attendanceToday / stats.totalStudents * 100) < 75 && (
                <div className="dashboard-alert">
                    <div className="alert-icon">
                        <i className="fa fa-exclamation-triangle"></i>
                    </div>
                    <div className="alert-content">
                        <h4>Low Attendance Alert</h4>
                        <p>Overall attendance is below 75%. Review and take action.</p>
                    </div>
                    <button className="alert-btn">View Details</button>
                </div>
            )}

            {error && (
                <div className="dashboard-alert" style={{backgroundColor: '#fee'}}>
                    <div className="alert-icon">
                        <i className="fa fa-times-circle"></i>
                    </div>
                    <div className="alert-content">
                        <h4>Error Loading Data</h4>
                        <p>{error}</p>
                    </div>
                    <button className="alert-btn" onClick={fetchDashboardData}>Retry</button>
                </div>
            )}

            <div className="dashboard-grid">
                <div className="grid-section full-width">
                    <div className="section-header">
                        <h2><i className="fa fa-table"></i> Recent Attendance Records</h2>
                        <div className="time-filter">
                            <button className={timeFilter === 'today' ? 'active' : ''} onClick={() => setTimeFilter('today')}>Today</button>
                            <button className={timeFilter === 'week' ? 'active' : ''} onClick={() => setTimeFilter('week')}>This Week</button>
                            <button className={timeFilter === 'month' ? 'active' : ''} onClick={() => setTimeFilter('month')}>This Month</button>
                        </div>
                    </div>
                    {loading ? (
                        <div style={{textAlign: 'center', padding: '40px'}}>Loading attendance records...</div>
                    ) : attendanceRecords.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '40px'}}>No attendance records found</div>
                    ) : (
                        <AttendanceTable filterOptions={dummyAdminData.filterOptions} data={attendanceRecords} role="admin" />
                    )}
                </div>

                <div className="grid-section">
                    <div className="section-header">
                        <h2><i className="fa fa-chart-bar"></i> Attendance Trends</h2>
                    </div>
                    <AttendanceChart data={dummyAdminData.charts} role="admin" />
                </div>

                <div className="grid-section">
                    <div className="section-header">
                        <h2><i className="fa fa-trophy"></i> Top Performing Classes</h2>
                    </div>
                    <div className="top-classes">
                        <div className="class-item">
                            <div className="class-rank">1</div>
                            <div className="class-details">
                                <h4>Class A</h4>
                                <p>98% Attendance</p>
                            </div>
                            <div className="class-progress">
                                <div className="progress-bar" style={{width: '98%'}}></div>
                            </div>
                        </div>
                        <div className="class-item">
                            <div className="class-rank">2</div>
                            <div className="class-details">
                                <h4>Class B</h4>
                                <p>95% Attendance</p>
                            </div>
                            <div className="class-progress">
                                <div className="progress-bar" style={{width: '95%'}}></div>
                            </div>
                        </div>
                        <div className="class-item">
                            <div className="class-rank">3</div>
                            <div className="class-details">
                                <h4>Class C</h4>
                                <p>92% Attendance</p>
                            </div>
                            <div className="class-progress">
                                <div className="progress-bar" style={{width: '92%'}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}