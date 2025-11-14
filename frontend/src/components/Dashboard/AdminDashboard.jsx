import React, { useState, useEffect } from "react";
import AttendanceTable from "../AttendanceTable";
import AttendanceChart from "../Charts/AttendanceChart";
import { dummyAdminData } from "../../utils/dummyData";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        attendanceToday: 0
    });
    const [timeFilter, setTimeFilter] = useState('today');
    const [showQuickActions, setShowQuickActions] = useState(false);

    useEffect(() => {
        // Animate counters on load
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

        animateCounter('totalStudents', dummyAdminData.totalStudents);
        animateCounter('totalTeachers', dummyAdminData.totalTeachers);
        animateCounter('totalClasses', dummyAdminData.totalClasses);
        animateCounter('attendanceToday', dummyAdminData.attendanceToday);
    }, []);

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

            <div className="dashboard-alert">
                <div className="alert-icon">
                    <i className="fa fa-exclamation-triangle"></i>
                </div>
                <div className="alert-content">
                    <h4>{dummyAdminData.alerts}</h4>
                    <p>Students have low attendance. Review and take action.</p>
                </div>
                <button className="alert-btn">View Details</button>
            </div>

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
                    <AttendanceTable filterOptions={dummyAdminData.filterOptions} data={dummyAdminData.attendance} role="admin" />
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