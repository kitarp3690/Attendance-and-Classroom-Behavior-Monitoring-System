import React, { useState, useEffect } from "react";
import { userAPI, departmentAPI, attendanceAPI, authAPI, classAPI } from "../../services/api";
import "./HODDashboard.css";

const HODDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hodInfo, setHodInfo] = useState({ name: "Loading...", email: "", department: "" });
    
    // Department Data
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [attendanceChangeRequests, setAttendanceChangeRequests] = useState([]);
    
    // UI State
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [approvalComment, setApprovalComment] = useState("");
    
    // Stats
    const [stats, setStats] = useState({
        totalTeachers: 0,
        totalClasses: 0,
        totalStudents: 0,
        averageAttendance: 0,
        pendingApprovals: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch HOD info
            const userResponse = await authAPI.getCurrentUser();
            const user = userResponse.data;
            setHodInfo({
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                department: user.department || "N/A"
            });

            // Fetch all teachers
            const teachersResponse = await userAPI.getAll({ role: 'teacher' });
            const teachersData = teachersResponse.data.results || [];
            setTeachers(teachersData);

            // Fetch classes
            const classesResponse = await classAPI.getAll();
            const classesData = classesResponse.data.results || [];
            setClasses(classesData);

            // Fetch attendance change requests (simulated - filter by status 'pending')
            const requestsResponse = await attendanceAPI.getChangeRequests?.() || { data: { results: [] } };
            const requests = requestsResponse.data.results || [];
            const pendingRequests = requests.filter(r => r.status === 'pending');
            setAttendanceChangeRequests(pendingRequests);

            // Calculate stats
            const totalStudents = classesData.reduce((sum, c) => sum + (c.students?.length || 0), 0);
            setStats({
                totalTeachers: teachersData.length,
                totalClasses: classesData.length,
                totalStudents: totalStudents,
                averageAttendance: calculateAverageAttendance(classesData),
                pendingApprovals: pendingRequests.length
            });

        } catch (err) {
            console.error("Error fetching HOD dashboard data:", err);
            setError("Failed to load dashboard data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const calculateAverageAttendance = (classesData) => {
        if (classesData.length === 0) return 0;
        let totalAttendance = 0;
        classesData.forEach(cls => {
            if (cls.attendance_percentage) {
                totalAttendance += cls.attendance_percentage;
            }
        });
        return (totalAttendance / classesData.length).toFixed(1);
    };

    const handleApproveRequest = async (requestId, approved) => {
        try {
            await attendanceAPI.updateChangeRequest(requestId, {
                status: approved ? 'approved' : 'rejected',
                comment: approvalComment
            });
            alert(`Request ${approved ? 'approved' : 'rejected'} successfully`);
            setShowApprovalModal(false);
            setSelectedRequest(null);
            setApprovalComment("");
            fetchDashboardData();
        } catch (err) {
            console.error("Error updating request:", err);
            alert("Failed to update request");
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
            <div className="hod-dashboard">
                <div className="alert-banner alert-danger">
                    <i className="fa fa-exclamation-circle"></i>
                    <div>
                        <h4>Error</h4>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="hod-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="hod-avatar">
                            {hodInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="hod-info">
                            <h1>{hodInfo.name}</h1>
                            <div className="hod-meta">
                                <span><i className="fa fa-envelope"></i> {hodInfo.email}</span>
                                <span><i className="fa fa-building"></i> HOD - {hodInfo.department}</span>
                            </div>
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="header-btn btn-secondary" onClick={() => window.location.reload()}>
                            <i className="fa fa-sync-alt"></i> Refresh
                        </button>
                        {stats.pendingApprovals > 0 && (
                            <button className="header-btn btn-warning">
                                <i className="fa fa-exclamation-circle"></i>
                                {stats.pendingApprovals} Pending
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fa fa-chalkboard-teacher"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalTeachers}</div>
                            <div className="stat-label">Teachers</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fa fa-door-open"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalClasses}</div>
                            <div className="stat-label">Classes</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fa fa-users"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalStudents}</div>
                            <div className="stat-label">Total Students</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon pending">
                            <i className="fa fa-tasks"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.pendingApprovals}</div>
                            <div className="stat-label">Pending Approvals</div>
                        </div>
                    </div>
                </div>

                {/* Pending Approvals Alert */}
                {stats.pendingApprovals > 0 && (
                    <div className="alert-banner alert-warning">
                        <i className="fa fa-exclamation-triangle"></i>
                        <div>
                            <h4>Pending Approvals</h4>
                            <p>You have {stats.pendingApprovals} attendance change request(s) awaiting your review.</p>
                        </div>
                    </div>
                )}

                {/* Main Grid */}
                <div className="dashboard-grid">
                    {/* Pending Approval Requests */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fa fa-inbox"></i>
                                Pending Approvals
                            </h3>
                        </div>

                        {attendanceChangeRequests.length === 0 ? (
                            <div className="empty-state">
                                <i className="fa fa-check-circle"></i>
                                <p>No pending requests</p>
                            </div>
                        ) : (
                            <div className="requests-list">
                                {attendanceChangeRequests.map(request => (
                                    <div key={request.id} className="request-item">
                                        <div className="request-info">
                                            <div className="request-title">
                                                {request.student?.first_name} {request.student?.last_name}
                                            </div>
                                            <div className="request-details">
                                                <span><i className="fa fa-calendar"></i> {new Date(request.date).toLocaleDateString()}</span>
                                                <span><i className="fa fa-bookmark"></i> {request.current_status}</span>
                                            </div>
                                            <div className="request-reason">
                                                <strong>Reason:</strong> {request.reason}
                                            </div>
                                        </div>
                                        <button 
                                            className="review-btn"
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                setShowApprovalModal(true);
                                            }}
                                        >
                                            Review
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Teachers Management */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fa fa-chalkboard-teacher"></i>
                                Department Teachers
                            </h3>
                        </div>

                        {teachers.length === 0 ? (
                            <div className="empty-state">
                                <i className="fa fa-inbox"></i>
                                <p>No teachers assigned</p>
                            </div>
                        ) : (
                            <div className="teachers-list">
                                {teachers.map(teacher => (
                                    <div key={teacher.id} className="teacher-item">
                                        <div className="teacher-avatar-small">
                                            {teacher.first_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="teacher-details">
                                            <div className="teacher-name">
                                                {teacher.first_name} {teacher.last_name}
                                            </div>
                                            <div className="teacher-email">
                                                {teacher.email}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Classes Overview */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="fa fa-list"></i>
                            Classes Overview
                        </h3>
                    </div>

                    {classes.length === 0 ? (
                        <div className="empty-state">
                            <i className="fa fa-inbox"></i>
                            <p>No classes found</p>
                        </div>
                    ) : (
                        <div className="classes-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Class Name</th>
                                        <th>Semester</th>
                                        <th>Students</th>
                                        <th>Avg. Attendance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {classes.map(cls => (
                                        <tr key={cls.id}>
                                            <td><strong>{cls.name}</strong></td>
                                            <td>{cls.semester || 'N/A'}</td>
                                            <td>{cls.students?.length || 0}</td>
                                            <td>
                                                <div className="attendance-badge">
                                                    {cls.attendance_percentage || 'N/A'}%
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Department Statistics */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="fa fa-chart-bar"></i>
                            Department Statistics
                        </h3>
                    </div>
                    
                    <div className="statistics-grid">
                        <div className="stat-summary">
                            <h4>Average Attendance</h4>
                            <div className="stat-large">{stats.averageAttendance}%</div>
                        </div>
                        <div className="stat-summary">
                            <h4>Total Enrolled</h4>
                            <div className="stat-large">{stats.totalStudents}</div>
                        </div>
                        <div className="stat-summary">
                            <h4>Active Classes</h4>
                            <div className="stat-large">{stats.totalClasses}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval Modal */}
            {showApprovalModal && selectedRequest && (
                <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Review Attendance Change Request</h3>
                            <button className="modal-close" onClick={() => setShowApprovalModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="request-details-full">
                                <div className="detail-row">
                                    <label>Student:</label>
                                    <p>{selectedRequest.student?.first_name} {selectedRequest.student?.last_name}</p>
                                </div>
                                <div className="detail-row">
                                    <label>Date:</label>
                                    <p>{new Date(selectedRequest.date).toLocaleDateString()}</p>
                                </div>
                                <div className="detail-row">
                                    <label>Current Status:</label>
                                    <p className="status-current">{selectedRequest.current_status}</p>
                                </div>
                                <div className="detail-row">
                                    <label>Requested Change:</label>
                                    <p className="status-requested">{selectedRequest.requested_status}</p>
                                </div>
                                <div className="detail-row">
                                    <label>Reason:</label>
                                    <p>{selectedRequest.reason}</p>
                                </div>
                                
                                <div className="form-group">
                                    <label>Add Comment (Optional)</label>
                                    <textarea 
                                        rows="4"
                                        value={approvalComment}
                                        onChange={(e) => setApprovalComment(e.target.value)}
                                        placeholder="Add any additional notes..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                className="btn-secondary"
                                onClick={() => setShowApprovalModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn-danger"
                                onClick={() => handleApproveRequest(selectedRequest.id, false)}
                            >
                                <i className="fa fa-times"></i> Reject
                            </button>
                            <button 
                                className="btn-primary"
                                onClick={() => handleApproveRequest(selectedRequest.id, true)}
                            >
                                <i className="fa fa-check"></i> Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HODDashboard;
