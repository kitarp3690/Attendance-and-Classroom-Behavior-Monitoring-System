import React, { useState, useEffect } from "react";
import { sessionAPI, classAPI, attendanceAPI, authAPI } from "../../services/api";
import "./TeacherDashboard.css";

const TeacherDashboard = ({ currentPage = "dashboard" }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teacherInfo, setTeacherInfo] = useState({ name: "Loading...", email: "", department: "" });
    
    // Classes and Sessions
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [activeSession, setActiveSession] = useState(null);
    
    // Attendance
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [sessionStudents, setSessionStudents] = useState([]);
    
    // UI State
    const [showStartSessionModal, setShowStartSessionModal] = useState(false);
    const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);
    const [attendanceMarking, setAttendanceMarking] = useState({});
    
    // Dashboard Stats
    const [stats, setStats] = useState({
        totalClasses: 0,
        activeSessions: 0,
        totalStudents: 0,
        averageAttendance: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch teacher info
            const userResponse = await authAPI.getCurrentUser();
            const user = userResponse.data;
            setTeacherInfo({
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                department: user.department || "N/A"
            });

            // Fetch my classes
            const classesResponse = await classAPI.getAll();
            const classesData = classesResponse.data.results || [];
            setClasses(classesData);
            if (classesData.length > 0) {
                setSelectedClass(classesData[0]);
            }

            // Fetch active sessions
            const sessionsResponse = await sessionAPI.getAll();
            const sessions = sessionsResponse.data.results || [];
            const activeSessions = sessions.filter(s => s.status === 'active');
            if (activeSessions.length > 0) {
                setActiveSession(activeSessions[0]);
            }

            // Fetch attendance records
            const attendanceResponse = await attendanceAPI.getAll();
            const records = attendanceResponse.data.results || [];
            setAttendanceRecords(records);

            // Calculate stats
            setStats({
                totalClasses: classesData.length,
                activeSessions: activeSessions.length,
                totalStudents: classesData.reduce((sum, c) => sum + (c.students?.length || 0), 0),
                averageAttendance: records.length > 0 
                    ? ((records.filter(r => r.status === 'present').length / records.length) * 100).toFixed(1)
                    : 0
            });

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError("Failed to load dashboard data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const startSession = async (classId, subjectId) => {
        try {
            const response = await sessionAPI.create({
                class_id: classId,
                subject_id: subjectId,
                status: 'active'
            });
            setActiveSession(response.data);
            setShowStartSessionModal(false);
            
            // Fetch students for this class
            const classData = classes.find(c => c.id === classId);
            if (classData?.students) {
                setSessionStudents(classData.students);
                setAttendanceMarking({});
            }
        } catch (err) {
            console.error("Error starting session:", err);
            alert("Failed to start session");
        }
    };

    const endSession = async () => {
        if (!activeSession) return;
        try {
            await sessionAPI.update(activeSession.id, { status: 'ended' });
            setActiveSession(null);
            alert("Session ended successfully");
            fetchDashboardData();
        } catch (err) {
            console.error("Error ending session:", err);
            alert("Failed to end session");
        }
    };

    const markAttendance = async () => {
        if (!activeSession) return;
        try {
            const attendanceData = Object.entries(attendanceMarking).map(([studentId, status]) => ({
                session_id: activeSession.id,
                student_id: parseInt(studentId),
                status: status
            }));

            for (const attendance of attendanceData) {
                await attendanceAPI.create(attendance);
            }

            alert("Attendance marked successfully");
            setShowMarkAttendanceModal(false);
            setAttendanceMarking({});
            fetchDashboardData();
        } catch (err) {
            console.error("Error marking attendance:", err);
            alert("Failed to mark attendance");
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
            <div className="teacher-dashboard">
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
        <div className="teacher-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <div className="teacher-avatar">
                            {teacherInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="teacher-info">
                            <h1>{teacherInfo.name}</h1>
                            <div className="teacher-meta">
                                <span><i className="fa fa-envelope"></i> {teacherInfo.email}</span>
                                <span><i className="fa fa-building"></i> {teacherInfo.department}</span>
                            </div>
                        </div>
                    </div>
                    <div className="header-right">
                        <button className="header-btn btn-secondary" onClick={() => window.location.reload()}>
                            <i className="fa fa-sync-alt"></i> Refresh
                        </button>
                        {activeSession && (
                            <button className="header-btn btn-danger" onClick={endSession}>
                                <i className="fa fa-stop-circle"></i> End Session
                            </button>
                        )}
                        {!activeSession && (
                            <button className="header-btn btn-primary" onClick={() => setShowStartSessionModal(true)}>
                                <i className="fa fa-play-circle"></i> Start Session
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Active Session Alert */}
                {activeSession && (
                    <div className="alert-banner alert-success">
                        <i className="fa fa-check-circle"></i>
                        <div>
                            <h4>Session Active</h4>
                            <p>Class: {selectedClass?.name} | Subject: {activeSession.subject?.name}</p>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fa fa-book"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalClasses}</div>
                            <div className="stat-label">Classes Assigned</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon active">
                            <i className="fa fa-play-circle"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.activeSessions}</div>
                            <div className="stat-label">Active Sessions</div>
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
                        <div className="stat-icon">
                            <i className="fa fa-chart-pie"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.averageAttendance}%</div>
                            <div className="stat-label">Average Attendance</div>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="dashboard-grid">
                    {/* My Classes */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fa fa-graduation-cap"></i>
                                My Classes
                            </h3>
                        </div>

                        {classes.length === 0 ? (
                            <div className="empty-state">
                                <i className="fa fa-inbox"></i>
                                <p>No classes assigned</p>
                            </div>
                        ) : (
                            <div className="class-list">
                                {classes.map(cls => (
                                    <div 
                                        key={cls.id} 
                                        className={`class-item ${selectedClass?.id === cls.id ? 'active' : ''}`}
                                        onClick={() => setSelectedClass(cls)}
                                    >
                                        <div className="class-info">
                                            <div className="class-name">{cls.name}</div>
                                            <div className="class-meta">
                                                <i className="fa fa-users"></i>
                                                {cls.students?.length || 0} Students
                                            </div>
                                        </div>
                                        <i className="fa fa-chevron-right"></i>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Session Management */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fa fa-clock"></i>
                                Session Management
                            </h3>
                        </div>

                        {!activeSession ? (
                            <div className="empty-state">
                                <i className="fa fa-calendar-times"></i>
                                <p>No active session</p>
                                <button 
                                    className="btn-primary"
                                    onClick={() => setShowStartSessionModal(true)}
                                    style={{ marginTop: '16px' }}
                                >
                                    Start Session
                                </button>
                            </div>
                        ) : (
                            <div className="session-info">
                                <div className="info-item">
                                    <label>Current Class</label>
                                    <p>{selectedClass?.name}</p>
                                </div>
                                <div className="info-item">
                                    <label>Subject</label>
                                    <p>{activeSession.subject?.name}</p>
                                </div>
                                <div className="info-item">
                                    <label>Status</label>
                                    <p className="status-active">
                                        <i className="fa fa-circle"></i> Active
                                    </p>
                                </div>
                                <button 
                                    className="btn-primary"
                                    onClick={() => setShowMarkAttendanceModal(true)}
                                    style={{ width: '100%', marginTop: '16px' }}
                                >
                                    <i className="fa fa-check-square"></i> Mark Attendance
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Attendance */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <i className="fa fa-history"></i>
                            Recent Attendance Records
                        </h3>
                    </div>

                    {attendanceRecords.length === 0 ? (
                        <div className="empty-state">
                            <i className="fa fa-file-alt"></i>
                            <p>No attendance records yet</p>
                        </div>
                    ) : (
                        <div className="attendance-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Class</th>
                                        <th>Student</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceRecords.slice(0, 10).map(record => (
                                        <tr key={record.id}>
                                            <td>{new Date(record.marked_at).toLocaleDateString()}</td>
                                            <td>{record.session?.class?.name || 'N/A'}</td>
                                            <td>{record.student?.first_name} {record.student?.last_name}</td>
                                            <td>
                                                <span className={`status-badge status-${record.status}`}>
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Start Session Modal */}
            {showStartSessionModal && (
                <div className="modal-overlay" onClick={() => setShowStartSessionModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Start New Session</h3>
                            <button className="modal-close" onClick={() => setShowStartSessionModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Select Class</label>
                                <select 
                                    onChange={(e) => setSelectedClass(classes.find(c => c.id === parseInt(e.target.value)))}
                                    value={selectedClass?.id || ''}
                                >
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Select Subject</label>
                                <select id="subject-select">
                                    <option value="">Choose a subject...</option>
                                    {selectedClass?.subjects?.map(subj => (
                                        <option key={subj.id} value={subj.id}>{subj.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowStartSessionModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className="btn-primary"
                                onClick={() => {
                                    const subjectId = document.getElementById('subject-select').value;
                                    if (!subjectId) {
                                        alert('Please select a subject');
                                        return;
                                    }
                                    startSession(selectedClass.id, subjectId);
                                }}
                            >
                                Start Session
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mark Attendance Modal */}
            {showMarkAttendanceModal && (
                <div className="modal-overlay" onClick={() => setShowMarkAttendanceModal(false)}>
                    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Mark Attendance</h3>
                            <button className="modal-close" onClick={() => setShowMarkAttendanceModal(false)}>
                                <i className="fa fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="attendance-marking">
                                {sessionStudents.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No students in this class
                                    </p>
                                ) : (
                                    <div className="student-attendance-list">
                                        {sessionStudents.map(student => (
                                            <div key={student.id} className="student-attendance-item">
                                                <div className="student-name">
                                                    {student.first_name} {student.last_name}
                                                </div>
                                                <div className="attendance-options">
                                                    <label className="radio-option">
                                                        <input 
                                                            type="radio" 
                                                            name={`student-${student.id}`}
                                                            value="present"
                                                            checked={attendanceMarking[student.id] === 'present'}
                                                            onChange={(e) => setAttendanceMarking({
                                                                ...attendanceMarking,
                                                                [student.id]: e.target.value
                                                            })}
                                                        />
                                                        <span className="radio-label present">Present</span>
                                                    </label>
                                                    <label className="radio-option">
                                                        <input 
                                                            type="radio" 
                                                            name={`student-${student.id}`}
                                                            value="absent"
                                                            checked={attendanceMarking[student.id] === 'absent'}
                                                            onChange={(e) => setAttendanceMarking({
                                                                ...attendanceMarking,
                                                                [student.id]: e.target.value
                                                            })}
                                                        />
                                                        <span className="radio-label absent">Absent</span>
                                                    </label>
                                                    <label className="radio-option">
                                                        <input 
                                                            type="radio" 
                                                            name={`student-${student.id}`}
                                                            value="late"
                                                            checked={attendanceMarking[student.id] === 'late'}
                                                            onChange={(e) => setAttendanceMarking({
                                                                ...attendanceMarking,
                                                                [student.id]: e.target.value
                                                            })}
                                                        />
                                                        <span className="radio-label late">Late</span>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowMarkAttendanceModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={markAttendance}>
                                Save Attendance
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDashboard;