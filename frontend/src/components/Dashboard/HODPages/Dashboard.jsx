import React, { useState, useEffect } from 'react';
import { attendanceChangeAPI, attendanceReportAPI, classStudentAPI } from '../../../services/api';
import './HODPages.css';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        pendingApprovals: 0,
        lowAttendanceStudents: 0,
        totalStudents: 0,
        averageAttendance: 0
    });
    const [recentRequests, setRecentRequests] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch pending approvals
            const approvalsResponse = await attendanceChangeAPI.getPending();
            const pendingApprovals = approvalsResponse.data.results || approvalsResponse.data || [];
            setRecentRequests(pendingApprovals.slice(0, 5));

            // Fetch low attendance students
            const lowAttendanceResponse = await attendanceReportAPI.getLowAttendance(75);
            const lowAttendanceStudents = lowAttendanceResponse.data.results || lowAttendanceResponse.data || [];

            // Calculate stats
            setStats({
                pendingApprovals: pendingApprovals.length,
                lowAttendanceStudents: lowAttendanceStudents.length,
                totalStudents: 0,
                averageAttendance: calculateAverageAttendance(lowAttendanceStudents)
            });
        } catch (err) {
            console.error('Error fetching HOD dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const calculateAverageAttendance = (students) => {
        if (students.length === 0) return 0;
        const total = students.reduce((sum, s) => sum + (s.percentage || 0), 0);
        return (total / students.length).toFixed(1);
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
            <div className="alert-banner alert-danger">
                <i className="fa fa-exclamation-circle"></i>
                <div>{error}</div>
            </div>
        );
    }

    return (
        <div className="hod-dashboard">
            <div className="page-header">
                <h1><i className="fa fa-building"></i> Department Dashboard</h1>
                <p>Manage department attendance and approvals</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{backgroundColor: 'rgba(52, 152, 219, 0.1)'}}>
                        <i className="fa fa-clock" style={{color: '#3498db'}}></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Pending Approvals</div>
                        <div className="stat-value">{stats.pendingApprovals}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{backgroundColor: 'rgba(231, 76, 60, 0.1)'}}>
                        <i className="fa fa-exclamation-triangle" style={{color: '#e74c3c'}}></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Low Attendance</div>
                        <div className="stat-value">{stats.lowAttendanceStudents}</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{backgroundColor: 'rgba(46, 204, 113, 0.1)'}}>
                        <i className="fa fa-percentage" style={{color: '#2ecc71'}}></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Avg Attendance</div>
                        <div className="stat-value">{stats.averageAttendance}%</div>
                    </div>
                </div>
            </div>

            {/* Recent Requests */}
            <div className="section">
                <div className="section-header">
                    <h2><i className="fa fa-list"></i> Recent Change Requests</h2>
                    <a href="#" className="view-all">View All →</a>
                </div>

                {recentRequests.length > 0 ? (
                    <div className="requests-list">
                        {recentRequests.map((request) => (
                            <div key={request.id} className="request-card">
                                <div className="request-info">
                                    <div className="request-title">
                                        {request.attendance?.student?.first_name} {request.attendance?.student?.last_name}
                                    </div>
                                    <div className="request-details">
                                        <span>{request.old_status} → {request.new_status}</span>
                                        <span className="request-reason">{request.reason}</span>
                                    </div>
                                </div>
                                <div className="request-actions">
                                    <button className="btn-sm btn-success">Approve</button>
                                    <button className="btn-sm btn-danger">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <i className="fa fa-inbox"></i>
                        <p>No pending requests</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
